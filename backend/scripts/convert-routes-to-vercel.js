// Script to help convert Express routes to Vercel serverless functions
// This generates the basic structure for each route

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../routes');
const apiDir = path.join(__dirname, '../api');

// Route mappings: route file -> API path
const routeMappings = {
  'authRoutes.js': 'auth',
  'userRoutes.js': 'users',
  'companyRoutes.js': 'companies',
  'customerRoutes.js': 'customers',
  'orderRoutes.js': 'orders',
  'productRoutes.js': 'products',
  'roleRoutes.js': 'roles',
  'permissionRoutes.js': 'permissions',
  'permissionGroupRoutes.js': 'permission-groups',
  'notificationRoutes.js': 'notifications',
  'managerRoutes.js': 'managers',
  'categoryRoutes.js': 'product-categories',
  'invoiceRoutes.js': 'invoices',
  'customerLedgerRoutes.js': 'customer-ledger',
  'productImageRoutes.js': 'product-images',
};

function createApiFunction(routeName, apiPath) {
  const apiFunctionPath = path.join(apiDir, `${apiPath}/index.js`);
  const apiDirPath = path.dirname(apiFunctionPath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(apiDirPath)) {
    fs.mkdirSync(apiDirPath, { recursive: true });
  }

  // Check if file already exists
  if (fs.existsSync(apiFunctionPath)) {
    console.log(`⚠️  ${apiFunctionPath} already exists, skipping...`);
    return;
  }

  // Create the serverless function
  const functionCode = `// Vercel serverless function for /api/${apiPath} routes
// Uses Express router adapter to reuse existing routes

const { createHandler } = require('../_utils/handler');
const express = require('express');
const router = express.Router();
const ${routeName.replace('Routes', 'Routes')} = require('../../routes/${routeName}');

// Use the existing Express router
router.use('/', ${routeName.replace('Routes', 'Routes')});

// Convert to Vercel handler
// Note: This is a catch-all handler for all routes in this path
// Individual routes can be created separately for better performance
module.exports = createHandler(async (req, res) => {
  // Handle the request with Express router
  router(req, res, (err) => {
    if (err) {
      console.error('${apiPath} routes error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
  });
}, { requireAuth: false, connectDb: true });
`;

  fs.writeFileSync(apiFunctionPath, functionCode);
  console.log(`✅ Created ${apiFunctionPath}`);
}

// Main execution
console.log('🚀 Converting Express routes to Vercel serverless functions...\n');

Object.entries(routeMappings).forEach(([routeFile, apiPath]) => {
  const routePath = path.join(routesDir, routeFile);
  if (fs.existsSync(routePath)) {
    createApiFunction(routeFile.replace('.js', ''), apiPath);
  } else {
    console.log(`⚠️  Route file ${routeFile} not found, skipping...`);
  }
});

console.log('\n✅ Conversion complete!');
console.log('\n📝 Next steps:');
console.log('1. Review generated functions in backend/api/');
console.log('2. Test locally with: vercel dev');
console.log('3. Update vercel.json routes if needed');
console.log('4. Deploy to Vercel');

