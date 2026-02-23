// Filtered Tiling and Grouting Materials products from user's list

const tilingGroutingProducts = [
  // Ressi TA Series
  { name: "Ressi TA 210", unit: "KG", sku: 20, price: 667, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA 210 Plus", unit: "KG", sku: 20, price: 966, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA 220", unit: "KG", sku: 20, price: 1266, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA 230", colorCode: "(Grey)", unit: "KG", sku: 20, price: 1610, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA 230", colorCode: "(White)", unit: "KG", sku: 20, price: 2148, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA 240", unit: "KG", sku: 20, price: 3115, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA 250", unit: "KG", sku: 20, price: 3242, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA 260", unit: "KG", sku: 20, price: 4069, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA 270", unit: "KG", sku: 20, price: 1293, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA 280", unit: "KG", sku: 20, price: 5651, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA 290", unit: "KG", sku: 20, price: 6644, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA 300", unit: "KG", sku: 20, price: 2798, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA Re Bond 245", unit: "KG", sku: 20, price: 2226, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi ETA", unit: "KG", sku: 25, price: 13099, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi ETA SF-1", unit: "KG", sku: 32, price: 38584, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA 0001 B", unit: "KG", sku: 20, price: 3469, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA QS - 1", unit: "KG", sku: 20, price: 6144, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi TG 810
  { name: "Ressi TG 810", colorCode: "0001 (Bright White)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "0001 (Bright White)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "1110 (Ivory)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "1110 (Ivory)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "8111 (Dark Ivory)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "8111 (Dark Ivory)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "1211 (Beige)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "1211 (Beige)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "1421 (Dark Beige)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "1421 (Dark Beige)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "1600 (Yellow)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "1600 (Yellow)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "3100 (Pink)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "3100 (Pink)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "3700 (Terracotta)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "3700 (Terracotta)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "4720 (Burgundy)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "4720 (Burgundy)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "5110 (Light Grey)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "5110 (Light Grey)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "5210-2 (Marble Beige)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "5210-2 (Marble Beige)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "9111-1 (Dessert Tan)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "9111-1 (Dessert Tan)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "6110 (Off White)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "6110 (Off White)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "6400 (Peach)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "6400 (Peach)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "1950 (Maple Wood)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "1950 (Maple Wood)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "9000 (Gray)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "9000 (Gray)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "9111 (Ash White)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "9111 (Ash White)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "9200 (Dark Grey)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "9200 (Dark Grey)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "9321 (Brown)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "9321 (Brown)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "9642 (Dark Brown)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "9642 (Dark Brown)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "9960 (Black)", unit: "KG", sku: 1, price: 177, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810", colorCode: "9960 (Black)", unit: "KG", sku: 15, price: 2425, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi TG 810 Special Colour
  { name: "Ressi TG 810 Special Colou", colorCode: "2400 (Light Green)", unit: "KG", sku: 1, price: 189, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810 Special Colou", colorCode: "2400 (Light Green)", unit: "KG", sku: 15, price: 2609, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810 Special Colou", colorCode: "2770 (Aqua Green)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810 Special Colou", colorCode: "2770 (Aqua Green)", unit: "KG", sku: 15, price: 3541, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810 Special Colou", colorCode: "5210-1 (Sky Blue)", unit: "KG", sku: 1, price: 211, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810 Special Colou", colorCode: "5210-1 (Sky Blue)", unit: "KG", sku: 15, price: 2797, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810 Special Colou", colorCode: "5410-1 (Aqua Blue)", unit: "KG", sku: 1, price: 211, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810 Special Colou", colorCode: "5410-1 (Aqua Blue)", unit: "KG", sku: 15, price: 2609, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810 Special Colou", colorCode: "5410 (Dark Blue)", unit: "KG", sku: 1, price: 532, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810 Special Colou", colorCode: "5410 (Dark Blue)", unit: "KG", sku: 15, price: 7648, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810 Special Colou", colorCode: "5960 (Indigo Blue)", unit: "KG", sku: 1, price: 761, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810 Special Colou", colorCode: "5960 (Indigo Blue)", unit: "KG", sku: 15, price: 11000, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810 Special Colou", colorCode: "5650 (Purple)", unit: "KG", sku: 1, price: 211, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 810 Special Colou", colorCode: "5650 (Purple)", unit: "KG", sku: 15, price: 2986, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi TG 820
  { name: "Ressi TG 820", colorCode: "0001 (Bright White)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "0001 (Bright White)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "1110 (Ivory)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "1110 (Ivory)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "8111 (Dark Ivory)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "8111 (Dark Ivory)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "1211 (Beige)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "1211 (Beige)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "1421 (Dark Beige)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "1421 (Dark Beige)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "1600 (Yellow)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "1600 (Yellow)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "2400 (Light Green)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "2400 (Light Green)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "2770 (Aqua Green)", unit: "KG", sku: 1, price: 500, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "2770 (Aqua Green)", unit: "KG", sku: 15, price: 7087, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "3100 (Pink)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "3100 (Pink)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "3700 (Terracotta)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "3700 (Terracotta)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "4720 (Burgundy)", unit: "KG", sku: 1, price: 500, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "4720 (Burgundy)", unit: "KG", sku: 15, price: 7087, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "5650 (Purple)", unit: "KG", sku: 1, price: 500, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "5650 (Purple)", unit: "KG", sku: 15, price: 7087, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "5110 (Light Grey)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "5110 (Light Grey)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "5210-1 (Sky Blue)", unit: "KG", sku: 1, price: 274, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "5210-1 (Sky Blue)", unit: "KG", sku: 15, price: 3730, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "5410-1 (Aqua Blue)", unit: "KG", sku: 1, price: 272, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "5410-1 (Aqua Blue)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "5210-2 (Marble Beige)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "5210-2 (Marble Beige)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "9111-1 (Dessert Tan)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "9111-1 (Dessert Tan)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "5410 (Dark Blue)", unit: "KG", sku: 1, price: 683, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "5410 (Dark Blue)", unit: "KG", sku: 15, price: 9885, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "5960 (Indigo Blue)", unit: "KG", sku: 1, price: 993, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "5960 (Indigo Blue)", unit: "KG", sku: 15, price: 14547, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "6110 (Off White)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "6110 (Off White)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "6400 (Peach)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "6400 (Peach)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "1950 (Maple Wood)", unit: "KG", sku: 1, price: 500, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "1950 (Maple Wood)", unit: "KG", sku: 15, price: 7087, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "9000 (Gray)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "9000 (Gray)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "9111 (Ash White)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "9111 (Ash White)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "9200 (Dark Grey)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "9200 (Dark Grey)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "9321 (Brown)", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "9321 (Brown)", unit: "KG", sku: 15, price: 3358, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "9642 (Dark Brown)", unit: "KG", sku: 1, price: 500, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "9642 (Dark Brown)", unit: "KG", sku: 15, price: 7087, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "9960 (Black)", unit: "KG", sku: 1, price: 498, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 820", colorCode: "9960 (Black)", unit: "KG", sku: 15, price: 7087, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi TG CR High Gloss
  { name: "Ressi TG CR High Gloss", colorCode: "0001 (Bright White)", unit: "KG", sku: 1.4, price: 5594, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG CR High Gloss", colorCode: "1110 (Ivory)", unit: "KG", sku: 1.4, price: 5594, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG CR High Gloss", colorCode: "1211 (Beige)", unit: "KG", sku: 1.4, price: 5594, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG CR High Gloss", colorCode: "5110 (Light Grey)", unit: "KG", sku: 1.4, price: 5594, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG CR High Gloss", colorCode: "5210-1 (Sky Blue)", unit: "KG", sku: 1.4, price: 5594, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG CR High Gloss", colorCode: "9960 (Black)", unit: "KG", sku: 1.4, price: 5594, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi TG CR Semi Gloss
  { name: "Ressi TG CR Semi Gloss", colorCode: "0001 (Bright White)", unit: "KG", sku: 1.54, price: 6588, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG CR Semi Gloss", colorCode: "1110 (Ivory)", unit: "KG", sku: 1.54, price: 6588, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG CR Semi Gloss", colorCode: "1211 (Beige)", unit: "KG", sku: 1.54, price: 6588, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG CR Semi Gloss", colorCode: "5110 (Light Grey)", unit: "KG", sku: 1.54, price: 6588, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG CR Semi Gloss", colorCode: "5210 - 1 (Sky Blue)", unit: "KG", sku: 1.54, price: 6588, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG CR Semi Gloss", colorCode: "9960 (Black)", unit: "KG", sku: 1.54, price: 6588, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi ETG DP Matt
  { name: "Ressi ETG DP Matt", colorCode: "0001 (Bright White)", unit: "KG", sku: 1.6, price: 2858, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi ETG DP Matt", colorCode: "1110 (Ivory)", unit: "KG", sku: 1.6, price: 2858, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi ETG DP Matt", colorCode: "1211 (Beige)", unit: "KG", sku: 1.6, price: 2858, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi ETG DP Matt", colorCode: "5110 (Light Grey)", unit: "KG", sku: 1.6, price: 2858, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi ETG DP Matt", colorCode: "5210 (Sky Blue)", unit: "KG", sku: 1.6, price: 2858, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi ETG DP Matt", colorCode: "9960 (Black)", unit: "KG", sku: 1.6, price: 2858, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi Tile Latex
  { name: "Ressi Tile Latex", unit: "LTR", sku: 1, price: 966, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Tile Latex", unit: "LTR", sku: 5, price: 4662, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Tile Latex", unit: "LTR", sku: 10, price: 9013, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Tile Latex", unit: "LTR", sku: 15, price: 13054, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Tile Latex", unit: "LTR", sku: 25, price: 21134, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Tile Latex", unit: "LTR", sku: 200, price: 164102, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi Grout Latex
  { name: "Ressi Grout Latex", unit: "KG", sku: 1, price: 1055, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Latex", unit: "KG", sku: 5, price: 5128, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Latex", unit: "KG", sku: 10, price: 9946, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Latex", unit: "KG", sku: 15, price: 14452, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Latex", unit: "KG", sku: 30, price: 23310, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Latex", unit: "KG", sku: 200, price: 180264, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi TA 2K
  { name: "Ressi TA 2K", colorCode: "(Grey)", unit: "KG", sku: 25, price: 4218, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TA 2K", colorCode: "(White)", unit: "KG", sku: 25, price: 4901, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi TA HPA
  { name: "Ressi TA HPA", unit: "KG", sku: 20, price: 27972, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi Grout Seal
  { name: "Ressi Grout Seal", unit: "LTR", sku: 1, price: 1987, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Seal", unit: "LTR", sku: 5, price: 9324, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Seal", unit: "LTR", sku: 10, price: 17405, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Seal", unit: "LTR", sku: 15, price: 24242, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Seal", unit: "LTR", sku: 25, price: 37296, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Seal", unit: "LTR", sku: 200, price: 273504, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi Grout Admix
  { name: "Ressi Grout Admix", unit: "LTR", sku: 1, price: 2115, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Admix", unit: "LTR", sku: 5, price: 9946, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Admix", unit: "LTR", sku: 10, price: 18648, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Admix", unit: "LTR", sku: 15, price: 26107, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Admix", unit: "LTR", sku: 25, price: 40404, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi Grout Admix", unit: "LTR", sku: 200, price: 298368, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi TG 2K
  { name: "Ressi TG 2K", colorCode: "0001 (Bright White)", unit: "KG", sku: 1.5, price: 1243, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 2K", colorCode: "1110 (Ivory)", unit: "KG", sku: 1.5, price: 1243, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 2K", colorCode: "1211 (Beige)", unit: "KG", sku: 1.5, price: 1243, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 2K", colorCode: "5110 (Light Grey)", unit: "KG", sku: 1.5, price: 1243, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 2K", colorCode: "5210 - 1 (Sky Blue)", unit: "KG", sku: 1.5, price: 1243, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG 2K", colorCode: "9960 (Black)", unit: "KG", sku: 1.5, price: 1243, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi TG Bath Seal 2K
  { name: "Ressi TG Bath Seal 2K", colorCode: "0001 (Bright White)", unit: "KG", sku: 1.5, price: 1493, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG Bath Seal 2K", colorCode: "1110 (Ivory)", unit: "KG", sku: 1.5, price: 1493, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG Bath Seal 2K", colorCode: "1211 (Beige)", unit: "KG", sku: 1.5, price: 1493, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG Bath Seal 2K", colorCode: "5110 (Light Grey)", unit: "KG", sku: 1.5, price: 1493, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG Bath Seal 2K", colorCode: "5210 - 1 (Sky Blue)", unit: "KG", sku: 1.5, price: 1493, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi TG Bath Seal 2K", colorCode: "9960 (Black)", unit: "KG", sku: 1.5, price: 1493, category: { mainCategory: "Tiling and Grouting Materials" } },
  
  // Ressi EPO Grout Pro
  { name: "Ressi EPO Grout Pro", colorCode: "(White)", unit: "ML", sku: 0.4, price: 2797, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi EPO Grout Pro", colorCode: "(Black)", unit: "ML", sku: 0.4, price: 2859, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi EPO Grout Pro", colorCode: "(Ivory)", unit: "ML", sku: 0.4, price: 2859, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi EPO Grout Pro", colorCode: "(Brown)", unit: "ML", sku: 0.4, price: 2859, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi EPO Grout Pro", colorCode: "(Silver)", unit: "ML", sku: 0.4, price: 2859, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi EPO Grout Pro", colorCode: "(Copper)", unit: "ML", sku: 0.4, price: 2859, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi EPO Grout Pro", colorCode: "(Gold)", unit: "ML", sku: 0.4, price: 2859, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi EPO Grout Pro", colorCode: "(Beige)", unit: "ML", sku: 0.4, price: 2859, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi EPO Grout Pro", colorCode: "(Aqua Blue)", unit: "ML", sku: 0.4, price: 2859, category: { mainCategory: "Tiling and Grouting Materials" } },
  { name: "Ressi EPO Grout Pro", colorCode: "(Grey)", unit: "ML", sku: 0.4, price: 2859, category: { mainCategory: "Tiling and Grouting Materials" } },
].map(p => {
  // Build product name with color code if present
  const productName = p.colorCode 
    ? `${p.name} - ${p.colorCode}`
    : p.name;
  
  // Build description - avoid double parentheses if colorCode already has them
  let description = p.name;
  if (p.colorCode) {
    if (p.colorCode.startsWith('(')) {
      // Color code already has parentheses, just append it
      description = `${p.name} ${p.colorCode}`;
    } else {
      // Wrap color code in parentheses
      description = `${p.name} (${p.colorCode})`;
    }
  }
  
  return {
    ...p,
    name: productName,
    description: description,
    fullName: `${productName} - ${p.sku} ${p.unit}`,
    company_id: "RESSICHEM"
  };
});

module.exports = { tilingGroutingProducts };

