// backend/scripts/extractRemainingCategories.js
// Extract products with prices > 0 from remaining categories in import script
const { productData } = require('./importProductsFromExcel');

const categories = [
  'Decorative Concrete',
  'Epoxy Adhesives and Coatings',
  'Specialty Products',
  'Epoxy Floorings & Coatings'
];

const remainingProducts = productData.filter(p => {
  return categories.includes(p.category.mainCategory) && p.price > 0;
});

console.log(`Found ${remainingProducts.length} products with prices > 0 in remaining categories:\n`);

const byCategory = {};
remainingProducts.forEach(p => {
  const cat = p.category.mainCategory;
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(p);
});

Object.entries(byCategory).forEach(([cat, products]) => {
  console.log(`${cat}: ${products.length} products`);
});

console.log('\nSample products:');
remainingProducts.slice(0, 10).forEach(p => {
  console.log(`  - ${p.name} - ${p.sku} ${p.unit} (${p.price} PKR)`);
});

module.exports = { remainingProducts, byCategory };

