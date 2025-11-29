const normalizeCategory = (cat) => {
  if (!cat || typeof cat !== 'string') return '';
  return cat.toLowerCase().trim()
    .replace(/\s*&\s*/g, ' and ')
    .replace(/\s+/g, ' ');
};

const managerCategories = ['Building Care & Maintenance', 'Concrete Admixtures', 'Decorative Concrete'];
const productCategories = ['Building Care and Maintenance', 'Decorative Concrete', 'Tiling and Grouting Materials'];

console.log('Manager categories:', managerCategories);
console.log('Product categories:', productCategories);
console.log('\nNormalized manager categories:');
managerCategories.forEach(cat => {
  console.log(`  "${cat}" -> "${normalizeCategory(cat)}"`);
});

console.log('\nNormalized product categories:');
productCategories.forEach(cat => {
  const normalized = normalizeCategory(cat);
  console.log(`  "${cat}" -> "${normalized}"`);
  const matches = managerCategories.some(managerCat => {
    const normalizedManager = normalizeCategory(managerCat);
    const exactMatch = normalized === normalizedManager;
    const containsMatch = normalized.includes(normalizedManager) || normalizedManager.includes(normalized);
    if (exactMatch || containsMatch) {
      console.log(`    ✅ Matches "${managerCat}" (normalized: "${normalizedManager}")`);
      return true;
    }
    return false;
  });
  if (!matches) {
    console.log(`    ❌ No match`);
  }
});

