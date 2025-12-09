const mongoose = require('mongoose');
const Company = require('../models/Company');
require('dotenv').config();

const mongoUri = process.env.CONNECTION_STRING || "mongodb://localhost:27017/Ressichem";

const sampleCompanies = [
  {
    company_id: "RESSICHEM",
    name: "Ressichem",
    email: "admin@ressichem.com",
    address: "123 Chemical Street, Karachi, Pakistan",
    industry: "Chemical Manufacturing",
    departments: ["HR", "Finance", "IT", "Sales", "Production"],
    userCount: 25,
    isActive: true
  },
  {
    company_id: "TECHCORP",
    name: "TechCorp Solutions",
    email: "contact@techcorp.com",
    address: "456 Tech Street, Lahore, Pakistan",
    industry: "Technology",
    departments: ["HR", "Finance", "IT", "Development", "Marketing"],
    userCount: 45,
    isActive: true
  },
  {
    company_id: "GLOBALMFG",
    name: "Global Manufacturing Inc",
    email: "info@globalmfg.com",
    address: "789 Industrial Ave, Islamabad, Pakistan",
    industry: "Manufacturing",
    departments: ["HR", "Finance", "IT", "Production", "Quality"],
    userCount: 120,
    isActive: true
  },
  {
    company_id: "RETAILMAX",
    name: "RetailMax Corporation",
    email: "support@retailmax.com",
    address: "321 Commerce Blvd, Karachi, Pakistan",
    industry: "Retail",
    departments: ["HR", "Finance", "IT", "Sales", "Operations"],
    userCount: 78,
    isActive: false
  }
];

async function seedCompanies() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem"
    });
    
    console.log("✅ Connected to MongoDB");
    
    // Clear existing companies
    await Company.deleteMany({});
    console.log("🗑️ Cleared existing companies");
    
    // Insert sample companies
    const createdCompanies = await Company.insertMany(sampleCompanies);
    console.log(`✅ Created ${createdCompanies.length} sample companies`);
    
    console.log("🎉 Database seeded successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedCompanies();
