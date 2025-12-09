const mongoose = require('mongoose');
const Manager = require('./models/Manager');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

async function testStatusAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    // Find the test order
    const order = await Order.findOne({ orderNumber: /TEST-/ });
    if (!order) {
      console.log('❌ No test order found');
      return;
    }
    console.log('✅ Test order found:', order.orderNumber, 'Status:', order.status);

    // Find the manager
    const manager = await Manager.findOne({});
    if (!manager) {
      console.log('❌ No manager found');
      return;
    }
    console.log('✅ Manager found:', manager.user_id);

    // Simulate the status update logic from the controller
    console.log('\n🧪 Testing status update logic...');
    
    const { orderId } = { orderId: order._id.toString() };
    const { status, comments } = { status: 'approved', comments: 'Test approval' };
    const userId = manager.user_id;
    const companyId = manager.company_id;
    
    console.log('📋 Parameters:', { orderId, status, comments, userId, companyId });

    // Get manager's assigned categories
    const assignedCategories = manager.assignedCategories.map(cat => cat.category || cat);
    console.log('📋 Manager assigned categories:', assignedCategories);

    // Get order with populated items
    const orderWithItems = await Order.findById(orderId).populate('items.product');
    if (!orderWithItems) {
      console.log('❌ Order not found');
      return;
    }
    
    console.log('✅ Order found with items:', orderWithItems.items.length);

    // Check if order has items from manager's categories
    const hasManagerCategories = orderWithItems.items.some(item => {
      const productCategory = item.product?.category?.mainCategory || item.product?.category;
      return assignedCategories.includes(productCategory);
    });

    console.log('🔍 Manager can update this order:', hasManagerCategories);

    if (hasManagerCategories) {
      console.log('✅ Updating order status...');
      
      // Update order status
      orderWithItems.status = status;
      if (comments) {
        orderWithItems.notes = (orderWithItems.notes || '') + `\n[Manager ${userId}]: ${comments}`;
      }
      
      await orderWithItems.save();
      console.log('✅ Order status updated successfully!');
      console.log('📋 New status:', orderWithItems.status);
      console.log('📋 Notes:', orderWithItems.notes);
    } else {
      console.log('❌ Manager cannot update this order - no matching categories');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testStatusAPI();
