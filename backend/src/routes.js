const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const pool = require("./db");
const { issueToken, requireAuth, requireStaff, requireAdmin } = require("./auth");
const { shapeReport } = require("./report-shape");

const router = express.Router();
const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again shortly." },
});
const validStatuses = new Set([
  "SUBMITTED",
  "UNDER_REVIEW",
  "IN_PROGRESS",
  "RESOLVED",
  "REOPENED",
]);
const validUrgencies = new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

async function findReport(reportId) {
  const [rows] = await pool.execute(
    `SELECT r.*, ST_Y(r.location) AS latitude, ST_X(r.location) AS longitude,
       reporter.name AS reporter_name, officer.name AS officer_name
     FROM reports r
     JOIN users reporter ON reporter.id = r.user_id
     LEFT JOIN users officer ON officer.id = r.assigned_officer_id
     WHERE r.id = ? LIMIT 1`,
    [reportId],
  );
  return rows[0] || null;
}

async function userCanReadReport(user, reportId) {
  if (["ADMIN", "INSPECTOR"].includes(user.role)) return true;
  const [rows] = await pool.execute(
    "SELECT 1 FROM reports WHERE id = ? AND user_id = ? LIMIT 1",
    [reportId, user.sub],
  );
  return rows.length > 0;
}

router.post(
  "/auth/login",
  loginLimiter,
  asyncRoute(async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const [rows] = await pool.execute(
      "SELECT id, name, email, password_hash, role, phone FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    const user = rows[0];
    const passwordMatches = user && (await bcrypt.compare(password, user.password_hash));
    if (!passwordMatches) return res.status(401).json({ error: "Invalid email or password." });
    if (!["ADMIN", "INSPECTOR"].includes(user.role)) {
      return res.status(403).json({ error: "This account is not authorized for the admin dashboard." });
    }
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone };
    return res.json({ token: issueToken(safeUser), user: safeUser });
  }),
);

router.get("/auth/me", requireAuth, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT id, name, email, role, phone FROM users WHERE id = ? LIMIT 1",
    [req.user.sub],
  );
  if (!rows[0]) return res.status(401).json({ error: "Account no longer exists." });
  res.json({ user: rows[0] });
}));

router.get("/reports", requireAuth, asyncRoute(async (req, res) => {
  const { status, category, urgency, search, limit = "500" } = req.query;
  const clauses = [];
  const values = [];
  if (req.user.role === "CITIZEN") {
    clauses.push("r.user_id = ?");
    values.push(req.user.sub);
  }
  if (status && validStatuses.has(String(status))) {
    clauses.push("r.status = ?");
    values.push(status);
  }
  if (category) {
    clauses.push("r.category_name = ?");
    values.push(String(category).slice(0, 50));
  }
  if (urgency && validUrgencies.has(String(urgency))) {
    clauses.push("r.urgency = ?");
    values.push(urgency);
  }
  if (search) {
    clauses.push("(r.id LIKE ? OR r.title LIKE ? OR r.description LIKE ? OR r.address_text LIKE ?)");
    const term = `%${String(search).slice(0, 100)}%`;
    values.push(term, term, term, term);
  }
  const parsedLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 100, 1), 500);
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await pool.execute(
    `SELECT r.*, ST_Y(r.location) AS latitude, ST_X(r.location) AS longitude,
       reporter.name AS reporter_name, officer.name AS officer_name
     FROM reports r
     JOIN users reporter ON reporter.id = r.user_id
     LEFT JOIN users officer ON officer.id = r.assigned_officer_id
     ${where} ORDER BY r.created_at DESC LIMIT ${parsedLimit}`,
    values,
  );
  res.json({ data: rows.map(shapeReport) });
}));

