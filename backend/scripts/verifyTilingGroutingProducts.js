// backend/scripts/verifyTilingGroutingProducts.js
// Verifies all Tiling and Grouting Materials products against user's list

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Expected products from user's list
const expectedProducts = [
  // Ressi TA Series
  { name: "Ressi TA 210", sku: 20, unit: "KG", price: 667 },
  { name: "Ressi TA 210 Plus", sku: 20, unit: "KG", price: 966 },
  { name: "Ressi TA 220", sku: 20, unit: "KG", price: 1266 },
  { name: "Ressi TA 230", colorCode: "(Grey)", sku: 20, unit: "KG", price: 1610 },
  { name: "Ressi TA 230", colorCode: "(White)", sku: 20, unit: "KG", price: 2148 },
  { name: "Ressi TA 240", sku: 20, unit: "KG", price: 3115 },
  { name: "Ressi TA 250", sku: 20, unit: "KG", price: 3242 },
  { name: "Ressi TA 260", sku: 20, unit: "KG", price: 4069 },
  { name: "Ressi TA 270", sku: 20, unit: "KG", price: 1293 },
  { name: "Ressi TA 280", sku: 20, unit: "KG", price: 5651 },
  { name: "Ressi TA 290", sku: 20, unit: "KG", price: 6644 },
  { name: "Ressi TA 300", sku: 20, unit: "KG", price: 2798 },
  { name: "Ressi TA Re Bond 245", sku: 20, unit: "KG", price: 2226 },
  { name: "Ressi ETA", sku: 25, unit: "KG", price: 13099 },
  { name: "Ressi ETA SF-1", sku: 32, unit: "KG", price: 38584 },
  { name: "Ressi TA 0001 B", sku: 20, unit: "KG", price: 3469 },
  { name: "Ressi TA QS - 1", sku: 20, unit: "KG", price: 6144 },
  
  // Ressi TG 810
  { name: "Ressi TG 810", colorCode: "810 - 0001 (Bright White)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "810 - 0001 (Bright White)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "810 -1110 (Ivory)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "810 -1110 (Ivory)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "810 - 8111 (Dark Ivory)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "810 - 8111 (Dark Ivory)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "810 - 1211 (Beige)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "810 - 1211 (Beige)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "810 - 1421 (Dark Beige)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "810 - 1421 (Dark Beige)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "810 - 1600 (Yellow)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "810 - 1600 (Yellow)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 3100 (Pink)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 3100 (Pink)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 3700 (Terracotta)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 3700 (Terracotta)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 4720 (Burgundy)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 4720 (Burgundy)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "TG 810 -5110 (Light Grey)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "TG 810 -5110 (Light Grey)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 5210-2 (Marble Beige)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 5210-2 (Marble Beige)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "810 - 9111-1 (Dessert Tan)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "810 - 9111-1 (Dessert Tan)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 6110 (Off White)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 6110 (Off White)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 6400 (Peach)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 6400 (Peach)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "810 -1950 (Maple Wood)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "810 -1950 (Maple Wood)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "810 - 9000 (Gray)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "810 - 9000 (Gray)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "810 - 9111 (Ash White)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "810 - 9111 (Ash White)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "810 - 9200 (Dark Grey)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "810 - 9200 (Dark Grey)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 9321 (Brown)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 9321 (Brown)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 9642 (Dark Brown)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 9642 (Dark Brown)", sku: 15, unit: "KG", price: 2425 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 9960 (Black)", sku: 1, unit: "KG", price: 177 },
  { name: "Ressi TG 810", colorCode: "TG 810 - 9960 (Black)", sku: 15, unit: "KG", price: 2425 },
  
  // Ressi TG 810 Special Colour
  { name: "Ressi TG 810 Special Colou", colorCode: "810 - 2400 (Light Green)", sku: 1, unit: "KG", price: 189 },
  { name: "Ressi TG 810 Special Colou", colorCode: "810 - 2400 (Light Green)", sku: 15, unit: "KG", price: 2609 },
  { name: "Ressi TG 810 Special Colou", colorCode: "810 - 2770 (Aqua Green)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 810 Special Colou", colorCode: "810 - 2770 (Aqua Green)", sku: 15, unit: "KG", price: 3541 },
  { name: "Ressi TG 810 Special Colou", colorCode: "TG 810 - 5210-1 (Sky Blue)", sku: 1, unit: "KG", price: 211 },
  { name: "Ressi TG 810 Special Colou", colorCode: "TG 810 - 5210-1 (Sky Blue)", sku: 15, unit: "KG", price: 2797 },
  { name: "Ressi TG 810 Special Colou", colorCode: "810 -5410-1 (Aqua Blue)", sku: 1, unit: "KG", price: 211 },
  { name: "Ressi TG 810 Special Colou", colorCode: "810 -5410-1 (Aqua Blue)", sku: 15, unit: "KG", price: 2609 },
  { name: "Ressi TG 810 Special Colou", colorCode: "TG 810 - 5410 (Dark Blue)", sku: 1, unit: "KG", price: 532 },
  { name: "Ressi TG 810 Special Colou", colorCode: "TG 810 - 5410 (Dark Blue)", sku: 15, unit: "KG", price: 7648 },
  { name: "Ressi TG 810 Special Colou", colorCode: "TG 810 - 5960 (Indigo Blue)", sku: 1, unit: "KG", price: 761 },
  { name: "Ressi TG 810 Special Colou", colorCode: "TG 810 - 5960 (Indigo Blue)", sku: 15, unit: "KG", price: 11000 },
  { name: "Ressi TG 810 Special Colou", colorCode: "TG 810 - 5650 (Purple)", sku: 1, unit: "KG", price: 211 },
  { name: "Ressi TG 810 Special Colou", colorCode: "TG 810 - 5650 (Purple)", sku: 15, unit: "KG", price: 2986 },
  
  // Ressi TG 820
  { name: "Ressi TG 820", colorCode: "820 - 0001 (Bright White)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "820 - 0001 (Bright White)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "820 -1110 (Ivory)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "820 -1110 (Ivory)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "820 - 8111 (Dark Ivory)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "820 - 8111 (Dark Ivory)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "820 - 1211 (Beige)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "820 - 1211 (Beige)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "820 - 1421 (Dark Beige)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "820 - 1421 (Dark Beige)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "820 - 1600 (Yellow)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "820 - 1600 (Yellow)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "820 - 2400 (Light Green)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "820 - 2400 (Light Green)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "820 - 2770 (Aqua Green)", sku: 1, unit: "KG", price: 500 },
  { name: "Ressi TG 820", colorCode: "820 - 2770 (Aqua Green)", sku: 15, unit: "KG", price: 7087 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 3100 (Pink)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 3100 (Pink)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 3700 (Terracotta)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 3700 (Terracotta)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 4720 (Burgundy)", sku: 1, unit: "KG", price: 500 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 4720 (Burgundy)", sku: 15, unit: "KG", price: 7087 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 5650 (Purple)", sku: 1, unit: "KG", price: 500 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 5650 (Purple)", sku: 15, unit: "KG", price: 7087 },
  { name: "Ressi TG 820", colorCode: "TG 820 -5110 (Light Grey)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "TG 820 -5110 (Light Grey)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 5210-1 (Sky Blue)", sku: 1, unit: "KG", price: 274 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 5210-1 (Sky Blue)", sku: 15, unit: "KG", price: 3730 },
  { name: "Ressi TG 820", colorCode: "820 -5410-1 (Aqua Blue)", sku: 1, unit: "KG", price: 272 },
  { name: "Ressi TG 820", colorCode: "820 -5410-1 (Aqua Blue)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 5210-2 (Marble Beige)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 5210-2 (Marble Beige)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "820 - 9111-1 (Dessert Tan)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "820 - 9111-1 (Dessert Tan)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 5410 (Dark Blue)", sku: 1, unit: "KG", price: 683 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 5410 (Dark Blue)", sku: 15, unit: "KG", price: 9885 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 5960 (Indigo Blue)", sku: 1, unit: "KG", price: 993 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 5960 (Indigo Blue)", sku: 15, unit: "KG", price: 14547 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 6110 (Off White)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 6110 (Off White)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 6400 (Peach)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 6400 (Peach)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "820 -1950 (Maple Wood)", sku: 1, unit: "KG", price: 500 },
  { name: "Ressi TG 820", colorCode: "820 -1950 (Maple Wood)", sku: 15, unit: "KG", price: 7087 },
  { name: "Ressi TG 820", colorCode: "820 - 9000 (Gray)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "820 - 9000 (Gray)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "820 - 9111 (Ash White)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "820 - 9111 (Ash White)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "820 - 9200 (Dark Grey)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "820 - 9200 (Dark Grey)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 9321 (Brown)", sku: 1, unit: "KG", price: 250 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 9321 (Brown)", sku: 15, unit: "KG", price: 3358 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 9642 (Dark Brown)", sku: 1, unit: "KG", price: 500 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 9642 (Dark Brown)", sku: 15, unit: "KG", price: 7087 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 9960 (Black)", sku: 1, unit: "KG", price: 498 },
  { name: "Ressi TG 820", colorCode: "TG 820 - 9960 (Black)", sku: 15, unit: "KG", price: 7087 },
  
  // Ressi TG CR High Gloss
  { name: "Ressi TG CR High Gloss", colorCode: "High Gloss - 0001 (Bright White)", sku: 1.4, unit: "KG", price: 5594 },
  { name: "Ressi TG CR High Gloss", colorCode: "High Gloss - 1110 (Ivory)", sku: 1.4, unit: "KG", price: 5594 },
  { name: "Ressi TG CR High Gloss", colorCode: "High Gloss - 1211 (Beige)", sku: 1.4, unit: "KG", price: 5594 },
  { name: "Ressi TG CR High Gloss", colorCode: "High Gloss - 5110 (Light Grey)", sku: 1.4, unit: "KG", price: 5594 },
  { name: "Ressi TG CR High Gloss", colorCode: "High Gloss - 5210-1 (Sky Blue)", sku: 1.4, unit: "KG", price: 5594 },
  { name: "Ressi TG CR High Gloss", colorCode: "High Gloss - 9960 (Black)", sku: 1.4, unit: "KG", price: 5594 },
  
  // Ressi TG CR Semi Gloss
  { name: "Ressi TG CR Semi Gloss", colorCode: "Semi Gloss - 0001 (Bright White)", sku: 1.54, unit: "KG", price: 6588 },
  { name: "Ressi TG CR Semi Gloss", colorCode: "Semi Gloss - 1110 (Ivory)", sku: 1.54, unit: "KG", price: 6588 },
  { name: "Ressi TG CR Semi Gloss", colorCode: "Semi Gloss - 1211 (Beige)", sku: 1.54, unit: "KG", price: 6588 },
  { name: "Ressi TG CR Semi Gloss", colorCode: "Semi Gloss - 5110 (Light Grey)", sku: 1.54, unit: "KG", price: 6588 },
  { name: "Ressi TG CR Semi Gloss", colorCode: "Semi Gloss - 5210 - 1 (Sky Blue)", sku: 1.54, unit: "KG", price: 6588 },
  { name: "Ressi TG CR Semi Gloss", colorCode: "Semi Gloss - 9960 (Black)", sku: 1.54, unit: "KG", price: 6588 },
  
  // Ressi ETG DP Matt
  { name: "Ressi ETG DP Matt", colorCode: "ETG DP Matt 0001 (Bright White)", sku: 1.6, unit: "KG", price: 2858 },
  { name: "Ressi ETG DP Matt", colorCode: "ETG DP Matt 1110 (Ivory)", sku: 1.6, unit: "KG", price: 2858 },
  { name: "Ressi ETG DP Matt", colorCode: "ETG DP Matt 1211 (Beige)", sku: 1.6, unit: "KG", price: 2858 },
  { name: "Ressi ETG DP Matt", colorCode: "ETG DP Matt 5110 (Light Grey)", sku: 1.6, unit: "KG", price: 2858 },
  { name: "Ressi ETG DP Matt", colorCode: "ETG DP Matt 5210 (Sky Blue)", sku: 1.6, unit: "KG", price: 2858 },
  { name: "Ressi ETG DP Matt", colorCode: "ETG DP Matt 9960 (Black)", sku: 1.6, unit: "KG", price: 2858 },
  
  // Ressi Tile Latex
  { name: "Ressi Tile Latex", sku: 1, unit: "LTR", price: 966 },
  { name: "Ressi Tile Latex", sku: 5, unit: "LTR", price: 4662 },
  { name: "Ressi Tile Latex", sku: 10, unit: "LTR", price: 9013 },
  { name: "Ressi Tile Latex", sku: 15, unit: "LTR", price: 13054 },
  { name: "Ressi Tile Latex", sku: 25, unit: "LTR", price: 21134 },
  { name: "Ressi Tile Latex", sku: 200, unit: "LTR", price: 164102 },
  
  // Ressi Grout Latex
  { name: "Ressi Grout Latex", sku: 1, unit: "KG", price: 1055 },
  { name: "Ressi Grout Latex", sku: 5, unit: "KG", price: 5128 },
  { name: "Ressi Grout Latex", sku: 10, unit: "KG", price: 9946 },
  { name: "Ressi Grout Latex", sku: 15, unit: "KG", price: 14452 },
  { name: "Ressi Grout Latex", sku: 30, unit: "KG", price: 23310 },
  { name: "Ressi Grout Latex", sku: 200, unit: "KG", price: 180264 },
  
  // Ressi TA 2K
  { name: "Ressi TA 2K", colorCode: "(Grey)", sku: 25, unit: "KG", price: 4218 },
  { name: "Ressi TA 2K", colorCode: "(White)", sku: 25, unit: "KG", price: 4901 },
  
  // Ressi TA HPA
  { name: "Ressi TA HPA", sku: 20, unit: "KG", price: 27972 },
  
  // Ressi Grout Seal
  { name: "Ressi Grout Seal", sku: 1, unit: "LTR", price: 1987 },
  { name: "Ressi Grout Seal", sku: 5, unit: "LTR", price: 9324 },
  { name: "Ressi Grout Seal", sku: 10, unit: "LTR", price: 17405 },
  { name: "Ressi Grout Seal", sku: 15, unit: "LTR", price: 24242 },
  { name: "Ressi Grout Seal", sku: 25, unit: "LTR", price: 37296 },
  { name: "Ressi Grout Seal", sku: 200, unit: "LTR", price: 273504 },
  
  // Ressi Grout Admix
  { name: "Ressi Grout Admix", sku: 1, unit: "LTR", price: 2115 },
  { name: "Ressi Grout Admix", sku: 5, unit: "LTR", price: 9946 },
  { name: "Ressi Grout Admix", sku: 10, unit: "LTR", price: 18648 },
  { name: "Ressi Grout Admix", sku: 15, unit: "LTR", price: 26107 },
  { name: "Ressi Grout Admix", sku: 25, unit: "LTR", price: 40404 },
  { name: "Ressi Grout Admix", sku: 200, unit: "LTR", price: 298368 },
  
  // Ressi TG 2K
  { name: "Ressi TG 2K", colorCode: "TG 2K - 0001 (Bright White)", sku: 1.5, unit: "KG", price: 1243 },
  { name: "Ressi TG 2K", colorCode: "TG 2K - 1110 (Ivory)", sku: 1.5, unit: "KG", price: 1243 },
  { name: "Ressi TG 2K", colorCode: "TG 2K - 1211 (Beige)", sku: 1.5, unit: "KG", price: 1243 },
  { name: "Ressi TG 2K", colorCode: "TG 2K - 5110 (Light Grey)", sku: 1.5, unit: "KG", price: 1243 },
  { name: "Ressi TG 2K", colorCode: "TG 2K - 5210 - 1 (Sky Blue)", sku: 1.5, unit: "KG", price: 1243 },
  { name: "Ressi TG 2K", colorCode: "TG 2K - 9960 (Black)", sku: 1.5, unit: "KG", price: 1243 },
  
  // Ressi TG Bath Seal 2K
  { name: "Ressi TG Bath Seal 2K", colorCode: "Bath Seal 2K - 0001 (Bright White)", sku: 1.5, unit: "KG", price: 1493 },
  { name: "Ressi TG Bath Seal 2K", colorCode: "Bath Seal 2K - 1110 (Ivory)", sku: 1.5, unit: "KG", price: 1493 },
  { name: "Ressi TG Bath Seal 2K", colorCode: "Bath Seal 2K - 1211 (Beige)", sku: 1.5, unit: "KG", price: 1493 },
  { name: "Ressi TG Bath Seal 2K", colorCode: "Bath Seal 2K - 5110 (Light Grey)", sku: 1.5, unit: "KG", price: 1493 },
  { name: "Ressi TG Bath Seal 2K", colorCode: "Bath Seal 2K - 5210 - 1 (Sky Blue)", sku: 1.5, unit: "KG", price: 1493 },
  { name: "Ressi TG Bath Seal 2K", colorCode: "Bath Seal 2K - 9960 (Black)", sku: 1.5, unit: "KG", price: 1493 },
  
  // Ressi EPO Grout Pro
  { name: "Ressi EPO Grout Pro", colorCode: "Ressi EPO Grout Pro (White)", sku: 0.4, unit: "ML", price: 2797 },
  { name: "Ressi EPO Grout Pro", colorCode: "Ressi EPO Grout Pro (Black)", sku: 0.4, unit: "ML", price: 2859 },
  { name: "Ressi EPO Grout Pro", colorCode: "Ressi EPO Grout Pro (Ivory)", sku: 0.4, unit: "ML", price: 2859 },
  { name: "Ressi EPO Grout Pro", colorCode: "Ressi EPO Grout Pro (Brown)", sku: 0.4, unit: "ML", price: 2859 },
  { name: "Ressi EPO Grout Pro", colorCode: "Ressi EPO Grout Pro (Silver)", sku: 0.4, unit: "ML", price: 2859 },
  { name: "Ressi EPO Grout Pro", colorCode: "Ressi EPO Grout Pro (Copper)", sku: 0.4, unit: "ML", price: 2859 },
  { name: "Ressi EPO Grout Pro", colorCode: "Ressi EPO Grout Pro (Gold)", sku: 0.4, unit: "ML", price: 2859 },
  { name: "Ressi EPO Grout Pro", colorCode: "Ressi EPO Grout Pro (Beige)", sku: 0.4, unit: "ML", price: 2859 },
  { name: "Ressi EPO Grout Pro", colorCode: "Ressi EPO Grout Pro (Aqua Blue)", sku: 0.4, unit: "ML", price: 2859 },
  { name: "Ressi EPO Grout Pro", colorCode: "Ressi EPO Grout Pro (Grey)", sku: 0.4, unit: "ML", price: 2859 },
];

async function verifyProducts() {
  try {
    await connect();
    console.log("🔍 Verifying Tiling and Grouting Materials products...\n");

    // Fetch all products from database
    const dbProducts = await Product.find({ 
      "category.mainCategory": "Tiling and Grouting Materials" 
    });

    console.log(`📊 Found ${dbProducts.length} products in database\n`);

    const issues = [];
    const foundProducts = new Set();
    const missingProducts = [];
    const priceMismatches = [];
    const skuMismatches = [];
    const unitMismatches = [];

    // Check each expected product
    for (const expected of expectedProducts) {
      const expectedName = expected.colorCode 
        ? `${expected.name} - ${expected.colorCode}`
        : expected.name;
      
      const expectedKey = `${expectedName} - ${expected.sku} ${expected.unit}`;
      
      // Find matching product in database
      const dbProduct = dbProducts.find(p => {
        const dbKey = `${p.name} - ${p.sku} ${p.unit}`;
        return dbKey === expectedKey;
      });

      if (!dbProduct) {
        missingProducts.push({
          name: expectedName,
          sku: expected.sku,
          unit: expected.unit,
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
        
        // Check unit
        if (dbProduct.unit !== expected.unit) {
          unitMismatches.push({
            name: expectedName,
            sku: expected.sku,
            expectedUnit: expected.unit,
            actualUnit: dbProduct.unit
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
    
    if (missingProducts.length === 0 && priceMismatches.length === 0 && skuMismatches.length === 0 && unitMismatches.length === 0 && extraProducts.length === 0) {
      console.log("\n✅ ALL PRODUCTS VERIFIED SUCCESSFULLY!");
      console.log(`   ✓ ${expectedProducts.length} products found with correct SKUs, units, and prices`);
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
          console.log(`   - ${p.name} - ${p.sku}: Expected ${p.expectedPrice}, Found ${p.actualPrice}`);
        });
      }
      
      if (skuMismatches.length > 0) {
        console.log(`\n⚠️  SKU MISMATCHES (${skuMismatches.length}):`);
        skuMismatches.forEach(p => {
          console.log(`   - ${p.name}: Expected SKU ${p.expectedSKU}, Found ${p.actualSKU}`);
        });
      }
      
      if (unitMismatches.length > 0) {
        console.log(`\n⚠️  UNIT MISMATCHES (${unitMismatches.length}):`);
        unitMismatches.forEach(p => {
          console.log(`   - ${p.name} - ${p.sku}: Expected ${p.expectedUnit}, Found ${p.actualUnit}`);
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
    console.log(`   ⚠️  Unit Issues: ${unitMismatches.length}`);
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

