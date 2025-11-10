// Main catch-all serverless function for all API routes
// This consolidates all routes into a single function to stay within Vercel's free tier limit

const express = require('express');
const { connectToDatabase } = require('./_utils/db');

// Import all routes
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const companyRoutes = require('../routes/companyRoutes');
const customerRoutes = require('../routes/customerRoutes');
const orderRoutes = require('../routes/orderRoutes');
const productRoutes = require('../routes/productRoutes');
const roleRoutes = require('../routes/roleRoutes');
const permissionRoutes = require('../routes/permissionRoutes');
const permissionGroupRoutes = require('../routes/permissionGroupRoutes');
const notificationRoutes = require('../routes/notificationRoutes');
const managerRoutes = require('../routes/managerRoutes');
const categoryRoutes = require('../routes/categoryRoutes');
const invoiceRoutes = require('../routes/invoiceRoutes');
const customerLedgerRoutes = require('../routes/customerLedgerRoutes');
const productImageRoutes = require('../routes/productImageRoutes');

module.exports = async (req, res) => {
  try {
    // Connect to database
    await connectToDatabase();

    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-company-id');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Create Express app
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Health check (before other routes)
    app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
    app.get('/api/health/test', (req, res) =>
      res.json({ status: 'ok', route: '/api/health/test', time: new Date().toISOString() })
    );

    // Mount all routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/companies', companyRoutes);
    app.use('/api/customers', customerRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/roles', roleRoutes);
    app.use('/api/permissions', permissionRoutes);
    app.use('/api/permission-groups', permissionGroupRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/managers', managerRoutes);
    app.use('/api/product-categories', categoryRoutes);
    app.use('/api/invoices', invoiceRoutes);
    app.use('/api/customer-ledger', customerLedgerRoutes);
    app.use('/api/product-images', productImageRoutes);

    // Handle 404 for unmatched routes
    app.use((req, res) => {
      if (!res.headersSent) {
        res.status(404).json({ error: 'Route not found', path: req.url });
      }
    });

    // Handle the request
    app(req, res, (err) => {
      if (err) {
        console.error('API error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: err.message });
        }
      }
    });
  } catch (error) {
    console.error('Serverless function error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

