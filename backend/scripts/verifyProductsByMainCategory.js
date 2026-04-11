/**
 * Run from backend folder: node scripts/verifyProductsByMainCategory.js
 * Requires MONGODB_URI or defaults to mongodb://localhost:27017/Ressichem
 * Prints product counts per category.mainCategory and flags mismatches vs expected mains.
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Product = require("../models/Product");

const EXPECTED_MAIN_CATEGORIES = [
  "Dry Mix Mortars / Premix Plasters",
  "Epoxy Adhesives and Coatings",
  "Epoxy Floorings & Coatings",
  "Building Care and Maintenance",
  "Building Care & Maintenance",
  "Tiling and Grouting Materials",
  "Concrete Admixtures",
  "Decorative Concrete",
  "Building Insulation",
  "Specialty Products",
];

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/Ressichem";
  await mongoose.connect(uri);
  console.log("Connected. Aggregating products by category.mainCategory...\n");

  const rows = await Product.aggregate([
    { $match: { isActive: true, company_id: "RESSICHEM" } },
    {
      $group: {
        _id: "$category.mainCategory",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  let total = 0;
  const byCat = new Map();
  for (const r of rows) {
    const name = r._id || "(missing mainCategory)";
    byCat.set(name, r.count);
    total += r.count;
  }

  console.log(`Total active RESSICHEM products: ${total}\n`);
  console.log("Count per mainCategory:");
  for (const [name, count] of [...byCat.entries()].sort((a, b) =>
    String(a[0]).localeCompare(String(b[0]))
  )) {
    console.log(`  ${count}\t${name}`);
  }

  const dupOrVariant = [];
  for (const exp of EXPECTED_MAIN_CATEGORIES) {
    if (byCat.has(exp)) continue;
    const lower = exp.toLowerCase();
    for (const k of byCat.keys()) {
      if (k && k.toLowerCase().replace(/&/g, "and") === lower.replace(/&/g, "and")) {
        dupOrVariant.push({ expected: exp, inDb: k, count: byCat.get(k) });
      }
    }
  }
  if (dupOrVariant.length) {
    console.log("\n⚠️  Similar names (check & vs and / spelling):");
    for (const d of dupOrVariant) {
      console.log(`  Listed "${d.expected}" → DB has "${d.inDb}" (${d.count} products)`);
    }
  }

  const missing = EXPECTED_MAIN_CATEGORIES.filter((e) => !byCat.has(e));
  if (missing.length) {
    console.log("\nℹ️  Expected label not found as exact mainCategory string:");
    missing.forEach((m) => console.log(`  - ${m}`));
  }

  await mongoose.disconnect();
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