router.post("/reports", requireAuth, asyncRoute(async (req, res) => {
  const { category, title, description, urgency = "MEDIUM", latitude, longitude, address, photoUrl } = req.body;
  if (!category || !title || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude)) ||
      Number(latitude) < -90 || Number(latitude) > 90 || Number(longitude) < -180 || Number(longitude) > 180) {
    return res.status(400).json({ error: "Category, title, latitude and longitude are required." });
  }
  if (!validUrgencies.has(urgency)) return res.status(400).json({ error: "Invalid urgency value." });
  const id = require("crypto").randomUUID();
  const point = `POINT(${Number(longitude)} ${Number(latitude)})`;
  await pool.execute(
    `INSERT INTO reports (id, user_id, category_name, title, description, urgency, location, address_text, photo_url)
     VALUES (?, ?, ?, ?, ?, ?, ST_GeomFromText(?, 4326, 'axis-order=long-lat'), ?, ?)`,
    [id, req.user.sub, String(category).slice(0, 50), String(title).slice(0, 255), description || null,
      urgency, point, address || null, photoUrl || null],
  );
  const row = await findReport(id);
  const report = shapeReport(row);
  req.io.to("admin_reports").emit("admin:new_report", report);
  res.status(201).json({ data: report });
}));

router.get("/reports/:id", requireAuth, asyncRoute(async (req, res) => {
  if (!(await userCanReadReport(req.user, req.params.id))) return res.status(403).json({ error: "You cannot access this report." });
  const row = await findReport(req.params.id);
  if (!row) return res.status(404).json({ error: "Report not found." });
  res.json({ data: shapeReport(row) });
}));

router.patch("/reports/:id", requireAuth, requireStaff, asyncRoute(async (req, res) => {
  const { status, assignedOfficerId, note } = req.body;
  const connection = await pool.getConnection();
  let row;
  try {
    await connection.beginTransaction();
    const [existingRows] = await connection.execute("SELECT id FROM reports WHERE id = ? FOR UPDATE", [req.params.id]);
    if (!existingRows.length) {
      await connection.rollback();
      return res.status(404).json({ error: "Report not found." });
    }
    const updates = [];
    const values = [];
    if (status !== undefined) {
      if (!validStatuses.has(status)) {
        await connection.rollback();
        return res.status(400).json({ error: "Invalid report status." });
      }
      updates.push("status = ?");
      values.push(status);
    }
    if (assignedOfficerId !== undefined) {
      if (assignedOfficerId !== null && assignedOfficerId !== "") {
        const [officers] = await connection.execute("SELECT id FROM users WHERE id = ? AND role = 'INSPECTOR'", [assignedOfficerId]);
        if (!officers.length) {
          await connection.rollback();
          return res.status(400).json({ error: "Assigned account must be an inspector." });
        }
        updates.push("assigned_officer_id = ?");
        values.push(assignedOfficerId);
      } else {
        updates.push("assigned_officer_id = NULL");
      }
    }
    if (updates.length) {
      values.push(req.params.id);
      await connection.execute(`UPDATE reports SET ${updates.join(", ")} WHERE id = ?`, values);
    }
    if (note && String(note).trim()) {
      await connection.execute(
        "INSERT INTO inspections (id, report_id, officer_id, notes) VALUES (?, ?, ?, ?)",
        [require("crypto").randomUUID(), req.params.id, req.user.sub, String(note).trim().slice(0, 5000)],
      );
    }
    await connection.commit();
    row = await findReport(req.params.id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  const report = shapeReport(row);
  req.io.to("admin_reports").emit("report:updated", report);
  req.io.to(`report_${report.id}`).emit("report:updated", report);
  res.json({ data: report });
}));

router.get("/reports/:id/timeline", requireAuth, asyncRoute(async (req, res) => {
  if (!(await userCanReadReport(req.user, req.params.id))) return res.status(403).json({ error: "You cannot access this report." });
  const [rows] = await pool.execute(
    `SELECT i.id, i.report_id, i.notes, i.inspection_photo_url, i.inspected_at, i.officer_id, u.name AS officer_name
     FROM inspections i JOIN users u ON u.id = i.officer_id
     WHERE i.report_id = ? ORDER BY i.inspected_at DESC`,
    [req.params.id],
  );
  res.json({ data: rows });
}));

router.get("/officers", requireAuth, requireStaff, asyncRoute(async (_req, res) => {
  const [rows] = await pool.execute(
    "SELECT id, name, email, phone FROM users WHERE role = 'INSPECTOR' ORDER BY name",
  );
  res.json({ data: rows });
}));

router.get("/reports/:id/messages", requireAuth, asyncRoute(async (req, res) => {
  if (!(await userCanReadReport(req.user, req.params.id))) return res.status(403).json({ error: "You cannot access this report." });
  const [rows] = await pool.execute(
    `SELECT m.id, m.report_id, m.sender_id, m.message, m.sent_at,
       u.name AS sender_name, u.role AS sender_role
     FROM chat_messages m JOIN users u ON u.id = m.sender_id
     WHERE m.report_id = ? ORDER BY m.sent_at ASC`,
    [req.params.id],
  );
  res.json({ data: rows });
}));

router.post("/reports/:id/messages", requireAuth, asyncRoute(async (req, res) => {
  if (!(await userCanReadReport(req.user, req.params.id))) return res.status(403).json({ error: "You cannot access this report." });
  const message = String(req.body.message || "").trim();
  if (!message || message.length > 4000) return res.status(400).json({ error: "Message must contain 1 to 4000 characters." });
  const id = require("crypto").randomUUID();
  await pool.execute("INSERT INTO chat_messages (id, report_id, sender_id, message) VALUES (?, ?, ?, ?)", [id, req.params.id, req.user.sub, message]);
  const [rows] = await pool.execute(
    `SELECT m.id, m.report_id, m.sender_id, m.message, m.sent_at,
       u.name AS sender_name, u.role AS sender_role
     FROM chat_messages m JOIN users u ON u.id = m.sender_id WHERE m.id = ?`,
    [id],
  );
  const data = rows[0];
  req.io.to(`report_${req.params.id}`).emit("chat:new_message", data);
  res.status(201).json({ data });
}));

router.get("/analytics", requireAuth, requireStaff, asyncRoute(async (req, res) => {
  const range = String(req.query.range || "30d");
  const ranges = { "7d": 7, "30d": 30, "2m": 60, "1y": 365 };
  const days = ranges[range] || 30;
  const [[totals]] = await pool.execute(
    `SELECT COUNT(*) AS reports_count,
       SUM(status = 'RESOLVED') AS resolved_count,
       ROUND(AVG(CASE WHEN status = 'RESOLVED' THEN TIMESTAMPDIFF(HOUR, created_at, updated_at) END), 1) AS avg_resolution_hours
     FROM reports WHERE created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)`,
    [days],
  );
  const [categories] = await pool.execute(
    `SELECT category_name AS category, COUNT(*) AS count FROM reports
     WHERE created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)
     GROUP BY category_name ORDER BY count DESC`,
    [days],
  );
  const [monthly] = await pool.execute(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
       COUNT(*) AS total, SUM(status = 'RESOLVED') AS resolved
     FROM reports WHERE created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month`,
  );
  const count = Number(totals.reports_count || 0);
  const resolved = Number(totals.resolved_count || 0);
  res.json({ data: {
    range,
    reportsCount: count,
    resolvedCount: resolved,
    resolutionRate: count ? Math.round((resolved / count) * 100) : 0,
    avgResolutionHours: totals.avg_resolution_hours == null ? null : Number(totals.avg_resolution_hours),
    categories: categories.map((item) => ({ ...item, count: Number(item.count) })),
    monthly: monthly.map((item) => ({ ...item, total: Number(item.total), resolved: Number(item.resolved) })),
  } });
}));

router.get("/announcements", requireAuth, requireStaff, asyncRoute(async (_req, res) => {
  const [rows] = await pool.execute("SELECT * FROM announcements ORDER BY is_important DESC, created_at DESC LIMIT 100");
  res.json({ data: rows });
}));

router.post("/announcements", requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const title = String(req.body.title || "").trim();
  const content = String(req.body.content || "").trim();
  if (!title || !content) return res.status(400).json({ error: "Title and content are required." });
  const id = require("crypto").randomUUID();
  await pool.execute(
    "INSERT INTO announcements (id, title, content, category, author_name, is_important) VALUES (?, ?, ?, ?, ?, ?)",
    [id, title.slice(0, 200), content, String(req.body.category || "GENERAL").slice(0, 50), req.body.authorName || "CEGCT Team", Boolean(req.body.isImportant)],
  );
  const [rows] = await pool.execute("SELECT * FROM announcements WHERE id = ?", [id]);
  req.io.emit("announcement:new", rows[0]);
  res.status(201).json({ data: rows[0] });
}));

module.exports = router;
