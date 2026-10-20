const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const cloudinary = require("./cloudinary");
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
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const parseReportImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 20, parts: 21 },
  fileFilter: (_req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      const error = new Error("Evidence must be a JPEG, PNG, or WebP image.");
      error.statusCode = 415;
      return callback(error);
    }
    callback(null, true);
  },
}).single("image");

function handleReportImageUpload(req, res, next) {
  parseReportImage(req, res, (error) => {
    if (!error) return next();
    console.warn("Report image request rejected during multipart parsing:", {
      code: error.code || "INVALID_UPLOAD",
      message: error.message || "Invalid image upload.",
    });
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "Evidence images must be 10 MB or smaller." });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ error: "Attach one image using the multipart field named 'image'." });
    }
    return res.status(error.statusCode || 400).json({ error: error.message || "Invalid image upload." });
  });
}

function logReportSubmission(req, _res, next) {
  console.info("Report submission request received:", {
    contentType: req.get("content-type") || "missing",
    contentLength: req.get("content-length") || "unknown",
  });
  next();
}

function uploadReportImage(file) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "cegct",
        public_id: require("crypto").randomUUID(),
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    uploadStream.end(file.buffer);
  });
}

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

function getReportDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Blantyre",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

async function userCanReadReport(user, reportId) {
  if (["ADMIN", "INSPECTOR"].includes(user.role)) return true;
  const [rows] = await pool.execute(
    "SELECT 1 FROM reports WHERE id = ? AND user_id = ? LIMIT 1",
    [reportId, user.sub],
  );
  return rows.length > 0;
}
// src/routes.js
router.post(
  "/auth/register",
  asyncRoute(async (req, res) => {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const phone = String(req.body.phone || "").trim();

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const id = require("crypto").randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    
    await pool.execute(
      "INSERT INTO users (id, name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, 'CITIZEN', ?)",
      [id, name, email, passwordHash, phone || null]
    );

    const safeUser = { id, name, email, role: "CITIZEN", phone: phone || null };
    const token = issueToken(safeUser);

    return res.status(201).json({ token, user: safeUser });
  })
);

router.post(
  "/auth/mobile/login",
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
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    if (user.role !== "CITIZEN") {
      return res.status(403).json({ error: "This endpoint is for citizen accounts. Use the admin login for staff accounts." });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };
    return res.json({ token: issueToken(safeUser), user: safeUser });
  }),
);

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

