const mongoose = require('mongoose');
const OrderItemApproval = require('./models/OrderItemApproval');
const User = require('./models/User');
const Product = require('./models/Product');

async function checkApprovalEntries() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB');
    
    // Get all approval entries for the test order
    const approvals = await OrderItemApproval.find({
      orderId: { $regex: 'REALISTIC-' }
    })
    .populate('assignedManager', 'email')
    .populate('product', 'name category')
    .sort({ orderId: 1, itemIndex: 1 });
    
    console.log('📋 All Approval Entries:');
    for (const approval of approvals) {
      console.log(`- Order: ${approval.orderId}, Item: ${approval.itemIndex}, Product: ${approval.product?.name}, Category: ${approval.category}, Manager: ${approval.assignedManager?.email || 'Auto-approved'}`);
    }
    
    // Group by manager
    console.log('\n👥 Approvals by Manager:');
    const managerGroups = {};
    for (const approval of approvals) {
      const managerEmail = approval.assignedManager?.email || 'Auto-approved';
      if (!managerGroups[managerEmail]) {
        managerGroups[managerEmail] = [];
      }
      managerGroups[managerEmail].push(approval);
    }
    
    for (const [managerEmail, managerApprovals] of Object.entries(managerGroups)) {
      console.log(`\n📧 Manager: ${managerEmail}`);
      console.log(`   Total items: ${managerApprovals.length}`);
      for (const approval of managerApprovals) {
        console.log(`   - Item ${approval.itemIndex}: ${approval.product?.name} (${approval.category})`);
      }
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkApprovalEntries();
