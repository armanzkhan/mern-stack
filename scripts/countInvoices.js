const mongoose = require('mongoose');
require('dotenv').config();

const Invoice = require('../models/Invoice');

async function countInvoices() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const mongoUri = process.env.CONNECTION_STRING || "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem"
    });
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 INVOICE COUNT REPORT');
    console.log('========================\n');

    // Total invoices
    const totalInvoices = await Invoice.countDocuments({});
    console.log(`📄 Total Invoices: ${totalInvoices}`);

    // Invoices by company
    const invoicesByCompany = await Invoice.aggregate([
      {
        $group: {
          _id: '$company_id',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Invoices by Company:');
    invoicesByCompany.forEach(item => {
      console.log(`   ${item._id || 'N/A'}: ${item.count} invoices`);
    });

    // Invoices by status
    const invoicesByStatus = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Invoices by Status:');
    invoicesByStatus.forEach(item => {
      console.log(`   ${item._id || 'N/A'}: ${item.count} invoices`);
    });

    // Invoices by date (last 30 days, last 90 days, all time)
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const invoicesLast30Days = await Invoice.countDocuments({
      invoiceDate: { $gte: last30Days }
    });

    const invoicesLast90Days = await Invoice.countDocuments({
      invoiceDate: { $gte: last90Days }
    });

    console.log('\n📅 Invoices by Date Range:');
    console.log(`   Last 30 days: ${invoicesLast30Days} invoices`);
    console.log(`   Last 90 days: ${invoicesLast90Days} invoices`);
    console.log(`   All time: ${totalInvoices} invoices`);

    // Sample invoices
    const sampleInvoices = await Invoice.find({})
      .select('invoiceNumber orderNumber status invoiceDate total company_id')
      .sort({ invoiceDate: -1 })
      .limit(5);

    console.log('\n📋 Sample Invoices (Latest 5):');
    sampleInvoices.forEach((inv, index) => {
      console.log(`   ${index + 1}. ${inv.invoiceNumber} - Order: ${inv.orderNumber} - Status: ${inv.status} - Total: ${inv.total} - Date: ${inv.invoiceDate ? inv.invoiceDate.toISOString().split('T')[0] : 'N/A'}`);
    });

    console.log('\n✅ Invoice count report complete');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

countInvoices();

