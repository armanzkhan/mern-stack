require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Expected products from user's list (excluding entries with "-" for price)
const expectedProducts = [
  // Zepoxy Electropot
  { name: "Zepoxy Electropot", unit: "KG", sku: 0.615, price: 1007 },
  { name: "Zepoxy Electropot", unit: "KG", sku: 1.23, price: 1651 },
  { name: "Zepoxy Electropot", unit: "KG", sku: 24.6, price: 25917 },
  
  // Zepoxy Electropot DT-W
  { name: "Zepoxy Electropot DT-W", unit: "KG", sku: 0.625, price: 914 },
  { name: "Zepoxy Electropot DT-W", unit: "KG", sku: 1.25, price: 1707 },
  { name: "Zepoxy Electropot DT-W", unit: "KG", sku: 25, price: 29579 },
  
  // Zepoxy Electropot Econo
  { name: "Zepoxy Electropot Econo", unit: "KG", sku: 0.6, price: 1142 },
  { name: "Zepoxy Electropot Econo", unit: "KG", sku: 24, price: 27054 },
  
  // Zepoxy Clear
  { name: "Zepoxy Clear", unit: "KG", sku: 0.15, price: 313 },
  { name: "Zepoxy Clear", unit: "KG", sku: 0.75, price: 1178 },
  { name: "Zepoxy Clear", unit: "KG", sku: 1.5, price: 2188 },
  { name: "Zepoxy Clear", unit: "KG", sku: 15, price: 20633 },
  { name: "Zepoxy Clear", unit: "KG", sku: 45, price: 61322 },
  
  // Zepoxy Clear AS
  { name: "Zepoxy Clear AS", unit: "KG", sku: 0.15, price: 312 },
  { name: "Zepoxy Clear AS", unit: "KG", sku: 0.75, price: 1200 },
  { name: "Zepoxy Clear AS", unit: "KG", sku: 1.5, price: 2220 },
  
  // Zepoxy 300
  { name: "Zepoxy 300", unit: "KG", sku: 0.15, price: 361 },
  { name: "Zepoxy 300", unit: "KG", sku: 0.75, price: 1320 },
  { name: "Zepoxy 300", unit: "KG", sku: 1.5, price: 2509 },
  { name: "Zepoxy 300", unit: "KG", sku: 15, price: 23860 },
  { name: "Zepoxy 300", unit: "KG", sku: 45, price: 71004 },
  
  // Zepoxy 350
  { name: "Zepoxy 350", unit: "KG", sku: 1.5, price: 2895 },
  { name: "Zepoxy 350", unit: "KG", sku: 15, price: 28095 },
  { name: "Zepoxy 350", unit: "KG", sku: 45, price: 83454 },
  
  // Zepoxy Resin Art
  { name: "Zepoxy Resin Art", unit: "KG", sku: 0.75, price: 1279 },
  { name: "Zepoxy Resin Art", unit: "KG", sku: 1.5, price: 2343 },
  { name: "Zepoxy Resin Art", unit: "KG", sku: 15, price: 21997 },
  { name: "Zepoxy Resin Art", unit: "KG", sku: 45, price: 64863 },
  
  // Zepoxy Felxicure
  { name: "Zepoxy Felxicure", unit: "KG", sku: 1.4, price: 4124 },
  
  // Zepoxy 400
  { name: "Zepoxy 400", unit: "KG", sku: 1.56, price: 5291 },
  
  // Zepoxy Table Top Deep Pour
  { name: "Zepoxy Table Top Deep Pour", unit: "KG", sku: 1.5, price: 4377 },
  { name: "Zepoxy Table Top Deep Pour", unit: "KG", sku: 15, price: 42805 },
  { name: "Zepoxy Table Top Deep Pour", unit: "KG", sku: 45, price: 129017 },
  
  // Zepoxy 100
  { name: "Zepoxy 100", unit: "Mini GM", sku: 0.18, price: 333 },
  { name: "Zepoxy 100", unit: "Half GM", sku: 0.9, price: 1389 },
  { name: "Zepoxy 100", unit: "Full KG", sku: 1.8, price: 2725 },
  { name: "Zepoxy 100", unit: "CP KG", sku: 54, price: 75911 },
  { name: "Zepoxy 100", unit: "CP KG", sku: 63, price: 88883 },
  
  // Zepoxy 100 Y
  { name: "Zepoxy 100 Y", unit: "Mini GM", sku: 0.18, price: 303 },
  { name: "Zepoxy 100 Y", unit: "Full KG", sku: 1.8, price: 2465 },
  { name: "Zepoxy 100 Y", unit: "CP KG", sku: 54, price: 73954 },
  
  // Zepoxy 100 Plus
  { name: "Zepoxy 100 Plus", unit: "Mini GM", sku: 0.18, price: 314 },
  { name: "Zepoxy 100 Plus", unit: "Half GM", sku: 0.9, price: 1293 },
  { name: "Zepoxy 100 Plus", unit: "Full KG", sku: 1.8, price: 2528 },
  { name: "Zepoxy 100 Plus", unit: "CP KG", sku: 54, price: 74130 },
  { name: "Zepoxy 100 Plus", unit: "CP KG", sku: 63, price: 85693 },
  
  // Zepoxy 100 CL
  { name: "Zepoxy 100 CL", unit: "Mini GM", sku: 0.18, price: 372 },
  { name: "Zepoxy 100 CL", unit: "Half GM", sku: 0.9, price: 1620 },
  { name: "Zepoxy 100 CL", unit: "Full KG", sku: 1.8, price: 2760 },
  
  // Zepoxy 150
  { name: "Zepoxy 150", unit: "Full KG", sku: 1.8, price: 2826 },
  { name: "Zepoxy 150", unit: "CP KG", sku: 54, price: 89879 },
  
  // Zepoxy 200
  { name: "Zepoxy 200", unit: "Full KG", sku: 1.8, price: 4930 },
  { name: "Zepoxy 200", unit: "CP KG", sku: 54, price: 137434 },
  
  // Zepoxy Kara Garh
  { name: "Zepoxy Kara Garh", unit: "Mini GM", sku: 0.18, price: 283 },
  { name: "Zepoxy Kara Garh", unit: "Half GM", sku: 0.9, price: 1208 },
  { name: "Zepoxy Kara Garh", unit: "Full KG", sku: 1.8, price: 2397 },
  { name: "Zepoxy Kara Garh", unit: "CP KG", sku: 54, price: 67409 },
  { name: "Zepoxy Kara Garh", unit: "CP KG", sku: 63, price: 77960 },
  
  // Zepoxy Wood Master
  { name: "Zepoxy Wood Master", unit: "Mini GM", sku: 0.18, price: 283 },
  { name: "Zepoxy Wood Master", unit: "Half GM", sku: 0.9, price: 1208 },
  { name: "Zepoxy Wood Master", unit: "Full KG", sku: 1.8, price: 2397 },
  { name: "Zepoxy Wood Master", unit: "CP KG", sku: 54, price: 67409 },
  { name: "Zepoxy Wood Master", unit: "CP KG", sku: 63, price: 77960 },
  
  // Zepoxy Clutch Leather
  { name: "Zepoxy Clutch Leather", unit: "Mini GM", sku: 0.18, price: 277 },
  { name: "Zepoxy Clutch Leather", unit: "Half GM", sku: 0.9, price: 1238 },
  { name: "Zepoxy Clutch Leather", unit: "Full KG", sku: 1.8, price: 2459 },
  { name: "Zepoxy Clutch Leather", unit: "CP KG", sku: 54, price: 69138 },
  { name: "Zepoxy Clutch Leather", unit: "CP KG", sku: 63, price: 79959 },
  
  // Zepoxy Kara Noor
  { name: "Zepoxy Kara Noor", unit: "Mini GM", sku: 0.15, price: 361 },
  { name: "Zepoxy Kara Noor", unit: "Half GM", sku: 0.75, price: 1587 },
  { name: "Zepoxy Kara Noor", unit: "Full KG", sku: 1.5, price: 2928 },
  { name: "Zepoxy Kara Noor", unit: "CP KG", sku: 15, price: 28376 },
  
  // Zepoxy Steel 5 Min
  { name: "Zepoxy Steel 5 Min", unit: "STS GM", sku: 0.01, price: 40 },
  { name: "Zepoxy Steel 5 Min", unit: "MTS GM", sku: 0.03, price: 121 },
  
  // Zepoxy Steel 90 Min
  { name: "Zepoxy Steel 90 Min", unit: "STS GM", sku: 0.01, price: 35 },
  { name: "Zepoxy Steel 90 Min", unit: "MTS GM", sku: 0.03, price: 99 },
  
  // Zepoxy Crystal
  { name: "Zepoxy Crystal", unit: "STS GM", sku: 0.01, price: 55 },
  { name: "Zepoxy Crystal", unit: "MTS GM", sku: 0.03, price: 176 },
  { name: "Zepoxy Crystal", unit: "CP KG", sku: 2, price: 7551 },
  { name: "Zepoxy Crystal", unit: "BP KG", sku: 40, price: 154335 },
  
  // Zepoxy Ultimate
  { name: "Zepoxy Ultimate", unit: "STS GM", sku: 0.01, price: 66 },
  { name: "Zepoxy Ultimate", unit: "MTS GM", sku: 0.03, price: 132 },
  
  // Zepoxy RER Series (Tier 3 Pack Price)
  { name: "Zepoxy RER 128", unit: "KG", sku: 1, price: 1323 },
  { name: "Zepoxy RER 128", unit: "KG", sku: 5, price: 6440 },
  { name: "Zepoxy RER 128", unit: "KG", sku: 10, price: 12650 },
  { name: "Zepoxy RER 128", unit: "KG", sku: 30, price: 36570 },
  { name: "Zepoxy RER 128", unit: "KG", sku: 230, price: 231438 },
  
  { name: "Zepoxy RER 128 Y", unit: "KG", sku: 1, price: 1242 },
  { name: "Zepoxy RER 128 Y", unit: "KG", sku: 5, price: 6095 },
  { name: "Zepoxy RER 128 Y", unit: "KG", sku: 10, price: 11960 },
  { name: "Zepoxy RER 128 Y", unit: "KG", sku: 30, price: 34500 },
  { name: "Zepoxy RER 128 Y", unit: "KG", sku: 230, price: 211600 },
  
  { name: "Zepoxy RER 136", unit: "KG", sku: 1, price: 1346 },
  { name: "Zepoxy RER 136", unit: "KG", sku: 5, price: 6670 },
  { name: "Zepoxy RER 136", unit: "KG", sku: 10, price: 13225 },
  { name: "Zepoxy RER 136", unit: "KG", sku: 30, price: 38985 },
  { name: "Zepoxy RER 136", unit: "KG", sku: 230, price: 296240 },
  
  { name: "Zepoxy RER 011 X 75", unit: "KG", sku: 1, price: 1190 },
  { name: "Zepoxy RER 011 X 75", unit: "KG", sku: 5, price: 5836 },
  { name: "Zepoxy RER 011 X 75", unit: "KG", sku: 10, price: 11443 },
  { name: "Zepoxy RER 011 X 75", unit: "KG", sku: 30, price: 32948 },
  { name: "Zepoxy RER 011 X 75", unit: "KG", sku: 230, price: 211600 },
  
  { name: "Zepoxy RER 816", unit: "KG", sku: 1, price: 1794 },
  { name: "Zepoxy RER 816", unit: "KG", sku: 5, price: 8855 },
  { name: "Zepoxy RER 816", unit: "KG", sku: 10, price: 17480 },
  { name: "Zepoxy RER 816", unit: "KG", sku: 30, price: 51060 },
  { name: "Zepoxy RER 816", unit: "KG", sku: 230, price: 317400 },
  
  { name: "Zepoxy RER 816 Y", unit: "KG", sku: 1, price: 1691 },
  { name: "Zepoxy RER 816 Y", unit: "KG", sku: 5, price: 8338 },
  { name: "Zepoxy RER 816 Y", unit: "KG", sku: 10, price: 16445 },
  { name: "Zepoxy RER 816 Y", unit: "KG", sku: 30, price: 47955 },
  { name: "Zepoxy RER 816 Y", unit: "KG", sku: 230, price: 362365 },
  
  { name: "Zepoxy RER 126", unit: "KG", sku: 1, price: 1415 },
  { name: "Zepoxy RER 126", unit: "KG", sku: 5, price: 6958 },
  { name: "Zepoxy RER 126", unit: "KG", sku: 10, price: 13685 },
  { name: "Zepoxy RER 126", unit: "KG", sku: 30, price: 39675 },
  { name: "Zepoxy RER 126", unit: "KG", sku: 230, price: 298885 },
  
  { name: "Zepoxy RER AW 106", unit: "KG", sku: 1, price: 2461 },
  { name: "Zepoxy RER AW 106", unit: "KG", sku: 5, price: 12190 },
  { name: "Zepoxy RER AW 106", unit: "KG", sku: 10, price: 24150 },
  { name: "Zepoxy RER AW 106", unit: "KG", sku: 30, price: 71070 },
  { name: "Zepoxy RER AW 106", unit: "KG", sku: 230, price: 539580 },
  
  // Zepoxy WR Series
  { name: "Zepoxy WR 110", unit: "KG", sku: 1, price: 1409 },
  { name: "Zepoxy WR 110", unit: "KG", sku: 5, price: 6929 },
  { name: "Zepoxy WR 110", unit: "KG", sku: 10, price: 13628 },
  { name: "Zepoxy WR 110", unit: "KG", sku: 30, price: 39503 },
  { name: "Zepoxy WR 110", unit: "KG", sku: 200, price: 258750 },
  
  { name: "Zepoxy WR 220", unit: "KG", sku: 1, price: 1438 },
  { name: "Zepoxy WR 220", unit: "KG", sku: 5, price: 7015 },
  { name: "Zepoxy WR 220", unit: "KG", sku: 10, price: 13685 },
  { name: "Zepoxy WR 220", unit: "KG", sku: 30, price: 38985 },
  { name: "Zepoxy WR 220", unit: "KG", sku: 200, price: 253000 },
  
  // Zepoxy REH Series
  { name: "Zepoxy REH 140", unit: "KG", sku: 1, price: 2116 },
  { name: "Zepoxy REH 140", unit: "KG", sku: 5, price: 10465 },
  { name: "Zepoxy REH 140", unit: "KG", sku: 10, price: 20700 },
  { name: "Zepoxy REH 140", unit: "KG", sku: 25, price: 50025 },
  { name: "Zepoxy REH 140", unit: "KG", sku: 200, price: 332350 },
  
  { name: "Zepoxy REH 140-LVD", unit: "KG", sku: 1, price: 1932 },
  { name: "Zepoxy REH 140-LVD", unit: "KG", sku: 5, price: 9545 },
  { name: "Zepoxy REH 140-LVD", unit: "KG", sku: 10, price: 18860 },
  { name: "Zepoxy REH 140-LVD", unit: "KG", sku: 25, price: 46000 },
  { name: "Zepoxy REH 140-LVD", unit: "KG", sku: 200, price: 363400 },
  
  { name: "Zepoxy REH 125", unit: "KG", sku: 1, price: 3048 },
  { name: "Zepoxy REH 125", unit: "KG", sku: 5, price: 15123 },
  { name: "Zepoxy REH 125", unit: "KG", sku: 10, price: 30015 },
  { name: "Zepoxy REH 125", unit: "KG", sku: 25, price: 73888 },
  { name: "Zepoxy REH 125", unit: "KG", sku: 200, price: 586500 },
  
  { name: "Zepoxy REH 115", unit: "KG", sku: 1, price: 1932 },
  { name: "Zepoxy REH 115", unit: "KG", sku: 5, price: 9545 },
  { name: "Zepoxy REH 115", unit: "KG", sku: 10, price: 18860 },
  { name: "Zepoxy REH 115", unit: "KG", sku: 25, price: 46000 },
  { name: "Zepoxy REH 115", unit: "KG", sku: 200, price: 322000 },
  
  { name: "Zepoxy REH 147", unit: "KG", sku: 1, price: 2013 },
  { name: "Zepoxy REH 147", unit: "KG", sku: 5, price: 9948 },
  { name: "Zepoxy REH 147", unit: "KG", sku: 10, price: 19665 },
  { name: "Zepoxy REH 147", unit: "KG", sku: 25, price: 48013 },
  { name: "Zepoxy REH 147", unit: "KG", sku: 200, price: 379500 },
  
  { name: "Zepoxy REH 148", unit: "KG", sku: 1, price: 1748 },
  { name: "Zepoxy REH 148", unit: "KG", sku: 5, price: 8625 },
  { name: "Zepoxy REH 148", unit: "KG", sku: 10, price: 17020 },
  { name: "Zepoxy REH 148", unit: "KG", sku: 25, price: 41400 },
  { name: "Zepoxy REH 148", unit: "KG", sku: 200, price: 326600 },
  
  { name: "Zepoxy REH 149", unit: "KG", sku: 1, price: 1737 },
  { name: "Zepoxy REH 149", unit: "KG", sku: 5, price: 8568 },
  { name: "Zepoxy REH 149", unit: "KG", sku: 10, price: 16905 },
  { name: "Zepoxy REH 149", unit: "KG", sku: 25, price: 41113 },
  { name: "Zepoxy REH 149", unit: "KG", sku: 200, price: 324300 },
  
  { name: "Zepoxy REH 953 U", unit: "KG", sku: 1, price: 2277 },
  { name: "Zepoxy REH 953 U", unit: "KG", sku: 5, price: 11270 },
  { name: "Zepoxy REH 953 U", unit: "KG", sku: 10, price: 22310 },
  { name: "Zepoxy REH 953 U", unit: "KG", sku: 25, price: 54625 },
  { name: "Zepoxy REH 953 U", unit: "KG", sku: 200, price: 432400 },
  
  { name: "Zepoxy REH 160", unit: "KG", sku: 1, price: 2024 },
  { name: "Zepoxy REH 160", unit: "KG", sku: 5, price: 10005 },
  { name: "Zepoxy REH 160", unit: "KG", sku: 10, price: 19780 },
  { name: "Zepoxy REH 160", unit: "KG", sku: 25, price: 48300 },
  { name: "Zepoxy REH 160", unit: "KG", sku: 200, price: 381800 },
  
  { name: "Zepoxy REH 161", unit: "KG", sku: 1, price: 2070 },
  { name: "Zepoxy REH 161", unit: "KG", sku: 5, price: 10235 },
  { name: "Zepoxy REH 161", unit: "KG", sku: 10, price: 20240 },
  { name: "Zepoxy REH 161", unit: "KG", sku: 25, price: 49450 },
  { name: "Zepoxy REH 161", unit: "KG", sku: 200, price: 391000 },
  
  { name: "Zepoxy REH 205", unit: "KG", sku: 1, price: 1926 },
  { name: "Zepoxy REH 205", unit: "KG", sku: 5, price: 9516 },
  { name: "Zepoxy REH 205", unit: "KG", sku: 10, price: 18803 },
  { name: "Zepoxy REH 205", unit: "KG", sku: 15, price: 27859 },
  { name: "Zepoxy REH 205", unit: "KG", sku: 200, price: 316250 },
  
  { name: "Zepoxy REH 206", unit: "KG", sku: 1, price: 1932 },
  { name: "Zepoxy REH 206", unit: "KG", sku: 5, price: 9315 },
  { name: "Zepoxy REH 206", unit: "KG", sku: 10, price: 18285 },
  { name: "Zepoxy REH 206", unit: "KG", sku: 15, price: 26565 },
  { name: "Zepoxy REH 206", unit: "KG", sku: 200, price: 333500 },
  
  { name: "Zepoxy REH 207", unit: "KG", sku: 1, price: 2369 },
  { name: "Zepoxy REH 207", unit: "KG", sku: 5, price: 11615 },
  { name: "Zepoxy REH 207", unit: "KG", sku: 10, price: 22770 },
  { name: "Zepoxy REH 207", unit: "KG", sku: 15, price: 33465 },
  { name: "Zepoxy REH 207", unit: "KG", sku: 200, price: 434700 },
  
  { name: "Zepoxy REH 208", unit: "KG", sku: 1, price: 1817 },
  { name: "Zepoxy REH 208", unit: "KG", sku: 5, price: 8970 },
  { name: "Zepoxy REH 208", unit: "KG", sku: 10, price: 17710 },
  { name: "Zepoxy REH 208", unit: "KG", sku: 15, price: 26220 },
  { name: "Zepoxy REH 208", unit: "KG", sku: 200, price: 340400 },
  
  { name: "Zepoxy REH 7301", unit: "KG", sku: 1, price: 1840 },
  { name: "Zepoxy REH 7301", unit: "KG", sku: 5, price: 9056 },
  { name: "Zepoxy REH 7301", unit: "KG", sku: 10, price: 17825 },
  { name: "Zepoxy REH 7301", unit: "KG", sku: 15, price: 26306 },
  { name: "Zepoxy REH 7301", unit: "KG", sku: 200, price: 304750 },
  
  { name: "Zepoxy REH 243", unit: "KG", sku: 1, price: 3117 },
  { name: "Zepoxy REH 243", unit: "KG", sku: 5, price: 15353 },
  { name: "Zepoxy REH 243", unit: "KG", sku: 10, price: 30245 },
  { name: "Zepoxy REH 243", unit: "KG", sku: 15, price: 44678 },
  { name: "Zepoxy REH 243", unit: "KG", sku: 180, price: 517500 },
  
  { name: "Zepoxy REH 241", unit: "KG", sku: 1, price: 1898 },
  { name: "Zepoxy REH 241", unit: "KG", sku: 5, price: 9373 },
  { name: "Zepoxy REH 241", unit: "KG", sku: 10, price: 18515 },
  { name: "Zepoxy REH 241", unit: "KG", sku: 15, price: 27428 },
  { name: "Zepoxy REH 241", unit: "KG", sku: 180, price: 320850 },
  
  { name: "Zepoxy REH 541", unit: "KG", sku: 1, price: 3048 },
  { name: "Zepoxy REH 541", unit: "KG", sku: 5, price: 15123 },
  { name: "Zepoxy REH 541", unit: "KG", sku: 10, price: 30015 },
  { name: "Zepoxy REH 541", unit: "KG", sku: 15, price: 44678 },
  { name: "Zepoxy REH 541", unit: "KG", sku: 200, price: 586500 },
  
  { name: "Zepoxy REH 360", unit: "KG", sku: 1, price: 1633 },
  { name: "Zepoxy REH 360", unit: "KG", sku: 5, price: 8050 },
  { name: "Zepoxy REH 360", unit: "KG", sku: 10, price: 15870 },
  { name: "Zepoxy REH 360", unit: "KG", sku: 25, price: 38525 },
  { name: "Zepoxy REH 360", unit: "KG", sku: 200, price: 303600 },
  
  { name: "Zepoxy REH 361", unit: "KG", sku: 1, price: 1409 },
  { name: "Zepoxy REH 361", unit: "KG", sku: 5, price: 6900 },
  { name: "Zepoxy REH 361", unit: "KG", sku: 10, price: 13513 },
  { name: "Zepoxy REH 361", unit: "KG", sku: 25, price: 32344 },
  { name: "Zepoxy REH 361", unit: "KG", sku: 200, price: 253000 },
  
  { name: "Zepoxy REH 347", unit: "KG", sku: 1, price: 1702 },
  { name: "Zepoxy REH 347", unit: "KG", sku: 5, price: 8395 },
  { name: "Zepoxy REH 347", unit: "KG", sku: 10, price: 16560 },
  { name: "Zepoxy REH 347", unit: "KG", sku: 25, price: 40250 },
  { name: "Zepoxy REH 347", unit: "KG", sku: 200, price: 317400 },
  
  { name: "Zepoxy REH 348", unit: "KG", sku: 1, price: 1507 },
  { name: "Zepoxy REH 348", unit: "KG", sku: 5, price: 7418 },
  { name: "Zepoxy REH 348", unit: "KG", sku: 10, price: 14605 },
  { name: "Zepoxy REH 348", unit: "KG", sku: 25, price: 35363 },
  { name: "Zepoxy REH 348", unit: "KG", sku: 200, price: 278300 },
  
  { name: "Zepoxy REH 7269", unit: "KG", sku: 1, price: 4370 },
  { name: "Zepoxy REH 7269", unit: "KG", sku: 5, price: 21735 },
  { name: "Zepoxy REH 7269", unit: "KG", sku: 10, price: 43240 },
  { name: "Zepoxy REH 7269", unit: "KG", sku: 25, price: 107525 },
  { name: "Zepoxy REH 7269", unit: "KG", sku: 180, price: 770040 },
  
  { name: "Zepoxy REH 5569", unit: "KG", sku: 1, price: 3002 },
  { name: "Zepoxy REH 5569", unit: "KG", sku: 5, price: 14835 },
  { name: "Zepoxy REH 5569", unit: "KG", sku: 10, price: 29095 },
  { name: "Zepoxy REH 5569", unit: "KG", sku: 25, price: 72163 },
  { name: "Zepoxy REH 5569", unit: "KG", sku: 200, price: 563500 },
  
  { name: "Zepoxy REH 2958", unit: "KG", sku: 1, price: 1898 },
  { name: "Zepoxy REH 2958", unit: "KG", sku: 5, price: 9373 },
  { name: "Zepoxy REH 2958", unit: "KG", sku: 10, price: 18515 },
  { name: "Zepoxy REH 2958", unit: "KG", sku: 25, price: 45138 },
  { name: "Zepoxy REH 2958", unit: "KG", sku: 180, price: 320850 },
  
  { name: "Zepoxy REH 2257", unit: "KG", sku: 1, price: 1817 },
  { name: "Zepoxy REH 2257", unit: "KG", sku: 5, price: 8970 },
  { name: "Zepoxy REH 2257", unit: "KG", sku: 10, price: 17710 },
  { name: "Zepoxy REH 2257", unit: "KG", sku: 25, price: 43125 },
  { name: "Zepoxy REH 2257", unit: "KG", sku: 180, price: 306360 },
  
  // Zepoxy WH Series
  { name: "Zepoxy WH 230", unit: "KG", sku: 1, price: 2225 },
  { name: "Zepoxy WH 230", unit: "KG", sku: 5, price: 11011 },
  { name: "Zepoxy WH 230", unit: "KG", sku: 10, price: 21793 },
  { name: "Zepoxy WH 230", unit: "KG", sku: 25, price: 53331 },
  { name: "Zepoxy WH 230", unit: "KG", sku: 200, price: 422050 },
];

