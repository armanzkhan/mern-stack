const mongoose = require("mongoose");
const { productCategories, getAllCategories } = require("../utils/productCategories");

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING || "mongodb://localhost:27017/Ressichem", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// Seed actual product categories
async function seedActualProductCategories() {
  try {
    console.log("🌱 Seeding actual product categories...");
    
    // Get all categories in the correct format
    const allCategories = getAllCategories();
    
    console.log("📋 Categories to be seeded:");
    allCategories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category}`);
    });
    
    // Create a categories collection document
    const CategoryDocument = mongoose.model('ProductCategory', new mongoose.Schema({
      name: String,
      level: Number, // 1 = main, 2 = sub, 3 = sub-sub
      parent: String,
      path: String,
      isActive: { type: Boolean, default: true }
    }));
    
    // Clear existing categories
    await CategoryDocument.deleteMany({});
    console.log("🗑️ Cleared existing categories");
    
    // Insert main categories
    const mainCategories = [
      "Dry Mix Mortars / Premix Plasters",
      "Epoxy Floorings & Coatings", 
      "Building Care and Maintenance",
      "Epoxy Adhesives and Coatings",
      "Tiling and Grouting Materials",
      "Concrete Admixtures",
      "Building Insulation",
      "Decorative Concrete",
      "Specialty Products"
    ];
    
    for (const category of mainCategories) {
      await CategoryDocument.create({
        name: category,
        level: 1,
        parent: null,
        path: category,
        isActive: true
      });
      console.log(`✅ Added main category: ${category}`);
    }
    
    // Insert subcategories for Epoxy Floorings & Coatings
    const epoxySubCategories = [
      "Epoxy Crack Fillers",
      "Epoxy Primers", 
      "Epoxy Mid Coats",
      "Cementitious Screeds and Repair Materials",
      "Two Component Epoxy Top Coats",
      "Three Component Heavy Duty Epoxy Floorings",
      "Thin Coat Brush, Roller and Spray Applied"
    ];
    
    for (const subCategory of epoxySubCategories) {
      await CategoryDocument.create({
        name: subCategory,
        level: 2,
        parent: "Epoxy Floorings & Coatings",
        path: `Epoxy Floorings & Coatings > ${subCategory}`,
        isActive: true
      });
      console.log(`✅ Added subcategory: ${subCategory}`);
    }
    
    // Insert subcategories for Epoxy Adhesives and Coatings
    const epoxyAdhesivesSubCategories = [
      "Resins",
      "Hardeners", 
      "Mixed Formulated Systems",
      "Additives"
    ];
    
    for (const subCategory of epoxyAdhesivesSubCategories) {
      await CategoryDocument.create({
        name: subCategory,
        level: 2,
        parent: "Epoxy Adhesives and Coatings",
        path: `Epoxy Adhesives and Coatings > ${subCategory}`,
        isActive: true
      });
      console.log(`✅ Added subcategory: ${subCategory}`);
    }
    
    // Insert sub-subcategories for Resins
    const resinSubSubCategories = [
      "Unmodified Resins",
      "Solvent Cut Resins",
      "Reactive Diluent Modified Resins", 
      "Solid Resins",
      "Special Liquid Resins",
      "Other Resins"
    ];
    
    for (const subSubCategory of resinSubSubCategories) {
      await CategoryDocument.create({
        name: subSubCategory,
        level: 3,
        parent: "Resins",
        path: `Epoxy Adhesives and Coatings > Resins > ${subSubCategory}`,
        isActive: true
      });
      console.log(`✅ Added sub-subcategory: ${subSubCategory}`);
    }
    
    // Insert sub-subcategories for Hardeners
    const hardenerSubSubCategories = [
      "Polyamides",
      "Amidoamines",
      "Cycloaliphatic amines",
      "Phenalkamines", 
      "Aliphatic amines",
      "Anhydrides",
      "Other Hardeners"
    ];
    
    for (const subSubCategory of hardenerSubSubCategories) {
      await CategoryDocument.create({
        name: subSubCategory,
        level: 3,
        parent: "Hardeners",
        path: `Epoxy Adhesives and Coatings > Hardeners > ${subSubCategory}`,
        isActive: true
      });
      console.log(`✅ Added sub-subcategory: ${subSubCategory}`);
    }
    
    // Insert sub-subcategories for Mixed Formulated Systems
    const mixedSystemsSubSubCategories = [
      "Brush Potting",
      "Electronic Component Potting",
      "Clear Coating",
      "Other Coatings",
      "Tabletop Pouring",
      "Composite Manufacturing",
      "Adhesives",
      "Other Systems"
    ];
    
    for (const subSubCategory of mixedSystemsSubSubCategories) {
      await CategoryDocument.create({
        name: subSubCategory,
        level: 3,
        parent: "Mixed Formulated Systems",
        path: `Epoxy Adhesives and Coatings > Mixed Formulated Systems > ${subSubCategory}`,
        isActive: true
      });
      console.log(`✅ Added sub-subcategory: ${subSubCategory}`);
    }
    
    console.log("\n🎉 Product categories seeded successfully!");
    console.log(`📊 Total categories created: ${await CategoryDocument.countDocuments()}`);
    
  } catch (error) {
    console.error("❌ Error seeding product categories:", error);
  }
}

// Main function
async function main() {
  await connectDB();
  await seedActualProductCategories();
  await mongoose.connection.close();
  console.log("✅ Database connection closed");
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedActualProductCategories };
