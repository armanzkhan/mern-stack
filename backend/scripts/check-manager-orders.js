require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const Manager = require("../models/Manager");
const Order = require("../models/Order");
const Product = require("../models/Product");

async function checkManagerOrders() {
  try {
    const mongoUri = process.env.CONNECTION_STRING || "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem",
    });

    console.log("🔍 Checking manager orders for: amin.irfan@ressichem.com\n");

    const user = await User.findOne({ email: "amin.irfan@ressichem.com" });
    if (!user) {
      console.log("❌ User not found");
      await mongoose.disconnect();
      return;
    }

    console.log("✅ User found:");
    console.log("  Email:", user.email);
    console.log("  isManager:", user.isManager);
    console.log("  managerProfile exists:", !!user.managerProfile);
    
    if (user.managerProfile) {
      console.log("  Assigned Categories (from User):", user.managerProfile.assignedCategories || []);
    }

    const manager = await Manager.findOne({ user_id: user.user_id });
    if (manager) {
      const managerCategories = manager.assignedCategories?.map(c => c.category || c) || [];
      console.log("\n✅ Manager record found:");
      console.log("  Assigned Categories (from Manager):", managerCategories);

      if (managerCategories.length === 0) {
        console.log("\n⚠️ Manager has no assigned categories!");
        await mongoose.disconnect();
        return;
      }

      console.log("\n📊 Checking orders...");
      
      // Check orders by category match
      const ordersByCategory = await Order.find({ 
        categories: { $in: managerCategories },
        company_id: "RESSICHEM"
      });
      console.log(`  Orders matching categories: ${ordersByCategory.length}`);

      // Check orders by product category match
      const productsInCategories = await Product.find({
        company_id: "RESSICHEM",
        $or: [
          { "category.mainCategory": { $in: managerCategories } },
          { "category.subCategory": { $in: managerCategories } },
          { "category.subSubCategory": { $in: managerCategories } }
        ]
      }).distinct('_id');

      console.log(`  Products in manager categories: ${productsInCategories.length}`);

      const ordersByProduct = await Order.find({
        "items.product": { $in: productsInCategories },
        company_id: "RESSICHEM"
      });
      console.log(`  Orders with products in categories: ${ordersByProduct.length}`);

      // Get unique orders
      const allOrderIds = new Set();
      ordersByCategory.forEach(o => allOrderIds.add(o._id.toString()));
      ordersByProduct.forEach(o => allOrderIds.add(o._id.toString()));

      console.log(`\n✅ Total unique orders for manager: ${allOrderIds.size}`);

      if (allOrderIds.size > 0) {
        console.log("\n📋 Sample orders:");
        const sampleOrders = await Order.find({
          _id: { $in: Array.from(allOrderIds).slice(0, 5) }
        }).select('orderNumber status categories');
        sampleOrders.forEach(o => {
          console.log(`  - ${o.orderNumber}: ${o.status}, Categories: ${o.categories?.join(', ') || 'none'}`);
        });
      }
    } else {
      console.log("\n❌ Manager record not found for this user");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkManagerOrders();

