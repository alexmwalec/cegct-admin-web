require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured in backend/.env before starting the API.");
}

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { Server } = require("socket.io");
const pool = require("./src/db");
const routes = require("./src/routes");

const app = express();
const server = http.createServer(app);
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST", "PATCH", "OPTIONS"] },
});

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "1mb" }));
app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch (_error) {
    res.status(503).json({ ok: false, database: "unavailable" });
  }
});
app.use("/api", routes);

io.use((socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    const jwt = require("jsonwebtoken");
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (_error) {
    return next(new Error("Invalid session token"));
  }
});

io.on("connection", (socket) => {
  if (["ADMIN", "INSPECTOR"].includes(socket.user.role)) socket.join("admin_reports");
  if (socket.user.role === "CITIZEN") socket.join(`user_${socket.user.sub}`);
  socket.on("join_report_room", async (reportId) => {
    if (typeof reportId !== "string" || reportId.length > 64) return;
    if (["ADMIN", "INSPECTOR"].includes(socket.user.role)) {
      socket.join(`report_${reportId}`);
      return;
    }
    try {
      const [rows] = await pool.execute(
        "SELECT 1 FROM reports WHERE id = ? AND user_id = ? LIMIT 1",
        [reportId, socket.user.sub],
      );
      if (rows.length) socket.join(`report_${reportId}`);
    } catch (error) {
      console.error("Socket room authorization failed:", error.message);
    }
  });
  socket.on("leave_report_room", (reportId) => {
    if (typeof reportId === "string" && reportId.length <= 64) {
      socket.leave(`report_${reportId}`);
    }
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "An unexpected server error occurred." });
});

const port = Number(process.env.PORT || 5000);
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the other server or set a different PORT in backend/.env.`);
    process.exit(1);
  }
  console.error("Could not start the CEGCT API:", error.message);
  process.exit(1);
});

async function startServer() {
  try {
    // Existing installations may not yet have this table. Ensure it exists
    // before accepting report submissions, then seed counters from old IDs.
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS report_sequences (
        report_date DATE PRIMARY KEY,
        last_number INT UNSIGNED NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB`,
    );
    await pool.execute(
      `INSERT INTO report_sequences (report_date, last_number)
       SELECT STR_TO_DATE(LEFT(id, 10), '%d-%m-%Y'),
              MAX(CAST(SUBSTRING_INDEX(id, 'ID', -1) AS UNSIGNED))
       FROM reports
       WHERE id REGEXP '^[0-9]{2}-[0-9]{2}-[0-9]{4}-ID[0-9]+$'
       GROUP BY STR_TO_DATE(LEFT(id, 10), '%d-%m-%Y')
       ON DUPLICATE KEY UPDATE last_number = GREATEST(last_number, VALUES(last_number))`,
    );
    server.listen(port, () => {
      console.log(`CEGCT API and Socket.IO listening on port ${port}`);
    });
  } catch (error) {
    console.error("Could not initialize the CEGCT database:", error.message);
    await pool.end();
    process.exit(1);
  }
}

startServer();

function shutdown() {
  io.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
