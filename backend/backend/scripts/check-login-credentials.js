/**
 * Check login credentials by phone or email.
 *
 * Run:
 *   node scripts/check-login-credentials.js "0321-3004025" "S.Gabbas@123"
 *   node scripts/check-login-credentials.js "s.gabbas@ressichem.local" "S.Gabbas@123"
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const identifier = process.argv[2];
const password = process.argv[3];

if (!identifier || !password) {
  console.error("❌ Please provide identifier and password.");
  process.exit(1);
}

const uri =
  process.env.CONNECTION_STRING ||
  process.env.MONGODB_URI ||
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(uri, { dbName: "Ressichem" });

  const loginIdRaw = identifier.trim();
  const loginId = loginIdRaw.includes("@") ? loginIdRaw.toLowerCase() : loginIdRaw;
  const isEmail = loginId.includes("@");
  const normalizedPhone = loginId.replace(/[^\d+]/g, "");
  const phoneCandidates = [loginId];
  if (normalizedPhone && normalizedPhone !== loginId) {
    phoneCandidates.push(normalizedPhone);
  }

  const query = isEmail
    ? { email: loginId }
    : { $or: [{ phone: { $in: phoneCandidates } }, { email: loginId }] };

  const user = await User.findOne(query).lean();

  console.log("Identifier:", identifier);
  console.log("Query:", query);
  if (!user) {
    console.log("User found: false");
    await mongoose.disconnect();
    return;
  }

  const ok = await bcrypt.compare(password, user.password);
  console.log("User found: true");
  console.log("Email:", user.email);
  console.log("Phone:", user.phone);
  console.log("Password match:", ok);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
