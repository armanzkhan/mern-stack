// Script to populate product images based on categories
const mongoose = require('mongoose');
const productImageService = require('./services/productImageService');
require('dotenv').config();

async function populateImages() {
  try {
    console.log('🖼️ Starting product image population...');
    
    // Connect to MongoDB
    const mongoUri = process.env.CONNECTION_STRING || "mongodb://localhost:27017/Ressichem";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem"
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Populate images for RESSICHEM company
    const result = await productImageService.populateProductImages('RESSICHEM');
    
    if (result.success) {
      console.log(`🎉 Successfully updated ${result.updatedCount} products with images`);
    } else {
      console.error('❌ Failed to populate images:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
populateImages();
