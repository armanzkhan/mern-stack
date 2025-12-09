// backend/scripts/seedProducts.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

const sampleProducts = [
  {
    company_id: "RESSICHEM",
    name: "RESSICHEM Premium Dry Mix Mortar",
    description: "High-quality dry mix mortar for construction applications",
    price: 2500,
    unit: "kg",
    stock: 1000,
    minStock: 100,
    category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "General Purpose Mortars", subSubCategory: "Standard Grade" }
  },
  {
    company_id: "RESSICHEM",
    name: "RESSICHEM Epoxy Floor Coating",
    description: "Durable two-component epoxy coating for industrial floors",
    price: 4500,
    unit: "liter",
    stock: 500,
    minStock: 50,
    category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats", subSubCategory: "Industrial Grade" }
  },
  {
    company_id: "RESSICHEM",
    name: "RESSICHEM Waterproofing Membrane",
    description: "Flexible polyurethane waterproofing membrane",
    price: 250,
    unit: "sqm",
    stock: 2000,
    minStock: 200,
    category: { mainCategory: "Building Care & Maintenance", subCategory: "Waterproofing Systems", subSubCategory: "Membrane Systems" }
  },
  {
    company_id: "RESSICHEM",
    name: "RESSICHEM Concrete Repair Mortar",
    description: "Fast-setting concrete repair mortar for structural repairs",
    price: 150,
    unit: "kg",
    stock: 800,
    minStock: 80,
    category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "Repair Materials", subSubCategory: "Structural Repair" }
  },
  {
    company_id: "RESSICHEM",
    name: "RESSICHEM Tile Adhesive",
    description: "High-strength cement-based tile adhesive",
    price: 1500,
    unit: "kg",
    stock: 600,
    minStock: 60,
    category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives", subSubCategory: "Cement-Based" }
  },
  {
    company_id: "RESSICHEM",
    name: "RESSICHEM Building Care Solution",
    description: "Multi-purpose building care and maintenance solution",
    price: 3000,
    unit: "liter",
    stock: 300,
    minStock: 30,
    category: { mainCategory: "Building Care & Maintenance", subCategory: "Maintenance Solutions", subSubCategory: "Multi-Purpose" }
  },
  {
    company_id: "RESSICHEM",
    name: "RESSICHEM Epoxy Adhesive",
    description: "High-strength epoxy adhesive for structural bonding",
    price: 3500,
    unit: "liter",
    stock: 400,
    minStock: 40,
    category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Structural Adhesives", subSubCategory: "Two-Component" }
  },
  {
    company_id: "RESSICHEM",
    name: "RESSICHEM Concrete Admixture",
    description: "Superplasticizer concrete admixture for improved workability",
    price: 1800,
    unit: "liter",
    stock: 700,
    minStock: 70,
    category: { mainCategory: "Concrete Admixtures", subCategory: "Superplasticizers", subSubCategory: "High Range" }
  },
  {
    company_id: "RESSICHEM",
    name: "RESSICHEM Insulation Foam",
    description: "Polyurethane insulation foam for building insulation",
    price: 1200,
    unit: "liter",
    stock: 900,
    minStock: 90,
    category: { mainCategory: "Building Insulation", subCategory: "Foam Insulation", subSubCategory: "Polyurethane" }
  },
  {
    company_id: "RESSICHEM",
    name: "RESSICHEM Decorative Concrete Stain",
    description: "Acid-based decorative concrete stain for architectural finishes",
    price: 2200,
    unit: "liter",
    stock: 350,
    minStock: 35,
    category: { mainCategory: "Decorative Concrete", subCategory: "Stains and Dyes", subSubCategory: "Acid-Based" }
  }
];

async function seedProducts() {
  const mongoUri = process.env.CONNECTION_STRING || "mongodb://127.0.0.1:27017/Ressichem";
  await connect(mongoUri, undefined, "Ressichem");
  try {
    console.log("MongoDB connected for seedProducts");
    // Remove only RESSICHEM products to be safe
    await Product.deleteMany({ company_id: "RESSICHEM" });
    const created = await Product.insertMany(sampleProducts, { ordered: false });
    console.log(`✅ seedProducts finished. Inserted ${created.length} products`);
  } catch (err) {
    console.error("seedProducts error:", err);
    throw err;
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  seedProducts().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seedProducts;
