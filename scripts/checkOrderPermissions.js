const { connect, disconnect } = require('../config/_db');
const Permission = require('../models/Permission');

async function checkOrderPermissions() {
  await connect();
  
  try {
    console.log('🔍 Checking order permissions...\n');
    
    // Get all order-related permissions
    const orderPermissions = await Permission.find({
      key: { $regex: /^order/ },
      company_id: 'RESSICHEM'
    });
    
    console.log('📋 Order-related permissions:');
    orderPermissions.forEach(perm => {
      console.log(`   - ${perm.key}: ${perm.description}`);
    });
    
    // Check for specific permissions
    const requiredPermissions = ['order.view', 'order.create', 'order.update', 'order.delete', 'orders.read', 'orders.create', 'orders.update', 'orders.delete'];
    
    console.log('\n🔍 Checking required permissions:');
    requiredPermissions.forEach(perm => {
      const exists = orderPermissions.some(p => p.key === perm);
      console.log(`   ${perm}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  checkOrderPermissions();
}

module.exports = checkOrderPermissions;
