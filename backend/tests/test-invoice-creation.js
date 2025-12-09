const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('./models/Order');
const OrderItemApproval = require('./models/OrderItemApproval');
const Invoice = require('./models/Invoice');
const invoiceService = require('./services/invoiceService');

async function testInvoiceCreation() {
  try {
    console.log('🧪 TESTING INVOICE CREATION');
    console.log('===========================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find the order from the logs
    const orderId = '68ff619a8340097e0838ca73';
    console.log(`🔍 Testing order: ${orderId}`);

    // Check if order exists
    const order = await Order.findById(orderId).populate('customer');
    if (!order) {
      console.log('❌ Order not found');
      return;
    }

    console.log(`✅ Order found: ${order.orderNumber}`);
    console.log(`   Customer: ${order.customer?.companyName || 'Unknown'}`);
    console.log(`   Status: ${order.status}`);

    // Check approved items for this order
    const approvals = await OrderItemApproval.find({ 
      orderId: orderId,
      status: 'approved'
    }).populate('product');

    console.log(`\n📋 Approved items for this order: ${approvals.length}`);
    approvals.forEach((approval, index) => {
      console.log(`   ${index + 1}. ${approval.product?.name || 'Unknown Product'}`);
      console.log(`      Quantity: ${approval.quantity}`);
      console.log(`      Unit Price: PKR ${approval.unitPrice}`);
      console.log(`      Total: PKR ${approval.total}`);
      console.log(`      Discount: PKR ${approval.discountAmount || 0}`);
    });

    // Test the hasApprovedItemsForInvoicing function
    console.log('\n🔍 Testing hasApprovedItemsForInvoicing...');
    const hasApprovedItems = await invoiceService.hasApprovedItemsForInvoicing(orderId);
    console.log(`   Has approved items: ${hasApprovedItems ? '✅' : '❌'}`);

    if (hasApprovedItems) {
      console.log('\n📄 Testing invoice creation...');
      try {
        const invoice = await invoiceService.createInvoiceFromApprovedItems(orderId, 'RESSICHEM');
        console.log('✅ Invoice created successfully!');
        console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
        console.log(`   Total Amount: PKR ${invoice.total}`);
        console.log(`   Status: ${invoice.status}`);
      } catch (error) {
        console.log('❌ Error creating invoice:', error.message);
      }
    } else {
      console.log('❌ No approved items found for invoicing');
    }

  } catch (error) {
    console.error('❌ Error testing invoice creation:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testInvoiceCreation();
