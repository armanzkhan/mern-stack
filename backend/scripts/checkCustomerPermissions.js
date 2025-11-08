const { connect, disconnect } = require('../config/_db');
const Permission = require('../models/Permission');

async function checkCustomerPermissions() {
  await connect();
  
  try {
    console.log('🔍 Checking customer permissions...\n');
    
    // Get all permissions related to customers
    const customerPermissions = await Permission.find({
      key: { $regex: /customer/ },
      company_id: 'RESSICHEM'
    });
    
    console.log('📋 Customer-related permissions:');
    customerPermissions.forEach(perm => {
      console.log(`   - ${perm.key}: ${perm.description}`);
    });
    
    // Check if specific permissions exist
    const requiredPermissions = [
      'customer.view',
      'customer.create', 
      'customer.update',
      'customer.delete'
    ];
    
    console.log('\n🔍 Checking required permissions:');
    for (const permKey of requiredPermissions) {
      const exists = await Permission.findOne({ key: permKey, company_id: 'RESSICHEM' });
      console.log(`   ${permKey}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  checkCustomerPermissions();
}

module.exports = checkCustomerPermissions;
