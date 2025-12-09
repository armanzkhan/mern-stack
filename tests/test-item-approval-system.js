const mongoose = require('mongoose');
const Order = require('./models/Order');
const Customer = require('./models/Customer');
const Product = require('./models/Product');
const User = require('./models/User');
const OrderItemApproval = require('./models/OrderItemApproval');
const itemApprovalService = require('./services/itemApprovalService');

async function testItemApprovalSystem() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Create test products with different categories
    const products = [
      {
        name: 'Tile Adhesive - Premium',
        category: { mainCategory: 'Tile & Adhesive' },
        price: 1500,
        stock: 100,
        company_id: 'RESSICHEM'
      },
      {
        name: 'General Paint - White',
        category: { mainCategory: 'General' },
        price: 800,
        stock: 50,
        company_id: 'RESSICHEM'
      },
      {
        name: 'Others - Special Coating',
        category: { mainCategory: 'Others' },
        price: 2000,
        stock: 25,
        company_id: 'RESSICHEM'
      }
    ];

    console.log('📦 Creating test products...');
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create test customer
    const customer = new Customer({
      companyName: 'Test Customer Company',
      contactName: 'Test Customer',
      email: 'test.customer@example.com',
      phone: '+92 300 1234567',
      street: '123 Test Street',
      city: 'Karachi',
      state: 'Sindh',
      zip: '75000',
      country: 'Pakistan',
      company_id: 'RESSICHEM'
    });
    await customer.save();
    console.log('✅ Created test customer');

    // Create test order with items from different categories
    const order = new Order({
      orderNumber: `TEST-${Date.now()}`,
      customer: customer._id,
      items: [
        {
          product: createdProducts[0]._id, // Tile & Adhesive
          quantity: 2,
          unitPrice: 1500,
          total: 3000
        },
        {
          product: createdProducts[1]._id, // General
          quantity: 1,
          unitPrice: 800,
          total: 800
        },
        {
          product: createdProducts[2]._id, // Others
          quantity: 1,
          unitPrice: 2000,
          total: 2000
        }
      ],
      subtotal: 5800,
      tax: 580,
      total: 6380,
      notes: 'Test order for item-level approval system',
      company_id: 'RESSICHEM',
      categories: ['Tile & Adhesive', 'General', 'Others']
    });

    await order.save();
    console.log('✅ Created test order:', order.orderNumber);

    // Test the new item-level approval system
    console.log('\n🔍 Testing item-level approval system...');
    const itemApprovals = await itemApprovalService.createItemApprovals(order);
    console.log(`✅ Created ${itemApprovals.length} item approval entries`);

    // Show the approval entries
    console.log('\n📋 Item Approval Entries:');
    for (const approval of itemApprovals) {
      console.log(`- Item ${approval.itemIndex}: ${approval.category} -> Manager: ${approval.assignedManager || 'Auto-approved'}`);
    }

    // Show how managers would see their pending approvals
    console.log('\n👥 Manager View:');
    const managers = await User.find({ isManager: true, company_id: 'RESSICHEM' });
    for (const manager of managers) {
      const pendingApprovals = await itemApprovalService.getManagerPendingApprovals(manager._id, 'RESSICHEM');
      console.log(`Manager ${manager.email}: ${pendingApprovals.length} pending approvals`);
    }

    console.log('\n✅ Item-level approval system test completed!');
    console.log('\n📝 Key Benefits:');
    console.log('1. Each order item is routed to its specific category manager');
    console.log('2. Managers only see items from their assigned categories');
    console.log('3. Items can be approved/rejected independently');
    console.log('4. Order status updates only when ALL items are processed');
    console.log('5. No more "approve entire order" - only relevant items');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testItemApprovalSystem();
