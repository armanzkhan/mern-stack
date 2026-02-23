/**
 * Reset a user's password by email.
 *
 * Run:
 *   cd Ressichem/backend/backend
 *   node scripts/reset-user-password.js "velcommoditiessingaporepteltd@gmail.com" "NewPassword@123"
 */
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
  process.env.CONNECTION_STRING ||
  process.env.MONGODB_URI ||
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(uri, { dbName: "Ressichem" });
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