router.post("/reports", logReportSubmission, requireAuth, handleReportImageUpload, asyncRoute(async (req, res) => {
  const body = req.body || {};
  const location = body.location;
  const coordinates = Array.isArray(location?.coordinates)
    ? location.coordinates
    : Array.isArray(location)
      ? location
      : null;
  const category = String(body.category || body.category_name || body.categoryName || "Other").trim();
  const description = String(body.description || body.details || "");
  const title = String(body.title || category || description.slice(0, 100)).trim();
  const latitude = body.latitude ?? body.lat ?? location?.latitude ?? coordinates?.[1];
  const longitude = body.longitude ?? body.lng ?? location?.longitude ?? coordinates?.[0];
  const urgency = body.urgency || body.severity || "MEDIUM";
  const address = body.address || body.address_text || body.locationAddress || (typeof location === "string" ? location : "");
  let photoUrl = body.photoUrl || body.photo_url || body.imageUrl || body.image_url || body.evidenceUrl || body.evidence_url || null;
  if (!category || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude)) ||
      Number(latitude) < -90 || Number(latitude) > 90 || Number(longitude) < -180 || Number(longitude) > 180) {
    return res.status(400).json({
      error: "A category and valid GPS coordinates are required.",
      acceptedCoordinateFields: ["latitude/longitude", "lat/lng", "location.coordinates [longitude, latitude]"],
    });
  }
  if (!validUrgencies.has(urgency)) return res.status(400).json({ error: "Invalid urgency value." });
  if (req.file && !(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
    console.error("Report image upload is not configured:", {
      cloudNamePresent: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
      apiKeyPresent: Boolean(process.env.CLOUDINARY_API_KEY),
      apiSecretPresent: Boolean(process.env.CLOUDINARY_API_SECRET),
    });
    return res.status(503).json({ error: "Image uploads are not configured on the API." });
  }
  if (photoUrl && (typeof photoUrl !== "string" || photoUrl.length > 512)) {
    return res.status(400).json({ error: "The photo URL must be 512 characters or fewer." });
  }
  let uploadedAsset = null;
  if (req.file) {
    try {
      uploadedAsset = await uploadReportImage(req.file);
      photoUrl = uploadedAsset.secure_url;
      if (!photoUrl || photoUrl.length > 512) {
        await cloudinary.uploader.destroy(uploadedAsset.public_id, { resource_type: "image" });
        return res.status(502).json({ error: "Cloudinary returned an invalid image URL." });
      }
    } catch (error) {
      console.error("Cloudinary report image upload failed:", {
        name: error.name,
        message: error.message,
        httpCode: error.http_code,
      });
      return res.status(502).json({ error: "Could not upload report evidence. The report was not saved; please retry." });
    }
  }
  const dateParts = getReportDateParts();
  const reportDate = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
  let connection;
  let id;
  const point = `POINT(${Number(longitude)} ${Number(latitude)})`;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO report_sequences (report_date, last_number) VALUES (?, 1)
       ON DUPLICATE KEY UPDATE last_number = last_number + 1`,
      [reportDate],
    );
    const [sequenceRows] = await connection.execute(
      "SELECT last_number FROM report_sequences WHERE report_date = ? FOR UPDATE",
      [reportDate],
    );
    const number = String(sequenceRows[0].last_number).padStart(3, "0");
    id = `${dateParts.day}-${dateParts.month}-${dateParts.year}-ID${number}`;
    await connection.execute(
      `INSERT INTO reports (id, user_id, category_name, title, description, urgency, location, address_text, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ST_GeomFromText(?, 4326, 'axis-order=long-lat'), ?, ?)`,
      [id, req.user.sub, String(category).slice(0, 50), String(title).slice(0, 255), description || null,
        urgency, point, address || null, photoUrl],
    );
    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    if (uploadedAsset) {
      await cloudinary.uploader.destroy(uploadedAsset.public_id, { resource_type: "image" }).catch((cleanupError) => {
        console.error("Could not remove unlinked Cloudinary evidence:", cleanupError.message);
      });
    }
    throw error;
  } finally {
    if (connection) connection.release();
  }
  const row = await findReport(id);
  const report = shapeReport(row);
  req.io.to("admin_reports").emit("admin:new_report", report);
  req.io.to(`user_${req.user.sub}`).emit("report:created", report);
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
  let previousStatus;
  try {
    await connection.beginTransaction();
    const [existingRows] = await connection.execute("SELECT id, status FROM reports WHERE id = ? FOR UPDATE", [req.params.id]);
    if (!existingRows.length) {
      await connection.rollback();
      return res.status(404).json({ error: "Report not found." });
    }
    previousStatus = existingRows[0].status;
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
  if (status && status !== previousStatus) {
    const statusEvent = {
      reportId: report.id,
      status: report.status,
      updatedAt: report.updatedAt,
      report,
    };
    req.io.to(`report_${report.id}`).emit("report:status_changed", statusEvent);
    req.io.to(`user_${report.reporterId}`).emit("report:status_changed", statusEvent);
  }
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
  const [reportRows] = await pool.execute("SELECT user_id FROM reports WHERE id = ? LIMIT 1", [req.params.id]);
  if (!reportRows.length) return res.status(404).json({ error: "Report not found." });
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
  if (["ADMIN", "INSPECTOR"].includes(req.user.role)) {
    req.io
      .to(`report_${req.params.id}`)
      .to(`user_${reportRows[0].user_id}`)
      .emit("chat:new_message", data);
  } else {
    req.io.to(`report_${req.params.id}`).emit("chat:new_message", data);
  }
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
