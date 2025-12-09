const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('./models/Order');
const OrderItemApproval = require('./models/OrderItemApproval');
const Invoice = require('./models/Invoice');
const Customer = require('./models/Customer');
const Product = require('./models/Product');
const User = require('./models/User');

// Import services
const invoiceService = require('./services/invoiceService');
const itemApprovalService = require('./services/itemApprovalService');

async function testInvoiceWorkflow() {
  try {
    console.log('🧪 TESTING INVOICE WORKFLOW');
    console.log('============================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find a test order with approved items
    const order = await Order.findOne({ status: 'approved' })
      .populate('customer', 'companyName email')
      .populate('items.product', 'name category');

    if (!order) {
      console.log('❌ No approved orders found. Please approve an order first.');
      return;
    }

    console.log(`\n📋 Found approved order: ${order.orderNumber}`);
    console.log(`   Customer: ${order.customer.companyName}`);
    console.log(`   Total: PKR ${order.total}`);

    // Check if invoice already exists for this order
    const existingInvoice = await Invoice.findOne({ orderId: order._id });
    if (existingInvoice) {
      console.log(`\n📄 Invoice already exists: ${existingInvoice.invoiceNumber}`);
      console.log(`   Status: ${existingInvoice.status}`);
      console.log(`   Total: PKR ${existingInvoice.total}`);
      return;
    }

    // Get approved items for this order
    const approvedItems = await OrderItemApproval.find({
      orderId: order._id,
      status: 'approved'
    }).populate('product', 'name category')
      .populate('approvedBy', 'firstName lastName email');

    console.log(`\n📦 Found ${approvedItems.length} approved items:`);
    approvedItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.product.name}`);
      console.log(`      Category: ${item.category}`);
      console.log(`      Original: PKR ${item.originalAmount}`);
      console.log(`      Discount: PKR ${item.discountAmount || 0}`);
      console.log(`      Final: PKR ${item.originalAmount - (item.discountAmount || 0)}`);
      console.log(`      Approved by: ${item.approvedBy?.firstName} ${item.approvedBy?.lastName}`);
    });

    // Test invoice creation
    console.log('\n📄 Creating invoice...');
    const invoice = await invoiceService.createInvoiceFromApprovedItems(order._id, order.company_id);
    
    console.log(`\n✅ Invoice created successfully!`);
    console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
    console.log(`   Order Number: ${invoice.orderNumber}`);
    console.log(`   Customer: ${invoice.customerName}`);
    console.log(`   Subtotal: PKR ${invoice.subtotal}`);
    console.log(`   Total Discount: PKR ${invoice.totalDiscount}`);
    console.log(`   Tax: PKR ${invoice.taxAmount}`);
    console.log(`   Total: PKR ${invoice.total}`);
    console.log(`   Due Date: ${invoice.dueDate.toLocaleDateString()}`);

    console.log(`\n📋 Invoice Items:`);
    invoice.items.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.productName}`);
      console.log(`      Quantity: ${item.quantity}`);
      console.log(`      Unit Price: PKR ${item.unitPrice}`);
      console.log(`      Discount: PKR ${item.discountAmount}`);
      console.log(`      Final Amount: PKR ${item.finalAmount}`);
    });

    // Test invoice retrieval
    console.log('\n🔍 Testing invoice retrieval...');
    const retrievedInvoice = await invoiceService.getInvoiceById(invoice._id);
    console.log(`✅ Invoice retrieved: ${retrievedInvoice.invoiceNumber}`);

    // Test invoice stats
    console.log('\n📊 Testing invoice statistics...');
    const stats = await invoiceService.getInvoiceStats(order.company_id);
    console.log('Invoice Statistics:');
    console.log(`   Total Invoices: ${stats.totalInvoices}`);
    console.log(`   Total Amount: PKR ${stats.totalAmount}`);
    console.log(`   Paid Amount: PKR ${stats.paidAmount}`);
    console.log(`   Pending Amount: PKR ${stats.pendingAmount}`);
    console.log(`   Draft: ${stats.draftInvoices}`);
    console.log(`   Sent: ${stats.sentInvoices}`);
    console.log(`   Paid: ${stats.paidInvoices}`);
    console.log(`   Overdue: ${stats.overdueInvoices}`);

    console.log('\n✅ Invoice workflow test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing invoice workflow:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testInvoiceWorkflow();
