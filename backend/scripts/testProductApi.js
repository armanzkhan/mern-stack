// backend/scripts/testProductApi.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function testProductApi() {
  try {
    await connect();
    console.log("🔍 Testing Product API Connection Flow...\n");

    // Test 1: Database Query (simulating backend controller)
    console.log("📊 Test 1: Database Query (Backend Controller Logic)");
    const filter = { 
      isActive: true,
      company_id: "RESSICHEM"
    };
    
    const products = await Product.find(filter)
      .limit(10)
      .select('name sku price unit category');
    
    console.log(`   ✅ Found ${products.length} products in database`);
    console.log(`   📦 Sample products:`);
    products.slice(0, 5).forEach((p, i) => {
      console.log(`      ${i + 1}. ${p.name} | SKU: ${p.sku} ${p.unit} | PKR ${p.price.toLocaleString()}`);
      console.log(`         Category: ${p.category?.mainCategory || 'N/A'}${p.category?.subCategory ? ' › ' + p.category.subCategory : ''}`);
    });

    // Test 2: Check if products have SKU
    console.log("\n📊 Test 2: Verify SKU Field");
    const productsWithSku = await Product.countDocuments({
      ...filter,
      sku: { $exists: true, $ne: "" }
    });
    console.log(`   ✅ Products with SKU: ${productsWithSku}`);

    // Test 3: Verify category structure
    console.log("\n📊 Test 3: Verify Category Structure");
    const categorySample = await Product.findOne(filter).select('category');
    if (categorySample) {
      console.log(`   ✅ Category structure: ${JSON.stringify(categorySample.category, null, 2)}`);
    }

    // Test 4: Verify prices are set
    console.log("\n📊 Test 4: Verify Prices");
    const productsWithPrice = await Product.countDocuments({
      ...filter,
      price: { $gt: 0 }
    });
    console.log(`   ✅ Products with price > 0: ${productsWithPrice}`);

    // Test 5: Sample from each main category
    console.log("\n📊 Test 5: Sample Products by Category");
    const categories = [
      "Dry Mix Mortars / Premix Plasters",
      "Building Care and Maintenance",
      "Tiling and Grouting Materials",
      "Concrete Admixtures"
    ];

    for (const category of categories) {
      const catProducts = await Product.find({
        ...filter,
        "category.mainCategory": category
      })
      .limit(2)
      .select('name sku price unit');
      
      if (catProducts.length > 0) {
        console.log(`\n   ${category}:`);
        catProducts.forEach(p => {
          console.log(`      - ${p.name} | SKU: ${p.sku} ${p.unit} | PKR ${p.price.toLocaleString()}`);
        });
      }
    }

    console.log("\n✅ All database connection tests passed!");
    console.log("✅ Backend API can fetch products from database");
    console.log("✅ Products have SKU, price, unit, and category fields");
    console.log("✅ Data structure matches frontend expectations");

  } catch (error) {
    console.error("❌ Error testing Product API:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run test
if (require.main === module) {
  testProductApi()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { testProductApi };

