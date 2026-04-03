/**
 * One-time migration:
 * - Ensures "Logistic Manager" role exists for the user's company
 * - Assigns that role + logistic permissions to a specific logistic manager account
 *
 * Usage:
 *   node backend/scripts/fix-logistic-manager-role.js
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");

const TARGET_EMAIL = process.env.TARGET_EMAIL || "logistic@gmail.com";
const LOGISTIC_ROLE_NAME = "Logistic Manager";

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function main() {
  const mongoUri =
    process.env.CONNECTION_STRING ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("Missing CONNECTION_STRING / MONGODB_URI in backend/.env");
  }

  await mongoose.connect(mongoUri);

  // Case-insensitive match for the target email.
  const user = await User.findOne({
    email: { $regex: `^${escapeRegex(TARGET_EMAIL)}$`, $options: "i" },
  }).populate("roles");
  if (!user) {
    console.log(`❌ User not found (case-insensitive): ${TARGET_EMAIL}`);

    const candidates = await User.find({
      email: { $regex: "logistic", $options: "i" },
    })
      .select("email company_id isManager isCustomer role roles user_id")
      .limit(25);

    console.log("Candidates (email contains 'logistic'):");
    console.log(
      candidates.map((u) => ({
        email: u.email,
        company_id: u.company_id,
        isManager: u.isManager,
        isCustomer: u.isCustomer,
        role: u.role,
        roles: (u.roles || []).map((r) => (r && r.name ? r.name : String(r))).slice(0, 6),
      }))
    );
    return;
  }

  const companyId = user.company_id;
  console.log(`✅ Found user: ${user.email} (company_id=${companyId})`);

  let logisticRole = await Role.findOne({
    name: LOGISTIC_ROLE_NAME,
    company_id: companyId,
  });

  if (!logisticRole) {
    console.log(`ℹ️ Role not found, creating: ${LOGISTIC_ROLE_NAME}`);
    logisticRole = await Role.create({
      name: LOGISTIC_ROLE_NAME,
      description: "Logistic Manager role (dispatch/hold orders)",
      company_id: companyId,
      permissionGroups: [],
      permissions: [],
      isActive: true,
    });
  }

  // Apply the role
  user.roles = [logisticRole._id];
  user.isManager = false;
  user.managerProfile = undefined;

  // Apply minimal logistics permissions directly to the user.
  // Backend status checks are role-based, but permissions can also be used by middleware/route guards.
  const logisticPermissions = await Permission.find({
    key: { $in: ["orders.read", "orders.update", "notifications.read"] },
    company_id: companyId,
  });
  user.permissions = logisticPermissions.map((p) => p._id);

  await user.save();

  console.log("🎯 Migration complete:", {
    email: user.email,
    role: LOGISTIC_ROLE_NAME,
    roleId: String(logisticRole._id),
    permissions: logisticPermissions.map((p) => p.key),
  });
}

main()
  .then(() => {
    mongoose.disconnect();
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    mongoose.disconnect();
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  });

