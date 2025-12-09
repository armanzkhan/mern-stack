const mongoose = require('mongoose');
const User = require('../models/User');
const Permission = require('../models/Permission');
const Role = require('../models/Role');

const MONGODB_URI = process.env.MONGODB_URI || process.env.CONNECTION_STRING || "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function checkCompanyAdminUsersPermission() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: 'Ressichem' });
    console.log('✅ Connected to MongoDB\n');

    // Find company admin user
    const user = await User.findOne({ email: 'companyadmin@samplecompany.com' });
    if (!user) {
      console.log('❌ Company admin user not found');
      await mongoose.disconnect();
      return;
    }

    console.log(`👤 User: ${user.email}`);
    console.log(`   - isCompanyAdmin: ${user.isCompanyAdmin}`);
    console.log(`   - Roles: ${user.roles?.length || 0}`);
    console.log(`   - Direct Permissions: ${user.permissions?.length || 0}\n`);

    // Check for users.read permission
    const usersReadPermission = await Permission.findOne({ key: 'users.read' });
    if (!usersReadPermission) {
      console.log('❌ users.read permission not found in database');
      console.log('   Creating users.read permission...');
      
      const newPermission = new Permission({
        key: 'users.read',
        name: 'Read Users',
        description: 'View and list all users',
        category: 'users',
        company_id: user.company_id
      });
      await newPermission.save();
      console.log('✅ Created users.read permission');
    } else {
      console.log('✅ users.read permission exists');
    }

    // Get all user permissions
    const userPermissions = await Permission.find({ key: { $regex: /^users\./ } });
    console.log(`\n📋 Available user permissions:`);
    userPermissions.forEach(p => {
      console.log(`   - ${p.key}: ${p.name}`);
    });

    // Check if user has users.read permission
    const userWithPerms = await User.findOne({ email: 'companyadmin@samplecompany.com' })
      .populate('permissions')
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions'
        }
      });

    const allUserPermissions = new Set();
    
    // Add direct permissions
    if (userWithPerms.permissions) {
      userWithPerms.permissions.forEach(p => {
        allUserPermissions.add(p.key || p._id.toString());
      });
    }

    // Add permissions from roles
    if (userWithPerms.roles) {
      userWithPerms.roles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(p => {
            allUserPermissions.add(p.key || p._id.toString());
          });
        }
      });
    }

    console.log(`\n🔑 User's current permissions (${allUserPermissions.size}):`);
    Array.from(allUserPermissions).sort().forEach(p => {
      console.log(`   - ${p}`);
    });

    const hasUsersRead = allUserPermissions.has('users.read');
    console.log(`\n${hasUsersRead ? '✅' : '❌'} Has users.read permission: ${hasUsersRead}`);

    if (!hasUsersRead) {
      console.log('\n🔧 Fixing: Adding users.read permission...');
      
      // Get the permission
      const usersReadPerm = await Permission.findOne({ key: 'users.read' });
      
      // Add to user's direct permissions
      if (!userWithPerms.permissions.some(p => (p.key || p._id.toString()) === 'users.read')) {
        userWithPerms.permissions.push(usersReadPerm._id);
        await userWithPerms.save();
        console.log('✅ Added users.read to user direct permissions');
      }

      // Also check if there's a Company Admin role and add it there
      const companyAdminRole = await Role.findOne({ 
        name: 'Company Admin',
        company_id: user.company_id 
      });
      
      if (companyAdminRole) {
        if (!companyAdminRole.permissions.some(p => p.toString() === usersReadPerm._id.toString())) {
          companyAdminRole.permissions.push(usersReadPerm._id);
          await companyAdminRole.save();
          console.log('✅ Added users.read to Company Admin role');
        } else {
          console.log('✅ Company Admin role already has users.read');
        }
      } else {
        console.log('⚠️ Company Admin role not found');
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCompanyAdminUsersPermission();

