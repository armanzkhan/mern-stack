// Test complete manager notification flow
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const categoryNotificationService = require('./services/categoryNotificationService');

async function testManagerNotificationFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🧪 TESTING COMPLETE MANAGER NOTIFICATION FLOW:');
    
    // Test with sales@ressichem.com (Tiling and Grouting Materials)
    const salesManager = await User.findOne({ email: 'sales@ressichem.com' });
    if (!salesManager) {
      console.log('❌ Sales manager not found');
      return;
    }

    console.log(`\n👤 Testing with: ${salesManager.firstName} ${salesManager.lastName} (${salesManager.email})`);
    console.log(`   Assigned Categories: ${salesManager.managerProfile?.assignedCategories?.join(', ') || 'None'}`);

    // Find a customer to create an order
    const customer = await User.findOne({ isCustomer: true });
    if (!customer) {
      console.log('❌ No customer found for testing');
      return;
    }

    console.log(`\n👤 Using customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);

    // Find products in the manager's assigned categories
    const tilingProducts = await Product.find({
      company_id: 'RESSICHEM',
      $or: [
        { 'category.mainCategory': 'Tiling and Grouting Materials' },
        { 'category.subCategory': 'Tiling and Grouting Materials' },
        { 'category.subSubCategory': 'Tiling and Grouting Materials' }
      ]
    }).limit(2);

    if (tilingProducts.length === 0) {
      console.log('❌ No tiling products found for testing');
      return;
    }

    console.log(`\n📦 Found ${tilingProducts.length} tiling products:`);
    tilingProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name}`);
      console.log(`      Category: ${JSON.stringify(product.category)}`);
    });

    // Create a test order with tiling products
    const testOrder = {
      orderNumber: `TEST-MANAGER-${Date.now()}`,
      customer: customer._id,
      items: tilingProducts.map(product => ({
        product: product._id,
        quantity: 2,
        unitPrice: 100,
        total: 200
      })),
      subtotal: tilingProducts.length * 200,
      tax: tilingProducts.length * 20,
      total: tilingProducts.length * 220,
      categories: tilingProducts.map(p => p.category.mainCategory),
      company_id: 'RESSICHEM',
      createdBy: customer._id,
      status: 'pending'
    };

    console.log(`\n📋 Test order details:`);
    console.log(`   Order Number: ${testOrder.orderNumber}`);
    console.log(`   Customer: ${customer.firstName} ${customer.lastName}`);
    console.log(`   Categories: ${testOrder.categories.join(', ')}`);
    console.log(`   Items: ${testOrder.items.length}`);
    console.log(`   Total: $${testOrder.total}`);

    // Test notification triggering
    console.log(`\n🔔 Testing notification trigger...`);
    try {
      await categoryNotificationService.notifyOrderUpdate(testOrder, 'created', customer);
      console.log('✅ Notification triggered successfully');
    } catch (notificationError) {
      console.log('❌ Notification trigger failed:', notificationError.message);
    }

    // Simulate what the manager would see
    console.log(`\n👀 What the manager would see:`);
    console.log(`   1. Notification popup appears for 60 seconds`);
    console.log(`   2. Popup shows: "New Order Created"`);
    console.log(`   3. Popup shows: "Order ${testOrder.orderNumber} has been created"`);
    console.log(`   4. Popup shows: "Categories: ${testOrder.categories.join(', ')}"`);
    console.log(`   5. Popup shows: "Your Categories: ${salesManager.managerProfile?.assignedCategories?.join(', ')}"`);
    console.log(`   6. Clicking popup navigates to: /orders?highlight=${testOrder.orderNumber}`);
    console.log(`   7. Order is highlighted with yellow ring and pulse animation`);
    console.log(`   8. Highlight disappears after 5 seconds`);

    // Test order filtering for the manager
    console.log(`\n📊 Testing order filtering for manager...`);
    const allOrders = await Order.find({ company_id: 'RESSICHEM' });
    const managerOrders = allOrders.filter(order => {
      if (order.categories && order.categories.some(cat => 
        salesManager.managerProfile?.assignedCategories?.includes(cat)
      )) {
        return true;
      }
      
      if (order.items && order.items.some(item => {
        if (item.product && item.product.category) {
          const productCategory = item.product.category;
          return salesManager.managerProfile?.assignedCategories?.some(managerCat => 
            productCategory.mainCategory === managerCat ||
            productCategory.subCategory === managerCat ||
            productCategory.subSubCategory === managerCat
          );
        }
        return false;
      })) {
        return true;
      }
      
      return false;
    });

    console.log(`   Total orders in system: ${allOrders.length}`);
    console.log(`   Orders visible to manager: ${managerOrders.length}`);
    console.log(`   Orders hidden from manager: ${allOrders.length - managerOrders.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Complete manager notification flow test completed!');

  } catch (error) {
    console.error('❌ Manager notification flow test failed:', error);
    process.exit(1);
  }
}

testManagerNotificationFlow();
