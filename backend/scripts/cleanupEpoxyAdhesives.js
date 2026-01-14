require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

(async () => {
  await connect();
  console.log("🧹 Cleaning up Epoxy Adhesives and Coatings products...\n");
  
  const result = await Product.deleteMany({
    "category.mainCategory": "Epoxy Adhesives and Coatings"
  });
  
  console.log(`✅ Deleted ${result.deletedCount} products from Epoxy Adhesives and Coatings category`);
  
  await disconnect();
})();

