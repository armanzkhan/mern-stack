// Test manager notifications for order creation
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const categoryNotificationService = require('./services/categoryNotificationService');

async function testManagerNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🧪 TESTING MANAGER NOTIFICATIONS:');
    
    // Test 1: Check if products have categories
    console.log('\n📦 PRODUCT CATEGORIES:');
    const products = await Product.find().limit(5);
    console.log(`📊 Found ${products.length} products`);
    
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name}`);
      console.log(`      Category: ${JSON.stringify(product.category)}`);
    });

    // Test 2: Check manager categories
    console.log('\n👤 MANAGER CATEGORIES:');
    const managers = await User.find({ isManager: true });
    console.log(`📊 Found ${managers.length} managers`);
    
    managers.forEach((manager, index) => {
      console.log(`   ${index + 1}. ${manager.firstName} ${manager.lastName} (${manager.email})`);
      if (manager.managerProfile?.assignedCategories) {
        console.log(`      Categories: ${manager.managerProfile.assignedCategories.join(', ')}`);
      } else {
        console.log(`      ⚠️ No categories assigned`);
      }
    });

    // Test 3: Test category notification service directly
    console.log('\n🔔 TESTING CATEGORY NOTIFICATION SERVICE:');
    
    const testCategories = ['Tiling and Grouting Materials', 'Epoxy Adhesives and Coatings'];
    console.log(`Testing with categories: ${testCategories.join(', ')}`);
    
    const relevantManagers = await categoryNotificationService.getManagersForCategories(testCategories, 'RESSICHEM');
    console.log(`📋 Found ${relevantManagers.length} relevant managers`);
    
    relevantManagers.forEach((manager, index) => {
      console.log(`   ${index + 1}. ${manager.firstName} ${manager.lastName} (${manager.email})`);
    });

    // Test 4: Create a test order and see if notifications are sent
    console.log('\n📋 TESTING ORDER CREATION NOTIFICATIONS:');
    
    // Find a customer
    const customer = await User.findOne({ isCustomer: true });
    if (!customer) {
      console.log('❌ No customer found for testing');
      return;
    }
    
    console.log(`✅ Using customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);
    
    // Find products with categories
    const productsWithCategories = await Product.find({ 
      'category.mainCategory': { $exists: true } 
    }).limit(2);
    
    if (productsWithCategories.length === 0) {
      console.log('❌ No products with categories found');
      return;
    }
    
    console.log(`✅ Found ${productsWithCategories.length} products with categories`);
    
    // Create test order
    const testOrder = {
      orderNumber: `TEST-${Date.now()}`,
      customer: customer._id,
      items: productsWithCategories.map(product => ({
        product: product._id,
        quantity: 1,
        unitPrice: 100,
        total: 100
      })),
      subtotal: productsWithCategories.length * 100,
      tax: productsWithCategories.length * 10,
      total: productsWithCategories.length * 110,
      categories: productsWithCategories.map(p => p.category.mainCategory),
      company_id: 'RESSICHEM',
      createdBy: customer._id
    };
    
    console.log(`📋 Test order categories: ${testOrder.categories.join(', ')}`);
    
    // Test notification
    try {
      await categoryNotificationService.notifyOrderUpdate(testOrder, 'created', customer);
      console.log('✅ Notification test completed');
    } catch (error) {
      console.log('❌ Notification test failed:', error.message);
    }

    await mongoose.connection.close();
    console.log('\n✅ Manager notification test completed!');

  } catch (error) {
    console.error('❌ Manager notification test failed:', error);
    process.exit(1);
  }
}

testManagerNotifications();
