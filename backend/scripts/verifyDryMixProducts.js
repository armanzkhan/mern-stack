// backend/scripts/verifyDryMixProducts.js
// Verifies all Dry Mix Mortars / Premix Plasters products against user's list

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");
const { dryMixProducts } = require('./dryMixProductsList');

// Expected products from user's list
const expectedProducts = [
  // Ressi DecoRend 20,000 C
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 0001 (White)", sku: 1, price: 299 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 0001 (White)", sku: 12, price: 2990 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 9000 W (Dark Fair Face Concrete)", sku: 1, price: 299 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 9000 W (Dark Fair Face Concrete)", sku: 12, price: 2990 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 7000 W (Fair Face Concrete)", sku: 1, price: 299 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 7000 W (Fair Face Concrete)", sku: 12, price: 2990 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 9111 (Ash White)", sku: 1, price: 299 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 9111 (Ash White)", sku: 12, price: 2990 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 8500 (Dessert Sand 3)", sku: 1, price: 299 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 8500 (Dessert Sand 3)", sku: 12, price: 2990 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 1200 (Dessert Sand 1)", sku: 1, price: 299 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 1200 (Dessert Sand 1)", sku: 12, price: 2875 },
  
  // Ressi PlastoRend 100
  { name: "Ressi PlastoRend 100", colorCode: "100 - 0001 B (Brilliant White)", sku: 50, price: 6325 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 0001 (White)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 0003 (Med White)", sku: 50, price: 4600 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 8400 - 1 HD (Adobe Buff)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1100 (Dessert Sand 3)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1101 (Dessert Sand 4)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9111 TG (Ash White 1)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 6110 TG (Ash White 2)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1111 (Dessert Sand 5)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1211-2 (Dirty White)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1200 (Dessert sand 1)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1210 (Dessert Sand 2)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 7000 W (F/F Cement Medium)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 7000 WL (F/F Cement Light)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9000 W (F/F cement)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - GRG (Grey 2)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9210 (Grey 3)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9110 W (Medium Grey)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - TG (Light Grey)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9311 HD (Grey 1)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - GOG (Light Grey 2)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - NW (Ultra Light Pink)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1211 (Biege)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - CHG (Light Walnut Brown)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 3990 X 9 (Red)", sku: 50, price: 9200 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 6800 (Dark Orange)", sku: 50, price: 9200 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 6400 (Light Orange)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 3400 (Pink)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 8820 X 2 HD (Wheatish 1)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1320 (Wheatish 2)", sku: 50, price: 5405 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1220 (Wheatish 3)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - CHW (Wheatish 4)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 8810 X 1 (Wheatish 5)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 8500 HD (Dessert Sand 3)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 5211 (Light Sky Blue)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 5210 (Sky Blue)", sku: 50, price: 5520 },
  
  // Ressi PlastoRend 110
  { name: "Ressi PlastoRend 110", colorCode: "110 - 0001 B (Brilliant White)", sku: 50, price: 6900 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 0001 (White)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 0003 (Med White)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 8400 - 1 HD (Adobe Buff)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1100 (Dessert Sand 3)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1101 (Dessert Sand 4)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9111 TG (Ash White 1)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 6110 TG (Ash White 2)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1111 (Dessert Sand 5)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1211-2 (Dirty White)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1200 (Dessert Sand 1)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1210 (Dessert Sand 2)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 7000 W (F/F Cement Medium)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 7000 WL (F/F Cement Light)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9000 W (Fair Face Cement)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - GRG (Grey2)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9210 W (Grey 3)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9110 W (Medium Grey)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - TG (Light Grey)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9311 HD (Grey 1)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - GOG (Light Grey 2)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - NW (Ultra Light Pink)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1211 (Biege)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - CHG (Light Walnut Brown)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 3990 X 9 (Red)", sku: 50, price: 9200 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 6800 (Dark Orange)", sku: 50, price: 9200 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 6400 (Light Orange)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 3400 (Pink)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 8820 X 2 HD (Wheatish1)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1320 (Wheatish 2)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1220 (Wheatish 3)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - CHW (Wheatish 4)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 8810 X 1 (Wheatish 5)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 8500 HD (Dessert Sand 3)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 5211 (Light Sky Blue)", sku: 50, price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 5210 (Sky Blue)", sku: 50, price: 5405 },
  
  // Ressi PlastoRend 120
  { name: "Ressi PlastoRend 120", colorCode: "(Market Grade)", sku: 50, price: 943 },
  { name: "Ressi PlastoRend 120", colorCode: "(Machine Grade)", sku: 50, price: 1553 },
  
  // Ressi PlastoRend 120 C
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C- 0001 B (Brilliant White)", sku: 50, price: 3335 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 0001 (White)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 0003 (Med White)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 8400 - 1 HD (Adobe Buff)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1100 (Dessert Sand 3)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C- 1101 (Dessert Sand 4)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9111 TG (Ash White 1)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 6110 TG (Ash White 2)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1111 (Dessert Sand 5)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1211-2 (Dirty White)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1200 (Dessert Sand 1)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1210 (Dessert Sand 2)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 7000 W (F/F Cement Medium)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 7000 WL (F/F Cement Light)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9000 W (F/F Cement)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - GRG (Grey 2)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9210 (Grey 3)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9110 W (Medium Grey)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9311 HD (Grey 1)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - GOG (Light Grey 2)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - NW (Ultra Light Pink)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1211 (Beige)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - CHG (Light Walnut Brown)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 3990 X 9 (Red)", sku: 50, price: 4600 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 6800 (Dark Orange)", sku: 50, price: 3738 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 6400 (Light Orange)", sku: 50, price: 3738 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 3400 (Pink)", sku: 50, price: 3738 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 8820 X 2 HD (Wheatish 1)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1320 (Wheatish 2)", sku: 50, price: 3565 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1220 (Wheatish 3)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - CHW (Wheatish 4)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 8810 X 1 (Wheatish 5)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 8500 HD (Dessert Sand 3)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 5211 (Light Sky Blue)", sku: 50, price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 5210 (Sky Blue)", sku: 50, price: 3623 },
  
  // Ressi SC 310
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 0001 (Pasty White)", sku: 50, price: 10925 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 1100 (Harvest Sand)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8400 - 1 (Adobe Buff)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8500 (Sand Stone)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8700 (Steadman Buff)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8820 X 2 (BT Dessert Tan 1)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 1422 (Sun Buff)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8900 (Sand Buff)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8810 X 1 (Nutmeg)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8920 X 2 (Dessert Tan 2)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 1950 X 2 (Mapel Wood)", sku: 50, price: 9200 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 3110 X 4 (Mistsy Wave)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 9110 W (Medium Grey 1)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 7000 W (Fair Face Grey)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 9311 (Grey 1)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9640 (Light Grey)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9400 (Grey)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9600 (Medium Grey 2)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9620 (Smokey Grey)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9700 (Sun Grey)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9522 (Philly Grey)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9800 (Charcoal)", sku: 50, price: 8740 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9960 (Black)", sku: 50, price: 8740 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 3400 X 4 (Coral)", sku: 50, price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 3700 X 4 (Brick Red)", sku: 50, price: 8740 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 3900 X 1 - 1 (Terracotta)", sku: 50, price: 8740 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 3900 X 1 (Red Wood)", sku: 50, price: 7475 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 4740 (Autumn Brown)", sku: 50, price: 8740 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 4810 X 4 (Chesnut)", sku: 50, price: 8740 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 4900 (Walnut)", sku: 50, price: 8740 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 1762 (Waccamaw)", sku: 50, price: 7475 },
  
  // Ressi Lime O Might 8000 - No price (skip)
  // Ressi PFS 620
  { name: "Ressi PFS 620", colorCode: null, sku: 50, price: 1380 },
  
  // Ressi Gyps O Might 9000 - No price (skip)
  // Ressi SLS 610
  { name: "Ressi SLS 610", colorCode: null, sku: 20, price: 4140 },
  { name: "Ressi SLS 610", colorCode: null, sku: 50, price: 10206 },
  
  // Ressi SLS Primer
  { name: "Ressi SLS Primer", colorCode: null, sku: 1, price: 598 },
  { name: "Ressi SLS Primer", colorCode: null, sku: 5, price: 2444 },
  { name: "Ressi SLS Primer", colorCode: null, sku: 10, price: 4830 },
  { name: "Ressi SLS Primer", colorCode: null, sku: 15, price: 7159 },
  { name: "Ressi SLS Primer", colorCode: null, sku: 25, price: 11788 },
  { name: "Ressi SLS Primer", colorCode: null, sku: 200, price: 93150 },
  
  // Ressi BLM 510
  { name: "Ressi BLM 510", colorCode: null, sku: 50, price: 1380 },
  
  // Ressi BRC 7000
  { name: "Ressi BRC 7000", colorCode: null, sku: 50, price: 2875 },
];

