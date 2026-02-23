// Quick test to verify all connections
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

console.log("🔍 Testing imports and connections...\n");

// Test 1: Database connection module
console.log("1. Testing database connection module...");
try {
  const { connect, disconnect } = require("../config/_db");
  console.log("   ✅ Database connection module found at ../config/_db\n");
} catch (error) {
  console.log("   ❌ Error loading ../config/_db:", error.message);
  try {
    const { connect, disconnect } = require("../backend/config/_db");
    console.log("   ✅ Database connection module found at ../backend/config/_db\n");
  } catch (error2) {
    console.log("   ❌ Error loading ../backend/config/_db:", error2.message, "\n");
  }
}

// Test 2: Product model
console.log("2. Testing Product model...");
try {
  const Product = require("../models/Product");
  console.log("   ✅ Product model found at ../models/Product\n");
} catch (error) {
  console.log("   ❌ Error loading ../models/Product:", error.message);
  try {
    const Product = require("../backend/models/Product");
    console.log("   ✅ Product model found at ../backend/models/Product\n");
  } catch (error2) {
    console.log("   ❌ Error loading ../backend/models/Product:", error2.message, "\n");
  }
}

// Test 3: Database connection
console.log("3. Testing actual database connection...");
async function testConnection() {
  try {
    let connect, disconnect;
    try {
      const db = require("../config/_db");
      connect = db.connect;
      disconnect = db.disconnect;
    } catch {
      const db = require("../backend/config/_db");
      connect = db.connect;
      disconnect = db.disconnect;
    }
    
    await connect();
    console.log("   ✅ Database connection successful!\n");
    
    // Test Product model
    let Product;
    try {
      Product = require("../models/Product");
    } catch {
      Product = require("../backend/models/Product");
    }
    
    const count = await Product.countDocuments();
    console.log(`   ✅ Product model working! Found ${count} products in database\n`);
    
    await disconnect();
    console.log("   ✅ Database disconnected successfully\n");
    
    console.log("✅ All tests passed! Everything is connected properly.\n");
    process.exit(0);
  } catch (error) {
    console.log("   ❌ Database connection failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

testConnection();

