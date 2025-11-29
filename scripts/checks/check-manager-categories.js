// Check manager category assignments and notifications
const mongoose = require('mongoose');
const User = require('./models/User');
const Manager = require('./models/Manager');
const Product = require('./models/Product');
const Order = require('./models/Order');

async function checkManagerCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🔍 MANAGER CATEGORY ASSIGNMENTS:');
    
    // Check all managers
    const managers = await User.find({ isManager: true });
    console.log(`📊 Total managers: ${managers.length}`);
    
    for (const manager of managers) {
      console.log(`\n👤 Manager: ${manager.firstName} ${manager.lastName} (${manager.email})`);
      console.log(`   ID: ${manager._id}`);
      console.log(`   Is Manager: ${manager.isManager}`);
      console.log(`   Company ID: ${manager.company_id}`);
      
      if (manager.managerProfile) {
        console.log(`   Manager Profile: ${manager.managerProfile ? 'Exists' : 'Missing'}`);
        console.log(`   Assigned Categories: ${manager.managerProfile.assignedCategories?.length || 0}`);
        
        if (manager.managerProfile.assignedCategories) {
          console.log('   Categories:');
          manager.managerProfile.assignedCategories.forEach((category, index) => {
            console.log(`     ${index + 1}. ${category}`);
          });
        }
      } else {
        console.log('   ⚠️ No manager profile found');
      }
    }

    // Check specific managers mentioned
    console.log('\n🎯 SPECIFIC MANAGERS:');
    
    const salesManager = await User.findOne({ email: 'sales@ressichem.com' });
    if (salesManager) {
      console.log(`\n✅ Sales Manager: ${salesManager.firstName} ${salesManager.lastName}`);
      console.log(`   Categories: ${salesManager.managerProfile?.assignedCategories?.length || 0}`);
      if (salesManager.managerProfile?.assignedCategories) {
        salesManager.managerProfile.assignedCategories.forEach((cat, i) => {
          console.log(`     ${i + 1}. ${cat}`);
        });
      }
    } else {
      console.log('❌ Sales manager (sales@ressichem.com) not found');
    }

    const shahManager = await User.findOne({ email: 'shah@ressichem.com' });
    if (shahManager) {
      console.log(`\n✅ Shah Manager: ${shahManager.firstName} ${shahManager.lastName}`);
      console.log(`   Categories: ${shahManager.managerProfile?.assignedCategories?.length || 0}`);
      if (shahManager.managerProfile?.assignedCategories) {
        shahManager.managerProfile.assignedCategories.forEach((cat, i) => {
          console.log(`     ${i + 1}. ${cat}`);
        });
      }
    } else {
      console.log('❌ Shah manager (shah@ressichem.com) not found');
    }

    // Check products and their categories
    console.log('\n📦 PRODUCTS AND CATEGORIES:');
    const products = await Product.find().limit(10);
    console.log(`📊 Total products: ${products.length}`);
    
    const categories = new Set();
    products.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    
    console.log(`📋 Product categories found: ${categories.size}`);
    Array.from(categories).forEach((category, index) => {
      console.log(`   ${index + 1}. ${category}`);
    });

    // Check recent orders
    console.log('\n📋 RECENT ORDERS:');
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    console.log(`📊 Recent orders: ${recentOrders.length}`);
    
    recentOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. Order ${order.orderNumber} - ${order.status}`);
      if (order.items && order.items.length > 0) {
        console.log(`      Items: ${order.items.length}`);
        order.items.forEach((item, i) => {
          console.log(`        ${i + 1}. ${item.productName} (${item.category || 'No category'})`);
        });
      }
    });

    await mongoose.connection.close();
    console.log('\n✅ Manager categories check completed!');

  } catch (error) {
    console.error('❌ Manager categories check failed:', error);
    process.exit(1);
  }
}

checkManagerCategories();
