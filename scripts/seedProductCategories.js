// backend/scripts/seedProductCategories.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const ProductCategory = require("../models/ProductCategory");

const categories = [
  { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategories: [] },
  { mainCategory: "Epoxy Floorings & Coatings", subCategories: [
      { name: "Epoxy Crack Fillers", subSubCategories: [] },
      { name: "Epoxy Primers", subSubCategories: [] },
      { name: "Epoxy Mid Coats", subSubCategories: [] },
      { name: "Cementitious Screeds and Repair Materials", subSubCategories: [] },
      { name: "Two Component Epoxy Top Coats", subSubCategories: [] },
      { name: "Three Component Heavy Duty Epoxy Floorings", subSubCategories: [] },
      { name: "Thin Coat Brush, Roller and Spray Applied", subSubCategories: [] }
    ]
  },
  { mainCategory: "Building Care & Maintenance", subCategories: [] },
  { mainCategory: "Epoxy Adhesives and Coatings", subCategories: [
      { name: "Resins", subSubCategories: ["Unmodified Resins","Solvent Cut Resins","Reactive Diluent Modified Resins","Solid Resins","Special Liquid Resins","Other Resins"] },
      { name: "Unmodified Resins", subSubCategories: ["Polyamides","Amidoamines","Cycloaliphatic amines","Phenalkamines","Aliphatic amines","Anhydrides","Other Hardeners"] },
      { name: "Solvent Cut Resins", subSubCategories: ["Brush Potting","Electronic Component Potting","Clear Coating","Other Coatings","Tabletop Pouring","Composite Manufacturing","Adhesives","Other Systems"] },
      { name: "Additives", subSubCategories: [] }
    ]
  },
  { mainCategory: "Tiling and Grouting Materials", subCategories: [] },
  { mainCategory: "Concrete Admixtures", subCategories: [] },
  { mainCategory: "Building Insulation", subCategories: [] },
  { mainCategory: "Decorative Concrete", subCategories: [] },
  { mainCategory: "Specialty Products", subCategories: [] }
];

async function seedCategories() {
  const mongoUri = process.env.CONNECTION_STRING || "mongodb://127.0.0.1:27017/Ressichem";
  await connect(mongoUri, undefined, "Ressichem");
  try {
    console.log("Connected to MongoDB for categories");
    for (const c of categories) {
      const existing = await ProductCategory.findOne({ mainCategory: c.mainCategory });
      if (!existing) {
        await ProductCategory.create(c);
        console.log("Created category:", c.mainCategory);
      } else {
        console.log("Category exists:", c.mainCategory);
      }
    }
    console.log("✅ seedProductCategories finished");
  } catch (err) {
    console.error("seedProductCategories error:", err);
    throw err;
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  seedCategories().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seedCategories;
