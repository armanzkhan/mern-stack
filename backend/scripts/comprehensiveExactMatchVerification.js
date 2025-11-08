// backend/scripts/comprehensiveExactMatchVerification.js
// Comprehensive exact match verification with the price list
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

/**
 * Comprehensive product list from price list - EXACT format
 * Format: { name, colorCode, unit, sku, price, category }
 */
const priceListProducts = [
  // PlastoRend 100 - SKU 1 and 12 (multiple entries at top)
  { name: "Ressi PlastoRend 100", colorCode: "0001 B", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "0001 B", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "0001", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "0001", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "0003", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "0003", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "8400 - 1 HD", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "8400 - 1 HD", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "1100", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "1100", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "1320", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "1320", unit: "KG", sku: 12, price: 2875, category: "Dry Mix Mortars / Premix Plasters" },
  
  // PlastoRend 100 - SKU 50 variants (format: "100 - 0001 B")
  { name: "100", colorCode: "0001 B", description: "Brilliant White", unit: "KG", sku: 50, price: 6325, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "0001", description: "White", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "0003", description: "Med White", unit: "KG", sku: 50, price: 4600, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "8400 - 1 HD", description: "Adobe Buff", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1100", description: "Dessert Sand 3", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1101", description: "Dessert Sand 4", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9111 TG", description: "Ash White 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "6110 TG", description: "Ash White 2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1111", description: "Dessert Sand 5", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1211-2", description: "Dirty White", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1200", description: "Dessert sand 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1210", description: "Dessert Sand 2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "7000 W", description: "F/F Cement Medium", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "7000 WL", description: "F/F Cement Light", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9000 W", description: "F/F cement", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "GRG", description: "Grey 2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9210", description: "Grey 3", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9110 W", description: "Medium Grey", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "TG", description: "Light Grey", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9311 HD", description: "Grey 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "GOG", description: "Light Grey 2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "NW", description: "Ultra Light Pink", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1211", description: "Biege", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "CHG", description: "Light Walnut Brown", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "3990 X 9", description: "Red", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "6800", description: "Dark Orange", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "6400", description: "Light Orange", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "3400", description: "Pink", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "8820 X 2 HD", description: "Wheatish 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1320", description: "Wheatish 2", unit: "KG", sku: 50, price: 5405, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1220", description: "Wheatish 3", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "CHW", description: "Wheatish 4", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "8810 X 1", description: "Wheatish 5", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "8500 HD", description: "Dessert Sand 3", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "5211", description: "Light Sky Blue", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "5210", description: "Sky Blue", unit: "KG", sku: 50, price: 5520, category: "Dry Mix Mortars / Premix Plasters" },
  
  // PlastoRend 110 - SKU 50 variants
  { name: "110", colorCode: "0001 B", description: "Brilliant White", unit: "KG", sku: 50, price: 6900, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "0001", description: "White", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "0003", description: "Med White", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "8400 - 1 HD", description: "Adobe Buff", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1100", description: "Dessert Sand 3", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1101", description: "Dessert Sand 4", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "9111 TG", description: "Ash White 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "6110 TG", description: "Ash White 2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1111", description: "Dessert Sand 5", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1211-2", description: "Dirty White", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1200", description: "Dessert Sand 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1210", description: "Dessert Sand 2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "7000 W", description: "F/F Cement Medium", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "7000 WL", description: "F/F Cement Light", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "9000 W", description: "Fair Face Cement", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "GRG", description: "Grey2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "9210 W", description: "Grey 3", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "9110 W", description: "Medium Grey", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "TG", description: "Light Grey", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "9311 HD", description: "Grey 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "GOG", description: "Light Grey 2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "NW", description: "Ultra Light Pink", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1211", description: "Biege", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "CHG", description: "Light Walnut Brown", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "3990 X 9", description: "Red", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "6800", description: "Dark Orange", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "6400", description: "Light Orange", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "3400", description: "Pink", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "8820 X 2 HD", description: "Wheatish1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1320", description: "Wheatish 2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1220", description: "Wheatish 3", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "CHW", description: "Wheatish 4", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "8810 X 1", description: "Wheatish 5", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "8500 HD", description: "Dessert Sand 3", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "5211", description: "Light Sky Blue", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "5210", description: "Sky Blue", unit: "KG", sku: 50, price: 5405, category: "Dry Mix Mortars / Premix Plasters" },
  
  // Market Grade and Machine Grade
  { name: "Ressi PlastoRend 100", grade: "Market Grade", unit: "KG", sku: 50, price: 943, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", grade: "Machine Grade", unit: "KG", sku: 50, price: 1553, category: "Dry Mix Mortars / Premix Plasters" },
  
  // RPR 120 C (PlastoRend 120 C)
  { name: "RPR 120 C", colorCode: "0001 B", description: "Brilliant White", unit: "KG", sku: 50, price: 3335, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "0001", description: "White", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "0003", description: "Med White", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "8400 - 1 HD", description: "Adobe Buff", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1100", description: "Dessert Sand 3", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1101", description: "Dessert Sand 4", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "9111 TG", description: "Ash White 1", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "6110 TG", description: "Ash White 2", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1111", description: "Dessert Sand 5", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1211-2", description: "Dirty White", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1200", description: "Dessert Sand 1", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1210", description: "Dessert Sand 2", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "7000 W", description: "F/F Cement Medium", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "7000 WL", description: "F/F Cement Light", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "9000 W", description: "F/F Cement", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "GRG", description: "Grey 2", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "9210", description: "Grey 3", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "9110 W", description: "Medium Grey", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "9311 HD", description: "Grey 1", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "GOG", description: "Light Grey 2", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "NW", description: "Ultra Light Pink", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1211", description: "Beige", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "CHG", description: "Light Walnut Brown", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "3990 X 9", description: "Red", unit: "KG", sku: 50, price: 4600, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "6800", description: "Dark Orange", unit: "KG", sku: 50, price: 3738, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "6400", description: "Light Orange", unit: "KG", sku: 50, price: 3738, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "3400", description: "Pink", unit: "KG", sku: 50, price: 3738, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "8820 X 2 HD", description: "Wheatish 1", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1320", description: "Wheatish 2", unit: "KG", sku: 50, price: 3565, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1220", description: "Wheatish 3", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "CHW", description: "Wheatish 4", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "8810 X 1", description: "Wheatish 5", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "8500 HD", description: "Dessert Sand 3", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "5211", description: "Light Sky Blue", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "5210", description: "Sky Blue", unit: "KG", sku: 50, price: 3623, category: "Dry Mix Mortars / Premix Plasters" },
  
  // SC 310 Series
  { name: "Ressi SC 310", colorCode: "0001", description: "Pasty White", unit: "KG", sku: 50, price: 10925, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "1100", description: "Harvest Sand", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "8400 - 1", description: "Adobe Buff", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "8500", description: "Sand Stone", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "8700", description: "Steadman Buff", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "8820 X 2", description: "BT Dessert Tan 1", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "1422", description: "Sun Buff", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "8900", description: "Sand Buff", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "8810 X 1", description: "Nutmeg", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "8920 X 2", description: "Dessert Tan 2", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "1950 X 2", description: "Mapel Wood", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "3110 X 4", description: "Mistsy Wave", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "9110 W", description: "Medium Grey 1", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "7000 W", description: "Fair Face Grey", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "9311", description: "Grey 1", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9640", description: "Light Grey", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9400", description: "Grey", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9600", description: "Medium Grey 2", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9620", description: "Smokey Grey", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9700", description: "Sun Grey", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9522", description: "Philly Grey", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9800", description: "Charcoal", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9960", description: "Black", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "3400 X 4", description: "Coral", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "3700 X 4", description: "Brick Red", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "3900 X 1 - 1", description: "Terracotta", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "3900 X 1", description: "Red Wood", unit: "KG", sku: 50, price: 7475, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "4740", description: "Autumn Brown", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "4810 X 4", description: "Chesnut", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "4900", description: "Walnut", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "1762", description: "Waccamaw", unit: "KG", sku: 50, price: 7475, category: "Dry Mix Mortars / Premix Plasters" },
  
  // Building Care and Maintenance - Ressi SLS 610 (decimal SKU)
  { name: "Ressi SLS 610", unit: "KG", sku: 2.18, price: 1438, category: "Building Care and Maintenance" },
  { name: "Ressi SLS 610", unit: "KG", sku: 21.8, price: 12263, category: "Building Care and Maintenance" },
  
  // Building Care and Maintenance - Water Guard products
  { name: "Water Guard 3020 N", colorCode: "0001", description: "White", unit: "KG", sku: 20, price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 3020 N", colorCode: "9400", description: "Grey", unit: "KG", sku: 20, price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 3020 N", colorCode: "3900 X1 - 1", description: "Terracotta", unit: "KG", sku: 20, price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 3020 N", colorCode: "1200", description: "Dessert Sand", unit: "KG", sku: 20, price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 3020 N", colorCode: "5210", description: "Sky Blue", unit: "KG", sku: 20, price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 3020 N", colorCode: "2400", description: "Light Green", unit: "KG", sku: 20, price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 1530 Econo", colorCode: "0001", description: "White", unit: "KG", sku: 20, price: 15500, category: "Building Care and Maintenance" },
  { name: "Water Guard 1530 Econo", colorCode: "9400", description: "Grey", unit: "KG", sku: 20, price: 15500, category: "Building Care and Maintenance" },
  { name: "Water Guard 1530 Econo", colorCode: "3900 X1 - 1", description: "Terracotta", unit: "KG", sku: 20, price: 15500, category: "Building Care and Maintenance" },
  { name: "Water Guard 1530 Econo", colorCode: "1200", description: "Dessert Sand", unit: "KG", sku: 20, price: 15500, category: "Building Care and Maintenance" },
  { name: "Water Guard 1530 Econo", colorCode: "5210", description: "Sky Blue", unit: "KG", sku: 20, price: 15625, category: "Building Care and Maintenance" },
  { name: "Water Guard 1530 Econo", colorCode: "2400", description: "Light Green", unit: "KG", sku: 20, price: 15688, category: "Building Care and Maintenance" },
  { name: "Rain Sheild 1810", colorCode: "0001", description: "White", unit: "KG", sku: 20, price: 22000, category: "Building Care and Maintenance" },
  { name: "Rain Sheild 1810", colorCode: "9400", description: "Grey", unit: "KG", sku: 20, price: 22000, category: "Building Care and Maintenance" },
  { name: "Rain Sheild 1810", colorCode: "3900 X1 - 1", description: "Terracotta", unit: "KG", sku: 20, price: 22000, category: "Building Care and Maintenance" },
  { name: "Rain Sheild 1810", colorCode: "1200", description: "Dessert Sand", unit: "KG", sku: 20, price: 22000, category: "Building Care and Maintenance" },
  { name: "Rain Sheild 1810", colorCode: "5210", description: "Sky Blue", unit: "KG", sku: 20, price: 22000, category: "Building Care and Maintenance" },
  { name: "Rain Sheild 1810", colorCode: "2400", description: "Light Green", unit: "KG", sku: 20, price: 22000, category: "Building Care and Maintenance" },
  
  // Tiling and Grouting Materials - Ressi TA 210
  { name: "Ressi TA 210", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TA 210", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  
  // Tiling and Grouting Materials - Ressi TG 810
  { name: "Ressi TG 810", colorCode: "0001", description: "Bright White", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "0001", description: "Bright White", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "1110", description: "Ivory", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "1110", description: "Ivory", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
];

async function comprehensiveExactMatchVerification() {
  try {
    await connect();
    console.log('🔍 Comprehensive Exact Match Verification...\n');
    console.log(`Checking ${priceListProducts.length} products from price list...\n`);
    
    let correct = 0;
    let skuMismatches = [];
    let priceMismatches = [];
    let categoryMismatches = [];
    let missing = [];
    
    for (const priceListProduct of priceListProducts) {
      // Build product name based on format
      let productName;
      if (priceListProduct.grade) {
        // Market Grade / Machine Grade
        productName = `${priceListProduct.name} (${priceListProduct.grade})`;
      } else if (priceListProduct.colorCode) {
        if (priceListProduct.name === "100" || priceListProduct.name === "110" || priceListProduct.name === "120") {
          // Format: "100 - 0001 B" becomes "Ressi PlastoRend 100 - 0001 B"
          productName = `Ressi PlastoRend ${priceListProduct.name} - ${priceListProduct.colorCode}`;
        } else if (priceListProduct.name === "RPR 120 C") {
          productName = `${priceListProduct.name} - ${priceListProduct.colorCode}`;
        } else if (priceListProduct.name === "SC 310" || priceListProduct.name.startsWith("SC 310")) {
          if (priceListProduct.name === "SC 310") {
            productName = `SC 310 - ${priceListProduct.colorCode}`;
          } else {
            productName = `${priceListProduct.name} - ${priceListProduct.colorCode}`;
          }
        } else {
          productName = `${priceListProduct.name} - ${priceListProduct.colorCode}`;
        }
      } else {
        productName = priceListProduct.name;
      }
      
      // Build full name with SKU and unit (as stored in database)
      const fullName = `${productName} - ${priceListProduct.sku} ${priceListProduct.unit}`;
      
      // Search for product - try exact match first
      let dbProduct = await Product.findOne({
        name: fullName,
        company_id: "RESSICHEM"
      });
      
      // If not found, try by name pattern, SKU, and unit
      if (!dbProduct) {
        const namePattern = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        dbProduct = await Product.findOne({
          name: { $regex: new RegExp(namePattern, 'i') },
          company_id: "RESSICHEM",
          sku: String(priceListProduct.sku),
          unit: priceListProduct.unit
        });
      }
      
      if (!dbProduct) {
        missing.push({
          name: productName,
          sku: priceListProduct.sku,
          unit: priceListProduct.unit,
          price: priceListProduct.price,
          category: priceListProduct.category
        });
        continue;
      }
      
      // Verify SKU
      const expectedSKU = String(priceListProduct.sku);
      const foundSKU = String(dbProduct.sku);
      if (expectedSKU !== foundSKU) {
        skuMismatches.push({
          name: productName,
          expectedSKU,
          foundSKU,
          unit: priceListProduct.unit,
          dbName: dbProduct.name
        });
      }
      
      // Verify price
      if (dbProduct.price !== priceListProduct.price) {
        priceMismatches.push({
          name: productName,
          sku: foundSKU,
          expectedPrice: priceListProduct.price,
          foundPrice: dbProduct.price,
          dbName: dbProduct.name
        });
      }
      
      // Verify category
      const expectedCategory = priceListProduct.category;
      const foundCategory = dbProduct.category?.mainCategory || '';
      if (expectedCategory !== foundCategory) {
        categoryMismatches.push({
          name: productName,
          sku: foundSKU,
          expectedCategory,
          foundCategory,
          dbName: dbProduct.name
        });
      }
      
      // If all match
      if (expectedSKU === foundSKU && 
          dbProduct.price === priceListProduct.price && 
          expectedCategory === foundCategory) {
        correct++;
      }
    }
    
    console.log(`\n📊 Verification Summary:`);
    console.log(`   ✅ Correct: ${correct}`);
    console.log(`   ⚠️  SKU Mismatches: ${skuMismatches.length}`);
    console.log(`   ⚠️  Price Mismatches: ${priceMismatches.length}`);
    console.log(`   ⚠️  Category Mismatches: ${categoryMismatches.length}`);
    console.log(`   ❌ Missing: ${missing.length}`);
    console.log(`   Total Checked: ${priceListProducts.length}\n`);
    
    if (skuMismatches.length > 0) {
      console.log(`⚠️  SKU Mismatches (${skuMismatches.length}):`);
      skuMismatches.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} (${p.unit})`);
        console.log(`     Expected SKU: ${p.expectedSKU}, Found SKU: ${p.foundSKU}`);
        console.log(`     DB Name: ${p.dbName}`);
      });
      if (skuMismatches.length > 10) {
        console.log(`   ... and ${skuMismatches.length - 10} more`);
      }
      console.log('');
    }
    
    if (priceMismatches.length > 0) {
      console.log(`⚠️  Price Mismatches (${priceMismatches.length}):`);
      priceMismatches.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} (SKU: ${p.sku} ${p.unit})`);
        console.log(`     Expected: ${p.expectedPrice}, Found: ${p.foundPrice}`);
        console.log(`     DB Name: ${p.dbName}`);
      });
      if (priceMismatches.length > 10) {
        console.log(`   ... and ${priceMismatches.length - 10} more`);
      }
      console.log('');
    }
    
    if (categoryMismatches.length > 0) {
      console.log(`⚠️  Category Mismatches (${categoryMismatches.length}):`);
      categoryMismatches.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} (SKU: ${p.sku})`);
        console.log(`     Expected: "${p.expectedCategory}"`);
        console.log(`     Found: "${p.foundCategory}"`);
        console.log(`     DB Name: ${p.dbName}`);
      });
      if (categoryMismatches.length > 10) {
        console.log(`   ... and ${categoryMismatches.length - 10} more`);
      }
      console.log('');
    }
    
    if (missing.length > 0) {
      console.log(`❌ Missing Products (${missing.length}):`);
      missing.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} (SKU: ${p.sku} ${p.unit}) - Price: ${p.price} - Category: ${p.category}`);
      });
      if (missing.length > 10) {
        console.log(`   ... and ${missing.length - 10} more`);
      }
      console.log('');
    }
    
    if (correct === priceListProducts.length && 
        skuMismatches.length === 0 && 
        priceMismatches.length === 0 && 
        categoryMismatches.length === 0 && 
        missing.length === 0) {
      console.log(`\n✅ All products match the price list exactly!`);
    } else {
      console.log(`\n⚠️  Some products need to be updated.`);
      console.log(`   Run the import script to fix them: node scripts/importProductsFromExcel.js`);
    }
    
    await disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnect();
    process.exit(1);
  }
}

// Run verification
comprehensiveExactMatchVerification();

