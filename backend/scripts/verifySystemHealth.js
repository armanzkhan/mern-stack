// Comprehensive system health check
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");
const User = require("../models/User");
const Company = require("../models/Company");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

async function checkDatabase() {
  console.log("\n" + "=".repeat(80));
  console.log("1. DATABASE CONNECTIVITY CHECK");
  console.log("=".repeat(80));
  
  try {
    await connect();
    console.log("✅ Database connection: SUCCESS");
    
    // Check collections
    const mongoose = require("mongoose");
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log(`✅ Found ${collectionNames.length} collections in database`);
    
    // Check key collections
    const requiredCollections = ["users", "companies", "customers", "orders", "products", "roles", "permissions"];
    const missing = requiredCollections.filter(c => !collectionNames.includes(c));
    
    if (missing.length === 0) {
      console.log("✅ All required collections exist");
    } else {
      console.log(`⚠️  Missing collections: ${missing.join(", ")}`);
    }
    
    // Check product counts by category
    const categories = [
      "Dry Mix Mortars / Premix Plasters",
      "Building Care and Maintenance",
      "Concrete Admixtures",
      "Decorative Concrete",
      "Epoxy Floorings & Coatings",
      "Speciality Products",
      "Tiling and Grouting Materials"
    ];
    
    console.log("\n📊 Product counts by category:");
    for (const category of categories) {
      const count = await Product.countDocuments({
        "category.mainCategory": category,
        company_id: "RESSICHEM",
        isActive: true
      });
      console.log(`   ${category}: ${count} products`);
    }
    
    // Check for duplicates
    console.log("\n🔍 Checking for duplicate products...");
    const allProducts = await Product.find({
      company_id: "RESSICHEM",
      isActive: true
    });
    
    const productMap = new Map();
    const duplicates = [];
    
    allProducts.forEach(p => {
      const key = `${p.name}::${p.sku}::${p.unit}`.toLowerCase();
      if (productMap.has(key)) {
        if (!duplicates.find(d => d.key === key)) {
          duplicates.push({ key, count: 2 });
        } else {
          duplicates.find(d => d.key === key).count++;
        }
      } else {
        productMap.set(key, p);
      }
    });
    
    if (duplicates.length === 0) {
      console.log("✅ No duplicate products found");
    } else {
      console.log(`⚠️  Found ${duplicates.length} duplicate product(s)`);
      duplicates.forEach(d => {
        console.log(`   - ${d.key} (${d.count} instances)`);
      });
    }
    
    // Check user count
    const userCount = await User.countDocuments();
    console.log(`\n👥 Total users: ${userCount}`);
    
    // Check company count
    const companyCount = await Company.countDocuments();
    console.log(`🏢 Total companies: ${companyCount}`);
    
    // Check order count
    const orderCount = await Order.countDocuments();
    console.log(`📦 Total orders: ${orderCount}`);
    
    // Check customer count
    const customerCount = await Customer.countDocuments();
    console.log(`👤 Total customers: ${customerCount}`);
    
    await disconnect();
    return true;
  } catch (error) {
    console.error("❌ Database connection: FAILED");
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function checkBackendAPI() {
  console.log("\n" + "=".repeat(80));
  console.log("2. BACKEND API CHECK");
  console.log("=".repeat(80));
  
  const endpoints = [
    { path: "/api/health", method: "GET", name: "Health Check" },
    { path: "/api/health/test", method: "GET", name: "Health Test" },
  ];
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${BACKEND_URL}${endpoint.path}`,
        timeout: 5000,
        validateStatus: () => true // Don't throw on any status
      });
      
      if (response.status === 200) {
        console.log(`✅ ${endpoint.name}: SUCCESS (${response.status})`);
        successCount++;
      } else {
        console.log(`⚠️  ${endpoint.name}: Unexpected status ${response.status}`);
      }
    } catch (error) {
      if (error.code === "ECONNREFUSED") {
        console.log(`❌ ${endpoint.name}: FAILED - Backend server not running`);
        console.log(`   Please start the backend server: cd backend && npm start`);
      } else {
        console.log(`❌ ${endpoint.name}: FAILED - ${error.message}`);
      }
    }
  }
  
  if (successCount === endpoints.length) {
    console.log("\n✅ All backend API endpoints are accessible");
    return true;
  } else {
    console.log(`\n⚠️  ${successCount}/${endpoints.length} endpoints accessible`);
    return false;
  }
}

async function checkFileStructure() {
  console.log("\n" + "=".repeat(80));
  console.log("3. FILE STRUCTURE CHECK");
  console.log("=".repeat(80));
  
  const fs = require("fs");
  const path = require("path");
  
  const requiredFiles = [
    { path: "backend/server.js", name: "Backend Server" },
    { path: "backend/package.json", name: "Backend Package.json" },
    { path: "backend/config/_db.js", name: "Database Config" },
    { path: "frontend/package.json", name: "Frontend Package.json" },
    { path: "frontend/next.config.mjs", name: "Next.js Config" },
  ];
  
  let allExist = true;
  
  for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, "..", "..", file.path);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${file.name}: EXISTS`);
    } else {
      console.log(`❌ ${file.name}: MISSING`);
      allExist = false;
    }
  }
  
  return allExist;
}

