const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Invoice = require('./models/Invoice');
const Order = require('./models/Order');
const Customer = require('./models/Customer');

async function checkInvoiceStorage() {
  try {
    console.log('🔍 CHECKING INVOICE STORAGE');
    console.log('===========================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find all invoices
    const invoices = await Invoice.find({}).populate('orderId', 'orderNumber').populate('customer', 'companyName');
    
    console.log(`📄 Found ${invoices.length} invoices in database:`);
    
    if (invoices.length === 0) {
      console.log('❌ No invoices found in database!');
    } else {
      invoices.forEach((invoice, index) => {
        console.log(`\n${index + 1}. Invoice: ${invoice.invoiceNumber}`);
        console.log(`   Order: ${invoice.orderId?.orderNumber || 'Unknown'}`);
        console.log(`   Customer: ${invoice.customer?.companyName || 'Unknown'}`);
        console.log(`   Total: PKR ${invoice.total}`);
        console.log(`   Status: ${invoice.status}`);
        console.log(`   Created: ${invoice.createdAt}`);
        console.log(`   Items: ${invoice.items?.length || 0} items`);
      });
    }

    // Check recent invoices (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentInvoices = await Invoice.find({
      createdAt: { $gte: yesterday }
    }).populate('orderId', 'orderNumber').populate('customer', 'companyName');
    
    console.log(`\n🕐 Recent invoices (last 24 hours): ${recentInvoices.length}`);
    recentInvoices.forEach((invoice, index) => {
      console.log(`   ${index + 1}. ${invoice.invoiceNumber} - Order: ${invoice.orderId?.orderNumber} - PKR ${invoice.total}`);
    });

  } catch (error) {
    console.error('❌ Error checking invoice storage:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkInvoiceStorage();
