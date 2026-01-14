require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Expected products from user's list - EXACT match required
// Note: Products with no price (Ressi Lime O Might 8000, Ressi Gyps O Might 9000) are included with price 0
const expectedProducts = [
  // Ressi DecoRend 20,000 C
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 0001 (White)", sku: 1, unit: "KG", price: 299 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 0001 (White)", sku: 12, unit: "KG", price: 2990 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 9000 W (Dark Fair Face Concrete)", sku: 1, unit: "KG", price: 299 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 9000 W (Dark Fair Face Concrete)", sku: 12, unit: "KG", price: 2990 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 7000 W (Fair Face Concrete)", sku: 1, unit: "KG", price: 299 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 7000 W (Fair Face Concrete)", sku: 12, unit: "KG", price: 2990 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 9111 (Ash White)", sku: 1, unit: "KG", price: 299 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 9111 (Ash White)", sku: 12, unit: "KG", price: 2990 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 8500 (Dessert Sand 3)", sku: 1, unit: "KG", price: 299 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 8500 (Dessert Sand 3)", sku: 12, unit: "KG", price: 2990 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 1200 (Dessert Sand 1)", sku: 1, unit: "KG", price: 299 },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 1200 (Dessert Sand 1)", sku: 12, unit: "KG", price: 2875 },
  
  // Ressi PlastoRend 100
  { name: "Ressi PlastoRend 100", colorCode: "100 - 0001 B (Brilliant White)", sku: 50, unit: "KG", price: 6325 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 0001 (White)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 0003 (Med White)", sku: 50, unit: "KG", price: 4600 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 8400 - 1 HD (Adobe Buff)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1100 (Dessert Sand 3)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1101 (Dessert Sand 4)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9111 TG (Ash White 1)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 6110 TG (Ash White 2)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1111 (Dessert Sand 5)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1211-2 (Dirty White)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1200 (Dessert sand 1 )", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1210 (Dessert Sand 2)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 7000 W  (F/F Cement Medium)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 7000 WL  (F/F Cement Light)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9000 W ( F/F cement)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - GRG (Grey 2)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9210  (Grey 3)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9110 W (Medium Grey )", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - TG (Light Grey)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9311 HD (Grey 1)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - GOG (Light Grey 2)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - NW ( Ultra Light Pink)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1211 (Biege)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - CHG (Light Walnut Brown)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 3990 X 9 (Red)", sku: 50, unit: "KG", price: 9200 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 6800 (Dark Orange)", sku: 50, unit: "KG", price: 9200 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 6400 (Light Orange)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 3400 (Pink)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 8820 X 2 HD (Wheatish 1)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1320 (Wheatish 2)", sku: 50, unit: "KG", price: 5405 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1220 (Wheatish 3)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - CHW (Wheatish 4)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 8810 X 1 (Wheatish 5)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 8500 HD (Dessert Sand 3)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 5211 (Light Sky Blue)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 5210 (Sky Blue)", sku: 50, unit: "KG", price: 5520 },
  
  // Ressi PlastoRend 110
  { name: "Ressi PlastoRend 110", colorCode: "110 - 0001 B (Brilliant White)", sku: 50, unit: "KG", price: 6900 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 0001 (White)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 0003 (Med White)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 8400 - 1 HD (Adobe Buff)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1100 (Dessert Sand 3)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1101 (Dessert Sand 4)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9111 TG (Ash White 1)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 6110 TG (Ash White 2)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1111 (Dessert Sand 5)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1211-2 (Dirty White)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1200 (Dessert Sand 1)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1210 ( Dessert Sand 2)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 7000 W (F/F Cement Medium)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 7000 WL  (F/F Cement Light)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9000 W (Fair Face Cement)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - GRG (Grey2)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9210 W  (Grey 3)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9110 W (Medium Grey)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - TG (Light Grey)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9311 HD  ( Grey 1)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - GOG (Light Grey 2)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - NW (Ultra Light Pink)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1211 (Biege)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - CHG (Light Walnut Brown)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 3990 X 9 (Red)", sku: 50, unit: "KG", price: 9200 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 6800 (Dark Orange)", sku: 50, unit: "KG", price: 9200 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 6400 (Light Orange)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 3400 (Pink)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 8820 X 2 HD  (Wheatish1)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1320 (Wheatish 2)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1220 (Wheatish 3)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - CHW (Wheatish 4)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 8810 X 1 (Wheatish 5)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 8500 HD (Dessert Sand 3)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 5211 ( Light Sky Blue)", sku: 50, unit: "KG", price: 5175 },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 5210 (Sky Blue)", sku: 50, unit: "KG", price: 5405 },
  
  // Ressi PlastoRend 120
  { name: "Ressi PlastoRend 120", colorCode: "(Market Grade)", sku: 50, unit: "KG", price: 943 },
  { name: "Ressi PlastoRend 120", colorCode: "(Machine Grade)", sku: 50, unit: "KG", price: 1553 },
  
  // Ressi PlastoRend 120 C
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C- 0001 B  (Brilliant White)", sku: 50, unit: "KG", price: 3335 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C  - 0001 (White)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C  - 0003 (Med White)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 8400 - 1 HD (Adobe Buff)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1100 (Dessert Sand 3)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C- 1101 (Dessert Sand 4)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9111 TG (Ash White 1)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 6110 TG (Ash White 2)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1111 ( Dessert Sand 5)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1211-2 (Dirty White)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1200 (Dessert Sand 1)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1210 ( Dessert Sand 2)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 7000 W (F/F Cement Medium)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 7000 WL (F/F Cement Light)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9000 W ( F/F Cement)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - GRG (Grey 2)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9210 (Grey 3)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9110 W (Medium Grey)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9311 HD  (Grey 1)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - GOG (Light Grey 2)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - NW (Ultra Light Pink)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1211 (Beige)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - CHG (Light Walnut Brown)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 3990 X 9 (Red)", sku: 50, unit: "KG", price: 4600 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 6800 (Dark Orange)", sku: 50, unit: "KG", price: 3738 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 6400 (Light Orange)", sku: 50, unit: "KG", price: 3738 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 3400 (Pink)", sku: 50, unit: "KG", price: 3738 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 8820 X 2 HD (Wheatish 1)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1320 (Wheatish 2)", sku: 50, unit: "KG", price: 3565 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1220 (Wheatish 3)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - CHW  (Wheatish 4)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 8810 X 1 (Wheatish 5)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 8500 HD (Dessert Sand 3)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 5211 (Light Sky Blue)", sku: 50, unit: "KG", price: 2415 },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 5210 (Sky Blue)", sku: 50, unit: "KG", price: 3623 },
  
  // Ressi SC 310
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 0001 (Pasty White)", sku: 50, unit: "KG", price: 10925 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 1100 (Harvest Sand)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8400 - 1 (Adobe Buff)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8500 (Sand Stone)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8700 (Steadman Buff)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8820 X 2 (BT Dessert Tan 1)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 1422 (Sun Buff)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8900 (Sand Buff)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8810 X 1 (Nutmeg)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8920 X 2 (Dessert Tan 2)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 1950 X 2 (Mapel Wood)", sku: 50, unit: "KG", price: 9200 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 3110 X 4 (Mistsy Wave)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 9110 W (Medium Grey 1)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 7000 W (Fair Face Grey )", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 9311 (Grey 1)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9640 (Light Grey)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9400 (Grey)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9600 (Medium Grey 2)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9620 ( Smokey Grey)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9700 (Sun Grey)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9522 (Philly Grey)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9800 (Charcoal)", sku: 50, unit: "KG", price: 8740 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9960 (Black)", sku: 50, unit: "KG", price: 8740 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 3400 X 4 (Coral)", sku: 50, unit: "KG", price: 5750 },
  { name: "Ressi SC 310", colorCode: "SC 310 - 3700 X 4 (Brick Red)", sku: 50, unit: "KG", price: 8740 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 3900 X 1 - 1 (Terracotta)", sku: 50, unit: "KG", price: 8740 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 3900 X 1 (Red Wood)", sku: 50, unit: "KG", price: 7475 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 4740 (Autumn Brown)", sku: 50, unit: "KG", price: 8740 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 4810 X 4 (Chesnut)", sku: 50, unit: "KG", price: 8740 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 4900 (Walnut)", sku: 50, unit: "KG", price: 8740 },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 1762 (Waccamaw)", sku: 50, unit: "KG", price: 7475 },
  
  // Ressi Lime O Might 8000 (no price listed - using 0)
  { name: "Ressi Lime O Might 8000", colorCode: null, sku: 50, unit: "KG", price: 0 },
  
  // Ressi PFS 620
  { name: "Ressi PFS 620", colorCode: null, sku: 50, unit: "KG", price: 1380 },
  
  // Ressi Gyps O Might 9000 (no price listed - using 0)
  { name: "Ressi Gyps O Might 9000", colorCode: null, sku: 50, unit: "KG", price: 0 },
  
  // Ressi SLS 610
  { name: "Ressi SLS 610", colorCode: null, sku: 20, unit: "KG", price: 4140 },
  { name: "Ressi SLS 610", colorCode: null, sku: 50, unit: "KG", price: 10206 },
  
  // Ressi SLS Primer
  { name: "Ressi SLS Primer", colorCode: null, sku: 1, unit: "KG", price: 598 },
  { name: "Ressi SLS Primer", colorCode: null, sku: 5, unit: "KG", price: 2444 },
  { name: "Ressi SLS Primer", colorCode: null, sku: 10, unit: "KG", price: 4830 },
  { name: "Ressi SLS Primer", colorCode: null, sku: 15, unit: "KG", price: 7159 },
  { name: "Ressi SLS Primer", colorCode: null, sku: 25, unit: "KG", price: 11788 },
  { name: "Ressi SLS Primer", colorCode: null, sku: 200, unit: "KG", price: 93150 },
  
  // Ressi BLM 510
  { name: "Ressi BLM 510", colorCode: null, sku: 50, unit: "KG", price: 1380 },
  
  // Ressi BRC 7000
  { name: "Ressi BRC 7000", colorCode: null, sku: 50, unit: "KG", price: 2875 },
];

