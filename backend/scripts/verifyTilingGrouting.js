// backend/scripts/verifyTilingGrouting.js
// Verify that Tiling and Grouting Materials category only contains the specified products
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Expected products from user's list
const expectedProducts = [
  // Ressi TA series (no color codes)
  { name: "Ressi TA 210", sku: 20, unit: "KG", price: 667 },
  { name: "Ressi TA 210 Plus", sku: 20, unit: "KG", price: 966 },
  { name: "Ressi TA 220", sku: 20, unit: "KG", price: 1266 },
  { name: "Ressi TA 230 (Grey)", sku: 20, unit: "KG", price: 1610 },
  { name: "Ressi TA 230 (White)", sku: 20, unit: "KG", price: 2148 },
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
  
  // Ressi TG 810 (with color codes)
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
  
  // Ressi TG 820 (with color codes)
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
  { name: "Ressi TA 2K (Grey)", sku: 25, unit: "KG", price: 4218 },
  { name: "Ressi TA 2K (White)", sku: 25, unit: "KG", price: 4901 },
  
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

// Helper function to normalize product name for comparison
function normalizeProductName(name) {
  return name.trim().replace(/\s+/g, ' ');
}

// Helper function to create a unique key for product matching
function createProductKey(product) {
  let name = normalizeProductName(product.name || '');
  if (product.colorCode) {
    name = `${name} - ${product.colorCode}`;
  }
  const sku = String(product.sku || '').trim();
  const unit = String(product.unit || '').trim();
  return `${name}::${sku}::${unit}`.toLowerCase();
}

async function verifyTilingGrouting() {
  try {
    console.log("🔍 Verifying Tiling and Grouting Materials Products...\n");
    
    // Connect to database
    await connect();
    console.log("✅ Connected to database\n");
    
    // Fetch all products in Tiling and Grouting Materials category
    const dbProducts = await Product.find({
      "category.mainCategory": "Tiling and Grouting Materials",
      isActive: true,
      company_id: "RESSICHEM"
    }).sort({ name: 1, sku: 1 });
    
    console.log(`📊 Found ${dbProducts.length} products in database\n`);
    
    // Create expected products map
    const expectedMap = new Map();
    expectedProducts.forEach(prod => {
      const key = createProductKey(prod);
      expectedMap.set(key, prod);
    });
    
    // Create database products map
    const dbProductsMap = new Map();
    dbProducts.forEach(prod => {
      const dbName = normalizeProductName(prod.name || '');
      const dbSku = String(prod.sku || '').trim();
      const dbUnit = String(prod.unit || '').trim();
      
      // Try to match with expected products
      for (const expected of expectedProducts) {
        let expectedName = expected.name;
        if (expected.colorCode) {
          expectedName = `${expected.name} - ${expected.colorCode}`;
        }
        const expectedFullName = `${expectedName} - ${expected.sku} ${expected.unit}`;
        
        // Normalize SKU - database might have "1.5 KG" in SKU field, extract just the number
        let dbSkuNormalized = dbSku.replace(/\s*(KG|LTR|ML)\s*/i, '').trim();
        const expectedSkuStr = String(expected.sku).trim();
        
        // Check if database product name matches (case-insensitive)
        const nameMatch = dbName.toLowerCase() === expectedFullName.toLowerCase();
        
        // Also check SKU and unit match
        const skuMatch = dbSkuNormalized === expectedSkuStr || dbSku === `${expectedSkuStr} ${expected.unit}` || dbSku === expectedSkuStr;
        const unitMatch = dbUnit.toLowerCase() === String(expected.unit).trim().toLowerCase();
        
        if (nameMatch && skuMatch && unitMatch) {
          const key = createProductKey(expected);
          if (!dbProductsMap.has(key)) {
            dbProductsMap.set(key, []);
          }
          dbProductsMap.get(key).push(prod);
          break; // Found match, move to next product
        }
      }
    });
    
    // Find missing products (in expected but not in database)
    const missingProducts = [];
    expectedMap.forEach((expected, key) => {
      if (!dbProductsMap.has(key)) {
        missingProducts.push(expected);
      }
    });
    
    // Find extra products (in database but not in expected)
    const extraProducts = [];
    dbProductsMap.forEach((dbProds, key) => {
      if (!expectedMap.has(key)) {
        extraProducts.push(...dbProds);
      }
    });
    
    // Find products with incorrect prices
    const incorrectPriceProducts = [];
    expectedMap.forEach((expected, key) => {
      if (dbProductsMap.has(key)) {
        const dbProds = dbProductsMap.get(key);
        dbProds.forEach(dbProd => {
          if (Math.abs(dbProd.price - expected.price) > 0.01) {
            incorrectPriceProducts.push({
              expected,
              actual: dbProd,
              expectedPrice: expected.price,
              actualPrice: dbProd.price
            });
          }
        });
      }
    });
    
    // Report results
    console.log("=".repeat(80));
    console.log("VERIFICATION RESULTS");
    console.log("=".repeat(80));
    
    console.log(`\n✅ Expected Products: ${expectedProducts.length}`);
    console.log(`📦 Database Products: ${dbProducts.length}`);
    
    if (missingProducts.length === 0 && extraProducts.length === 0 && incorrectPriceProducts.length === 0) {
      console.log("\n🎉 SUCCESS! All products match exactly!");
      console.log("\n✅ All expected products are present");
      console.log("✅ No extra products found");
      console.log("✅ All prices are correct");
    } else {
      if (missingProducts.length > 0) {
        console.log(`\n❌ Missing Products (${missingProducts.length}):`);
        missingProducts.slice(0, 20).forEach((prod, idx) => {
          const name = prod.colorCode ? `${prod.name} - ${prod.colorCode}` : prod.name;
          console.log(`   ${idx + 1}. ${name} - ${prod.sku} ${prod.unit} (Price: ${prod.price})`);
        });
        if (missingProducts.length > 20) {
          console.log(`   ... and ${missingProducts.length - 20} more`);
        }
      }
      
      if (extraProducts.length > 0) {
        console.log(`\n⚠️  Extra Products Found (${extraProducts.length}):`);
        extraProducts.slice(0, 20).forEach((prod, idx) => {
          console.log(`   ${idx + 1}. ${prod.name} - ${prod.sku} ${prod.unit} (Price: ${prod.price})`);
        });
        if (extraProducts.length > 20) {
          console.log(`   ... and ${extraProducts.length - 20} more`);
        }
      }
      
      if (incorrectPriceProducts.length > 0) {
        console.log(`\n⚠️  Products with Incorrect Prices (${incorrectPriceProducts.length}):`);
        incorrectPriceProducts.slice(0, 10).forEach((item, idx) => {
          const name = item.expected.colorCode ? `${item.expected.name} - ${item.expected.colorCode}` : item.expected.name;
          console.log(`   ${idx + 1}. ${name} - ${item.expected.sku} ${item.expected.unit}`);
          console.log(`      Expected: ${item.expectedPrice}, Actual: ${item.actualPrice}`);
        });
        if (incorrectPriceProducts.length > 10) {
          console.log(`   ... and ${incorrectPriceProducts.length - 10} more`);
        }
      }
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("VERIFICATION COMPLETE");
    console.log("=".repeat(80));
    
  } catch (error) {
    console.error("❌ Error during verification:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run verification
if (require.main === module) {
  verifyTilingGrouting()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { verifyTilingGrouting };

