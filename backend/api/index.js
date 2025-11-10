// Main catch-all serverless function for all API routes
// This consolidates all routes into a single function to stay within Vercel's free tier limit

const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./_utils/db');

// Create Express app (outside handler for better performance)
let app;

// Initialize Express app
function initializeApp() {
  if (app) return app; // Return cached app if already initialized

  app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/api/health/test', (req, res) =>
    res.json({ status: 'ok', route: '/api/health/test', time: new Date().toISOString() })
  );

  // Import and mount all routes
  try {
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
  } catch (error) {
    console.error('Error loading routes:', error);
    throw error;
  }

  // Handle 404 for unmatched routes
  app.use((req, res) => {
    if (!res.headersSent) {
      res.status(404).json({ error: 'Route not found', path: req.url });
    }
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Express error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  return app;
}

// Vercel serverless function handler
module.exports = async (req, res) => {
  try {
    console.log('🔍 Serverless function invoked:', req.method, req.url);
    
    // Initialize Express app
    const expressApp = initializeApp();
    
    // Connect to database
    console.log('🔍 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Database connected');

    // Handle the request with Express app
    // Wrap in promise to ensure proper async handling
    return new Promise((resolve, reject) => {
      // Track if response has been sent
      let responseSent = false;

      // Set a timeout to prevent hanging (9 seconds, less than maxDuration)
      const timeout = setTimeout(() => {
        if (!responseSent) {
          responseSent = true;
          console.error('❌ Request timeout');
          if (!res.headersSent) {
            res.status(504).json({ error: 'Request timeout' });
          }
          resolve(); // Resolve instead of reject to prevent unhandled rejection
        }
      }, 9000);

      // Override res.end to detect when response is complete
      const originalEnd = res.end.bind(res);
      res.end = function(...args) {
        if (!responseSent) {
          responseSent = true;
          clearTimeout(timeout);
          originalEnd(...args);
          resolve();
        }
      };

      // Override res.json
      const originalJson = res.json.bind(res);
      res.json = function(data) {
        if (!responseSent) {
          responseSent = true;
          clearTimeout(timeout);
          originalJson(data);
          resolve();
        }
        return res;
      };

      // Override res.send
      const originalSend = res.send.bind(res);
      res.send = function(data) {
        if (!responseSent) {
          responseSent = true;
          clearTimeout(timeout);
          originalSend(data);
          resolve();
        }
        return res;
      };

      // Handle the request with Express
      try {
        expressApp(req, res, (err) => {
          if (err) {
            console.error('❌ Express handler error:', err);
            if (!responseSent) {
              responseSent = true;
              clearTimeout(timeout);
              if (!res.headersSent) {
                res.status(500).json({ error: err.message || 'Internal server error' });
              }
              resolve(); // Resolve instead of reject to prevent unhandled rejection
            }
          }
        });
      } catch (err) {
        console.error('❌ Error calling Express app:', err);
        if (!responseSent) {
          responseSent = true;
          clearTimeout(timeout);
          if (!res.headersSent) {
            res.status(500).json({ error: err.message || 'Internal server error' });
          }
          resolve(); // Resolve instead of reject to prevent unhandled rejection
        }
      }
    });
  } catch (error) {
    console.error('❌ Serverless function error:', error);
    console.error('❌ Error stack:', error.stack);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: error.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
    throw error;
  }
};

