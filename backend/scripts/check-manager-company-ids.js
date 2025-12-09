const mongoose = require('mongoose');
require('dotenv').config();

const Manager = require('../models/Manager');

async function checkManagerCompanyIds() {
  try {
    console.log('🔍 CHECKING MANAGER COMPANY ID CONSISTENCY');
    console.log('==========================================\n');

    const mongoUri = process.env.CONNECTION_STRING || "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem"
    });
    console.log('✅ Connected to MongoDB\n');

    // Get all managers
    const managers = await Manager.find({}).select('_id firstName lastName email company_id user_id isActive');
    
    console.log('📊 MANAGER COMPANY ID STATUS:');
    console.log('----------------------------');
    console.log(`Total Managers: ${managers.length}\n`);
    
    managers.forEach((m, index) => {
      const name = `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Unknown';
      const companyId = m.company_id || 'MISSING';
      const status = m.company_id ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${name.padEnd(30)} | Email: ${(m.email || 'N/A').padEnd(35)} | company_id: ${companyId}`);
    });
    
    console.log('\n📈 STATISTICS:');
    console.log('--------------');
    
    const distinctCompanyIds = await Manager.distinct('company_id');
    console.log(`Distinct company_id values: ${distinctCompanyIds.length > 0 ? distinctCompanyIds.join(', ') : 'None'}`);
    
    const managersWithCompanyId = await Manager.countDocuments({ company_id: { $exists: true, $ne: null } });
    const managersWithoutCompanyId = await Manager.countDocuments({ 
      $or: [
        { company_id: { $exists: false } },
        { company_id: null },
        { company_id: '' }
      ]
    });
    
    console.log(`Managers with company_id: ${managersWithCompanyId}`);
    console.log(`Managers without company_id: ${managersWithoutCompanyId}`);
    
    // Check consistency with RESSICHEM
    const ressichemManagers = await Manager.countDocuments({ company_id: 'RESSICHEM' });
    const otherCompanyManagers = await Manager.countDocuments({ 
      company_id: { $exists: true, $ne: null, $ne: 'RESSICHEM' }
    });
    
    console.log(`\n🏢 COMPANY ID BREAKDOWN:`);
    console.log(`   RESSICHEM: ${ressichemManagers} managers`);
    if (otherCompanyManagers > 0) {
      const otherCompanies = await Manager.distinct('company_id', { company_id: { $ne: 'RESSICHEM' } });
      otherCompanies.forEach(companyId => {
        Manager.countDocuments({ company_id: companyId }).then(count => {
          console.log(`   ${companyId}: ${count} managers`);
        });
      });
    }
    
    console.log('\n✅ SUMMARY:');
    if (managersWithoutCompanyId === 0 && ressichemManagers === managers.length) {
      console.log('   ✅ All managers have company_id = RESSICHEM');
      console.log('   ✅ Consistent with other entities (Users, Products, Orders, Invoices, Customers)');
    } else {
      console.log('   ⚠️  Some managers may be missing company_id or have different values');
      if (managersWithoutCompanyId > 0) {
        console.log(`   ❌ ${managersWithoutCompanyId} managers are missing company_id`);
      }
      if (otherCompanyManagers > 0) {
        console.log(`   ⚠️  ${otherCompanyManagers} managers have different company_id values`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkManagerCompanyIds();

