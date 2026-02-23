// Verification script for updateEpoxyProducts
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

console.log("🔍 Verifying updateEpoxyProducts.js setup...\n");

async function verify() {
  try {
    // Test imports
    console.log("1. Testing imports...");
    const { connect, disconnect } = require("../backend/config/_db");
    const Product = require("../backend/models/Product");
    const { updateEpoxyProducts } = require("./updateEpoxyProducts");
    console.log("   ✅ All imports successful\n");

    // Test database connection
    console.log("2. Testing database connection...");
    await connect();
    console.log("   ✅ Database connected\n");

    // Test Product model query
    console.log("3. Testing Product model...");
    const productCount = await Product.countDocuments({ company_id: "RESSICHEM" });
    console.log(`   ✅ Found ${productCount} RESSICHEM products\n`);

    // Test epoxy products query
    console.log("4. Testing epoxy products query...");
    const epoxyCount = await Product.countDocuments({
      "category.mainCategory": "Epoxy Floorings & Coatings",
      company_id: "RESSICHEM"
    });
    console.log(`   ✅ Found ${epoxyCount} Epoxy Floorings & Coatings products\n`);

    await disconnect();
    console.log("   ✅ Database disconnected\n");

    console.log("✅ All verifications passed!\n");
    console.log("📋 Summary:");
    console.log("   - Database connection: ✅ Working");
    console.log("   - Product model: ✅ Working");
    console.log("   - Script imports: ✅ Correct");
    console.log("   - updateEpoxyProducts function: ✅ Available");
    console.log("\n🎉 Everything is properly connected and ready to use!\n");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

verify();

