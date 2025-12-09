const { connect, disconnect } = require('../config/_db');
const CategoryApproval = require('../models/CategoryApproval');
const Role = require('../models/Role');

async function seedCategoryApprovals() {
  await connect();
  
  try {
    console.log('🌱 Seeding Category Approvals...\n');
    
    // Get Manager role
    const managerRole = await Role.findOne({ name: 'Manager', company_id: 'RESSICHEM' });
    if (!managerRole) {
      console.log('❌ Manager role not found. Please run role seeding first.');
      return;
    }
    
    // Define category approvals
    const categoryApprovals = [
      {
        company_id: 'RESSICHEM',
        category: 'Electronics',
        approverRole: 'Manager',
        isActive: true,
        requiresApproval: true,
        approvalLimit: 10000
      },
      {
        company_id: 'RESSICHEM',
        category: 'Chemicals',
        approverRole: 'Manager',
        isActive: true,
        requiresApproval: true,
        approvalLimit: 5000
      },
      {
        company_id: 'RESSICHEM',
        category: 'Machinery',
        approverRole: 'Manager',
        isActive: true,
        requiresApproval: true,
        approvalLimit: 25000
      },
      {
        company_id: 'RESSICHEM',
        category: 'Office Supplies',
        approverRole: 'Manager',
        isActive: true,
        requiresApproval: false,
        approvalLimit: 1000
      },
      {
        company_id: 'RESSICHEM',
        category: 'Raw Materials',
        approverRole: 'Manager',
        isActive: true,
        requiresApproval: true,
        approvalLimit: 15000
      }
    ];
    
    // Clear existing approvals
    await CategoryApproval.deleteMany({ company_id: 'RESSICHEM' });
    console.log('🗑️ Cleared existing category approvals');
    
    // Create new approvals
    for (const approval of categoryApprovals) {
      const categoryApproval = new CategoryApproval(approval);
      await categoryApproval.save();
      console.log(`✅ Created approval for category: ${approval.category}`);
    }
    
    console.log('\n🎉 Category approvals seeded successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Electronics: Requires Manager approval (limit: 10,000)');
    console.log('   - Chemicals: Requires Manager approval (limit: 5,000)');
    console.log('   - Machinery: Requires Manager approval (limit: 25,000)');
    console.log('   - Office Supplies: No approval required (limit: 1,000)');
    console.log('   - Raw Materials: Requires Manager approval (limit: 15,000)');
    
  } catch (error) {
    console.error('❌ Error seeding category approvals:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  seedCategoryApprovals();
}

module.exports = seedCategoryApprovals;
