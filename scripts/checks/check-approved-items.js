const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const OrderItemApproval = require('./models/OrderItemApproval');
const Order = require('./models/Order');
const Product = require('./models/Product');

async function checkApprovedItems() {
  try {
    console.log('🔍 CHECKING APPROVED ITEMS');
    console.log('===========================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find all approved items
    const approvedItems = await OrderItemApproval.find({ 
      status: 'approved' 
    }).populate('product', 'name').populate('orderId', 'orderNumber customer');

    console.log(`📋 Found ${approvedItems.length} approved items:`);

    if (approvedItems.length === 0) {
      console.log('❌ No approved items found!');
      console.log('   This is why the invoice button is not visible.');
      console.log('   You need to approve some items first.');
    } else {
      approvedItems.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.product?.name || 'Unknown Product'}`);
        console.log(`   Order: ${item.orderId?.orderNumber || 'Unknown'}`);
        console.log(`   Customer: ${item.orderId?.customer?.companyName || 'Unknown'}`);
        console.log(`   Original Amount: PKR ${item.originalAmount}`);
        console.log(`   Discount: PKR ${item.discountAmount || 0}`);
        console.log(`   Final Amount: PKR ${item.originalAmount - (item.discountAmount || 0)}`);
        console.log(`   Approved At: ${item.approvedAt || 'Unknown'}`);
      });
    }

    // Check pending items
    const pendingItems = await OrderItemApproval.find({ 
      status: 'pending' 
    }).populate('product', 'name').populate('orderId', 'orderNumber');

    console.log(`\n⏳ Found ${pendingItems.length} pending items:`);
    if (pendingItems.length > 0) {
      console.log('   These items need to be approved before invoice buttons appear.');
      pendingItems.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.product?.name || 'Unknown Product'} (Order: ${item.orderId?.orderNumber || 'Unknown'})`);
      });
      if (pendingItems.length > 3) {
        console.log(`   ... and ${pendingItems.length - 3} more pending items`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking approved items:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkApprovedItems();
