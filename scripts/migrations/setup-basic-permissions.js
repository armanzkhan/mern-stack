const mongoose = require('mongoose');
const Permission = require('./models/Permission');
const PermissionGroup = require('./models/PermissionGroup');
const Role = require('./models/Role');

async function setupBasicPermissions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ressichem');
    console.log('🔧 Setting up basic permissions and roles...');
    
    const companyId = "RESSICHEM";
    
    // Create basic permissions
    const permissions = [
      // User Management
      { key: 'users.read', description: 'View users' },
      { key: 'users.create', description: 'Create users' },
      { key: 'users.update', description: 'Update users' },
      { key: 'users.delete', description: 'Delete users' },
      
      // Customer Management
      { key: 'customers.read', description: 'View customers' },
      { key: 'customers.create', description: 'Create customers' },
      { key: 'customers.update', description: 'Update customers' },
      { key: 'customers.delete', description: 'Delete customers' },
      
      // Order Management
      { key: 'orders.read', description: 'View orders' },
      { key: 'orders.create', description: 'Create orders' },
      { key: 'orders.update', description: 'Update orders' },
      { key: 'orders.delete', description: 'Delete orders' },
      
      // Product Management
      { key: 'products.read', description: 'View products' },
      { key: 'products.create', description: 'Create products' },
      { key: 'products.update', description: 'Update products' },
      { key: 'products.delete', description: 'Delete products' },
      
      // Role Management
      { key: 'roles.read', description: 'View roles' },
      { key: 'roles.create', description: 'Create roles' },
      { key: 'roles.update', description: 'Update roles' },
      { key: 'roles.delete', description: 'Delete roles' },
      
      // Permission Management
      { key: 'permissions.read', description: 'View permissions' },
      { key: 'permissions.create', description: 'Create permissions' },
      { key: 'permissions.update', description: 'Update permissions' },
      { key: 'permissions.delete', description: 'Delete permissions' },
      
      // Customer specific permissions
      { key: 'profile.update', description: 'Update own profile' },
      { key: 'notifications.read', description: 'View notifications' },
      { key: 'customer.dashboard', description: 'Access customer dashboard' },
      
      // Settings
      { key: 'edit_settings', description: 'Edit system settings' }
    ];
    
    console.log('📝 Creating permissions...');
    const createdPermissions = [];
    for (const permData of permissions) {
      let permission = await Permission.findOne({ key: permData.key, company_id: companyId });
      if (!permission) {
        permission = new Permission({
          ...permData,
          company_id: companyId
        });
        await permission.save();
        console.log('✅ Created permission: ' + permData.key);
      } else {
        console.log('⚠️ Permission already exists: ' + permData.key);
      }
      createdPermissions.push(permission);
    }
    
    // Create permission groups
    console.log('📁 Creating permission groups...');
    
    // User Management Group
    const userPermissions = createdPermissions.filter(p => p.key.startsWith('users.'));
    const userGroup = new PermissionGroup({
      name: 'User Management',
      company_id: companyId,
      permissions: userPermissions.map(p => p._id)
    });
    await userGroup.save();
    console.log('✅ Created permission group: User Management');
    
    // Customer Management Group
    const customerPermissions = createdPermissions.filter(p => p.key.startsWith('customers.'));
    const customerGroup = new PermissionGroup({
      name: 'Customer Management',
      company_id: companyId,
      permissions: customerPermissions.map(p => p._id)
    });
    await customerGroup.save();
    console.log('✅ Created permission group: Customer Management');
    
    // Order Management Group
    const orderPermissions = createdPermissions.filter(p => p.key.startsWith('orders.'));
    const orderGroup = new PermissionGroup({
      name: 'Order Management',
      company_id: companyId,
      permissions: orderPermissions.map(p => p._id)
    });
    await orderGroup.save();
    console.log('✅ Created permission group: Order Management');
    
    // Product Management Group
    const productPermissions = createdPermissions.filter(p => p.key.startsWith('products.'));
    const productGroup = new PermissionGroup({
      name: 'Product Management',
      company_id: companyId,
      permissions: productPermissions.map(p => p._id)
    });
    await productGroup.save();
    console.log('✅ Created permission group: Product Management');
    
    // Role Management Group
    const rolePermissions = createdPermissions.filter(p => p.key.startsWith('roles.'));
    const roleGroup = new PermissionGroup({
      name: 'Role Management',
      company_id: companyId,
      permissions: rolePermissions.map(p => p._id)
    });
    await roleGroup.save();
    console.log('✅ Created permission group: Role Management');
    
    // Permission Management Group
    const permPermissions = createdPermissions.filter(p => p.key.startsWith('permissions.'));
    const permGroup = new PermissionGroup({
      name: 'Permission Management',
      company_id: companyId,
      permissions: permPermissions.map(p => p._id)
    });
    await permGroup.save();
    console.log('✅ Created permission group: Permission Management');
    
    // Create basic roles
    console.log('👤 Creating basic roles...');
    
    // Super Admin Role
    const superAdminRole = new Role({
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      company_id: companyId,
      permissions: createdPermissions.map(p => p._id),
      permissionGroups: [userGroup._id, customerGroup._id, orderGroup._id, productGroup._id, roleGroup._id, permGroup._id]
    });
    await superAdminRole.save();
    console.log('✅ Created role: Super Admin');
    
    // Company Admin Role
    const companyAdminPermissions = createdPermissions.filter(p => 
      p.key.startsWith('users.') || 
      p.key.startsWith('customers.') || 
      p.key.startsWith('orders.') || 
      p.key.startsWith('products.') ||
      p.key === 'edit_settings'
    );
    
    const companyAdminRole = new Role({
      name: 'Company Admin',
      description: 'Company administrator with management permissions',
      company_id: companyId,
      permissions: companyAdminPermissions.map(p => p._id),
      permissionGroups: [userGroup._id, customerGroup._id, orderGroup._id, productGroup._id]
    });
    await companyAdminRole.save();
    console.log('✅ Created role: Company Admin');
    
    // Customer Role
    const customerRolePermissions = createdPermissions.filter(p => 
      p.key === 'products.read' ||
      p.key === 'orders.create' ||
      p.key === 'orders.read' ||
      p.key === 'profile.update' ||
      p.key === 'notifications.read' ||
      p.key === 'customer.dashboard'
    );
    
    const customerRole = new Role({
      name: 'Customer',
      description: 'Customer with access to products and orders',
      company_id: companyId,
      permissions: customerRolePermissions.map(p => p._id)
    });
    await customerRole.save();
    console.log('✅ Created role: Customer');
    
    // Manager Role
    const managerPermissions = createdPermissions.filter(p => 
      p.key.startsWith('orders.') || 
      p.key.startsWith('products.') ||
      p.key.startsWith('customers.')
    );
    
    const managerRole = new Role({
      name: 'Manager',
      description: 'Manager with order and product management permissions',
      company_id: companyId,
      permissions: managerPermissions.map(p => p._id),
      permissionGroups: [orderGroup._id, productGroup._id, customerGroup._id]
    });
    await managerRole.save();
    console.log('✅ Created role: Manager');
    
    console.log('🎯 Basic permissions and roles setup complete!');
    console.log('📊 Created:');
    console.log('   - ' + createdPermissions.length + ' permissions');
    console.log('   - 6 permission groups');
    console.log('   - 4 roles (Super Admin, Company Admin, Customer, Manager)');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error setting up permissions:', error.message);
  }
}

setupBasicPermissions();
