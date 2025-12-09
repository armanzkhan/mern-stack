const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');

async function checkUserEmails() {
  try {
    console.log('🔍 CHECKING USER EMAILS');
    console.log('========================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find all users with company admin related emails
    const companyAdminUsers = await User.find({
      $or: [
        { email: { $regex: /companyadmin/i } },
        { email: { $regex: /sample/i } },
        { email: { $regex: /admin/i } }
      ]
    }).select('email firstName lastName userType isCompanyAdmin isSuperAdmin');

    console.log(`\n👥 Found ${companyAdminUsers.length} admin-related users:`);
    companyAdminUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email}`);
      console.log(`      Name: ${user.firstName} ${user.lastName}`);
      console.log(`      User Type: ${user.userType}`);
      console.log(`      Is Company Admin: ${user.isCompanyAdmin}`);
      console.log(`      Is Super Admin: ${user.isSuperAdmin}`);
      console.log('');
    });

    // Check if the user is trying to login with wrong email
    const wrongEmail = 'companyadmin@sampleadmin.com';
    const correctEmail = 'companyadmin@samplecompany.com';
    
    const wrongUser = await User.findOne({ email: wrongEmail });
    const correctUser = await User.findOne({ email: correctEmail });

    console.log(`\n🔍 Email Check:`);
    console.log(`   Wrong email (${wrongEmail}): ${wrongUser ? 'EXISTS' : 'NOT FOUND'}`);
    console.log(`   Correct email (${correctEmail}): ${correctUser ? 'EXISTS' : 'NOT FOUND'}`);

    if (wrongUser) {
      console.log(`\n✅ User exists with wrong email: ${wrongEmail}`);
    } else if (correctUser) {
      console.log(`\n✅ User exists with correct email: ${correctEmail}`);
      console.log(`   Please use: ${correctEmail}`);
    } else {
      console.log(`\n❌ No company admin user found with either email`);
    }

    // Show all users for reference
    const allUsers = await User.find({}).select('email firstName lastName userType').limit(10);
    console.log(`\n📋 All users (first 10):`);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - ${user.firstName} ${user.lastName} (${user.userType})`);
    });

  } catch (error) {
    console.error('❌ Error checking user emails:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkUserEmails();
