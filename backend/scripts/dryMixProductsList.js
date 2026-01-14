// Filtered Dry Mix Mortars / Premix Plasters products from user's list
// This will be used to replace the section in importProductsFromExcel.js

const dryMixProducts = [
  // Ressi DecoRend 20,000 C
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 0001 (White)", unit: "KG", sku: 1, price: 299, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 0001 (White)", unit: "KG", sku: 12, price: 2990, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 9000 W (Dark Fair Face Concrete)", unit: "KG", sku: 1, price: 299, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 9000 W (Dark Fair Face Concrete)", unit: "KG", sku: 12, price: 2990, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 7000 W (Fair Face Concrete)", unit: "KG", sku: 1, price: 299, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 7000 W (Fair Face Concrete)", unit: "KG", sku: 12, price: 2990, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 9111 (Ash White)", unit: "KG", sku: 1, price: 299, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 9111 (Ash White)", unit: "KG", sku: 12, price: 2990, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 8500 (Dessert Sand 3)", unit: "KG", sku: 1, price: 299, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 8500 (Dessert Sand 3)", unit: "KG", sku: 12, price: 2990, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 1200 (Dessert Sand 1)", unit: "KG", sku: 1, price: 299, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi DecoRend 20,000 C", colorCode: "RDR 1200 (Dessert Sand 1)", unit: "KG", sku: 12, price: 2875, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  
  // Ressi PlastoRend 100 - Format: "100 - 0001 B (Brilliant White)"
  { name: "Ressi PlastoRend 100", colorCode: "100 - 0001 B (Brilliant White)", unit: "KG", sku: 50, price: 6325, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 0001 (White)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 0003 (Med White)", unit: "KG", sku: 50, price: 4600, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 8400 - 1 HD (Adobe Buff)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1100 (Dessert Sand 3)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1101 (Dessert Sand 4)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9111 TG (Ash White 1)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 6110 TG (Ash White 2)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1111 (Dessert Sand 5)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1211-2 (Dirty White)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1200 (Dessert sand 1)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1210 (Dessert Sand 2)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 7000 W (F/F Cement Medium)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 7000 WL (F/F Cement Light)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9000 W (F/F cement)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - GRG (Grey 2)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9210 (Grey 3)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9110 W (Medium Grey)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - TG (Light Grey)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 9311 HD (Grey 1)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - GOG (Light Grey 2)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - NW (Ultra Light Pink)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1211 (Biege)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - CHG (Light Walnut Brown)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 3990 X 9 (Red)", unit: "KG", sku: 50, price: 9200, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 6800 (Dark Orange)", unit: "KG", sku: 50, price: 9200, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 6400 (Light Orange)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 3400 (Pink)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 8820 X 2 HD (Wheatish 1)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1320 (Wheatish 2)", unit: "KG", sku: 50, price: 5405, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 1220 (Wheatish 3)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - CHW (Wheatish 4)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 8810 X 1 (Wheatish 5)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 8500 HD (Dessert Sand 3)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 5211 (Light Sky Blue)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 100", colorCode: "100 - 5210 (Sky Blue)", unit: "KG", sku: 50, price: 5520, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  
  // Ressi PlastoRend 110
  { name: "Ressi PlastoRend 110", colorCode: "110 - 0001 B (Brilliant White)", unit: "KG", sku: 50, price: 6900, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 0001 (White)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 0003 (Med White)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 8400 - 1 HD (Adobe Buff)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1100 (Dessert Sand 3)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1101 (Dessert Sand 4)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9111 TG (Ash White 1)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 6110 TG (Ash White 2)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1111 (Dessert Sand 5)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1211-2 (Dirty White)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1200 (Dessert Sand 1)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1210 (Dessert Sand 2)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 7000 W (F/F Cement Medium)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 7000 WL (F/F Cement Light)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9000 W (Fair Face Cement)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - GRG (Grey2)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9210 W (Grey 3)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9110 W (Medium Grey)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - TG (Light Grey)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 9311 HD (Grey 1)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - GOG (Light Grey 2)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - NW (Ultra Light Pink)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1211 (Biege)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - CHG (Light Walnut Brown)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 3990 X 9 (Red)", unit: "KG", sku: 50, price: 9200, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 6800 (Dark Orange)", unit: "KG", sku: 50, price: 9200, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 6400 (Light Orange)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 3400 (Pink)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 8820 X 2 HD (Wheatish1)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1320 (Wheatish 2)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 1220 (Wheatish 3)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - CHW (Wheatish 4)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 8810 X 1 (Wheatish 5)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 8500 HD (Dessert Sand 3)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 5211 (Light Sky Blue)", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 110", colorCode: "110 - 5210 (Sky Blue)", unit: "KG", sku: 50, price: 5405, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  
  // Ressi PlastoRend 120
  { name: "Ressi PlastoRend 120", colorCode: "(Market Grade)", unit: "KG", sku: 50, price: 943, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120", colorCode: "(Machine Grade)", unit: "KG", sku: 50, price: 1553, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  
  // Ressi PlastoRend 120 C
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C- 0001 B (Brilliant White)", unit: "KG", sku: 50, price: 3335, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 0001 (White)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 0003 (Med White)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 8400 - 1 HD (Adobe Buff)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1100 (Dessert Sand 3)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C- 1101 (Dessert Sand 4)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9111 TG (Ash White 1)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 6110 TG (Ash White 2)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1111 (Dessert Sand 5)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1211-2 (Dirty White)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1200 (Dessert Sand 1)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1210 (Dessert Sand 2)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 7000 W (F/F Cement Medium)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 7000 WL (F/F Cement Light)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9000 W (F/F Cement)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - GRG (Grey 2)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9210 (Grey 3)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9110 W (Medium Grey)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 9311 HD (Grey 1)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - GOG (Light Grey 2)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - NW (Ultra Light Pink)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1211 (Beige)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - CHG (Light Walnut Brown)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 3990 X 9 (Red)", unit: "KG", sku: 50, price: 4600, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 6800 (Dark Orange)", unit: "KG", sku: 50, price: 3738, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 6400 (Light Orange)", unit: "KG", sku: 50, price: 3738, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 3400 (Pink)", unit: "KG", sku: 50, price: 3738, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 8820 X 2 HD (Wheatish 1)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1320 (Wheatish 2)", unit: "KG", sku: 50, price: 3565, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 1220 (Wheatish 3)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - CHW (Wheatish 4)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 8810 X 1 (Wheatish 5)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 8500 HD (Dessert Sand 3)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 5211 (Light Sky Blue)", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi PlastoRend 120 C", colorCode: "RPR 120 C - 5210 (Sky Blue)", unit: "KG", sku: 50, price: 3623, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  
  // Ressi SC 310
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 0001 (Pasty White)", unit: "KG", sku: 50, price: 10925, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 1100 (Harvest Sand)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8400 - 1 (Adobe Buff)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8500 (Sand Stone)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8700 (Steadman Buff)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8820 X 2 (BT Dessert Tan 1)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 1422 (Sun Buff)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8900 (Sand Buff)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8810 X 1 (Nutmeg)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 8920 X 2 (Dessert Tan 2)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 1950 X 2 (Mapel Wood)", unit: "KG", sku: 50, price: 9200, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 3110 X 4 (Mistsy Wave)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 9110 W (Medium Grey 1)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 7000 W (Fair Face Grey)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 9311 (Grey 1)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9640 (Light Grey)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9400 (Grey)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9600 (Medium Grey 2)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9620 (Smokey Grey)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9700 (Sun Grey)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9522 (Philly Grey)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9800 (Charcoal)", unit: "KG", sku: 50, price: 8740, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "SC 310 - 9960 (Black)", unit: "KG", sku: 50, price: 8740, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "SC 310 - 3400 X 4 (Coral)", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "SC 310 - 3700 X 4 (Brick Red)", unit: "KG", sku: 50, price: 8740, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 3900 X 1 - 1 (Terracotta)", unit: "KG", sku: 50, price: 8740, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 3900 X 1 (Red Wood)", unit: "KG", sku: 50, price: 7475, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 4740 (Autumn Brown)", unit: "KG", sku: 50, price: 8740, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 4810 X 4 (Chesnut)", unit: "KG", sku: 50, price: 8740, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 4900 (Walnut)", unit: "KG", sku: 50, price: 8740, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SC 310", colorCode: "Ressi SC 310 - 1762 (Waccamaw)", unit: "KG", sku: 50, price: 7475, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  
  // Ressi Lime O Might 8000 - No price listed (using 0)
  { name: "Ressi Lime O Might 8000", unit: "KG", sku: 50, price: 0, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  
  // Ressi PFS 620
  { name: "Ressi PFS 620", unit: "KG", sku: 50, price: 1380, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  
  // Ressi Gyps O Might 9000 - No price listed (using 0)
  { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 50, price: 0, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  
  // Ressi SLS 610
  { name: "Ressi SLS 610", unit: "KG", sku: 20, price: 4140, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SLS 610", unit: "KG", sku: 50, price: 10206, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  
  // Ressi SLS Primer
  { name: "Ressi SLS Primer", unit: "KG", sku: 1, price: 598, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SLS Primer", unit: "KG", sku: 5, price: 2444, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SLS Primer", unit: "KG", sku: 10, price: 4830, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SLS Primer", unit: "KG", sku: 15, price: 7159, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SLS Primer", unit: "KG", sku: 25, price: 11788, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  { name: "Ressi SLS Primer", unit: "KG", sku: 200, price: 93150, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  
  // Ressi BLM 510
  { name: "Ressi BLM 510", unit: "KG", sku: 50, price: 1380, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
  
  // Ressi BRC 7000
  { name: "Ressi BRC 7000", unit: "KG", sku: 50, price: 2875, category: { mainCategory: "Dry Mix Mortars / Premix Plasters" } },
].map(p => {
  // Build product name with color code if present
  const productName = p.colorCode 
    ? `${p.name} - ${p.colorCode}`
    : p.name;
  
  return {
    ...p,
    name: productName,
    description: p.colorCode ? `${p.name} (${p.colorCode})` : p.name,
    fullName: `${productName} - ${p.sku} ${p.unit}`,
    company_id: "RESSICHEM"
  };
});

module.exports = { dryMixProducts };

