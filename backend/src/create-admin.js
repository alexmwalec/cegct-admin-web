require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("./db");

async function main() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in the environment.");
  }
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const [rows] = await pool.execute(
    "SELECT id, role FROM users WHERE email = ? LIMIT 1",
    [email],
  );

  if (rows[0]) {
    if (rows[0].role !== "ADMIN") {
      throw new Error(`The account ${email} exists with role ${rows[0].role}; refusing to change its role.`);
    }
    await pool.execute(
      "UPDATE users SET name = ?, password_hash = ? WHERE id = ?",
      [ADMIN_NAME, passwordHash, rows[0].id],
    );
    console.log(`Updated the password and name for existing admin ${email}.`);
  } else {
    const id = crypto.randomUUID();
    await pool.execute(
      "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'ADMIN')",
      [id, ADMIN_NAME, email, passwordHash],
    );
    console.log(`Created admin account ${email} (${id}).`);
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
