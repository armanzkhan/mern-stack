/*
  Test the manager profile API with an actual JWT token
  This simulates what the frontend does
*/

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

async function testManagerAPIWithToken() {
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
    
    // Create a JWT token exactly like the login does
    const tokenPayload = {
      user_id: user.user_id,
      _id: user._id,
      company_id: user.company_id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isSuperAdmin: user.isSuperAdmin || false
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1h" });
    console.log(`\n🔑 Generated JWT token`);
    console.log(`   Token length: ${token.length}`);
    console.log(`   Token preview: ${token.substring(0, 50)}...`);
    
    // Test the API endpoint
    console.log(`\n🌐 Testing API endpoint: ${BACKEND_URL}/api/managers/profile`);
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/managers/profile`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log(`\n✅ API Response Success:`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Has Manager: ${!!response.data.manager}`);
      
      if (response.data.manager) {
        console.log(`\n📋 Manager Profile:`);
        console.log(`   Manager ID: ${response.data.manager._id}`);
        console.log(`   User ID: ${response.data.manager.user_id}`);
        console.log(`   Categories: ${response.data.manager.assignedCategories?.join(', ') || 'None'}`);
        console.log(`   Manager Level: ${response.data.manager.managerLevel}`);
        console.log(`   Assigned Customers: ${response.data.manager.assignedCustomers?.length || 0}`);
      } else {
        console.error(`\n❌ No manager in response:`);
        console.error(JSON.stringify(response.data, null, 2));
      }
      
    } catch (error) {
      console.error(`\n❌ API Request Failed:`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Status Text: ${error.response.statusText}`);
        console.error(`   Error Data:`, error.response.data);
      } else if (error.request) {
        console.error(`   No response received. Is the backend server running?`);
        console.error(`   Request error:`, error.message);
      } else {
        console.error(`   Error:`, error.message);
      }
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
  testManagerAPIWithToken().catch(err => {
    console.error("❌ Unhandled error:", err);
    process.exit(1);
  });
}

module.exports = { testManagerAPIWithToken };

