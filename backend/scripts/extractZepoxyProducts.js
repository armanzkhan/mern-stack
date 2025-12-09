// backend/scripts/extractZepoxyProducts.js
// Extract Zepoxy products with prices > 0 from import script

const fs = require('fs');
const path = require('path');

const importScriptPath = path.join(__dirname, 'importProductsFromExcel.js');
const content = fs.readFileSync(importScriptPath, 'utf8');

// Extract products from lines 1147-1453
const lines = content.split('\n');
const zepoxyProducts = [];

for (let i = 1146; i < 1454; i++) {
  const line = lines[i];
  
  // Look for product entries with prices > 0
  if (line.includes('{ name:') && line.includes('price:') && !line.includes('price: 0')) {
    // Extract product info
    const nameMatch = line.match(/name:\s*"([^"]+)"/);
    const unitMatch = line.match(/unit:\s*"([^"]+)"/);
    const skuMatch = line.match(/sku:\s*([0-9.]+)/);
    const priceMatch = line.match(/price:\s*([0-9.]+)/);
    
    if (nameMatch && unitMatch && skuMatch && priceMatch) {
      const name = nameMatch[1];
      const unit = unitMatch[1];
      const sku = parseFloat(skuMatch[1]);
      const price = parseFloat(priceMatch[1]);
      
      // Create dbName
      const dbName = `${name} - ${sku} ${unit}`;
      
      zepoxyProducts.push({
        csvName: name,
        unit: unit,
        sku: sku,
        price: price,
        category: "Epoxy Adhesives and Coatings",
        dbName: dbName
      });
    }
  }
}

console.log(`Found ${zepoxyProducts.length} Zepoxy products with prices > 0\n`);

// Group by product name
const byName = {};
zepoxyProducts.forEach(p => {
  if (!byName[p.csvName]) byName[p.csvName] = [];
  byName[p.csvName].push(p);
});

console.log('Products by name:');
Object.entries(byName).forEach(([name, products]) => {
  console.log(`  ${name}: ${products.length} SKUs`);
});

// Output formatted array
console.log('\n\nFormatted array:');
console.log('const epoxyAdhesivesProducts = [');
zepoxyProducts.forEach(p => {
  console.log(`  { csvName: "${p.csvName}", unit: "${p.unit}", sku: ${p.sku}, price: ${p.price}, category: "${p.category}", dbName: "${p.dbName}" },`);
});
console.log('];');

module.exports = { zepoxyProducts };

