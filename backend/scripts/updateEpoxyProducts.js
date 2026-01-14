// backend/scripts/updateEpoxyProducts.js
// Quick script to update only Epoxy Floorings & Coatings products
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Only Epoxy Floorings & Coatings products from user's list
const epoxyProducts = [
  // Epoxy Crack Fillers
  { name: "Ressi EPO Crack Fill", unit: "LTR", sku: 2.16, price: 813, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
  { name: "Ressi EPO Crack Fill", unit: "LTR", sku: 21.6, price: 7500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
  { name: "Ressi EPO Crack Fill LV", unit: "LTR", sku: 2.18, price: 550, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
  { name: "Ressi EPO Crack Fill LV", unit: "LTR", sku: 21.8, price: 4088, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
  { name: "Ressi EPO Crack Fill WR", unit: "LTR", sku: 2.18, price: 681, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
  { name: "Ressi EPO Crack Fill WR", unit: "LTR", sku: 21.8, price: 5450, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
  { name: "Ressi EPO Crack Fill CR", unit: "LTR", sku: 2.15, price: 806, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
  { name: "Ressi EPO Crack Fill CR", unit: "LTR", sku: 21.5, price: 6719, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
  // Epoxy Primers
  { name: "Ressi EPO Primer", unit: "LTR", sku: 1.6, price: 3750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Primer", unit: "LTR", sku: 16, price: 34800, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Primer", unit: "LTR", sku: 48, price: 102500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Primer LV", unit: "LTR", sku: 1.8, price: 3563, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Primer LV", unit: "LTR", sku: 18, price: 32963, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Primer LV", unit: "LTR", sku: 54, price: 97875, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Primer WR", unit: "LTR", sku: 1.8, price: 5625, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Primer WR", unit: "LTR", sku: 18, price: 54000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Primer WR", unit: "LTR", sku: 54, price: 155250, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Primer CR", unit: "LTR", sku: 1.5, price: 6125, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Primer CR", unit: "LTR", sku: 15, price: 56250, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Primer CR", unit: "LTR", sku: 45, price: 160000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Primer WCR", unit: "LTR", sku: 1.8, price: 7875, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Primer WCR", unit: "LTR", sku: 18, price: 73125, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Primer WCR", unit: "LTR", sku: 54, price: 202500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Iron Primer", unit: "LTR", sku: 1.16, price: 2356, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Iron Primer", unit: "LTR", sku: 11.6, price: 21750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Iron Primer", unit: "LTR", sku: 23.2, price: 41250, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Chem Prime 402", unit: "LTR", sku: 1.5, price: 5000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Chem Prime 402", unit: "LTR", sku: 15, price: 48750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  { name: "Ressi EPO Chem Prime 402", unit: "LTR", sku: 45, price: 93750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
  // Epoxy Mid Coats
  { name: "Ressi EPO Mid Coat S - GP", unit: "LTR", sku: 2.96, price: 2368, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat S - GP", unit: "LTR", sku: 14.8, price: 11285, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat S - GP", unit: "LTR", sku: 29.6, price: 21830, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat S - GP", unit: "LTR", sku: 59.2, price: 41440, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat F - GP", unit: "LTR", sku: 2.96, price: 3330, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat F - GP", unit: "LTR", sku: 14.8, price: 13320, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat F - GP", unit: "LTR", sku: 29.6, price: 24420, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat F - GP", unit: "LTR", sku: 59.2, price: 45140, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat S - CR", unit: "LTR", sku: 2.8, price: 3150, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat S - CR", unit: "LTR", sku: 14, price: 14875, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat S - CR", unit: "LTR", sku: 28, price: 28000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat S - CR", unit: "LTR", sku: 56, price: 52500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat F - CR", unit: "LTR", sku: 2.8, price: 3325, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat F - CR", unit: "LTR", sku: 14, price: 15750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat F - CR", unit: "LTR", sku: 28, price: 29750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  { name: "Ressi EPO Mid Coat F - CR", unit: "LTR", sku: 56, price: 56000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
  // Two Component Epoxy Top Coats
  { name: "Ressi EPO Tough Might", unit: "LTR", sku: 1.4, price: 3525, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Tough Might", unit: "LTR", sku: 14, price: 33750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Tough Might", unit: "LTR", sku: 28, price: 66150, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Tough Might Econo", unit: "LTR", sku: 1.6, price: 3063, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Tough Might Econo", unit: "LTR", sku: 16, price: 28300, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Tough Might Econo", unit: "LTR", sku: 32, price: 54000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Gloss Might", unit: "LTR", sku: 1.4, price: 3360, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Gloss Might", unit: "LTR", sku: 14, price: 31763, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Gloss Might", unit: "LTR", sku: 28, price: 61600, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Chem Might", unit: "LTR", sku: 1.5, price: 4688, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Chem Might", unit: "LTR", sku: 15, price: 45000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Chem Might", unit: "LTR", sku: 30, price: 86250, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Clear Coat-Floor", unit: "LTR", sku: 1.5, price: 4688, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Clear Coat-Floor", unit: "LTR", sku: 15, price: 45000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Clear Coat-Floor", unit: "LTR", sku: 30, price: 86250, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Clear Coat-Walls", unit: "LTR", sku: 1.5, price: 3938, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Clear Coat-Walls", unit: "LTR", sku: 15, price: 37500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Clear Coat-Walls", unit: "LTR", sku: 30, price: 67500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Anti-static", unit: "LTR", sku: 1.5, price: 5375, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Anti-static", unit: "LTR", sku: 15, price: 50625, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  { name: "Ressi EPO Anti-static", unit: "LTR", sku: 30, price: 97500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
  // Three Component Heavy Duty Epoxy Floorings
  { name: "Ressi EPO FLOOR PLUS Econo", unit: "LTR", sku: 3.2, price: 2963, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  { name: "Ressi EPO FLOOR PLUS Econo", unit: "LTR", sku: 16, price: 14400, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  { name: "Ressi EPO FLOOR PLUS Econo", unit: "LTR", sku: 32, price: 28200, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  { name: "Ressi EPO FLOOR PLUS Econo", unit: "LTR", sku: 64, price: 54400, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  { name: "Ressi EPO FLOOR PLUS", unit: "LTR", sku: 2.8, price: 3325, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  { name: "Ressi EPO FLOOR PLUS", unit: "LTR", sku: 28, price: 31500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  { name: "Ressi EPO FLOOR PLUS", unit: "LTR", sku: 56, price: 58450, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  { name: "Ressi EPO Gloss Plus", unit: "LTR", sku: 2.7, price: 3875, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  { name: "Ressi EPO Gloss Plus", unit: "LTR", sku: 13.5, price: 18563, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  { name: "Ressi EPO Gloss Plus", unit: "LTR", sku: 27, price: 35438, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  { name: "Ressi EPO Gloss Plus", unit: "LTR", sku: 54, price: 67500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  { name: "Ressi EPO Chem Plus", unit: "LTR", sku: 2.7, price: 4900, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  { name: "Ressi EPO Chem Plus", unit: "LTR", sku: 13.5, price: 23625, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  { name: "Ressi EPO Chem Plus", unit: "LTR", sku: 27, price: 45563, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  { name: "Ressi EPO Chem Plus", unit: "LTR", sku: 54, price: 87750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
  // Thin Coat Brush, Roller and Spray Applied
  { name: "Ressi EPO Roll Coat-Floor", unit: "LTR", sku: 1.4, price: 3875, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  { name: "Ressi EPO Roll Coat-Floor", unit: "LTR", sku: 14, price: 37625, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  { name: "Ressi EPO Roll Coat-Floor", unit: "LTR", sku: 28, price: 73500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  { name: "Ressi EPO Roll Coat Plus", unit: "LTR", sku: 1.16, price: 2050, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  { name: "Ressi EPO Roll Coat Plus", unit: "LTR", sku: 11.6, price: 18750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  { name: "Ressi EPO Roll Coat Plus", unit: "LTR", sku: 23.2, price: 36000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  { name: "Ressi EPO Iron Coat", unit: "LTR", sku: 1.16, price: 2350, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  { name: "Ressi EPO Iron Coat", unit: "LTR", sku: 11.6, price: 22000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  { name: "Ressi EPO Iron Coat", unit: "LTR", sku: 23.2, price: 42500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  { name: "Ressi EPO Iron Coat CR", unit: "LTR", sku: 1.16, price: 2625, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  { name: "Ressi EPO Iron Coat CR", unit: "LTR", sku: 11.6, price: 25375, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  { name: "Ressi EPO Iron Coat CR", unit: "LTR", sku: 23.2, price: 49300, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  { name: "Ressi EPO Chem Coat 406", unit: "LTR", sku: 1.5, price: 4875, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  { name: "Ressi EPO Chem Coat 406", unit: "LTR", sku: 15, price: 47813, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  { name: "Ressi EPO Chem Coat 406", unit: "LTR", sku: 30, price: 93750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
].map(p => ({
  ...p,
  fullName: `${p.name} - ${p.sku} ${p.unit}`,
  company_id: "RESSICHEM"
}));

async function updateEpoxyProducts() {
  try {
    await connect();
    console.log("📦 Updating Epoxy Floorings & Coatings products...\n");
    console.log(`   Processing ${epoxyProducts.length} products...\n`);

    // Fetch all existing products in one query
    const productNames = epoxyProducts.map(p => p.fullName);
    const existingProducts = await Product.find({
      name: { $in: productNames },
      company_id: "RESSICHEM"
    });
    
    const existingMap = new Map();
    existingProducts.forEach(p => {
      existingMap.set(p.name, p);
    });

    // Prepare bulk operations
    const bulkOps = [];
    let created = 0;
    let updated = 0;

    for (const productInfo of epoxyProducts) {
      const productName = productInfo.fullName;
      const existingProduct = existingMap.get(productName);

      const productPayload = {
        name: productName,
        description: productInfo.name,
        price: productInfo.price,
        unit: productInfo.unit,
        sku: String(productInfo.sku),
        category: productInfo.category,
        company_id: "RESSICHEM",
        stock: existingProduct?.stock || 0,
        minStock: 0,
        isActive: true
      };

      if (existingProduct) {
        bulkOps.push({
          updateOne: {
            filter: { _id: existingProduct._id },
            update: { $set: productPayload }
          }
        });
        updated++;
      } else {
        bulkOps.push({
          insertOne: {
            document: productPayload
          }
        });
        created++;
      }
    }

    // Execute bulk operations
    if (bulkOps.length > 0) {
      console.log(`   Executing ${bulkOps.length} bulk operations...`);
      await Product.bulkWrite(bulkOps, { ordered: false });
    }

    console.log("\n📊 Update Summary:");
    console.log(`   ✨ Created: ${created} products`);
    console.log(`   ✅ Updated: ${updated} products`);
    console.log("\n🎉 Epoxy products update completed!");
  } catch (error) {
    console.error("❌ Update failed:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  updateEpoxyProducts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { updateEpoxyProducts };

