// Create missing permissions for customers
const mongoose = require('mongoose');
const Permission = require('./models/Permission');

async function createMissingPermissions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Create missing permissions
    const missingPermissions = [
      { key: 'products.read', description: 'Read products' },
      { key: 'customers.read', description: 'Read customers' },
      { key: 'notifications.read', description: 'Read notifications' }
    ];

    for (const permData of missingPermissions) {
      let permission = await Permission.findOne({ key: permData.key, company_id: 'RESSICHEM' });
      if (!permission) {
        permission = new Permission({
          ...permData,
          company_id: 'RESSICHEM'
        });
        await permission.save();
        console.log(`✅ Created ${permData.key} permission`);
      } else {
        console.log(`✅ ${permData.key} permission already exists`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Missing permissions created successfully!');

  } catch (error) {
    console.error('❌ Failed to create permissions:', error);
    process.exit(1);
  }
}

createMissingPermissions();
