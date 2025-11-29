// scripts/testMongoConnection.js
const { connect, disconnect } = require('../config/_db');
const mongoose = require('mongoose');

async function testMongoConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');

  try {
    // Test connection
    await connect();
    console.log('✅ MongoDB connection successful!');

    // Get connection info
    const connection = mongoose.connection;
    console.log(`📊 Connection Details:`);
    console.log(`   Host: ${connection.host}`);
    console.log(`   Port: ${connection.port}`);
    console.log(`   Database: ${connection.name}`);
    console.log(`   Ready State: ${connection.readyState} (1=connected)`);

    // List all collections
    const collections = await connection.db.listCollections().toArray();
    console.log(`\n📁 Collections in database (${collections.length}):`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // Test a simple query
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    console.log(`\n👥 Users in database: ${userCount}`);

    if (userCount > 0) {
      const sampleUser = await User.findOne().select('email user_id isSuperAdmin');
      console.log(`📝 Sample user: ${sampleUser.email} (Super Admin: ${sampleUser.isSuperAdmin})`);
    }

    console.log('\n✅ MongoDB connection test completed successfully!');
    console.log('\n💡 To connect with MongoDB Compass:');
    console.log('   Connection String: mongodb://localhost:27017/Ressichem');

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure MongoDB is running locally');
    console.log('   2. Check if MongoDB service is started');
    console.log('   3. Verify port 27017 is not blocked');
    console.log('   4. Try: mongod --version (to check if MongoDB is installed)');
  } finally {
    await disconnect();
  }
}

module.exports = testMongoConnection;

if (require.main === module) {
  testMongoConnection();
}
