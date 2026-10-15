const jwt = require("jsonwebtoken");

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "12h" },
  );
}

function requireAuth(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required." });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (_error) {
    return res.status(401).json({ error: "Session is invalid or expired." });
  }
}

function requireStaff(req, res, next) {
  if (!req.user || !["ADMIN", "INSPECTOR"].includes(req.user.role)) {
    return res.status(403).json({ error: "Administrator or inspector access required." });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Administrator access required." });
  }
  next();
}

module.exports = { issueToken, requireAuth, requireStaff, requireAdmin };
