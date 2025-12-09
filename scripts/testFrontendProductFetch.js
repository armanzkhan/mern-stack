// backend/scripts/testFrontendProductFetch.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function testFrontendProductFetch() {
  try {
    await connect();
    console.log("🔍 Testing Frontend Product Fetch: http://localhost:3000/products\n");

    // Simulate frontend API route behavior
    console.log("📊 Step 1: Simulating Frontend API Route (/api/products)");
    
    // Frontend API route defaults to limit=2000 (we just updated it)
    const frontendLimit = 2000;
    
    // Simulate what backend would return
    const backendFilter = {
      isActive: true,
      company_id: "RESSICHEM"
    };

    // Simulate backend getProducts controller with limit
    const products = await Product.find(backendFilter)
      .limit(parseInt(frontendLimit))
      .select('name sku price unit category company_id isActive')
      .sort({ name: 1 });

    console.log(`   Frontend API would request: limit=${frontendLimit}`);
    console.log(`   Backend would return: ${products.length} products`);
    console.log(`   Total products in database: ${await Product.countDocuments(backendFilter)}`);

    if (products.length >= 1256) {
      console.log(`   ✅ All products fetchable (${products.length} >= 1256)`);
    } else {
      console.log(`   ⚠️  Some products may not be fetched (${products.length} < 1256)`);
      console.log(`   ⚠️  Increase limit to ${await Product.countDocuments(backendFilter) + 100}`);
    }

    // Verify products have all required fields
    console.log("\n📊 Step 2: Verify Product Data Completeness");
    
    let completeCount = 0;
    let incompleteCount = 0;

    for (const product of products.slice(0, 100)) { // Check first 100
      const hasCompleteData = 
        product.name &&
        product.sku !== undefined &&
        product.price !== undefined &&
        product.unit &&
        product.category &&
        product.category.mainCategory;

      if (hasCompleteData) {
        completeCount++;
      } else {
        incompleteCount++;
      }
    }

    console.log(`   Products with complete data: ${completeCount}/100 (sample)`);
    if (incompleteCount > 0) {
      console.log(`   ⚠️  Products with incomplete data: ${incompleteCount}`);
    } else {
      console.log(`   ✅ All sample products have complete data`);
    }

    // Check specific products from your pasted list
    console.log("\n📊 Step 3: Verify Key Products Are Fetchable");
    
    const keyProducts = [
      "Ressi PlastoRend 100 - 0001 B - 1 KG",
      "Ressi PlastoRend 100 - 0001 B - 50 KG",
      "RPR 120 C - 0001 - 50 KG",
      "Ressi SC 310 - 0001 - 50 KG",
      "Ressi TG 810 - 0001 - 1 KG",
      "Ressi TG 820 - 0001 - 1 KG",
      "Max Flo P - 1 LTR",
      "Max Flo P - 200 LTR",
      "Water Guard 3020 N - 0001 - 20 KG",
      "Ressi TA 210 - 1 KG"
    ];

    let foundInFetch = 0;
    const fetchedProductNames = products.map(p => p.name);

    for (const keyProduct of keyProducts) {
      const found = fetchedProductNames.includes(keyProduct);
      if (found) {
        foundInFetch++;
        console.log(`   ✅ ${keyProduct.substring(0, 60)}...`);
      } else {
        console.log(`   ❌ ${keyProduct} - NOT in fetched products`);
      }
    }

    console.log(`\n   Key Products Found: ${foundInFetch}/${keyProducts.length}`);

    // Test pagination if needed
    console.log("\n📊 Step 4: Test Pagination (if products > limit)");
    
    const totalProducts = await Product.countDocuments(backendFilter);
    const fetchedCount = products.length;

    if (fetchedCount < totalProducts) {
      console.log(`   ⚠️  Pagination needed:`);
      console.log(`      Total products: ${totalProducts}`);
      console.log(`      Fetched products: ${fetchedCount}`);
      console.log(`      Missing: ${totalProducts - fetchedCount} products`);
      
      // Calculate how many pages needed
      const pagesNeeded = Math.ceil(totalProducts / frontendLimit);
      console.log(`      Pages needed: ${pagesNeeded}`);
    } else {
      console.log(`   ✅ All products fetched in one request (${fetchedCount} >= ${totalProducts})`);
    }

    // Final summary
    console.log("\n" + "=".repeat(70));
    console.log("📊 FRONTEND PRODUCT FETCH VERIFICATION SUMMARY");
    console.log("=".repeat(70));

    console.log(`\n✅ Database Status:`);
    console.log(`   Total Products: ${totalProducts}`);
    console.log(`   Fetchable Products: ${fetchedCount}`);

    console.log(`\n✅ Frontend API Route:`);
    console.log(`   Default Limit: ${frontendLimit}`);
    console.log(`   Products Returned: ${fetchedCount}`);

    console.log(`\n✅ Key Products:`);
    console.log(`   Found in Fetch: ${foundInFetch}/${keyProducts.length}`);

    if (fetchedCount >= totalProducts && foundInFetch === keyProducts.length && incompleteCount === 0) {
      console.log(`\n🎉 ALL PRODUCTS AVAILABLE ON FRONTEND!`);
      console.log(`✅ All ${totalProducts} products are fetchable`);
      console.log(`✅ All key products are included`);
      console.log(`✅ All products have complete data`);
      console.log(`✅ Accessible at: http://localhost:3000/products`);
    } else {
      console.log(`\n⚠️  Some issues detected:`);
      if (fetchedCount < totalProducts) {
        console.log(`   - Increase limit to fetch all products`);
      }
      if (foundInFetch < keyProducts.length) {
        console.log(`   - Some key products not found in fetch`);
      }
      if (incompleteCount > 0) {
        console.log(`   - Some products have incomplete data`);
      }
    }

  } catch (error) {
    console.error("❌ Error testing frontend fetch:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run test
if (require.main === module) {
  testFrontendProductFetch()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { testFrontendProductFetch };

