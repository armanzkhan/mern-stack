// Script to update all generated Vercel functions to use the expressRouter adapter

const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../api');

// Route mappings
const routeMappings = {
  'auth': 'authRoutes',
  'users': 'userRoutes',
  'companies': 'companyRoutes',
  'customers': 'customerRoutes',
  'orders': 'orderRoutes',
  'products': 'productRoutes',
  'roles': 'roleRoutes',
  'permissions': 'permissionRoutes',
  'permission-groups': 'permissionGroupRoutes',
  'notifications': 'notificationRoutes',
  'managers': 'managerRoutes',
  'product-categories': 'categoryRoutes',
  'invoices': 'invoiceRoutes',
  'customer-ledger': 'customerLedgerRoutes',
  'product-images': 'productImageRoutes',
};

function updateFunction(apiPath, routeName) {
  const functionPath = path.join(apiDir, apiPath, 'index.js');
  
  if (!fs.existsSync(functionPath)) {
    console.log(`⚠️  ${functionPath} not found, skipping...`);
    return;
  }

  const newContent = `// Vercel serverless function for /api/${apiPath} routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const ${routeName} = require('../../routes/${routeName}');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(${routeName}, { requireAuth: false, connectDb: true });
`;

  fs.writeFileSync(functionPath, newContent);
  console.log(`✅ Updated ${functionPath}`);
}

// Main execution
console.log('🚀 Updating Vercel serverless functions...\n');

Object.entries(routeMappings).forEach(([apiPath, routeName]) => {
  updateFunction(apiPath, routeName);
});

console.log('\n✅ Update complete!');