(async () => {
  await connect();
  console.log("🔍 Verifying Epoxy Adhesives and Coatings products...\n");
  
  const dbProducts = await Product.find({
    "category.mainCategory": "Epoxy Adhesives and Coatings"
  }).sort({ name: 1, sku: 1 });
  
  console.log(`Found ${dbProducts.length} products in database\n`);
  
  const correctProducts = [];
  const mismatches = [];
  const extraProducts = [];
  const missingProducts = [];
  
  // Check each expected product
  // The database stores fullName like "Zepoxy 100 - 0.18 Mini GM"
  for (const expected of expectedProducts) {
    const expectedFullName = `${expected.name} - ${expected.sku} ${expected.unit}`;
    const found = dbProducts.find(p => {
      // Match by fullName (which is stored in the name field)
      const dbFullName = p.name || p.fullName;
      return dbFullName === expectedFullName;
    });
    
    if (found) {
      if (found.price === expected.price) {
        correctProducts.push(expected);
      } else {
        mismatches.push({
          expected,
          found: { name: found.name, unit: found.unit, sku: found.sku, price: found.price }
        });
      }
    } else {
      missingProducts.push(expected);
    }
  }
  
  // Find extra products
  for (const dbProduct of dbProducts) {
    const dbFullName = dbProduct.name || dbProduct.fullName;
    const found = expectedProducts.find(e => {
      const expectedFullName = `${e.name} - ${e.sku} ${e.unit}`;
      return dbFullName === expectedFullName;
    });
    if (!found) {
      extraProducts.push({
        name: dbProduct.name,
        unit: dbProduct.unit,
        sku: dbProduct.sku,
        price: dbProduct.price
      });
    }
  }
  
  console.log(`✅ Correct products: ${correctProducts.length}`);
  console.log(`❌ Price/SKU mismatches: ${mismatches.length}`);
  console.log(`➕ Extra products: ${extraProducts.length}`);
  console.log(`➖ Missing products: ${missingProducts.length}\n`);
  
  if (mismatches.length > 0) {
    console.log("Mismatches:");
    mismatches.forEach(m => {
      console.log(`  ${m.expected.name} - ${m.expected.sku} ${m.expected.unit}: Expected ${m.expected.price}, Found ${m.found.price}`);
    });
    console.log();
  }
  
  if (extraProducts.length > 0) {
    console.log("Extra products:");
    extraProducts.forEach(p => {
      console.log(`  ${p.name} - ${p.sku} ${p.unit} - ${p.price}`);
    });
    console.log();
  }
  
  if (missingProducts.length > 0) {
    console.log("Missing products:");
    missingProducts.forEach(p => {
      console.log(`  ${p.name} - ${p.sku} ${p.unit} - ${p.price}`);
    });
    console.log();
  }
  
  if (correctProducts.length === expectedProducts.length && 
      mismatches.length === 0 && 
      extraProducts.length === 0 && 
      missingProducts.length === 0) {
    console.log("✅ All products match perfectly!");
  }
  
  await disconnect();
})();

