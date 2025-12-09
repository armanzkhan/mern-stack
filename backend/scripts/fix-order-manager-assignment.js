require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connect, disconnect } = require('../config/_db');
const Order = require('../models/Order');
const OrderItemApproval = require('../models/OrderItemApproval');
const Product = require('../models/Product');
const User = require('../models/User');
const Manager = require('../models/Manager');
const itemApprovalService = require('../services/itemApprovalService');

const ORDER_NUMBER = 'ORD-1764153310822-e4qcnavca';

async function fixOrderManagerAssignment() {
  try {
    await connect();
    console.log('✅ Connected to MongoDB\n');

    console.log('🔧 FIXING ORDER MANAGER ASSIGNMENT\n');
    console.log('='.repeat(80));

    // Find the order
    const order = await Order.findOne({ orderNumber: ORDER_NUMBER });
    if (!order) {
      console.log(`❌ Order not found: ${ORDER_NUMBER}`);
      await disconnect();
      return;
    }

    console.log(`✅ Order found: ${order.orderNumber}`);
    console.log(`   Order ID: ${order._id}`);
    console.log(`   Categories: ${order.categories.join(', ')}`);

    // Delete existing approvals for this order
    const deletedCount = await OrderItemApproval.deleteMany({ orderId: order._id });
    console.log(`\n🗑️ Deleted ${deletedCount.deletedCount} existing approval(s)`);

    // Recreate approvals using the updated logic
    console.log(`\n🔄 Recreating item approvals with updated logic...`);
    const newApprovals = await itemApprovalService.createItemApprovals(order);

    console.log(`\n✅ Created ${newApprovals.length} new approval(s)`);
    
    // Show which managers got assigned
    const managerIds = new Set();
    for (const approval of newApprovals) {
      if (approval.assignedManager) {
        managerIds.add(approval.assignedManager.toString());
      }
    }

    console.log(`\n👥 Managers assigned to this order:`);
    for (const managerId of managerIds) {
      const manager = await User.findById(managerId);
      if (manager) {
        const approvalsForManager = newApprovals.filter(a => 
          a.assignedManager && a.assignedManager.toString() === managerId
        );
        console.log(`   - ${manager.email}: ${approvalsForManager.length} item(s)`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Fix complete!');
    console.log(`\n💡 The manager should now be able to see this order in their dashboard.`);

    await disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
    await disconnect();
    process.exit(1);
  }
}

fixOrderManagerAssignment();

