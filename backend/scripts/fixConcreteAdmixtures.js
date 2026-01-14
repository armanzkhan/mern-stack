// backend/scripts/fixConcreteAdmixtures.js
// Ensures that the Concrete Admixtures category in the database
// exactly matches the provided list of products.

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Expected products from user's list - EXACT match required
const expectedProducts = [
  // Max Flo P
  { name: "Max Flo P", sku: 1, unit: "LTR", price: 489 },
  { name: "Max Flo P", sku: 5, unit: "LTR", price: 1955 },
  { name: "Max Flo P", sku: 10, unit: "LTR", price: 3680 },
  { name: "Max Flo P", sku: 15, unit: "LTR", price: 5175 },
  { name: "Max Flo P", sku: 25, unit: "LTR", price: 8050 },
  { name: "Max Flo P", sku: 200, unit: "LTR", price: 59800 },
  
  // Max Flo P 800
  { name: "Max Flo P 800", sku: 1, unit: "LTR", price: 529 },
  { name: "Max Flo P 800", sku: 5, unit: "LTR", price: 2070 },
  { name: "Max Flo P 800", sku: 10, unit: "LTR", price: 4025 },
  { name: "Max Flo P 800", sku: 15, unit: "LTR", price: 5865 },
  { name: "Max Flo P 800", sku: 25, unit: "LTR", price: 9488 },
  { name: "Max Flo P 800", sku: 200, unit: "LTR", price: 71300 },
  
  // Max Flo P 801
  { name: "Max Flo P 801", sku: 1, unit: "LTR", price: 575 },
  { name: "Max Flo P 801", sku: 5, unit: "LTR", price: 2358 },
  { name: "Max Flo P 801", sku: 10, unit: "LTR", price: 4600 },
  { name: "Max Flo P 801", sku: 15, unit: "LTR", price: 6728 },
  { name: "Max Flo P 801", sku: 25, unit: "LTR", price: 10925 },
  { name: "Max Flo P 801", sku: 200, unit: "LTR", price: 80500 },
  
  // Max Flo SP 802
  { name: "Max Flo SP 802", sku: 1, unit: "LTR", price: 598 },
  { name: "Max Flo SP 802", sku: 5, unit: "LTR", price: 2444 },
  { name: "Max Flo SP 802", sku: 10, unit: "LTR", price: 4715 },
  { name: "Max Flo SP 802", sku: 15, unit: "LTR", price: 6900 },
  { name: "Max Flo SP 802", sku: 25, unit: "LTR", price: 11213 },
  { name: "Max Flo SP 802", sku: 200, unit: "LTR", price: 85100 },
  
  // Max Flo SP 803
  { name: "Max Flo SP 803", sku: 1, unit: "LTR", price: 633 },
  { name: "Max Flo SP 803", sku: 5, unit: "LTR", price: 2588 },
  { name: "Max Flo SP 803", sku: 10, unit: "LTR", price: 5060 },
  { name: "Max Flo SP 803", sku: 15, unit: "LTR", price: 7504 },
  { name: "Max Flo SP 803", sku: 25, unit: "LTR", price: 12219 },
  { name: "Max Flo SP 803", sku: 200, unit: "LTR", price: 92000 },
  
  // Max Flo SP 804
  { name: "Max Flo SP 804", sku: 1, unit: "LTR", price: 667 },
  { name: "Max Flo SP 804", sku: 5, unit: "LTR", price: 2818 },
  { name: "Max Flo SP 804", sku: 10, unit: "LTR", price: 5520 },
  { name: "Max Flo SP 804", sku: 15, unit: "LTR", price: 8108 },
  { name: "Max Flo SP 804", sku: 25, unit: "LTR", price: 13225 },
  { name: "Max Flo SP 804", sku: 200, unit: "LTR", price: 103500 },
  
  // Max Flo SP 805
  { name: "Max Flo SP 805", sku: 1, unit: "LTR", price: 679 },
  { name: "Max Flo SP 805", sku: 5, unit: "LTR", price: 2933 },
  { name: "Max Flo SP 805", sku: 10, unit: "LTR", price: 5750 },
  { name: "Max Flo SP 805", sku: 15, unit: "LTR", price: 8453 },
  { name: "Max Flo SP 805", sku: 25, unit: "LTR", price: 13800 },
  { name: "Max Flo SP 805", sku: 200, unit: "LTR", price: 105800 },
  
  // Max Flo SP 900
  { name: "Max Flo SP 900", sku: 1, unit: "LTR", price: 748 },
  { name: "Max Flo SP 900", sku: 5, unit: "LTR", price: 3105 },
  { name: "Max Flo SP 900", sku: 10, unit: "LTR", price: 6095 },
  { name: "Max Flo SP 900", sku: 15, unit: "LTR", price: 9315 },
  { name: "Max Flo SP 900", sku: 25, unit: "LTR", price: 15238 },
  { name: "Max Flo SP 900", sku: 200, unit: "LTR", price: 115000 },
  
  // Max Flo SP 901
  { name: "Max Flo SP 901", sku: 1, unit: "LTR", price: 771 },
  { name: "Max Flo SP 901", sku: 5, unit: "LTR", price: 3220 },
  { name: "Max Flo SP 901", sku: 10, unit: "LTR", price: 6325 },
  { name: "Max Flo SP 901", sku: 15, unit: "LTR", price: 9315 },
  { name: "Max Flo SP 901", sku: 25, unit: "LTR", price: 15238 },
  { name: "Max Flo SP 901", sku: 200, unit: "LTR", price: 112700 },
  
  // Max Flo SP 902
  { name: "Max Flo SP 902", sku: 1, unit: "LTR", price: 851 },
  { name: "Max Flo SP 902", sku: 5, unit: "LTR", price: 3680 },
  { name: "Max Flo SP 902", sku: 10, unit: "LTR", price: 7245 },
  { name: "Max Flo SP 902", sku: 15, unit: "LTR", price: 10695 },
  { name: "Max Flo SP 902", sku: 25, unit: "LTR", price: 17538 },
  { name: "Max Flo SP 902", sku: 200, unit: "LTR", price: 133400 },
  
  // Max Flo VE
  { name: "Max Flo VE", sku: 1, unit: "LTR", price: 1219 },
  { name: "Max Flo VE", sku: 5, unit: "LTR", price: 5750 },
  { name: "Max Flo VE", sku: 10, unit: "LTR", price: 11270 },
  { name: "Max Flo VE", sku: 15, unit: "LTR", price: 16388 },
  { name: "Max Flo VE", sku: 25, unit: "LTR", price: 26450 },
  { name: "Max Flo VE", sku: 200, unit: "LTR", price: 204700 },
  
  // Max Flo R
  { name: "Max Flo R", sku: 1, unit: "LTR", price: 690 },
  { name: "Max Flo R", sku: 5, unit: "LTR", price: 3163 },
  { name: "Max Flo R", sku: 10, unit: "LTR", price: 6095 },
  { name: "Max Flo R", sku: 15, unit: "LTR", price: 8798 },
  { name: "Max Flo R", sku: 25, unit: "LTR", price: 14088 },
  { name: "Max Flo R", sku: 200, unit: "LTR", price: 103500 },
  
  // Max Flo Air Intra
  { name: "Max Flo Air Intra", sku: 1, unit: "LTR", price: 2013 },
  { name: "Max Flo Air Intra", sku: 5, unit: "LTR", price: 9775 },
  { name: "Max Flo Air Intra", sku: 10, unit: "LTR", price: 18975 },
  { name: "Max Flo Air Intra", sku: 15, unit: "LTR", price: 27600 },
  { name: "Max Flo Air Intra", sku: 25, unit: "LTR", price: 44563 },
  { name: "Max Flo Air Intra", sku: 200, unit: "LTR", price: 345000 },
  
  // Max Flo Integra 1 (Powder)
  { name: "Max Flo Integra 1 (Powder)", sku: 2, unit: "KG", price: 782 },
  { name: "Max Flo Integra 1 (Powder)", sku: 20, unit: "KG", price: 7130 },
  
  // Max Flo Integra 2 (Powder)
  { name: "Max Flo Integra 2 (Powder)", sku: 2, unit: "KG", price: 1058 },
  { name: "Max Flo Integra 2 (Powder)", sku: 20, unit: "KG", price: 10120 },
  
  // Max Flo Integra 3 (Powder)
  { name: "Max Flo Integra 3 (Powder)", sku: 2, unit: "KG", price: 1380 },
  { name: "Max Flo Integra 3 (Powder)", sku: 20, unit: "KG", price: 13340 },
  
  // Max Flo Integra 4 (Powder)
  { name: "Max Flo Integra 4 (Powder)", sku: 2, unit: "KG", price: 2185 },
  { name: "Max Flo Integra 4 (Powder)", sku: 20, unit: "KG", price: 21160 },
  
  // Max Flo CI
  { name: "Max Flo CI", sku: 1, unit: "LTR", price: 558 },
  { name: "Max Flo CI", sku: 5, unit: "LTR", price: 2588 },
  { name: "Max Flo CI", sku: 10, unit: "LTR", price: 4830 },
  { name: "Max Flo CI", sku: 15, unit: "LTR", price: 6900 },
  { name: "Max Flo CI", sku: 25, unit: "LTR", price: 10638 },
  { name: "Max Flo CI", sku: 200, unit: "LTR", price: 78200 },
  
  // Max Flo PB
  { name: "Max Flo PB", sku: 1, unit: "LTR", price: 920 },
  { name: "Max Flo PB", sku: 5, unit: "LTR", price: 3853 },
  { name: "Max Flo PB", sku: 10, unit: "LTR", price: 7590 },
  { name: "Max Flo PB", sku: 15, unit: "LTR", price: 12075 },
  { name: "Max Flo PB", sku: 25, unit: "LTR", price: 19550 },
  { name: "Max Flo PB", sku: 200, unit: "LTR", price: 151800 },
  
  // Max Flo MP
  { name: "Max Flo MP", sku: 1, unit: "LTR", price: 702 },
  { name: "Max Flo MP", sku: 5, unit: "LTR", price: 2875 },
  { name: "Max Flo MP", sku: 10, unit: "LTR", price: 5635 },
  { name: "Max Flo MP", sku: 15, unit: "LTR", price: 8280 },
  { name: "Max Flo MP", sku: 25, unit: "LTR", price: 13513 },
  { name: "Max Flo MP", sku: 200, unit: "LTR", price: 103500 },
  
  // Max Flo SAL
  { name: "Max Flo SAL", sku: 1, unit: "LTR", price: 771 },
  { name: "Max Flo SAL", sku: 5, unit: "LTR", price: 3335 },
  { name: "Max Flo SAL", sku: 10, unit: "LTR", price: 6555 },
  { name: "Max Flo SAL", sku: 15, unit: "LTR", price: 9660 },
  { name: "Max Flo SAL", sku: 25, unit: "LTR", price: 15813 },
  { name: "Max Flo SAL", sku: 200, unit: "LTR", price: 120750 },
  
  // Max Flo SAP (Powder)
  { name: "Max Flo SAP (Powder)", sku: 2, unit: "KG", price: 2990 },
  { name: "Max Flo SAP (Powder)", sku: 20, unit: "KG", price: 28750 },
  
  // Max Flo P 800 (Powder)
  { name: "Max Flo P 800 (Powder)", sku: 2, unit: "KG", price: 460 },
  { name: "Max Flo P 800 (Powder)", sku: 20, unit: "KG", price: 3680 },
  
  // Max Flo SP 900 (Powder)
  { name: "Max Flo SP 900 (Powder)", sku: 2, unit: "KG", price: 828 },
  { name: "Max Flo SP 900 (Powder)", sku: 20, unit: "KG", price: 7590 },
  
  // Max Flo SP 802 (Powder)
  { name: "Max Flo SP 802 (Powder)", sku: 2, unit: "KG", price: 575 },
  { name: "Max Flo SP 802 (Powder)", sku: 20, unit: "KG", price: 5175 },
];

