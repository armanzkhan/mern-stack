/*
  Usage:
  node backend/scripts/assignCategoryToManager.js "sales@ressichem.com" "Tiling and Grouting Materials" [--replace]
  If --replace is passed, existing assignedCategories will be removed and replaced by the provided category only.
*/

const mongoose = require("mongoose");
const User = require("../models/User");
const Manager = require("../models/Manager");
const Role = require("../models/Role");

async function connectDB() {
  const uri = process.env.CONNECTION_STRING || "mongodb://localhost:27017/Ressichem";
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function ensureRoleAssigned(user, roleName) {
  try {
    const role = await Role.findOne({ name: roleName, company_id: user.company_id });
    if (!role) {
      console.log(`ℹ️ Role '${roleName}' not found for company ${user.company_id}. Skipping role assignment.`);
      return false;
    }
    const hasRole = (user.roles || []).some((r) => String(r) === String(role._id));
    if (!hasRole) {
      user.roles = [...(user.roles || []), role._id];
      await user.save();
      console.log(`✅ Assigned role '${roleName}' to ${user.email}`);
    } else {
      console.log(`✅ User already has role '${roleName}'`);
    }
    return true;
  } catch (e) {
    console.log(`⚠️ Could not assign role '${roleName}':`, e.message);
    return false;
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const emailArg = argv[0];
  const categoryArg = argv[1];
  const replace = argv.includes('--replace');
  if (!emailArg || !categoryArg) {
    console.error("❌ Usage: node backend/scripts/assignCategoryToManager.js <email> <category>");
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

    // Upsert Manager record
    let manager = await Manager.findOne({ user_id: user.user_id, company_id: user.company_id });
    if (!manager) {
      manager = new Manager({
        user_id: user.user_id,
        company_id: user.company_id,
        createdBy: user._id,
        isActive: true,
      });
      console.log("🆕 Created new Manager record");
    }

    // Assign category
    let assigned = manager.assignedCategories || [];
    if (replace) {
      assigned = [];
    }
    const exists = assigned.some((c) => c.category === categoryArg && c.isActive);
    if (!exists) {
      assigned.push({
        category: categoryArg,
        assignedBy: user._id,
        assignedAt: new Date(),
        isActive: true,
      });
    }
    manager.assignedCategories = assigned;
    manager.managerLevel = 'senior';
    await manager.save();
    console.log(`✅ Manager categories updated → [${manager.assignedCategories.map(c => c.category).join(', ')}]`);

    // Update User manager profile
    user.isManager = true;
    user.managerProfile = user.managerProfile || {};
    user.managerProfile.managerLevel = 'senior';
    if (replace) {
      user.managerProfile.assignedCategories = [categoryArg];
    } else {
      const uCats = new Set([...(user.managerProfile.assignedCategories || []), categoryArg]);
      user.managerProfile.assignedCategories = Array.from(uCats);
    }
    await user.save();
    console.log("✅ User manager profile updated");

    // Assign Sales Manager role if present
    await ensureRoleAssigned(user, 'Sales Manager');

    console.log("\n🎉 Update complete");
    console.log({
      email: user.email,
      user_id: user.user_id,
      company_id: user.company_id,
      level: user.managerProfile.managerLevel,
      categories: user.managerProfile.assignedCategories,
      replaced: replace,
    });
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


