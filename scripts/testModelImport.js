const { connect, disconnect } = require('../config/_db');

async function testModelImport() {
  try {
    console.log('🔍 Testing Model Imports...\n');
    
    await connect();
    console.log('✅ Database connected');
    
    // Test Order model
    console.log('\n📝 Testing Order model...');
    try {
      const Order = require('../models/Order');
      console.log('✅ Order model imported successfully');
      
      // Test creating a simple order
      const testOrder = new Order({
        orderNumber: 'TEST-001',
        customer: '507f1f77bcf86cd799439011',
        items: [{
          product: '507f1f77bcf86cd799439012',
          quantity: 1,
          unitPrice: 100,
          total: 100
        }],
        subtotal: 100,
        tax: 10,
        total: 110,
        company_id: 'RESSICHEM',
        categories: ['Electronics'],
        approvals: [{
          category: 'Electronics',
          status: 'pending'
        }]
      });
      
      console.log('✅ Order model can be instantiated');
      
    } catch (error) {
      console.log('❌ Order model error:', error.message);
    }
    
    // Test CategoryApproval model
    console.log('\n📝 Testing CategoryApproval model...');
    try {
      const CategoryApproval = require('../models/CategoryApproval');
      console.log('✅ CategoryApproval model imported successfully');
    } catch (error) {
      console.log('❌ CategoryApproval model error:', error.message);
    }
    
    // Test User model
    console.log('\n📝 Testing User model...');
    try {
      const User = require('../models/User');
      console.log('✅ User model imported successfully');
    } catch (error) {
      console.log('❌ User model error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  testModelImport();
}

module.exports = testModelImport;
