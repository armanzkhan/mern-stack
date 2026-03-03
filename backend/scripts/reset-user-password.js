/**
 * Reset a user's password by email.
 * Uses same DB as app (MONGODB_DB_NAME or Testing).
 *
 * Run from backend:
 *   node scripts/reset-user-password.js "user@example.com" "NewPassword123"
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const emailArg = process.argv[2];
const passwordArg = process.argv[3];

if (!emailArg || !passwordArg) {
  console.error("❌ Provide email and new password.");
  process.exit(1);
}

const uri =
  process.env.CONNECTION_STRING?.trim() ||
  process.env.MONGODB_URI ||
  "";
const dbName = process.env.MONGODB_DB_NAME || "Testing";

async function run() {
  if (!uri) {
    console.error("❌ Set CONNECTION_STRING or MONGODB_URI in backend/.env");
    process.exit(1);
  }
  await mongoose.connect(uri, { dbName });
  const email = String(emailArg).toLowerCase();

  const user = await User.findOne({ email });
  if (!user) {
    console.log("❌ User not found:", email);
    await mongoose.disconnect();
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(passwordArg, 10);
  user.password = hashedPassword;
  await user.save();

  console.log("✅ Password reset for:", email);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
