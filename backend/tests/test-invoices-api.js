const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Invoice = require('./models/Invoice');
const User = require('./models/User');

async function testInvoicesAPI() {
  try {
    console.log('🧪 TESTING INVOICES API');
    console.log('=======================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find sales user to get token
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' });
    if (!salesUser) {
      console.log('❌ Sales user not found');
      return;
    }

    console.log(`👤 Testing with user: ${salesUser.email}`);

    // Test the backend invoice controller directly
    const InvoiceController = require('./controllers/invoiceController');
    
    // Mock request and response objects
    const mockReq = {
      user: {
        _id: salesUser._id,
        company_id: salesUser.company_id,
        isSuperAdmin: salesUser.isSuperAdmin
      },
      query: {}
    };

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`📡 Response Status: ${code}`);
          console.log(`📄 Response Data:`, JSON.stringify(data, null, 2));
          return { status: code, data };
        }
      })
    };

    console.log('\n🔍 Testing getInvoices controller...');
    await InvoiceController.getInvoices(mockReq, mockRes);

    // Also test direct database query
    console.log('\n🔍 Testing direct database query...');
    const invoices = await Invoice.find({}).populate('orderId', 'orderNumber').populate('customer', 'companyName email');
    console.log(`📄 Found ${invoices.length} invoices in database:`);
    
    invoices.forEach((invoice, index) => {
      console.log(`\n${index + 1}. ${invoice.invoiceNumber}`);
      console.log(`   Order: ${invoice.orderId?.orderNumber || 'Unknown'}`);
      console.log(`   Customer: ${invoice.customer?.companyName || 'Unknown'}`);
      console.log(`   Total: PKR ${invoice.total}`);
      console.log(`   Status: ${invoice.status}`);
    });

  } catch (error) {
    console.error('❌ Error testing invoices API:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testInvoicesAPI();
