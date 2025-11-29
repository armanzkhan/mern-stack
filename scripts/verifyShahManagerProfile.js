/*
  Script to verify manager profile for shah@ressichem.com
*/

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const User = require("../models/User");
const Manager = require("../models/Manager");

async function verifyShahManagerProfile() {
  try {
    await connect();
    
    const email = "shah@ressichem.com";
    const companyId = "RESSICHEM";
    
    console.log(`🔍 Verifying manager profile for: ${email}\n`);
    
    // Find user
    const user = await User.findOne({ email, company_id: companyId });
    
    if (!user) {
      console.error(`❌ User not found`);
      process.exit(1);
    }
    
    console.log("📋 User Details:");
    console.log(`   Email: ${user.email}`);
    console.log(`   User ID: ${user.user_id}`);
    console.log(`   Company ID: ${user.company_id}`);
    console.log(`   Is Manager: ${user.isManager}`);
    console.log(`   Has Manager Profile: ${!!user.managerProfile}`);
    
    if (user.managerProfile) {
      console.log(`   Manager Profile Manager ID: ${user.managerProfile.manager_id || 'NOT SET'}`);
      console.log(`   Manager Profile Categories: ${user.managerProfile.assignedCategories?.join(', ') || 'NONE'}`);
      console.log(`   Manager Profile Level: ${user.managerProfile.managerLevel || 'NOT SET'}`);
    }
    
    // Find manager by user_id and company_id (how backend looks it up)
    const manager = await Manager.findOne({ user_id: user.user_id, company_id: companyId });
    
    console.log("\n📋 Manager Record (looked up by user_id + company_id):");
    if (manager) {
      console.log(`   ✅ Manager found: ${manager._id}`);
      console.log(`   User ID: ${manager.user_id}`);
      console.log(`   Company ID: ${manager.company_id}`);
      console.log(`   Manager Level: ${manager.managerLevel}`);
      console.log(`   Active Categories: ${manager.assignedCategories.filter(c => c.isActive).map(c => c.category).join(', ')}`);
      
      // Check if manager_id in user.managerProfile matches
      if (user.managerProfile?.manager_id) {
        const profileManagerId = String(user.managerProfile.manager_id);
        const actualManagerId = String(manager._id);
        console.log(`\n🔗 Manager ID Match Check:`);
        console.log(`   User.managerProfile.manager_id: ${profileManagerId}`);
        console.log(`   Manager._id: ${actualManagerId}`);
        console.log(`   Match: ${profileManagerId === actualManagerId ? '✅ YES' : '❌ NO'}`);
        
        if (profileManagerId !== actualManagerId) {
          console.log(`\n⚠️  MISMATCH DETECTED! Updating user.managerProfile.manager_id...`);
          user.managerProfile.manager_id = manager._id;
          await user.save();
          console.log(`✅ Updated user.managerProfile.manager_id to match Manager._id`);
        }
      } else {
        console.log(`\n⚠️  user.managerProfile.manager_id is NOT SET! Setting it now...`);
        user.managerProfile = user.managerProfile || {};
        user.managerProfile.manager_id = manager._id;
        await user.save();
        console.log(`✅ Set user.managerProfile.manager_id to ${manager._id}`);
      }
    } else {
      console.log(`   ❌ Manager NOT found by user_id + company_id`);
      console.log(`   This is the problem! The backend won't find the manager.`);
    }
    
    // Also check by manager_id from user.managerProfile
    if (user.managerProfile?.manager_id) {
      const managerById = await Manager.findById(user.managerProfile.manager_id);
      console.log(`\n📋 Manager Record (looked up by managerProfile.manager_id):`);
      if (managerById) {
        console.log(`   ✅ Manager found: ${managerById._id}`);
      } else {
        console.log(`   ❌ Manager NOT found by managerProfile.manager_id`);
      }
    }
    
    console.log("\n✅ Verification complete!");
    
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  verifyShahManagerProfile().catch(err => {
    console.error("❌ Unhandled error:", err);
    process.exit(1);
  });
}

module.exports = { verifyShahManagerProfile };

