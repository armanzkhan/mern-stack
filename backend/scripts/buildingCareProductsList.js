// Filtered Building Care and Maintenance products from user's list

const buildingCareProducts = [
  // Ressi Insufix Series
  { name: "Ressi Insufix 200", unit: "KG", sku: 20, price: 1783, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi Insufix 201", unit: "KG", sku: 20, price: 2070, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi Insufix 202", unit: "KG", sku: 20, price: 1898, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Insulaster
  { name: "Insulaster", unit: "KG", sku: 50.802, price: 4945, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Crack Heal Series
  { name: "Crack Heal 910", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Crack Heal 910", unit: "KG", sku: 20, price: 4000, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Crack Heal 910 2K", unit: "KG", sku: 2.5, price: 1025, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Crack Heal 910 2K", unit: "KG", sku: 25, price: 9688, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Crack Heal 920", unit: "KG", sku: 1, price: 344, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Crack Heal 920", unit: "KG", sku: 20, price: 4750, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Crack Heal 920 2K", unit: "KG", sku: 2.5, price: 1025, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Crack Heal 920 2K", unit: "KG", sku: 25, price: 9688, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Crack Heal 940", unit: "KG", sku: 2.18, price: 1438, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Crack Heal 940", unit: "KG", sku: 21.8, price: 12263, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Crack Heal Flexi 950", unit: "KG", sku: 1, price: 1563, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Crack Heal Flexi 950", unit: "KG", sku: 20, price: 26875, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Tough Guard
  { name: "Tough Guard 12,000 E", unit: "KG", sku: 2.17, price: 1188, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Tough Guard 12,000 E", unit: "KG", sku: 21.7, price: 8875, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Water Guard Series
  { name: "Water Guard 491", unit: "KG", sku: 3.2, price: 1875, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 491", unit: "KG", sku: 16, price: 8125, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 491", unit: "KG", sku: 20, price: 10156, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 5010", unit: "KG", sku: 3.2, price: 1225, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 5010", unit: "KG", sku: 16, price: 5438, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 5010", unit: "KG", sku: 20, price: 6688, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 5253", unit: "KG", sku: 3.2, price: 938, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 5253", unit: "KG", sku: 16, price: 3063, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 5253", unit: "KG", sku: 20, price: 4813, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Water Guard 3020 N (with color codes)
  { name: "Water Guard 3020 N", colorCode: "3020 N - 0001 (White)", unit: "KG", sku: 20, price: 25213, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 3020 N", colorCode: "3020 N - 9400 (Grey)", unit: "KG", sku: 20, price: 25213, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 3020 N", colorCode: "3020 N - 3900 X1 - 1 (Terracotta)", unit: "KG", sku: 20, price: 25213, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 3020 N", colorCode: "3020 N - 1200 (Dessert Sand)", unit: "KG", sku: 20, price: 25213, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 3020 N", colorCode: "3020 N - 5210 (Sky Blue)", unit: "KG", sku: 20, price: 25213, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 3020 N", colorCode: "3020 N - 2400 (Light Green)", unit: "KG", sku: 20, price: 25213, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Water Guard 1530 Econo (with color codes)
  { name: "Water Guard 1530 Econo", colorCode: "1530 Econo - 0001 (White)", unit: "KG", sku: 20, price: 15500, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 1530 Econo", colorCode: "1530 Econo - 9400 (Grey)", unit: "KG", sku: 20, price: 15500, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 1530 Econo", colorCode: "1530 Econo- 3900 X1 - 1 (Terracotta)", unit: "KG", sku: 20, price: 15500, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 1530 Econo", colorCode: "1530 Econo - 1200 (Dessert Sand)", unit: "KG", sku: 20, price: 15500, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 1530 Econo", colorCode: "1530 Econo - 5210 (Sky Blue)", unit: "KG", sku: 20, price: 15625, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard 1530 Econo", colorCode: "1530 Econo - 2400 (Light Green)", unit: "KG", sku: 20, price: 15688, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Rain Sheild 1810 (with color codes)
  { name: "Rain Sheild 1810", colorCode: "1810 - 0001 (White)", unit: "KG", sku: 20, price: 22000, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Rain Sheild 1810", colorCode: "1810 N - 9400 (Grey)", unit: "KG", sku: 20, price: 22000, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Rain Sheild 1810", colorCode: "1810 - 3900 X1 - 1 (Terracotta)", unit: "KG", sku: 20, price: 22000, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Rain Sheild 1810", colorCode: "1810 - 1200 (Dessert Sand)", unit: "KG", sku: 20, price: 22000, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Rain Sheild 1810", colorCode: "1810 - 5210 (Sky Blue)", unit: "KG", sku: 20, price: 22000, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Rain Sheild 1810", colorCode: "1810 - 2400 (Light Green)", unit: "KG", sku: 20, price: 22000, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Silprime and Damp Seal
  { name: "Silprime 3K", unit: "KG", sku: 1.25, price: 5000, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Damp Seal", unit: "KG", sku: 1.25, price: 4688, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Silmix
  { name: "Silmix", unit: "LTR", sku: 1, price: 1088, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silmix", unit: "LTR", sku: 5, price: 5375, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silmix", unit: "LTR", sku: 10, price: 10625, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silmix", unit: "LTR", sku: 15, price: 15750, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silmix", unit: "LTR", sku: 25, price: 25938, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silmix", unit: "LTR", sku: 200, price: 200000, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Ressi SBR 5850
  { name: "Ressi SBR 5850", unit: "KG", sku: 1, price: 1125, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi SBR 5850", unit: "KG", sku: 5, price: 5469, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi SBR 5850", unit: "KG", sku: 10, price: 10688, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi SBR 5850", unit: "KG", sku: 15, price: 15750, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi SBR 5850", unit: "KG", sku: 25, price: 25781, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi SBR 5850", unit: "KG", sku: 200, price: 198000, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Ressi Guru
  { name: "Ressi Guru", unit: "KG", sku: 1, price: 606, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi Guru", unit: "KG", sku: 5, price: 2969, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi Guru", unit: "KG", sku: 10, price: 5813, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi Guru", unit: "KG", sku: 25, price: 13906, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi Guru", unit: "KG", sku: 200, price: 107500, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Ressi SBR 5840
  { name: "Ressi SBR 5840", unit: "KG", sku: 1, price: 563, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi SBR 5840", unit: "KG", sku: 5, price: 2750, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi SBR 5840", unit: "KG", sku: 10, price: 5375, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi SBR 5840", unit: "KG", sku: 15, price: 7781, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi SBR 5840", unit: "KG", sku: 25, price: 12813, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Ressi SBR 5840", unit: "KG", sku: 200, price: 100000, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Water Guard L 100
  { name: "Water Guard L 100", unit: "KG", sku: 1, price: 3125, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard L 100", unit: "KG", sku: 5, price: 15000, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard L 100", unit: "KG", sku: 10, price: 28750, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard L 100", unit: "KG", sku: 15, price: 42750, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard L 100", unit: "KG", sku: 25, price: 69375, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard L 100", unit: "KG", sku: 200, price: 550000, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Water Guard P 200
  { name: "Water Guard P 200", unit: "KG", sku: 1, price: 175, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard P 200", unit: "KG", sku: 20, price: 3250, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Silblock (appears twice with different prices - treating as two separate products or variants)
  { name: "Silblock", unit: "LTR", sku: 1, price: 1513, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silblock", unit: "LTR", sku: 5, price: 7500, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silblock", unit: "LTR", sku: 10, price: 14750, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silblock", unit: "LTR", sku: 15, price: 21750, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silblock", unit: "LTR", sku: 25, price: 35625, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silblock", unit: "LTR", sku: 200, price: 280000, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silblock", unit: "LTR", sku: 1, price: 2688, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silblock", unit: "LTR", sku: 5, price: 13313, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silblock", unit: "LTR", sku: 10, price: 26375, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silblock", unit: "LTR", sku: 15, price: 39375, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silblock", unit: "LTR", sku: 25, price: 64063, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Silblock", unit: "LTR", sku: 200, price: 500000, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Patch Series
  { name: "Patch 365", unit: "KG", sku: 1, price: 88, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Patch 365", unit: "KG", sku: 20, price: 1075, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Patch 365 Plus", unit: "KG", sku: 2.5, price: 1875, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Patch 365 Plus", unit: "KG", sku: 25, price: 13750, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Patch Epoxy 111", unit: "KG", sku: 2.5, price: 2250, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Patch Epoxy 111", unit: "KG", sku: 25, price: 14063, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Patch Epoxy 222", unit: "KG", sku: 16, price: 19875, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Rapid Patch
  { name: "Rapid Patch 999", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Rapid Patch 999", unit: "KG", sku: 20, price: 4375, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Heat Guard
  { name: "Heat Guard 1000", unit: "KG", sku: 20, price: 23125, category: { mainCategory: "Building Care and Maintenance" } },
  
  // Water Guard Crysta Series
  { name: "Water Guard Crysta Coat 101", unit: "KG", sku: 1, price: 563, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard Crysta Coat 101", unit: "KG", sku: 20, price: 10000, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard Crysta Coat 102", unit: "KG", sku: 1, price: 500, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard Crysta Coat 102", unit: "KG", sku: 20, price: 8750, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard Crysta Admix 103", unit: "KG", sku: 1, price: 713, category: { mainCategory: "Building Care and Maintenance" } },
  { name: "Water Guard Crysta Admix 103", unit: "KG", sku: 20, price: 13000, category: { mainCategory: "Building Care and Maintenance" } },
].map(p => ({
  ...p,
  name: p.colorCode ? `${p.name} - ${p.colorCode}` : p.name,
  description: p.colorCode ? `${p.name} - ${p.colorCode}` : p.name,
  fullName: p.colorCode ? `${p.name} - ${p.colorCode} - ${p.sku} ${p.unit}` : `${p.name} - ${p.sku} ${p.unit}`,
  company_id: "RESSICHEM"
}));

module.exports = { buildingCareProducts };
