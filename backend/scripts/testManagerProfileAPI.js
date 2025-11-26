/*
  Test script to verify manager profile API endpoint
  This simulates what happens when the API is called
*/

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const User = require("../models/User");
const Manager = require("../models/Manager");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

async function testManagerProfileAPI() {
  try {
    await connect();
    
    const email = "shah@ressichem.com";
    const companyId = "RESSICHEM";
    
    console.log(`🔍 Testing manager profile API for: ${email}\n`);
    
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
    
    // Create a test JWT token (simulating login)
    const tokenPayload = {
      user_id: user.user_id,
      _id: user._id,
      company_id: user.company_id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isSuperAdmin: user.isSuperAdmin || false
    };
    
    const testToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1h" });
    console.log(`\n🔑 Generated test token with payload:`, tokenPayload);
    
    // Now simulate what the backend controller does
    console.log(`\n🔍 Simulating getManagerProfile logic...`);
    const userId = tokenPayload.user_id;
    const companyIdFromToken = tokenPayload.company_id;
    
    console.log(`   Looking up Manager with:`);
    console.log(`     user_id: ${userId}`);
    console.log(`     company_id: ${companyIdFromToken}`);
    
    // First try to find a Manager record
    let manager = await Manager.findOne({ user_id: userId, company_id: companyIdFromToken })
      .populate('assignedCategories.assignedBy', 'firstName lastName email');
    
    console.log(`\n📋 Manager lookup result:`);
    console.log(`   Found: ${!!manager}`);
    if (manager) {
      console.log(`   Manager ID: ${manager._id}`);
      console.log(`   User ID: ${manager.user_id}`);
      console.log(`   Company ID: ${manager.company_id}`);
      console.log(`   Categories: ${manager.assignedCategories.filter(c => c.isActive).map(c => c.category).join(', ')}`);
    }
    
    // If no Manager record found, check User's managerProfile
    if (!manager) {
      console.log(`\n⚠️  Manager record not found, checking User's managerProfile...`);
      const userFromDB = await User.findOne({ user_id: userId, company_id: companyIdFromToken });
      
      console.log(`   User found: ${!!userFromDB}`);
      console.log(`   Is Manager: ${userFromDB?.isManager}`);
      console.log(`   Has Manager Profile: ${!!userFromDB?.managerProfile}`);
      
      if (!userFromDB || !userFromDB.isManager || !userFromDB.managerProfile) {
        console.error(`\n❌ FAILED: Manager profile not found - User check failed`);
        console.error(`   User exists: ${!!userFromDB}`);
        console.error(`   Is Manager: ${userFromDB?.isManager}`);
        console.error(`   Has Manager Profile: ${!!userFromDB?.managerProfile}`);
        process.exit(1);
      }
      
      // Try to find Manager record by the manager_id stored in user.managerProfile
      if (userFromDB.managerProfile.manager_id) {
        const managerByProfileId = await Manager.findById(userFromDB.managerProfile.manager_id);
        if (managerByProfileId) {
          console.log(`   ✅ Found Manager record by managerProfile.manager_id`);
          manager = managerByProfileId;
        }
      }
    }
    
    if (manager) {
      console.log(`\n✅ SUCCESS: Manager profile found!`);
      console.log(`   Manager ID: ${manager._id}`);
      console.log(`   User ID: ${manager.user_id}`);
      console.log(`   Company ID: ${manager.company_id}`);
    } else {
      console.error(`\n❌ FAILED: No manager profile found`);
      process.exit(1);
    }
    
    console.log(`\n🎉 Test complete!`);
    
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  testManagerProfileAPI().catch(err => {
    console.error("❌ Unhandled error:", err);
    process.exit(1);
  });
}

module.exports = { testManagerProfileAPI };
