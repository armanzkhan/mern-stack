// backend/scripts/fullPriceListVerification.js
// Full price list verification - checking ALL products
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

/**
 * ALL products from price list - comprehensive list
 */
const allPriceListProducts = [
  // ===== DRY MIX MORTARS / PREMIX PLASTERS =====
  
  // PlastoRend 100 - SKU 1 and 12 (multiple entries)
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
  { name: "100", colorCode: "0001 B", unit: "KG", sku: 50, price: 6325, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "0001", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "0003", unit: "KG", sku: 50, price: 4600, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "8400 - 1 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1100", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1101", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9111 TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "6110 TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1111", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1211-2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1200", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1210", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "7000 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "7000 WL", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9000 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "GRG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9210", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9110 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9311 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "GOG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "NW", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1211", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "CHG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "3990 X 9", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "6800", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "6400", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "3400", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "8820 X 2 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1320", unit: "KG", sku: 50, price: 5405, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1220", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "CHW", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "8810 X 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "8500 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "5211", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "5210", unit: "KG", sku: 50, price: 5520, category: "Dry Mix Mortars / Premix Plasters" },
  
  // PlastoRend 110 - SKU 50 variants
  { name: "110", colorCode: "0001 B", unit: "KG", sku: 50, price: 6900, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "0001", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "0003", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "8400 - 1 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1100", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1101", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "9111 TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "6110 TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1111", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1211-2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1200", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1210", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "7000 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "7000 WL", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "9000 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "GRG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "9210 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "9110 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "9311 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "GOG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "NW", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1211", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "CHG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "3990 X 9", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "6800", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "6400", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "3400", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "8820 X 2 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1320", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "1220", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "CHW", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "8810 X 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "8500 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "5211", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110", colorCode: "5210", unit: "KG", sku: 50, price: 5405, category: "Dry Mix Mortars / Premix Plasters" },
  
  // Market Grade and Machine Grade
  { name: "Ressi PlastoRend 100", grade: "Market Grade", unit: "KG", sku: 50, price: 943, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", grade: "Machine Grade", unit: "KG", sku: 50, price: 1553, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110", grade: "Market Grade", unit: "KG", sku: 50, price: 943, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110", grade: "Machine Grade", unit: "KG", sku: 50, price: 1553, category: "Dry Mix Mortars / Premix Plasters" },
  
  // RPR 120 C (PlastoRend 120 C)
  { name: "RPR 120 C", colorCode: "0001 B", unit: "KG", sku: 50, price: 3335, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "0001", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "0003", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "8400 - 1 HD", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1100", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1101", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "9111 TG", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "6110 TG", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1111", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1211-2", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1200", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1210", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "7000 W", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "7000 WL", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "9000 W", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "GRG", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "9210", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "9110 W", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "9311 HD", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "GOG", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "NW", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1211", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "CHG", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "3990 X 9", unit: "KG", sku: 50, price: 4600, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "6800", unit: "KG", sku: 50, price: 3738, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "6400", unit: "KG", sku: 50, price: 3738, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "3400", unit: "KG", sku: 50, price: 3738, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "8820 X 2 HD", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1320", unit: "KG", sku: 50, price: 3565, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "1220", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "CHW", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "8810 X 1", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "8500 HD", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "5211", unit: "KG", sku: 50, price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C", colorCode: "5210", unit: "KG", sku: 50, price: 3623, category: "Dry Mix Mortars / Premix Plasters" },
  
  // SC 310 Series
  { name: "Ressi SC 310", colorCode: "0001", unit: "KG", sku: 50, price: 10925, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "1100", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "8400 - 1", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "8500", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "8700", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "8820 X 2", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "1422", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "8900", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "8810 X 1", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "8920 X 2", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "1950 X 2", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "3110 X 4", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "9110 W", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "7000 W", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "9311", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9640", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9400", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9600", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9620", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9700", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9522", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9800", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "9960", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "3400 X 4", unit: "KG", sku: 50, price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "SC 310", colorCode: "3700 X 4", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "3900 X 1 - 1", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "3900 X 1", unit: "KG", sku: 50, price: 7475, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "4740", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "4810 X 4", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "4900", unit: "KG", sku: 50, price: 8740, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310", colorCode: "1762", unit: "KG", sku: 50, price: 7475, category: "Dry Mix Mortars / Premix Plasters" },
  
  // ===== BUILDING CARE AND MAINTENANCE =====
  
  // Ressi SLS 610 - decimal SKU
  { name: "Ressi SLS 610", unit: "KG", sku: 2.18, price: 1438, category: "Building Care and Maintenance" },
  { name: "Ressi SLS 610", unit: "KG", sku: 21.8, price: 12263, category: "Building Care and Maintenance" },
  
  // Ressi SLS Primer - decimal SKU
  { name: "Ressi SLS Primer", unit: "KG", sku: 2.17, price: 1188, category: "Building Care and Maintenance" },
  { name: "Ressi SLS Primer", unit: "KG", sku: 21.7, price: 8875, category: "Building Care and Maintenance" },
  
  // Ressi Lime O Might 8000
  { name: "Ressi Lime O Might 8000", unit: "KG", sku: 1, price: 250, category: "Building Care and Maintenance" },
  { name: "Ressi Lime O Might 8000", unit: "KG", sku: 20, price: 4000, category: "Building Care and Maintenance" },
  { name: "Ressi Lime O Might 8000", unit: "KG", sku: 2.5, price: 1025, category: "Building Care and Maintenance" },
  { name: "Ressi Lime O Might 8000", unit: "KG", sku: 25, price: 9688, category: "Building Care and Maintenance" },
  
  // Ressi Gyps O Might 9000
  { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 1, price: 344, category: "Building Care and Maintenance" },
  { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 20, price: 4750, category: "Building Care and Maintenance" },
  { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 2.5, price: 1025, category: "Building Care and Maintenance" },
  { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 25, price: 9688, category: "Building Care and Maintenance" },
  
  // Ressi BLM 510
  { name: "Ressi BLM 510", unit: "KG", sku: 1, price: 1563, category: "Building Care and Maintenance" },
  { name: "Ressi BLM 510", unit: "KG", sku: 20, price: 26875, category: "Building Care and Maintenance" },
  
  // Water Guard 3020 N
  { name: "Water Guard 3020 N", colorCode: "0001", unit: "KG", sku: 20, price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 3020 N", colorCode: "9400", unit: "KG", sku: 20, price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 3020 N", colorCode: "3900 X1 - 1", unit: "KG", sku: 20, price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 3020 N", colorCode: "1200", unit: "KG", sku: 20, price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 3020 N", colorCode: "5210", unit: "KG", sku: 20, price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 3020 N", colorCode: "2400", unit: "KG", sku: 20, price: 25213, category: "Building Care and Maintenance" },
  
  // Water Guard 1530 Econo
  { name: "Water Guard 1530 Econo", colorCode: "0001", unit: "KG", sku: 20, price: 15500, category: "Building Care and Maintenance" },
  { name: "Water Guard 1530 Econo", colorCode: "9400", unit: "KG", sku: 20, price: 15500, category: "Building Care and Maintenance" },
  { name: "Water Guard 1530 Econo", colorCode: "3900 X1 - 1", unit: "KG", sku: 20, price: 15500, category: "Building Care and Maintenance" },
  { name: "Water Guard 1530 Econo", colorCode: "1200", unit: "KG", sku: 20, price: 15500, category: "Building Care and Maintenance" },
  { name: "Water Guard 1530 Econo", colorCode: "5210", unit: "KG", sku: 20, price: 15625, category: "Building Care and Maintenance" },
  { name: "Water Guard 1530 Econo", colorCode: "2400", unit: "KG", sku: 20, price: 15688, category: "Building Care and Maintenance" },
  
  // Rain Sheild 1810
  { name: "Rain Sheild 1810", colorCode: "0001", unit: "KG", sku: 20, price: 22000, category: "Building Care and Maintenance" },
  { name: "Rain Sheild 1810", colorCode: "9400", unit: "KG", sku: 20, price: 22000, category: "Building Care and Maintenance" },
  { name: "Rain Sheild 1810", colorCode: "3900 X1 - 1", unit: "KG", sku: 20, price: 22000, category: "Building Care and Maintenance" },
  { name: "Rain Sheild 1810", colorCode: "1200", unit: "KG", sku: 20, price: 22000, category: "Building Care and Maintenance" },
  { name: "Rain Sheild 1810", colorCode: "5210", unit: "KG", sku: 20, price: 22000, category: "Building Care and Maintenance" },
  { name: "Rain Sheild 1810", colorCode: "2400", unit: "KG", sku: 20, price: 22000, category: "Building Care and Maintenance" },
  
  // ===== TILING AND GROUTING MATERIALS =====
  
  // Ressi TA 210
  { name: "Ressi TA 210", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TA 210", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  
  // Ressi TG 810 - multiple entries
  { name: "Ressi TG 810", colorCode: "0001", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "0001", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "1110", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "1110", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "8111", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "8111", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "1211", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "1211", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "1421", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "1421", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "1600", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "1600", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "2400", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "2400", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "2770", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "2770", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "1950", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "1950", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "9000", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "9000", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "9111", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "9111", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "9200", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "9200", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "5210-1", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "5210-1", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "5410-1", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810", colorCode: "5410-1", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  
  // TG 810 special colors
  { name: "TG 810", colorCode: "3100", unit: "KG", sku: 1, price: 173, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "3100", unit: "KG", sku: 15, price: 2415, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "3700", unit: "KG", sku: 1, price: 230, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "3700", unit: "KG", sku: 15, price: 3278, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "4720", unit: "KG", sku: 1, price: 196, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "4720", unit: "KG", sku: 15, price: 2588, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "5110", unit: "KG", sku: 1, price: 196, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "5110", unit: "KG", sku: 15, price: 2415, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "5210-2", unit: "KG", sku: 1, price: 230, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "5210-2", unit: "KG", sku: 15, price: 3105, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "5410", unit: "KG", sku: 1, price: 495, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "5410", unit: "KG", sku: 15, price: 7073, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "5960", unit: "KG", sku: 1, price: 702, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "5960", unit: "KG", sku: 15, price: 10178, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "5650", unit: "KG", sku: 1, price: 196, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "5650", unit: "KG", sku: 15, price: 2760, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "6400", unit: "KG", sku: 1, price: 230, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "6400", unit: "KG", sku: 15, price: 3105, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "9111-1", unit: "KG", sku: 1, price: 230, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "9111-1", unit: "KG", sku: 15, price: 3105, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "6110", unit: "KG", sku: 1, price: 230, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "6110", unit: "KG", sku: 15, price: 3105, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "9321", unit: "KG", sku: 1, price: 460, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "9321", unit: "KG", sku: 15, price: 6555, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "9642", unit: "KG", sku: 1, price: 460, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "9642", unit: "KG", sku: 15, price: 6555, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "9960", unit: "KG", sku: 1, price: 230, category: "Tiling and Grouting Materials" },
  { name: "TG 810", colorCode: "9960", unit: "KG", sku: 15, price: 3105, category: "Tiling and Grouting Materials" },
];

async function fullPriceListVerification() {
  try {
    await connect();
    console.log('🔍 Full Price List Verification...\n');
    console.log(`Checking ${allPriceListProducts.length} products from price list...\n`);
    
    let correct = 0;
    let skuMismatches = [];
    let priceMismatches = [];
    let categoryMismatches = [];
    let missing = [];
    
    for (const priceListProduct of allPriceListProducts) {
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
        } else if (priceListProduct.name === "TG 810") {
          productName = `TG 810 - ${priceListProduct.colorCode}`;
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
      
      // Verify SKU (handle decimal SKUs)
      const expectedSKU = String(priceListProduct.sku);
      const foundSKU = String(dbProduct.sku);
      // For decimal SKUs, compare as numbers to handle precision
      const expectedSKUNum = parseFloat(expectedSKU);
      const foundSKUNum = parseFloat(foundSKU);
      if (Math.abs(expectedSKUNum - foundSKUNum) > 0.001) {
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
      if (Math.abs(expectedSKUNum - foundSKUNum) <= 0.001 && 
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
    console.log(`   Total Checked: ${allPriceListProducts.length}\n`);
    
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
    
    if (correct === allPriceListProducts.length && 
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
fullPriceListVerification();

