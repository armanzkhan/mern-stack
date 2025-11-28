const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || process.env.CONNECTION_STRING || "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function checkCompanyAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: 'Ressichem' });
    console.log('✅ Connected to MongoDB');

    // Find company admin users
    const companyAdmins = await User.find({
      $or: [
        { email: { $regex: /companyadmin/i } },
        { isCompanyAdmin: true },
        { role: { $regex: /company.*admin/i } }
      ]
    }).select('email firstName lastName isCompanyAdmin role isSuperAdmin user_id company_id');

    console.log(`\n👥 Found ${companyAdmins.length} company admin users:\n`);
    
    companyAdmins.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   - isCompanyAdmin: ${user.isCompanyAdmin}`);
      console.log(`   - role: ${user.role || 'N/A'}`);
      console.log(`   - isSuperAdmin: ${user.isSuperAdmin}`);
      console.log(`   - user_id: ${user.user_id}`);
      console.log(`   - company_id: ${user.company_id}`);
      console.log('');
    });

    // Check if any need to be fixed
    const needsFix = companyAdmins.filter(u => !u.isCompanyAdmin);
    if (needsFix.length > 0) {
      console.log(`\n⚠️ Found ${needsFix.length} users that should be company admins but don't have the flag:`);
      needsFix.forEach(u => {
        console.log(`   - ${u.email}`);
      });
      console.log('\n💡 Run fixCompanyAdminFlags.js to fix these users.');
    } else {
      console.log('\n✅ All company admin users have the correct flags.');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCompanyAdmin();