// Helper function to create product name with color code
function createProductName(product) {
  if (product.colorCode) {
    return `${product.name} - ${product.colorCode}`;
  }
  return product.name;
}

// Helper function to create a unique key for matching products
function createProductKey(product) {
  const name = createProductName(product);
  return `${name}|${product.sku}|${product.unit}`;
}

(async () => {
  try {
    await connect();
    console.log("🔧 Fixing Dry Mix Mortars / Premix Plasters products...\n");
    
    // Step 1: Delete ALL products in this category
    console.log("Step 1: Removing all existing products from Dry Mix Mortars / Premix Plasters category...");
    const deleteResult = await Product.deleteMany({
      "category.mainCategory": "Dry Mix Mortars / Premix Plasters",
      company_id: "RESSICHEM"
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing products\n`);
    
    // Step 2: Create all expected products
    console.log(`Step 2: Creating ${expectedProducts.length} products with exact specifications...\n`);
    
    const productsToInsert = expectedProducts.map(prod => {
      const productName = createProductName(prod);
      return {
        name: `${productName} - ${prod.sku} ${prod.unit}`,
        fullName: `${productName} - ${prod.sku} ${prod.unit}`,
        description: productName,
        sku: prod.sku,
        unit: prod.unit,
        price: prod.price,
        category: {
          mainCategory: "Dry Mix Mortars / Premix Plasters"
        },
        company_id: "RESSICHEM",
        isActive: true,
        stockStatus: "in_stock"
      };
    });
    
    // Insert all products
    const insertResult = await Product.insertMany(productsToInsert, { ordered: false });
    console.log(`✅ Created ${insertResult.length} products\n`);
    
    // Step 3: Verify the results
    console.log("Step 3: Verifying results...\n");
    const dbProducts = await Product.find({
      "category.mainCategory": "Dry Mix Mortars / Premix Plasters",
      company_id: "RESSICHEM"
    }).sort({ name: 1, sku: 1 });
    
    console.log(`📊 Total products in database: ${dbProducts.length}`);
    console.log(`📊 Expected products: ${expectedProducts.length}\n`);
    
    // Verify each product
    let correctCount = 0;
    let missingCount = 0;
    const missingProducts = [];
    
    for (const expected of expectedProducts) {
      const expectedName = createProductName(expected);
      const expectedFullName = `${expectedName} - ${expected.sku} ${expected.unit}`;
      const found = dbProducts.find(p => {
        const dbFullName = p.name || p.fullName;
        // Compare name, price, unit, and sku
        const nameMatch = dbFullName === expectedFullName || dbFullName.trim() === expectedFullName.trim();
        const priceMatch = Math.abs((p.price || 0) - expected.price) < 0.01;
        const unitMatch = (p.unit || "").trim() === expected.unit.trim();
        const skuMatch = Math.abs((p.sku || 0) - expected.sku) < 0.0001;
        
        return nameMatch && priceMatch && unitMatch && skuMatch;
      });
      
      if (found) {
        correctCount++;
      } else {
        missingCount++;
        missingProducts.push(expected);
      }
    }
    
    console.log(`✅ Correct products: ${correctCount}`);
    if (missingCount > 0) {
      console.log(`❌ Missing/Incorrect products: ${missingCount}`);
      console.log("\nMissing products:");
      missingProducts.slice(0, 20).forEach(p => {
        const name = createProductName(p);
        console.log(`  - ${name} - ${p.sku} ${p.unit} - ${p.price}`);
      });
      if (missingProducts.length > 20) {
        console.log(`  ... and ${missingProducts.length - 20} more`);
      }
    }
    
    // Check for extra products
    const extraProducts = [];
    const expectedMap = new Map();
    expectedProducts.forEach(prod => {
      const key = createProductKey(prod);
      expectedMap.set(key, prod);
    });
    
    for (const dbProduct of dbProducts) {
      // Extract base info from full name
      const nameMatch = dbProduct.name.match(/^(.+?)\s*-\s*[\d.]+\s+(KG|LTR)$/);
      if (nameMatch) {
        const baseName = nameMatch[1].trim();
        const key = `${baseName}|${dbProduct.sku}|${dbProduct.unit}`;
        
        if (!expectedMap.has(key)) {
          extraProducts.push(dbProduct);
        }
      } else {
        extraProducts.push(dbProduct);
      }
    }
    
    if (extraProducts.length > 0) {
      console.log(`\n⚠️  Extra products found: ${extraProducts.length}`);
      extraProducts.slice(0, 10).forEach(p => {
        console.log(`  - ${p.name} - ${p.sku} ${p.unit} - ${p.price}`);
      });
      if (extraProducts.length > 10) {
        console.log(`  ... and ${extraProducts.length - 10} more`);
      }
    }
    
    if (correctCount === expectedProducts.length && missingCount === 0 && extraProducts.length === 0) {
      console.log("\n" + "=".repeat(80));
      console.log("✅ SUCCESS! 100% match achieved!");
      console.log("=".repeat(80));
      console.log(`\nAll ${expectedProducts.length} products are correctly configured in the database.`);
    } else {
      console.log("\n" + "=".repeat(80));
      console.log("⚠️  Some issues remain. Please review the output above.");
      console.log("=".repeat(80));
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
    if (error.writeErrors) {
      console.error("Write errors:", error.writeErrors);
    }
    process.exit(1);
  } finally {
    await disconnect();
  }
})();

