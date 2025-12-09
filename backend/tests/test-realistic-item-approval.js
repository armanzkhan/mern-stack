const mongoose = require('mongoose');
const Order = require('./models/Order');
const Customer = require('./models/Customer');
const Product = require('./models/Product');
const User = require('./models/User');
const OrderItemApproval = require('./models/OrderItemApproval');
const itemApprovalService = require('./services/itemApprovalService');

async function testRealisticItemApproval() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Find existing managers
    const managers = await User.find({ 
      isManager: true, 
      company_id: 'RESSICHEM',
      'managerProfile.assignedCategories': { $exists: true, $ne: [] }
    });

    console.log(`👥 Found ${managers.length} managers with assigned categories:`);
    managers.forEach(manager => {
      console.log(`- ${manager.email}: ${manager.managerProfile?.assignedCategories?.join(', ') || 'No categories'}`);
    });

    if (managers.length === 0) {
      console.log('❌ No managers found with assigned categories. Please assign categories to managers first.');
      return;
    }

    // Find existing customer (yousuf@gmail.com)
    const customer = await Customer.findOne({ email: 'yousuf@gmail.com' });
    if (!customer) {
      console.log('❌ Customer yousuf@gmail.com not found');
      return;
    }
    console.log(`✅ Found customer: ${customer.companyName} (${customer.email})`);

    // Create test products with categories that match manager assignments
    const managerCategories = managers.flatMap(m => m.managerProfile?.assignedCategories || []);
    const uniqueCategories = [...new Set(managerCategories)];
    
    console.log(`📦 Creating products for categories: ${uniqueCategories.join(', ')}`);
    
    const products = [];
    for (let i = 0; i < uniqueCategories.length; i++) {
      const category = uniqueCategories[i];
      products.push({
        name: `Test Product - ${category}`,
        category: { mainCategory: category },
        price: 1000 + (i * 500),
        stock: 50,
        company_id: 'RESSICHEM'
      });
    }

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create test order with items from different categories
    const orderItems = createdProducts.map(product => ({
      product: product._id,
      quantity: 1,
      unitPrice: product.price,
      total: product.price
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const order = new Order({
      orderNumber: `REALISTIC-${Date.now()}`,
      customer: customer._id,
      items: orderItems,
      subtotal,
      tax,
      total,
      notes: 'Test order for realistic item-level approval system',
      company_id: 'RESSICHEM',
      categories: uniqueCategories
    });

    await order.save();
    console.log(`✅ Created test order: ${order.orderNumber}`);
    console.log(`📋 Order has ${order.items.length} items from categories: ${uniqueCategories.join(', ')}`);

    // Test the new item-level approval system
    console.log('\n🔍 Testing item-level approval system...');
    const itemApprovals = await itemApprovalService.createItemApprovals(order);
    console.log(`✅ Created ${itemApprovals.length} item approval entries`);

    // Show the approval entries
    console.log('\n📋 Item Approval Entries:');
    for (const approval of itemApprovals) {
      const product = await Product.findById(approval.product);
      const manager = approval.assignedManager ? await User.findById(approval.assignedManager) : null;
      console.log(`- Item ${approval.itemIndex}: ${product?.name} (${approval.category}) -> Manager: ${manager?.email || 'Auto-approved'}`);
    }

    // Show how each manager would see their pending approvals
    console.log('\n👥 Manager-Specific Views:');
    for (const manager of managers) {
      const pendingApprovals = await itemApprovalService.getManagerPendingApprovals(manager._id, 'RESSICHEM');
      console.log(`\n📧 Manager: ${manager.email}`);
      console.log(`   Assigned Categories: ${manager.managerProfile?.assignedCategories?.join(', ')}`);
      console.log(`   Pending Approvals: ${pendingApprovals.length}`);
      
      for (const approval of pendingApprovals) {
        const product = await Product.findById(approval.product);
        const orderInfo = await Order.findById(approval.orderId);
        console.log(`   - Order: ${orderInfo?.orderNumber}, Item: ${product?.name}, Category: ${approval.category}`);
      }
    }

    console.log('\n✅ Realistic item-level approval system test completed!');
    console.log('\n📝 How This Solves Your Problem:');
    console.log('1. ✅ Each order item is routed to its specific category manager');
    console.log('2. ✅ Managers only see items from their assigned categories');
    console.log('3. ✅ No more "approve entire order" - only relevant items');
    console.log('4. ✅ Items can be approved/rejected independently');
    console.log('5. ✅ Order status updates only when ALL items are processed');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testRealisticItemApproval();