async function checkEnvironmentVariables() {
  console.log("\n" + "=".repeat(80));
  console.log("4. ENVIRONMENT VARIABLES CHECK");
  console.log("=".repeat(80));
  
  const requiredVars = [
    { name: "CONNECTION_STRING", optional: true, description: "MongoDB Connection String" },
    { name: "JWT_SECRET", optional: true, description: "JWT Secret Key" },
    { name: "PORT", optional: true, description: "Backend Port (default: 5000)" },
  ];
  
  let allSet = true;
  
  for (const envVar of requiredVars) {
    if (process.env[envVar.name]) {
      const value = envVar.name.includes("SECRET") || envVar.name.includes("PASSWORD") 
        ? "****" 
        : process.env[envVar.name].substring(0, 50);
      console.log(`✅ ${envVar.name}: SET (${value})`);
    } else if (envVar.optional) {
      console.log(`⚠️  ${envVar.name}: NOT SET (optional - using default)`);
    } else {
      console.log(`❌ ${envVar.name}: NOT SET (required)`);
      allSet = false;
    }
  }
  
  return allSet;
}

async function main() {
  console.log("\n" + "=".repeat(80));
  console.log("SYSTEM HEALTH VERIFICATION");
  console.log("=".repeat(80));
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  const results = {
    database: false,
    backendAPI: false,
    fileStructure: false,
    environment: false
  };
  
  // Run checks
  results.database = await checkDatabase();
  results.backendAPI = await checkBackendAPI();
  results.fileStructure = await checkFileStructure();
  results.environment = await checkEnvironmentVariables();
  
  // Final summary
  console.log("\n" + "=".repeat(80));
  console.log("VERIFICATION SUMMARY");
  console.log("=".repeat(80));
  
  const allPassed = Object.values(results).every(r => r === true);
  
  console.log(`Database:        ${results.database ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Backend API:      ${results.backendAPI ? "✅ PASS" : "⚠️  CHECK (server may not be running)"}`);
  console.log(`File Structure:   ${results.fileStructure ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Environment:      ${results.environment ? "✅ PASS" : "⚠️  WARN"}`);
  
  console.log("\n" + "=".repeat(80));
  if (allPassed) {
    console.log("✅ ALL CHECKS PASSED - System is healthy!");
  } else {
    console.log("⚠️  SOME CHECKS FAILED - Please review the issues above");
  }
  console.log("=".repeat(80) + "\n");
  
  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main().catch(err => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
  });
}

module.exports = { checkDatabase, checkBackendAPI, checkFileStructure, checkEnvironmentVariables };

