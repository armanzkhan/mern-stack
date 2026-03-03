/**
 * Set the same known password for ALL users (development/testing only).
 * After running this, you can document "password: <your-choice>" in README-CREDENTIALS.md.
 *
 * Run from backend:
 *   node scripts/set-all-users-known-password.js "YourKnownPassword123"
 *
 * Requires .env with CONNECTION_STRING or MONGODB_URI.
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const uri =
  process.env.CONNECTION_STRING?.trim() ||
  process.env.MONGODB_URI ||
  "";
const dbName = process.env.MONGODB_DB_NAME || "Testing";
const newPassword = process.argv[2];

async function run() {
  if (!uri) {
    console.error("Set CONNECTION_STRING or MONGODB_URI in backend/.env");
    process.exit(1);
  }
  if (!newPassword || newPassword.length < 6) {
    console.error("Usage: node scripts/set-all-users-known-password.js \"YourPassword123\"");
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName });
  const hashed = await bcrypt.hash(newPassword, 10);
  const result = await User.updateMany({}, { $set: { password: hashed } });
  console.log("Updated password for", result.modifiedCount, "users.");
  console.log("Document this password in README-CREDENTIALS.md (e.g. Password: YourPassword123)");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
