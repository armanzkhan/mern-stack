// backend/scripts/ensureBuildingCareCategory.js
// Ensures "Building Care and Maintenance" category exists in database

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const ProductCategory = require("../models/ProductCategory");

async function ensureBuildingCareCategory() {
  try {
    await connect();
    console.log("🔍 Ensuring Building Care and Maintenance category exists...\n");

    // Check for both variations
    const categoryWithAnd = await ProductCategory.findOne({ 
      name: "Building Care and Maintenance",
      level: 1
    });
    
    const categoryWithAmpersand = await ProductCategory.findOne({ 
      name: "Building Care & Maintenance",
      level: 1
    });

    if (categoryWithAnd) {
      console.log("✅ Category 'Building Care and Maintenance' already exists");
      console.log(`   ID: ${categoryWithAnd._id}`);
      console.log(`   Active: ${categoryWithAnd.isActive}`);
      
      // Ensure it's active
      if (!categoryWithAnd.isActive) {
        await ProductCategory.findByIdAndUpdate(categoryWithAnd._id, { isActive: true });
        console.log("   ✅ Activated category");
      }
    } else if (categoryWithAmpersand) {
      console.log("⚠️  Found 'Building Care & Maintenance' (with &), updating to 'Building Care and Maintenance'...");
      await ProductCategory.findByIdAndUpdate(categoryWithAmpersand._id, {
        name: "Building Care and Maintenance",
        path: "Building Care and Maintenance",
        isActive: true
      });
      console.log("✅ Updated category name to 'Building Care and Maintenance'");
    } else {
      console.log("➕ Creating 'Building Care and Maintenance' category...");
      const newCategory = await ProductCategory.create({
        name: "Building Care and Maintenance",
        level: 1,
        parent: null,
        path: "Building Care and Maintenance",
        isActive: true,
        subCategories: []
      });
      console.log(`✅ Created category: ${newCategory._id}`);
    }

    // Verify
    const finalCategory = await ProductCategory.findOne({ 
      name: "Building Care and Maintenance",
      level: 1
    });
    
    if (finalCategory) {
      console.log("\n✅ Category verified:");
      console.log(`   Name: ${finalCategory.name}`);
      console.log(`   Level: ${finalCategory.level}`);
      console.log(`   Active: ${finalCategory.isActive}`);
      console.log(`   Path: ${finalCategory.path}`);
    } else {
      console.log("\n❌ Category verification failed!");
    }

    console.log("\n🎉 Building Care and Maintenance category setup completed!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  ensureBuildingCareCategory()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { ensureBuildingCareCategory };

