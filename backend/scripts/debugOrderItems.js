const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Manager = require('../models/Manager');
const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || process.env.CONNECTION_STRING || 'mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: 'Ressichem' });
    console.log('✅ Connected');

    const user = await User.findOne({ email: 'karim@gmail.com' });
    const manager = await Manager.findOne({ user_id: user.user_id });
    console.log('👨‍💼 Manager categories:', manager?.assignedCategories?.map(c => c.category || c));

    const order = await Order.findOne({ orderNumber: 'ORD-1764389972587-4s6z983i3' }).populate('items.product');
    console.log('\n📦 Order items:', order.items.length);
    console.log('📦 Order categories:', order.categories);

    order.items.forEach((item, idx) => {
      const p = item.product;
      if (!p) {
        console.log(`\nItem ${idx+1}: NO PRODUCT`);
        return;
      }
      const cat = p.category;
      const mainCat = cat && cat.mainCategory ? cat.mainCategory : (typeof cat === 'string' ? cat : 'N/A');
      console.log(`\nItem ${idx+1}: ${p.name}`);
      console.log(`  Category: ${mainCat}`);
      console.log(`  Category type: ${typeof cat}`);
      if (cat && typeof cat === 'object') {
        console.log(`  Category object keys:`, Object.keys(cat));
        console.log(`  mainCategory: ${cat.mainCategory}`);
        console.log(`  subCategory: ${cat.subCategory}`);
      }
    });

    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

