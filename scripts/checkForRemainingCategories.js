// backend/scripts/checkForRemainingCategories.js
// Check for any remaining categories or products from the original list
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function checkForRemainingCategories() {
  try {
    await connect();
    console.log("🔍 CHECKING FOR REMAINING CATEGORIES AND PRODUCTS");
    console.log("=".repeat(80));

    // Get all categories from database
    const allProducts = await Product.find({ company_id: "RESSICHEM" });
    const dbCategories = [...new Set(allProducts.map(p => p.category?.mainCategory).filter(Boolean))];
    
    console.log("\n📋 Categories in Database:");
    dbCategories.forEach((cat, i) => {
      const count = allProducts.filter(p => p.category?.mainCategory === cat).length;
      const activeCount = allProducts.filter(p => p.category?.mainCategory === cat && p.isActive).length;
      console.log(`  ${i + 1}. ${cat} (${activeCount} active, ${count - activeCount} inactive, ${count} total)`);
    });

    // Expected categories from CSV
    const expectedCategories = [
      "Dry Mix Mortars / Premix Plasters",
      "Building Care and Maintenance",
      "Concrete Admixtures",
      "Tiling and Grouting Materials",
      "Decorative Concrete",
      "Specialty Products",
      "Epoxy Floorings & Coatings",
      "Epoxy Adhesives and Coatings"
    ];

    console.log("\n📋 Expected Categories from CSV:");
    expectedCategories.forEach((cat, i) => {
      console.log(`  ${i + 1}. ${cat}`);
    });

    // Check for categories in DB but not in CSV
    const extraCategories = dbCategories.filter(cat => !expectedCategories.includes(cat));
    if (extraCategories.length > 0) {
      console.log("\n⚠️  Categories in Database but NOT in CSV:");
      extraCategories.forEach(cat => {
        const products = allProducts.filter(p => p.category?.mainCategory === cat);
        const activeProducts = products.filter(p => p.isActive);
        console.log(`  - ${cat} (${activeProducts.length} active, ${products.length} total)`);
        if (activeProducts.length > 0) {
          console.log(`    Active products:`);
          activeProducts.slice(0, 5).forEach(p => {
            console.log(`      • ${p.name} (${p.price} PKR)`);
          });
          if (activeProducts.length > 5) {
            console.log(`      ... and ${activeProducts.length - 5} more`);
          }
        }
      });
    } else {
      console.log("\n✅ All database categories are in the expected CSV list");
    }

    // Check for categories in CSV but not in DB
    const missingCategories = expectedCategories.filter(cat => !dbCategories.includes(cat));
    if (missingCategories.length > 0) {
      console.log("\n❌ Categories in CSV but NOT in Database:");
      missingCategories.forEach(cat => {
        console.log(`  - ${cat}`);
      });
    } else {
      console.log("\n✅ All CSV categories are present in database");
    }

    // Check for products with unusual categories or missing categories
    const productsWithoutCategory = allProducts.filter(p => !p.category?.mainCategory);
    if (productsWithoutCategory.length > 0) {
      console.log(`\n⚠️  Products without category: ${productsWithoutCategory.length}`);
      const activeWithoutCategory = productsWithoutCategory.filter(p => p.isActive);
      if (activeWithoutCategory.length > 0) {
        console.log(`  Active products without category: ${activeWithoutCategory.length}`);
        activeWithoutCategory.slice(0, 10).forEach(p => {
          console.log(`    • ${p.name} (${p.price} PKR)`);
        });
      }
    }

    // Check for "Building Insulation" category (mentioned in category definitions but might not be in CSV)
    const buildingInsulationProducts = allProducts.filter(
      p => p.category?.mainCategory === "Building Insulation"
    );
    if (buildingInsulationProducts.length > 0) {
      console.log(`\n📦 Building Insulation Products: ${buildingInsulationProducts.length}`);
      const activeInsulation = buildingInsulationProducts.filter(p => p.isActive);
      if (activeInsulation.length > 0) {
        console.log(`  Active: ${activeInsulation.length}`);
        activeInsulation.slice(0, 10).forEach(p => {
          console.log(`    • ${p.name} (${p.price} PKR)`);
        });
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("📊 SUMMARY");
    console.log("=".repeat(80));
    console.log(`Total Categories in DB: ${dbCategories.length}`);
    console.log(`Expected Categories: ${expectedCategories.length}`);
    console.log(`Extra Categories: ${extraCategories.length}`);
    console.log(`Missing Categories: ${missingCategories.length}`);
    console.log(`Products without category: ${productsWithoutCategory.length}`);

    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

checkForRemainingCategories();