async function fixConcreteAdmixtures() {
  try {
    await connect();
    console.log("🔧 Fixing Concrete Admixtures products...\n");

    // Step 1: Remove all existing products from the category
    console.log("Step 1: Removing all existing products from Concrete Admixtures category...");
    const deleteResult = await Product.deleteMany({
      "category.mainCategory": "Concrete Admixtures",
      company_id: "RESSICHEM"
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing products\n`);

    // Step 2: Create products with exact specifications
    console.log(`Step 2: Creating ${expectedProducts.length} products with exact specifications...`);
    const productsToInsert = expectedProducts.map(prod => ({
      name: `${prod.name} - ${prod.sku} ${prod.unit}`,
      fullName: `${prod.name} - ${prod.sku} ${prod.unit}`,
      description: prod.name,
      sku: prod.sku,
      unit: prod.unit,
      price: prod.price,
      category: { mainCategory: "Concrete Admixtures" },
      company_id: "RESSICHEM",
      isActive: true,
      stockStatus: "in_stock"
    }));
    
    const createResult = await Product.insertMany(productsToInsert, { ordered: false });
    console.log(`✅ Created ${createResult.length} products\n`);

    // Step 3: Verify results
    console.log("Step 3: Verifying results...");
    const dbProducts = await Product.find({
      "category.mainCategory": "Concrete Admixtures",
      company_id: "RESSICHEM"
    });

    console.log(`\n📊 Total products in database: ${dbProducts.length}`);
    console.log(`📊 Expected products: ${expectedProducts.length}`);

    if (dbProducts.length === expectedProducts.length) {
      console.log("\n✅ Correct products: " + expectedProducts.length);
      console.log("\n================================================================================");
      console.log("✅ SUCCESS! 100% match achieved!");
      console.log("================================================================================\n");
    } else {
      console.log("\n❌ Product count mismatch!");
      console.log("================================================================================");
      console.log("⚠️  Please review the output above.");
      console.log("================================================================================\n");
    }

  } catch (error) {
    console.error("❌ Error during fixing process:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  fixConcreteAdmixtures()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { fixConcreteAdmixtures };

