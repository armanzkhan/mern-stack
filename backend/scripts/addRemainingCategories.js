// backend/scripts/addRemainingCategories.js
// Script to add remaining categories to fullCSVProductList.js
// This will extract products from import script and format them for verification

const fs = require('fs');
const path = require('path');

// Read the import script to extract products
const importScriptPath = path.join(__dirname, 'importProductsFromExcel.js');
const importScriptContent = fs.readFileSync(importScriptPath, 'utf8');

// Extract products from remaining categories manually
// Based on the import script structure

// Decorative Concrete products (from lines 238-324)
const decorativeConcreteProducts = [
  { csvName: "Ressi Overlay", unit: "KG", sku: 50, price: 3220, category: "Decorative Concrete", dbName: "Ressi Overlay - 50 KG" },
  { csvName: "Ressi Pigmented Hardener - 0001", unit: "KG", sku: 20, price: 4600, category: "Decorative Concrete", dbName: "Ressi Pigmented Hardener - 0001 - 20 KG" },
  { csvName: "Ressi Pigmented Hardener - 3700", unit: "KG", sku: 20, price: 4600, category: "Decorative Concrete", dbName: "Ressi Pigmented Hardener - 3700 - 20 KG" },
  { csvName: "Ressi Pigmented Hardener - 1600", unit: "KG", sku: 20, price: 4600, category: "Decorative Concrete", dbName: "Ressi Pigmented Hardener - 1600 - 20 KG" },
  { csvName: "Ressi Pigmented Hardener - 9000", unit: "KG", sku: 20, price: 4600, category: "Decorative Concrete", dbName: "Ressi Pigmented Hardener - 9000 - 20 KG" },
  { csvName: "Ressi Pigmented Hardener - 5210 - 1", unit: "KG", sku: 20, price: 4600, category: "Decorative Concrete", dbName: "Ressi Pigmented Hardener - 5210 - 1 - 20 KG" },
  { csvName: "Ressi Pigmented Hardener - 9321", unit: "KG", sku: 20, price: 4600, category: "Decorative Concrete", dbName: "Ressi Pigmented Hardener - 9321 - 20 KG" },
  { csvName: "Ressi Powder Release - 0001", unit: "KG", sku: 10, price: 7906, category: "Decorative Concrete", dbName: "Ressi Powder Release - 0001 - 10 KG" },
  { csvName: "Ressi Powder Release - 3700", unit: "KG", sku: 10, price: 7906, category: "Decorative Concrete", dbName: "Ressi Powder Release - 3700 - 10 KG" },
  { csvName: "Ressi Powder Release - 1600", unit: "KG", sku: 10, price: 7906, category: "Decorative Concrete", dbName: "Ressi Powder Release - 1600 - 10 KG" },
  { csvName: "Ressi Powder Release - 9000", unit: "KG", sku: 10, price: 7906, category: "Decorative Concrete", dbName: "Ressi Powder Release - 9000 - 10 KG" },
  { csvName: "Ressi Powder Release - 5210 - 1", unit: "KG", sku: 10, price: 7906, category: "Decorative Concrete", dbName: "Ressi Powder Release - 5210 - 1 - 10 KG" },
  { csvName: "Ressi Powder Release - 9321", unit: "KG", sku: 10, price: 7906, category: "Decorative Concrete", dbName: "Ressi Powder Release - 9321 - 10 KG" },
  { csvName: "Ressi Acid Itch", unit: "LTR", sku: 1, price: 592, category: "Decorative Concrete", dbName: "Ressi Acid Itch - 1 LTR" },
  { csvName: "Ressi Acid Itch", unit: "LTR", sku: 5, price: 2243, category: "Decorative Concrete", dbName: "Ressi Acid Itch - 5 LTR" },
  { csvName: "Ressi Acid Itch", unit: "LTR", sku: 10, price: 4370, category: "Decorative Concrete", dbName: "Ressi Acid Itch - 10 LTR" },
  { csvName: "Ressi Acid Itch", unit: "LTR", sku: 15, price: 6383, category: "Decorative Concrete", dbName: "Ressi Acid Itch - 15 LTR" },
  { csvName: "Ressi Acid Itch", unit: "LTR", sku: 25, price: 12420, category: "Decorative Concrete", dbName: "Ressi Acid Itch - 25 LTR" },
  { csvName: "Ressi Reactive Stain - Honey White", unit: "LTR", sku: 1, price: 1898, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Honey White - 1 LTR" },
  { csvName: "Ressi Reactive Stain - Honey White", unit: "LTR", sku: 5, price: 5750, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Honey White - 5 LTR" },
  { csvName: "Ressi Reactive Stain - Honey White", unit: "LTR", sku: 10, price: 10925, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Honey White - 10 LTR" },
  { csvName: "Ressi Reactive Stain - Honey White", unit: "LTR", sku: 15, price: 15525, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Honey White - 15 LTR" },
  { csvName: "Ressi Reactive Stain - Honey White", unit: "LTR", sku: 25, price: 24438, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Honey White - 25 LTR" },
  { csvName: "Ressi Reactive Stain - Nectarine", unit: "LTR", sku: 1, price: 1898, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Nectarine - 1 LTR" },
  { csvName: "Ressi Reactive Stain - Nectarine", unit: "LTR", sku: 5, price: 5750, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Nectarine - 5 LTR" },
  { csvName: "Ressi Reactive Stain - Nectarine", unit: "LTR", sku: 10, price: 10925, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Nectarine - 10 LTR" },
  { csvName: "Ressi Reactive Stain - Nectarine", unit: "LTR", sku: 15, price: 15525, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Nectarine - 15 LTR" },
  { csvName: "Ressi Reactive Stain - Nectarine", unit: "LTR", sku: 25, price: 24438, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Nectarine - 25 LTR" },
  { csvName: "Ressi Reactive Stain - Persimmon", unit: "LTR", sku: 1, price: 1898, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Persimmon - 1 LTR" },
  { csvName: "Ressi Reactive Stain - Persimmon", unit: "LTR", sku: 5, price: 5750, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Persimmon - 5 LTR" },
  { csvName: "Ressi Reactive Stain - Persimmon", unit: "LTR", sku: 10, price: 10925, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Persimmon - 10 LTR" },
  { csvName: "Ressi Reactive Stain - Persimmon", unit: "LTR", sku: 15, price: 15525, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Persimmon - 15 LTR" },
  { csvName: "Ressi Reactive Stain - Persimmon", unit: "LTR", sku: 25, price: 24438, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Persimmon - 25 LTR" },
  { csvName: "Ressi Reactive Stain - Rust Brown", unit: "LTR", sku: 1, price: 1898, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Rust Brown - 1 LTR" },
  { csvName: "Ressi Reactive Stain - Rust Brown", unit: "LTR", sku: 5, price: 5750, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Rust Brown - 5 LTR" },
  { csvName: "Ressi Reactive Stain - Rust Brown", unit: "LTR", sku: 10, price: 10925, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Rust Brown - 10 LTR" },
  { csvName: "Ressi Reactive Stain - Rust Brown", unit: "LTR", sku: 15, price: 15525, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Rust Brown - 15 LTR" },
  { csvName: "Ressi Reactive Stain - Rust Brown", unit: "LTR", sku: 25, price: 24438, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Rust Brown - 25 LTR" },
  { csvName: "Ressi Reactive Stain - Storm Green", unit: "LTR", sku: 1, price: 1898, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Storm Green - 1 LTR" },
  { csvName: "Ressi Reactive Stain - Storm Green", unit: "LTR", sku: 5, price: 5750, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Storm Green - 5 LTR" },
  { csvName: "Ressi Reactive Stain - Storm Green", unit: "LTR", sku: 10, price: 10925, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Storm Green - 10 LTR" },
  { csvName: "Ressi Reactive Stain - Storm Green", unit: "LTR", sku: 15, price: 15525, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Storm Green - 15 LTR" },
  { csvName: "Ressi Reactive Stain - Storm Green", unit: "LTR", sku: 25, price: 24438, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Storm Green - 25 LTR" },
  { csvName: "Ressi Reactive Stain - Kahlua", unit: "LTR", sku: 1, price: 1898, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Kahlua - 1 LTR" },
  { csvName: "Ressi Reactive Stain - Kahlua", unit: "LTR", sku: 5, price: 5750, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Kahlua - 5 LTR" },
  { csvName: "Ressi Reactive Stain - Kahlua", unit: "LTR", sku: 10, price: 10925, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Kahlua - 10 LTR" },
  { csvName: "Ressi Reactive Stain - Kahlua", unit: "LTR", sku: 15, price: 15525, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Kahlua - 15 LTR" },
  { csvName: "Ressi Reactive Stain - Kahlua", unit: "LTR", sku: 25, price: 24438, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Kahlua - 25 LTR" },
  { csvName: "Ressi Reactive Stain - Citrus Green", unit: "LTR", sku: 1, price: 1898, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Citrus Green - 1 LTR" },
  { csvName: "Ressi Reactive Stain - Citrus Green", unit: "LTR", sku: 5, price: 5750, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Citrus Green - 5 LTR" },
  { csvName: "Ressi Reactive Stain - Citrus Green", unit: "LTR", sku: 10, price: 10925, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Citrus Green - 10 LTR" },
  { csvName: "Ressi Reactive Stain - Citrus Green", unit: "LTR", sku: 15, price: 15525, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Citrus Green - 15 LTR" },
  { csvName: "Ressi Reactive Stain - Citrus Green", unit: "LTR", sku: 25, price: 24438, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Citrus Green - 25 LTR" },
  { csvName: "Ressi Reactive Stain - Cool Blue", unit: "LTR", sku: 1, price: 1898, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Cool Blue - 1 LTR" },
  { csvName: "Ressi Reactive Stain - Cool Blue", unit: "LTR", sku: 5, price: 5750, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Cool Blue - 5 LTR" },
  { csvName: "Ressi Reactive Stain - Cool Blue", unit: "LTR", sku: 10, price: 10925, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Cool Blue - 10 LTR" },
  { csvName: "Ressi Reactive Stain - Cool Blue", unit: "LTR", sku: 15, price: 15525, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Cool Blue - 15 LTR" },
  { csvName: "Ressi Reactive Stain - Cool Blue", unit: "LTR", sku: 25, price: 24438, category: "Decorative Concrete", dbName: "Ressi Reactive Stain - Cool Blue - 25 LTR" },
  { csvName: "Ressi Neutraliser", unit: "LTR", sku: 1, price: 920, category: "Decorative Concrete", dbName: "Ressi Neutraliser - 1 LTR" },
  { csvName: "Ressi Neutraliser", unit: "LTR", sku: 5, price: 4543, category: "Decorative Concrete", dbName: "Ressi Neutraliser - 5 LTR" },
  { csvName: "Ressi Neutraliser", unit: "LTR", sku: 10, price: 8855, category: "Decorative Concrete", dbName: "Ressi Neutraliser - 10 LTR" },
  { csvName: "Ressi Neutraliser", unit: "LTR", sku: 15, price: 13110, category: "Decorative Concrete", dbName: "Ressi Neutraliser - 15 LTR" },
  { csvName: "Ressi Neutraliser", unit: "LTR", sku: 25, price: 26220, category: "Decorative Concrete", dbName: "Ressi Neutraliser - 25 LTR" },
  { csvName: "Ressi Polymer", unit: "LTR", sku: 1, price: 3335, category: "Decorative Concrete", dbName: "Ressi Polymer - 1 LTR" },
  { csvName: "Ressi Polymer", unit: "LTR", sku: 5, price: 16100, category: "Decorative Concrete", dbName: "Ressi Polymer - 5 LTR" },
  { csvName: "Ressi Polymer", unit: "LTR", sku: 10, price: 31050, category: "Decorative Concrete", dbName: "Ressi Polymer - 10 LTR" },
  { csvName: "Ressi Polymer", unit: "LTR", sku: 15, price: 44850, category: "Decorative Concrete", dbName: "Ressi Polymer - 15 LTR" },
  { csvName: "Ressi Polymer", unit: "LTR", sku: 30, price: 86250, category: "Decorative Concrete", dbName: "Ressi Polymer - 30 LTR" },
  { csvName: "MT Base Coat", unit: "KG", sku: 20, price: 1610, category: "Decorative Concrete", dbName: "MT Base Coat - 20 KG" },
  { csvName: "MT Top Coat", unit: "KG", sku: 20, price: 2300, category: "Decorative Concrete", dbName: "MT Top Coat - 20 KG" },
  { csvName: "MT - Polymer Liquid", unit: "LTR", sku: 1, price: 3335, category: "Decorative Concrete", dbName: "MT - Polymer Liquid - 1 LTR" },
  { csvName: "MT - Polymer Liquid", unit: "LTR", sku: 5, price: 16100, category: "Decorative Concrete", dbName: "MT - Polymer Liquid - 5 LTR" },
  { csvName: "MT - Polymer Liquid", unit: "LTR", sku: 10, price: 31050, category: "Decorative Concrete", dbName: "MT - Polymer Liquid - 10 LTR" },
  { csvName: "MT - Polymer Liquid", unit: "LTR", sku: 15, price: 44850, category: "Decorative Concrete", dbName: "MT - Polymer Liquid - 15 LTR" },
  { csvName: "MT - Polymer Liquid", unit: "LTR", sku: 25, price: 86250, category: "Decorative Concrete", dbName: "MT - Polymer Liquid - 25 LTR" },
  { csvName: "Terrazzo Retarder", unit: "LTR", sku: 1, price: 1254, category: "Decorative Concrete", dbName: "Terrazzo Retarder - 1 LTR" },
  { csvName: "Terrazzo Retarder", unit: "LTR", sku: 5, price: 6153, category: "Decorative Concrete", dbName: "Terrazzo Retarder - 5 LTR" },
  { csvName: "Terrazzo Retarder", unit: "LTR", sku: 10, price: 12075, category: "Decorative Concrete", dbName: "Terrazzo Retarder - 10 LTR" },
  { csvName: "Terrazzo Retarder", unit: "LTR", sku: 15, price: 17768, category: "Decorative Concrete", dbName: "Terrazzo Retarder - 15 LTR" },
  { csvName: "Terrazzo Retarder", unit: "LTR", sku: 25, price: 29038, category: "Decorative Concrete", dbName: "Terrazzo Retarder - 25 LTR" },
];

// Specialty Products (from lines 224-236)
const specialtyProducts = [
  { csvName: "Ressi Anchor Fix", unit: "KG", sku: 3.8, price: 7245, category: "Specialty Products", dbName: "Ressi Anchor Fix - 3.8 KG" },
  { csvName: "Ressi Anchor Fix", unit: "KG", sku: 38, price: 70680, category: "Specialty Products", dbName: "Ressi Anchor Fix - 38 KG" },
  { csvName: "Ressi NSG 710", unit: "KG", sku: 20, price: 2100, category: "Specialty Products", dbName: "Ressi NSG 710 - 20 KG" },
  { csvName: "Ressi Kerb Grout 102", unit: "KG", sku: 20, price: 960, category: "Specialty Products", dbName: "Ressi Kerb Grout 102 - 20 KG" },
  { csvName: "Ressi KerbFix 101", unit: "KG", sku: 20, price: 900, category: "Specialty Products", dbName: "Ressi KerbFix 101 - 20 KG" },
  { csvName: "Zepoxy LEEG 10", unit: "KG", sku: 25, price: 66000, category: "Specialty Products", dbName: "Zepoxy LEEG 10 - 25 KG" },
];

console.log(`Decorative Concrete: ${decorativeConcreteProducts.length} products`);
console.log(`Specialty Products: ${specialtyProducts.length} products`);
console.log(`\nTotal: ${decorativeConcreteProducts.length + specialtyProducts.length} products`);

module.exports = { decorativeConcreteProducts, specialtyProducts };

