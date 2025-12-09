// scripts/fixPermissionIndexes.js
const mongoose = require('mongoose');
const { connect, disconnect } = require('../config/_db');

async function fixPermissionIndexes() {
  await connect();

  try {
    console.log('Fixing permission indexes...');
    
    // Drop the existing unique index on key
    try {
      await mongoose.connection.db.collection('permissions').dropIndex('key_1');
      console.log('Dropped existing key_1 index');
    } catch (err) {
      console.log('Index key_1 does not exist or already dropped');
    }
    
    // Create compound unique index
    await mongoose.connection.db.collection('permissions').createIndex(
      { key: 1, company_id: 1 }, 
      { unique: true, name: 'key_company_unique' }
    );
    console.log('Created compound unique index on key + company_id');
    
    console.log('Permission indexes fixed successfully');
  } catch (err) {
    console.error('Error fixing permission indexes:', err);
    throw err;
  } finally {
    await disconnect();
  }
}

module.exports = fixPermissionIndexes;

if (require.main === module) {
  fixPermissionIndexes().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
