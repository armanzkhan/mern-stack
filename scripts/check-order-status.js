require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connect, disconnect } = require('../config/_db');
const Order = require('../models/Order');
const OrderItemApproval = require('../models/OrderItemApproval');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Product = require('../models/Product');

async function checkOrderStatus() {
  try {
    await connect();
    console.log('✅ Connected to MongoDB\n');

    const orderNumber = 'ORD-1764074734781-3xh57c6u1';
    
    // Find the order
    const order = await Order.findOne({ orderNumber })
      .populate('customer', 'companyName email')
      .populate('items.product', 'name category');

    if (!order) {
      console.log(`❌ Order ${orderNumber} not found`);
      await mongoose.disconnect();
      return;
    }

    console.log(`\n📦 Order Details:`);
    console.log(`   Order Number: ${order.orderNumber}`);
    console.log(`   Order ID: ${order._id}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Approval Status: ${order.approvalStatus || 'N/A'}`);
    console.log(`   Rejected At: ${order.rejectedAt || 'N/A'}`);
    console.log(`   Created At: ${order.createdAt}`);
    console.log(`   Updated At: ${order.updatedAt}`);
    console.log(`   Customer: ${order.customer?.companyName || 'N/A'} (${order.customer?.email || 'N/A'})`);
    console.log(`   Items: ${order.items.length}`);

    // Get all approvals for this order
    const approvals = await OrderItemApproval.find({ orderId: order._id })
      .populate('assignedManager', 'email firstName lastName');

    console.log(`\n📋 Order Item Approvals (${approvals.length}):`);
    for (const approval of approvals) {
      console.log(`   - Approval ID: ${approval._id}`);
      console.log(`     Category: ${approval.category}`);
      console.log(`     Status: ${approval.status}`);
      console.log(`     Assigned Manager: ${approval.assignedManager ? approval.assignedManager.email : 'null (auto-approved)'}`);
      console.log(`     Created At: ${approval.createdAt}`);
      console.log(`     Updated At: ${approval.updatedAt}`);
      if (approval.rejectedAt) {
        console.log(`     Rejected At: ${approval.rejectedAt}`);
      }
      if (approval.rejectionReason) {
        console.log(`     Rejection Reason: ${approval.rejectionReason}`);
      }
      console.log('');
    }

    // Check if any approval is rejected
    const rejectedApprovals = approvals.filter(a => a.status === 'rejected');
    if (rejectedApprovals.length > 0) {
      console.log(`⚠️ Found ${rejectedApprovals.length} rejected approval(s)`);
      for (const approval of rejectedApprovals) {
        console.log(`   - Approval ID: ${approval._id}, Rejected by: ${approval.assignedManager?.email || 'N/A'}`);
      }
    } else {
      console.log(`✅ No rejected approvals found`);
    }

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`   Order Status: ${order.status}`);
    console.log(`   Approval Status: ${order.approvalStatus || 'N/A'}`);
    console.log(`   Total Approvals: ${approvals.length}`);
    console.log(`   Pending: ${approvals.filter(a => a.status === 'pending').length}`);
    console.log(`   Approved: ${approvals.filter(a => a.status === 'approved').length}`);
    console.log(`   Rejected: ${approvals.filter(a => a.status === 'rejected').length}`);

    await disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnect();
  }
}

checkOrderStatus();

