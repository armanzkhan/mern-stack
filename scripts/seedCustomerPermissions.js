const { connect, disconnect } = require('../config/_db');
const Permission = require('../models/Permission');
const PermissionGroup = require('../models/PermissionGroup');
const Role = require('../models/Role');

async function seedCustomerPermissions() {
  await connect();
  
  try {
    console.log('🔍 Seeding customer permissions...\n');
    
    const companyId = 'RESSICHEM';
    
    // Create missing customer permissions
    const customerPermissions = [
      { key: 'customer.update', description: 'Update customers' },
      { key: 'customer.delete', description: 'Delete customers' }
    ];
    
    for (const permData of customerPermissions) {
      let permission = await Permission.findOne({ key: permData.key, company_id: companyId });
      if (!permission) {
        permission = await Permission.create({
          ...permData,
          company_id: companyId
        });
        console.log(`✅ Created permission: ${permData.key}`);
      } else {
        console.log(`⚠️ Permission already exists: ${permData.key}`);
      }
    }
    
    // Get all customer permissions
    const allCustomerPermissions = await Permission.find({
      key: { $regex: /^customer\./ },
      company_id: companyId
    });
    
    console.log('\n📋 All customer permissions:');
    allCustomerPermissions.forEach(perm => {
      console.log(`   - ${perm.key}: ${perm.description}`);
    });
    
    // Update Super Admin permission group to include all customer permissions
    const superGroup = await PermissionGroup.findOne({ name: 'Super Admin', company_id: companyId });
    if (superGroup) {
      const permissionIds = allCustomerPermissions.map(p => p._id);
      const missingPermissions = permissionIds.filter(id => !superGroup.permissions.includes(id));
      
      if (missingPermissions.length > 0) {
        superGroup.permissions.push(...missingPermissions);
        await superGroup.save();
        console.log(`\n✅ Added ${missingPermissions.length} missing permissions to Super Admin group`);
      } else {
        console.log('\n✅ Super Admin group already has all customer permissions');
      }
    }
    
    // Update Manager role to include customer permissions
    const managerRole = await Role.findOne({ name: 'Manager', company_id: companyId });
    if (managerRole) {
      const customerPermIds = allCustomerPermissions.map(p => p._id);
      const missingPerms = customerPermIds.filter(id => !managerRole.permissions.includes(id));
      
      if (missingPerms.length > 0) {
        managerRole.permissions.push(...missingPerms);
        await managerRole.save();
        console.log(`✅ Added ${missingPerms.length} customer permissions to Manager role`);
      } else {
        console.log('✅ Manager role already has all customer permissions');
      }
    }
    
    console.log('\n🎉 Customer permissions setup complete!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  seedCustomerPermissions();
}

module.exports = seedCustomerPermissions;
