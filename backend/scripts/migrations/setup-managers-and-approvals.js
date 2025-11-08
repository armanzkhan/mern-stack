const mongoose = require('mongoose');
const User = require('./models/User');
const Manager = require('./models/Manager');
const CategoryApproval = require('./models/CategoryApproval');
const bcrypt = require('bcrypt');

async function setupManagersAndApprovals() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ressichem');
    console.log('🔧 Setting up managers and category approvals...');
    
    const companyId = "RESSICHEM";
    
    // Create manager users
    console.log('👤 Creating manager users...');
    
    // Shah - General Manager
    const shahPassword = await bcrypt.hash('password123', 10);
    const shahUser = new User({
      company_id: companyId,
      user_id: 'manager_shah_001',
      email: 'shah@ressichem.com',
      password: shahPassword,
      firstName: 'Shah',
      lastName: 'Ahmed',
      phone: '+92-300-1111111',
      isManager: true,
      isActive: true
    });
    await shahUser.save();
    console.log('✅ Created manager user: shah@ressichem.com');
    
    // Sales Manager - Tiles & Adhesive
    const salesPassword = await bcrypt.hash('password123', 10);
    const salesUser = new User({
      company_id: companyId,
      user_id: 'manager_sales_001',
      email: 'sales@ressichem.com',
      password: salesPassword,
      firstName: 'Sales',
      lastName: 'Manager',
      phone: '+92-300-2222222',
      isManager: true,
      isActive: true
    });
    await salesUser.save();
    console.log('✅ Created manager user: sales@ressichem.com');
    
    // Create manager records
    console.log('👥 Creating manager records...');
    
    // Shah Manager Record
    const shahManager = new Manager({
      user_id: shahUser._id,
      email: 'shah@ressichem.com',
      firstName: 'Shah',
      lastName: 'Ahmed',
      phone: '+92-300-1111111',
      managerLevel: 'General Manager',
      assignedCategories: [
        'General',
        'Construction',
        'Building Materials'
      ],
      company_id: companyId,
      isActive: true
    });
    await shahManager.save();
    console.log('✅ Created manager record: Shah Ahmed');
    
    // Sales Manager Record
    const salesManager = new Manager({
      user_id: salesUser._id,
      email: 'sales@ressichem.com',
      firstName: 'Sales',
      lastName: 'Manager',
      phone: '+92-300-2222222',
      managerLevel: 'Category Manager',
      assignedCategories: [
        'Tiles',
        'Adhesive',
        'Flooring',
        'Ceramic'
      ],
      company_id: companyId,
      isActive: true
    });
    await salesManager.save();
    console.log('✅ Created manager record: Sales Manager');
    
    // Create category approvals
    console.log('📋 Creating category approvals...');
    
    // Shah's category approvals
    const shahCategories = ['General', 'Construction', 'Building Materials'];
    for (const category of shahCategories) {
      const approval = new CategoryApproval({
        company_id: companyId,
        category: category,
        approverUser: shahUser._id,
        approverName: 'Shah Ahmed',
        approverEmail: 'shah@ressichem.com',
        isActive: true,
        createdBy: 'system',
        notes: `Auto-assigned to ${category} category`
      });
      await approval.save();
      console.log(`✅ Created approval for ${category} → Shah Ahmed`);
    }
    
    // Sales Manager's category approvals
    const salesCategories = ['Tiles', 'Adhesive', 'Flooring', 'Ceramic'];
    for (const category of salesCategories) {
      const approval = new CategoryApproval({
        company_id: companyId,
        category: category,
        approverUser: salesUser._id,
        approverName: 'Sales Manager',
        approverEmail: 'sales@ressichem.com',
        isActive: true,
        createdBy: 'system',
        notes: `Auto-assigned to ${category} category`
      });
      await approval.save();
      console.log(`✅ Created approval for ${category} → Sales Manager`);
    }
    
    console.log('🎯 Manager and category approval setup complete!');
    console.log('📊 Created:');
    console.log('   - 2 manager users');
    console.log('   - 2 manager records');
    console.log('   - 7 category approvals');
    console.log('');
    console.log('👥 Managers:');
    console.log('   - shah@ressichem.com (General, Construction, Building Materials)');
    console.log('   - sales@ressichem.com (Tiles, Adhesive, Flooring, Ceramic)');
    console.log('');
    console.log('📋 Category Routing:');
    console.log('   - General/Construction/Building Materials → shah@ressichem.com');
    console.log('   - Tiles/Adhesive/Flooring/Ceramic → sales@ressichem.com');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error setting up managers:', error.message);
  }
}

setupManagersAndApprovals();
