const mongoose = require('mongoose');
const User = require('./models/User');

async function testExistingUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    const users = await User.find({ role: { $ne: 'Customer' } }).limit(3);
    console.log('Non-customer users:', users.map(u => ({ email: u.email, role: u.role })));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testExistingUsers();

