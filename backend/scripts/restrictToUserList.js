// backend/scripts/restrictToUserList.js
// Restricts database to ONLY products from user's specific list
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Parse the user's list and extract all products
// This is a comprehensive list of products the user wants to keep
const userProductList = [
  // Dry Mix Mortars / Premix Plasters - Ressi PlastoRend 100
  { name: "Ressi PlastoRend 100", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 0001 B", unit: "KG", sku: 50, price: 6325, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 0001", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 0003", unit: "KG", sku: 50, price: 4600, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 8400 - 1 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1100", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1101", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 9111 TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 6110 TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1111", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1211-2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1200", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1210", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 7000 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 7000 WL", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 9000 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - GRG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 9210", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 9110 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 9311 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - GOG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - NW", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1211", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - CHG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 3990 X 9", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 6800", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 6400", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 3400", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 8820 X 2 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1320", unit: "KG", sku: 50, price: 5405, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1220", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - CHW", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 8810 X 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 8500 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 5211", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 5210", unit: "KG", sku: 50, price: 5520, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 (Market Grade)", unit: "KG", sku: 50, price: 943, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 (Machine Grade)", unit: "KG", sku: 50, price: 1553, category: "Dry Mix Mortars / Premix Plasters" },
  
  // Ressi PlastoRend 110
  { name: "Ressi PlastoRend 110 - 0001 B", unit: "KG", sku: 50, price: 6900, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 0001", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 0003", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 8400 - 1 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 1100", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 1101", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 9111 TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 6110 TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 1111", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 1211-2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 1200", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 1210", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 7000 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 7000 WL", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 9000 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - GRG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 9210 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 9110 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 9311 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - GOG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - NW", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 1211", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - CHG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 3990 X 9", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 6800", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 6400", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 3400", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 8820 X 2 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 1320", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 1220", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - CHW", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 8810 X 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 8500 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 5211", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 5210", unit: "KG", sku: 50, price: 5405, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 (Market Grade)", unit: "KG", sku: 50, price: 943, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 (Machine Grade)", unit: "KG", sku: 50, price: 1553, category: "Dry Mix Mortars / Premix Plasters" },
  
  // Ressi PlastoRend 120 C
  { name: "RPR 120 C - 0001 B", unit: "KG", sku: 50, price: 3335, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 0001", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 0003", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 8400 - 1 HD", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 1100", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 1101", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 9111 TG", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 6110 TG", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 1111", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 1211-2", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 1200", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 1210", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 7000 W", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 7000 WL", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 9000 W", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - GRG", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 9210", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 9110 W", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 9311 HD", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - GOG", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - NW", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 1211", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - CHG", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 3990 X 9", unit: "KG", sku: 50, price: 4600, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 6800", unit: "KG", sku: 50, price: 3738, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 6400", unit: "KG", sku: 50, price: 3738, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 3400", unit: "KG", sku: 50, price: 3738, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 8820 X 2 HD", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 1320", unit: "KG", sku: 50, price: 3565, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 1220", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - CHW", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 8810 X 1", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 8500 HD", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 5211", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 5210", unit: "KG", sku: 50, price: 3623, category: "Dry Mix Mortars / Premix Plasters" },
  
  // Ressi SC 310
  { name: "Ressi SC 310 - 0001", unit: "KG", sku: 50, price: 10925, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 1100", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 8400 - 1", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 8500", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 8700", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 8820 X 2", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 1422", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 8900", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 8810 X 1", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 8920 X 2", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 1950 X 2", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 3110 X 4", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 9110 W", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 7000 W", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 9311", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 -9640", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310 - 9400", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310 - 9600", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310 - 9620", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310 - 9700", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310 - 9522", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310 - 9800", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310 - 9960", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310 - 3400 X 4", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310 - 3700 X 4", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 3900 X 1 - 1", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 3900 X 1", unit: "KG", sku: 50, price: 7475, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 4740", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 4810 X 4", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 4900", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 1762", unit: "KG", sku: 50, price: 7475, category: "Dry Mix Mortars / Premix Plasters" },
  
  // Specialty products in Dry Mix Mortars
  { name: "Ressi PFS 620", unit: "KG", sku: 50, price: 1380, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BRC 7000", unit: "KG", sku: 50, price: 2875, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi Lime O Might 8000", unit: "KG", sku: 1, price: 250, category: "Building Care and Maintenance" },
  { name: "Ressi Lime O Might 8000", unit: "KG", sku: 20, price: 4000, category: "Building Care and Maintenance" },
  { name: "Ressi Lime O Might 8000", unit: "KG", sku: 2.5, price: 1025, category: "Building Care and Maintenance" },
  { name: "Ressi Lime O Might 8000", unit: "KG", sku: 25, price: 9688, category: "Building Care and Maintenance" },
  { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 1, price: 344, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 20, price: 4750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 2.5, price: 1025, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 25, price: 9688, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SLS 610", unit: "KG", sku: 1, price: 0, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SLS 610", unit: "KG", sku: 20, price: 0, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SLS 610", unit: "KG", sku: 2.18, price: 1438, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SLS 610", unit: "KG", sku: 21.8, price: 12263, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SLS Primer", unit: "KG", sku: 1, price: 1563, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SLS Primer", unit: "KG", sku: 20, price: 26875, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BLM 510", unit: "KG", sku: 2, price: 0, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BLM 510", unit: "KG", sku: 12, price: 0, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BLM 510", unit: "KG", sku: 15, price: 0, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BLM 510", unit: "KG", sku: 2.17, price: 1188, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BLM 510", unit: "KG", sku: 21.7, price: 8875, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BLM 510", unit: "KG", sku: 3.2, price: 1875, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BLM 510", unit: "KG", sku: 16, price: 8125, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BLM 510", unit: "KG", sku: 20, price: 10156, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BLM 510", unit: "KG", sku: 3.2, price: 1225, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BLM 510", unit: "KG", sku: 16, price: 5438, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BLM 510", unit: "KG", sku: 20, price: 6688, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BLM 510", unit: "KG", sku: 3.2, price: 938, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BLM 510", unit: "KG", sku: 16, price: 3063, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi BLM 510", unit: "KG", sku: 20, price: 4813, category: "Dry Mix Mortars / Premix Plasters" },
];

// Create a map for quick lookup: "Product Name - SKU UNIT" -> product data
const userProductMap = new Map();
userProductList.forEach(p => {
  const key = `${p.name} - ${p.sku} ${p.unit}`;
  userProductMap.set(key, p);
});

async function restrictToUserList() {
  try {
    await connect();
    console.log("🔧 RESTRICTING DATABASE TO USER'S PRODUCT LIST ONLY");
    console.log("=".repeat(80));
    console.log(`📋 User wants ${userProductList.length} products in the system\n`);
    
    // Get all active products from database
    const allDbProducts = await Product.find({ 
      company_id: "RESSICHEM", 
      isActive: true 
    });
    
    console.log(`📦 Found ${allDbProducts.length} products in database\n`);
    
    let deactivated = 0;
    let kept = 0;
    let created = 0;
    let updated = 0;
    
    // Check each database product
    for (const dbProduct of allDbProducts) {
      const key = dbProduct.name;
      const userProduct = userProductMap.get(key);
      
      if (!userProduct) {
        // Product not in user's list - deactivate it
        await Product.findByIdAndUpdate(dbProduct._id, { $set: { isActive: false } });
        deactivated++;
      } else {
        // Product is in user's list - verify and update if needed
        kept++;
        let needsUpdate = false;
        const updates = {};
        
        if (String(dbProduct.sku) !== String(userProduct.sku)) {
          updates.sku = String(userProduct.sku);
          needsUpdate = true;
        }
        if (dbProduct.price !== userProduct.price) {
          updates.price = userProduct.price;
          needsUpdate = true;
        }
        if (dbProduct.unit !== userProduct.unit) {
          updates.unit = userProduct.unit;
          needsUpdate = true;
        }
        if (dbProduct.category?.mainCategory !== userProduct.category) {
          updates["category.mainCategory"] = userProduct.category;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await Product.findByIdAndUpdate(dbProduct._id, { $set: updates });
          updated++;
        }
      }
    }
    
    // Create missing products from user's list
    console.log("\n📋 Creating missing products from user's list...");
    for (const userProduct of userProductList) {
      const key = `${userProduct.name} - ${userProduct.sku} ${userProduct.unit}`;
      const existing = await Product.findOne({
        name: key,
        company_id: "RESSICHEM"
      });
      
      if (!existing) {
        const newProduct = new Product({
          name: key,
          sku: String(userProduct.sku),
          unit: userProduct.unit,
          price: userProduct.price,
          category: { mainCategory: userProduct.category },
          company_id: "RESSICHEM",
          isActive: true,
          stock: 0
        });
        await newProduct.save();
        created++;
        console.log(`   ✅ Created: ${key}`);
      }
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 RESTRICTION SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Kept & Verified: ${kept} products`);
    console.log(`❌ Deactivated: ${deactivated} products (not in user's list)`);
    console.log(`➕ Created: ${created} products (from user's list)`);
    console.log(`🔄 Updated: ${updated} products (fixed data)`);
    console.log(`\n📦 Final active products: ${kept + created}`);
    console.log(`📋 User's list size: ${userProductList.length}`);
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error restricting products:", error);
    await disconnect();
    process.exit(1);
  }
}

restrictToUserList();

