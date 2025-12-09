/*
  Usage:
  node backend/scripts/setUserPassword.js "sales@ressichem.com" "NewStrongPassword123!"
*/

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

async function connectDB() {
  const uri = process.env.CONNECTION_STRING || "mongodb://localhost:27017/Ressichem";
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function main() {
  const [emailArg, passwordArg] = process.argv.slice(2);
  if (!emailArg || !passwordArg) {
    console.error("❌ Usage: node backend/scripts/setUserPassword.js <email> <newPassword>");
    process.exit(1);
  }

  await connectDB();
  console.log("✅ Connected to MongoDB");

  try {
    const user = await User.findOne({ email: emailArg });
    if (!user) {
      console.error(`❌ User not found for email: ${emailArg}`);
      process.exit(1);
    }

    const hashed = await bcrypt.hash(passwordArg, 10);
    user.password = hashed;
    await user.save();

    console.log(`✅ Password updated for ${emailArg}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };


