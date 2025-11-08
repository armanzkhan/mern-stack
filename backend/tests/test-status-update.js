const mongoose = require('mongoose');
const Manager = require('./models/Manager');
const Order = require('./models/Order');
const User = require('./models/User');

async function testStatusUpdate() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    // Find a manager
    const manager = await Manager.findOne({});
    if (!manager) {
      console.log('❌ No manager found');
      return;
    }
    console.log('✅ Manager found:', {
      id: manager._id,
      user_id: manager.user_id,
      categories: manager.assignedCategories
    });

    // Find an order
    const order = await Order.findOne({});
    if (!order) {
      console.log('❌ No order found');
      return;
    }
    console.log('✅ Order found:', {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      categories: order.categories
    });

    // Test the status update logic
    console.log('🧪 Testing status update logic...');
    
    const assignedCategories = manager.assignedCategories.map(cat => cat.category || cat);
    console.log('📋 Manager assigned categories:', assignedCategories);
    
    const hasManagerCategories = order.items.some(item => {
      const productCategory = item.product?.category?.mainCategory || item.product?.category;
      return assignedCategories.includes(productCategory);
    });
    
    console.log('🔍 Has manager categories:', hasManagerCategories);
    
    if (hasManagerCategories) {
      console.log('✅ Manager can update this order');
      
      // Test actual status update
      const originalStatus = order.status;
      order.status = 'approved';
      await order.save();
      console.log('✅ Status updated from', originalStatus, 'to', order.status);
      
      // Revert the change
      order.status = originalStatus;
      await order.save();
      console.log('✅ Status reverted to', originalStatus);
    } else {
      console.log('❌ Manager cannot update this order - no matching categories');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testStatusUpdate();
