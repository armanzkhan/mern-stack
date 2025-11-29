// backend/scripts/comprehensiveProductVerification.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Comprehensive product list from user's data
// Format: { name, sku, unit, price, category, subCategory }
const userProducts = [
  // PlastoRend 100 - Dry Mix Mortars / Premix Plasters
  { name: "100 - 0001 B (Brilliant White)", sku: "50", unit: "KG", price: 6325, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 0001 (White)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 0003 (Med White)", sku: "50", unit: "KG", price: 4600, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 8400 - 1 HD (Adobe Buff)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1100 (Dessert Sand 3)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1101 (Dessert Sand 4)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 9111 TG (Ash White 1)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 6110 TG (Ash White 2)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1111 (Dessert Sand 5)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1211-2 (Dirty White)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1200 (Dessert sand 1 )", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1210 (Dessert Sand 2)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 7000 W (F/F Cement Medium)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 7000 WL (F/F Cement Light)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 9000 W ( F/F cement)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - GRG (Grey 2)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 9210 (Grey 3)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 9110 W (Medium Grey )", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - TG (Light Grey)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 9311 HD (Grey 1)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - GOG (Light Grey 2)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - NW ( Ultra Light Pink)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1211 (Biege)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - CHG (Light Walnut Brown)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 3990 X 9 (Red)", sku: "50", unit: "KG", price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 6800 (Dark Orange)", sku: "50", unit: "KG", price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 6400 (Light Orange)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 3400 (Pink)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 8820 X 2 HD (Wheatish 1)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1320 (Wheatish 2)", sku: "50", unit: "KG", price: 5405, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1220 (Wheatish 3)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - CHW (Wheatish 4)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  
  // PlastoRend 110
  { name: "110 - 0001 B (Brilliant White)", sku: "50", unit: "KG", price: 6900, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110 - 0001 (White)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110 - 0003 (Med White)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110 - 8400 - 1 HD (Adobe Buff)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110 - 1100 (Dessert Sand 3)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  
  // PlastoRend 120 C
  { name: "RPR 120 C- 0001 B (Brilliant White)", sku: "50", unit: "KG", price: 3335, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 0001 (White)", sku: "50", unit: "KG", price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 0003 (Med White)", sku: "50", unit: "KG", price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  
  // SC 310
  { name: "Ressi SC 310 - 0001 (Pasty White)", sku: "50", unit: "KG", price: 10925, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 1100 (Harvest Sand)", sku: "50", unit: "KG", price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  
  // Building Care and Maintenance
  { name: "Tough Guard 12,000 E", sku: "12", unit: "KG", price: 558, category: "Building Care and Maintenance" },
  { name: "Water Guard 491", sku: "20", unit: "KG", price: 23125, category: "Building Care and Maintenance" },
  { name: "Water Guard 5010", sku: "20", unit: "KG", price: 10750, category: "Building Care and Maintenance" },
  { name: "Ressi BRC 7000", sku: "50", unit: "KG", price: 2875, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi Lime O Might 8000", sku: "1", unit: "KG", price: 250, category: "Building Care and Maintenance" },
  { name: "Ressi Lime O Might 8000", sku: "20", unit: "KG", price: 4000, category: "Building Care and Maintenance" },
  { name: "Ressi Gyps O Might 9000", sku: "1", unit: "KG", price: 344, category: "Building Care and Maintenance" },
  { name: "Ressi Gyps O Might 9000", sku: "20", unit: "KG", price: 4750, category: "Building Care and Maintenance" },
  { name: "Ressi SLS 610", sku: "2.18", unit: "KG", price: 1438, category: "Building Care and Maintenance" },
  { name: "Ressi SLS 610", sku: "21.8", unit: "KG", price: 12263, category: "Building Care and Maintenance" },
  { name: "Ressi BLM 510", sku: "1", unit: "KG", price: 1563, category: "Building Care and Maintenance" },
  { name: "Ressi BLM 510", sku: "20", unit: "KG", price: 26875, category: "Building Care and Maintenance" },
  
  // Water Guard variants
  { name: "Water Guard 3020 N", sku: "20", unit: "KG", price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 1530 Econo", sku: "20", unit: "KG", price: 15500, category: "Building Care and Maintenance" },
  { name: "Water Guard 1810", sku: "20", unit: "KG", price: 22000, category: "Building Care and Maintenance" },
  
  // Tiling and Grouting Materials
  { name: "810 - 0001 (Bright White)", sku: "1", unit: "KG", price: 161, category: "Tiling and Grouting Materials" },
  { name: "810 - 0001 (Bright White)", sku: "15", unit: "KG", price: 2243, category: "Tiling and Grouting Materials" },
  { name: "810 -1110 (Ivory)", sku: "1", unit: "KG", price: 161, category: "Tiling and Grouting Materials" },
  { name: "810 -1110 (Ivory)", sku: "15", unit: "KG", price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TA 210", sku: "1", unit: "KG", price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TA 210", sku: "15", unit: "KG", price: 2243, category: "Tiling and Grouting Materials" },
  
  // Concrete Admixtures
  { name: "Max Flo P", sku: "1", unit: "LTR", price: 489, category: "Concrete Admixtures" },
  { name: "Max Flo P", sku: "5", unit: "LTR", price: 1955, category: "Concrete Admixtures" },
  { name: "Max Flo P", sku: "10", unit: "LTR", price: 3680, category: "Concrete Admixtures" },
  { name: "Max Flo P", sku: "15", unit: "LTR", price: 5175, category: "Concrete Admixtures" },
  { name: "Max Flo P", sku: "25", unit: "LTR", price: 8050, category: "Concrete Admixtures" },
  { name: "Max Flo P", sku: "200", unit: "LTR", price: 59800, category: "Concrete Admixtures" },
  { name: "Max Flo P 800", sku: "1", unit: "LTR", price: 529, category: "Concrete Admixtures" },
  { name: "Max Flo P 800", sku: "5", unit: "LTR", price: 2070, category: "Concrete Admixtures" },
  { name: "Max Flo P 800", sku: "10", unit: "LTR", price: 4025, category: "Concrete Admixtures" },
  { name: "Max Flo P 800", sku: "15", unit: "LTR", price: 5865, category: "Concrete Admixtures" },
  { name: "Max Flo P 800", sku: "25", unit: "LTR", price: 9488, category: "Concrete Admixtures" },
  { name: "Max Flo P 800", sku: "200", unit: "LTR", price: 71300, category: "Concrete Admixtures" },
];

async function comprehensiveVerification() {
  try {
    await connect();
    console.log('🔍 Comprehensive Product Verification...\n');
    
    const results = {
      exactMatch: [],
      partialMatch: [],
      missing: [],
      incorrect: [],
      total: userProducts.length
    };
    
    for (const userProduct of userProducts) {
      // Try to find product by name pattern (normalize spacing)
      const normalizedName = userProduct.name.replace(/\s+/g, ' ').trim();
      const namePattern = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Also create a pattern that handles spacing variations (e.g., "C- " vs "C - ")
      const flexiblePattern = namePattern.replace(/\s+-\s+/g, '\\s*-\\s*').replace(/\s+/g, '\\s+');
      const nameRegex = new RegExp(namePattern, 'i');
      const flexibleRegex = new RegExp(flexiblePattern, 'i');
      
      // Search for products matching the name
      const products = await Product.find({
        company_id: 'RESSICHEM',
        isActive: true,
        $or: [
          { name: { $regex: flexibleRegex } },
          { name: { $regex: nameRegex } },
          { name: userProduct.name },
          { name: normalizedName }
        ]
      });
      
      if (products.length === 0) {
        results.missing.push({
          ...userProduct,
          reason: 'Product not found in database'
        });
        continue;
      }
      
      // Try to find exact match (name + SKU + unit + price)
      let exactMatch = null;
      let bestMatch = null;
      let bestScore = 0;
      
      for (const product of products) {
        // Normalize names for comparison (remove extra spaces, handle spacing variations)
        const normalizeName = (name) => name.toLowerCase().replace(/\s+/g, ' ').replace(/\s*-\s*/g, ' - ').trim();
        const normalizedProductName = normalizeName(product.name).replace(/\s*-\s*\d+\.?\d*\s*(kg|ltr)/i, '').trim();
        const normalizedUserProductName = normalizeName(userProduct.name);
        
        // Check if product name matches (with or without SKU/unit suffix)
        const productNameMatch = normalizedProductName === normalizedUserProductName ||
                                product.name.toLowerCase().includes(userProduct.name.toLowerCase()) ||
                                userProduct.name.toLowerCase().includes(product.name.toLowerCase()) ||
                                product.name.toLowerCase().replace(/ - \d+\.?\d* (KG|LTR)/i, '').trim() === userProduct.name.toLowerCase();
        
        if (!productNameMatch) continue;
        
        // Check SKU match
        const skuMatch = String(product.sku) === String(userProduct.sku);
        
        // Check unit match
        const unitMatch = product.unit === userProduct.unit;
        
        // Check price match (allow small difference for rounding)
        const priceMatch = Math.abs(product.price - userProduct.price) < 1;
        
        // Check category match
        let categoryMatch = false;
        if (typeof product.category === 'string') {
          categoryMatch = product.category.includes(userProduct.category) || 
                         userProduct.category.includes(product.category);
        } else if (product.category && typeof product.category === 'object') {
          const mainCategory = product.category.mainCategory || '';
          categoryMatch = mainCategory.includes(userProduct.category) || 
                         userProduct.category.includes(mainCategory);
        }
        
        // Calculate match score
        let score = 0;
        if (productNameMatch) score += 1;
        if (skuMatch) score += 2;
        if (unitMatch) score += 2;
        if (priceMatch) score += 2;
        if (categoryMatch) score += 1;
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = product;
        }
        
        // Check for exact match
        if (skuMatch && unitMatch && priceMatch && categoryMatch && productNameMatch) {
          exactMatch = product;
          break;
        }
      }
      
      if (exactMatch) {
        results.exactMatch.push({
          userProduct,
          found: {
            name: exactMatch.name,
            sku: exactMatch.sku,
            unit: exactMatch.unit,
            price: exactMatch.price,
            category: exactMatch.category
          }
        });
      } else if (bestMatch && bestScore >= 4) {
        // Partial match - check what's wrong
        const issues = [];
        if (String(bestMatch.sku) !== String(userProduct.sku)) {
          issues.push(`SKU: expected "${userProduct.sku}", found "${bestMatch.sku}"`);
        }
        if (bestMatch.unit !== userProduct.unit) {
          issues.push(`Unit: expected "${userProduct.unit}", found "${bestMatch.unit}"`);
        }
        if (Math.abs(bestMatch.price - userProduct.price) >= 1) {
          issues.push(`Price: expected ${userProduct.price}, found ${bestMatch.price}`);
        }
        
        let categoryMatch = false;
        let categoryIssue = '';
        if (typeof bestMatch.category === 'string') {
          categoryMatch = bestMatch.category.includes(userProduct.category);
          if (!categoryMatch) {
            categoryIssue = `Category: expected "${userProduct.category}", found "${bestMatch.category}"`;
          }
        } else if (bestMatch.category && typeof bestMatch.category === 'object') {
          const mainCategory = bestMatch.category.mainCategory || '';
          categoryMatch = mainCategory.includes(userProduct.category);
          if (!categoryMatch) {
            categoryIssue = `Category: expected "${userProduct.category}", found "${JSON.stringify(bestMatch.category)}"`;
          }
        }
        
        if (!categoryMatch && categoryIssue) {
          issues.push(categoryIssue);
        }
        
        results.partialMatch.push({
          userProduct,
          found: {
            name: bestMatch.name,
            sku: bestMatch.sku,
            unit: bestMatch.unit,
            price: bestMatch.price,
            category: bestMatch.category
          },
          issues
        });
      } else {
        results.incorrect.push({
          ...userProduct,
          reason: 'Product found but data does not match',
          found: bestMatch ? {
            name: bestMatch.name,
            sku: bestMatch.sku,
            unit: bestMatch.unit,
            price: bestMatch.price,
            category: bestMatch.category
          } : null
        });
      }
    }
    
    // Print results
    console.log('📊 Verification Results:\n');
    console.log(`✅ Exact Match: ${results.exactMatch.length}/${results.total} (${((results.exactMatch.length / results.total) * 100).toFixed(1)}%)`);
    console.log(`⚠️  Partial Match: ${results.partialMatch.length}/${results.total} (${((results.partialMatch.length / results.total) * 100).toFixed(1)}%)`);
    console.log(`❌ Missing: ${results.missing.length}/${results.total} (${((results.missing.length / results.total) * 100).toFixed(1)}%)`);
    console.log(`❌ Incorrect: ${results.incorrect.length}/${results.total} (${((results.incorrect.length / results.total) * 100).toFixed(1)}%)\n`);
    
    if (results.exactMatch.length > 0) {
      console.log('✅ Exact Matches (Name, SKU, Unit, Price, Category all match):');
      results.exactMatch.slice(0, 10).forEach((match, i) => {
        console.log(`   ${i + 1}. ${match.userProduct.name} - ${match.userProduct.sku} ${match.userProduct.unit} - PKR ${match.userProduct.price}`);
      });
      if (results.exactMatch.length > 10) {
        console.log(`   ... and ${results.exactMatch.length - 10} more exact matches`);
      }
      console.log('');
    }
    
    if (results.partialMatch.length > 0) {
      console.log('⚠️  Partial Matches (Found but with some differences):');
      results.partialMatch.forEach((match, i) => {
        console.log(`   ${i + 1}. ${match.userProduct.name} - ${match.userProduct.sku} ${match.userProduct.unit} - PKR ${match.userProduct.price}`);
        console.log(`      Found: ${match.found.name} - ${match.found.sku} ${match.found.unit} - PKR ${match.found.price}`);
        match.issues.forEach(issue => console.log(`      ⚠️  ${issue}`));
      });
      console.log('');
    }
    
    if (results.missing.length > 0) {
      console.log('❌ Missing Products (Not found in database):');
      results.missing.forEach((product, i) => {
        console.log(`   ${i + 1}. ${product.name} - ${product.sku} ${product.unit} - PKR ${product.price} - ${product.category}`);
      });
      console.log('');
    }
    
    if (results.incorrect.length > 0) {
      console.log('❌ Incorrect Products (Found but data significantly different):');
      results.incorrect.slice(0, 10).forEach((product, i) => {
        console.log(`   ${i + 1}. ${product.name} - ${product.sku} ${product.unit} - PKR ${product.price}`);
        if (product.found) {
          console.log(`      Found: ${product.found.name} - ${product.found.sku} ${product.found.unit} - PKR ${product.found.price}`);
        }
      });
      if (results.incorrect.length > 10) {
        console.log(`   ... and ${results.incorrect.length - 10} more`);
      }
      console.log('');
    }
    
    // Summary statistics
    console.log('\n📈 Summary Statistics:');
    console.log(`   Total products to verify: ${results.total}`);
    console.log(`   ✅ Exact matches: ${results.exactMatch.length} (${((results.exactMatch.length / results.total) * 100).toFixed(1)}%)`);
    console.log(`   ⚠️  Partial matches: ${results.partialMatch.length} (${((results.partialMatch.length / results.total) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Missing: ${results.missing.length} (${((results.missing.length / results.total) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Incorrect: ${results.incorrect.length} (${((results.incorrect.length / results.total) * 100).toFixed(1)}%)`);
    
  } catch (error) {
    console.error('❌ Error in verification:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  comprehensiveVerification();
}

module.exports = comprehensiveVerification;