async function verifyProducts() {
  try {
    await connect();
    console.log("🔍 Verifying Dry Mix Mortars / Premix Plasters products...\n");

    // Fetch all products from database
    const dbProducts = await Product.find({ 
      "category.mainCategory": "Dry Mix Mortars / Premix Plasters" 
    });

    console.log(`📊 Found ${dbProducts.length} products in database\n`);

    const issues = [];
    const foundProducts = new Set();
    const missingProducts = [];
    const priceMismatches = [];
    const skuMismatches = [];

    // Check each expected product
    for (const expected of expectedProducts) {
      const expectedName = expected.colorCode 
        ? `${expected.name} - ${expected.colorCode}`
        : expected.name;
      
      const expectedKey = `${expectedName} - ${expected.sku} KG`;
      
      // Find matching product in database
      const dbProduct = dbProducts.find(p => {
        const dbKey = `${p.name} - ${p.sku} ${p.unit}`;
        return dbKey === expectedKey;
      });

      if (!dbProduct) {
        missingProducts.push({
          name: expectedName,
          sku: expected.sku,
          unit: "KG",
          expectedPrice: expected.price
        });
      } else {
        foundProducts.add(expectedKey);
        
        // Check price
        if (dbProduct.price !== expected.price) {
          priceMismatches.push({
            name: expectedName,
            sku: expected.sku,
            expectedPrice: expected.price,
            actualPrice: dbProduct.price
          });
        }
        
        // Check SKU
        if (String(dbProduct.sku) !== String(expected.sku)) {
          skuMismatches.push({
            name: expectedName,
            expectedSKU: expected.sku,
            actualSKU: dbProduct.sku
          });
        }
      }
    }

    // Find extra products in database (not in expected list)
    const extraProducts = dbProducts.filter(p => {
      const dbKey = `${p.name} - ${p.sku} ${p.unit}`;
      return !foundProducts.has(dbKey);
    });

    // Print results
    console.log("=".repeat(80));
    console.log("VERIFICATION RESULTS");
    console.log("=".repeat(80));
    
    if (missingProducts.length === 0 && priceMismatches.length === 0 && skuMismatches.length === 0 && extraProducts.length === 0) {
      console.log("\n✅ ALL PRODUCTS VERIFIED SUCCESSFULLY!");
      console.log(`   ✓ ${expectedProducts.length} products found with correct SKUs and prices`);
    } else {
      if (missingProducts.length > 0) {
        console.log(`\n❌ MISSING PRODUCTS (${missingProducts.length}):`);
        missingProducts.forEach(p => {
          console.log(`   - ${p.name} - ${p.sku} ${p.unit} (Expected Price: ${p.expectedPrice})`);
        });
      }
      
      if (priceMismatches.length > 0) {
        console.log(`\n⚠️  PRICE MISMATCHES (${priceMismatches.length}):`);
        priceMismatches.forEach(p => {
          console.log(`   - ${p.name} - ${p.sku} KG: Expected ${p.expectedPrice}, Found ${p.actualPrice}`);
        });
      }
      
      if (skuMismatches.length > 0) {
        console.log(`\n⚠️  SKU MISMATCHES (${skuMismatches.length}):`);
        skuMismatches.forEach(p => {
          console.log(`   - ${p.name}: Expected SKU ${p.expectedSKU}, Found ${p.actualSKU}`);
        });
      }
      
      if (extraProducts.length > 0) {
        console.log(`\n⚠️  EXTRA PRODUCTS IN DATABASE (${extraProducts.length}):`);
        extraProducts.slice(0, 10).forEach(p => {
          console.log(`   - ${p.name} - ${p.sku} ${p.unit} (Price: ${p.price})`);
        });
        if (extraProducts.length > 10) {
          console.log(`   ... and ${extraProducts.length - 10} more`);
        }
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log(`Summary: ${expectedProducts.length} expected, ${dbProducts.length} in database`);
    console.log(`   ✓ Found: ${foundProducts.size}`);
    console.log(`   ❌ Missing: ${missingProducts.length}`);
    console.log(`   ⚠️  Price Issues: ${priceMismatches.length}`);
    console.log(`   ⚠️  SKU Issues: ${skuMismatches.length}`);
    console.log(`   ⚠️  Extra: ${extraProducts.length}`);
    console.log("=".repeat(80));

  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  verifyProducts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { verifyProducts };

