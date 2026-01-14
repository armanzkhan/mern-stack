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

  // Health check (handled directly in serverless function, but keep for compatibility)
  app.get('/api/health/test', (req, res) =>
    res.json({ status: 'ok', route: '/api/health/test', time: new Date().toISOString() })
  );

  // Import and mount all routes from backend folder
  try {
    const authRoutes = require('../backend/routes/authRoutes');
    const userRoutes = require('../backend/routes/userRoutes');
    const companyRoutes = require('../backend/routes/companyRoutes');
    const customerRoutes = require('../backend/routes/customerRoutes');
    const orderRoutes = require('../backend/routes/orderRoutes');
    const productRoutes = require('../backend/routes/productRoutes');
    const roleRoutes = require('../backend/routes/roleRoutes');
    const permissionRoutes = require('../backend/routes/permissionRoutes');
    const permissionGroupRoutes = require('../backend/routes/permissionGroupRoutes');
    const notificationRoutes = require('../backend/routes/notificationRoutes');
    const managerRoutes = require('../backend/routes/managerRoutes');
    const categoryRoutes = require('../backend/routes/categoryRoutes');
    const invoiceRoutes = require('../backend/routes/invoiceRoutes');
    const customerLedgerRoutes = require('../backend/routes/customerLedgerRoutes');
    const productImageRoutes = require('../backend/routes/productImageRoutes');

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
    
    // Handle health check without database connection (fast path)
    const urlPath = req.url.split('?')[0]; // Remove query string
    if (urlPath === '/api/health' || urlPath === '/api/health/') {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
      res.end();
      return Promise.resolve();
    }
    
    // Initialize Express app
    const expressApp = initializeApp();
    
    // Connect to database (with shorter timeout for faster failure)
    console.log('🔍 Connecting to database...');
    let dbConnected = false;
    try {
      await Promise.race([
        connectToDatabase(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout')), 3000)
        )
      ]);
      dbConnected = true;
      console.log('✅ Database connected');
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError.message);
      // For health checks, continue without database
      if (urlPath.startsWith('/api/health')) {
        res.status(200).json({ 
          status: 'ok', 
          database: 'disconnected',
          timestamp: new Date().toISOString() 
        });
        return;
      }
      // For other routes, return error
      if (!res.headersSent) {
        res.status(503).json({ 
          error: 'Database connection failed',
          message: dbError.message 
        });
        return;
      }
    }

    // Handle the request with Express app
    // Wrap in promise to ensure proper async handling
    return new Promise((resolve) => {
      let finished = false;
      
      // Set timeout (7 seconds to leave buffer)
      const timeout = setTimeout(() => {
        if (!finished && !res.headersSent) {
          finished = true;
          console.error('❌ Request timeout after 7s');
          res.status(504).json({ error: 'Request timeout' });
          resolve();
        }
      }, 7000);

      // Track when response is sent
      const finish = () => {
        if (!finished) {
          finished = true;
          clearTimeout(timeout);
          resolve();
        }
      };

      // Override res methods to detect completion
      const originalEnd = res.end.bind(res);
      res.end = function(...args) {
        finish();
        return originalEnd.apply(this, args);
      };

      const originalJson = res.json.bind(res);
      res.json = function(data) {
        finish();
        return originalJson.call(this, data);
      };

      const originalSend = res.send.bind(res);
      res.send = function(data) {
        finish();
        return originalSend.call(this, data);
      };

      // Handle the request with Express
      try {
        expressApp(req, res, (err) => {
          if (err) {
            console.error('❌ Express handler error:', err);
            if (!finished && !res.headersSent) {
              finish();
              res.status(500).json({ error: err.message || 'Internal server error' });
            }
          }
          // If no error and response not sent, Express should handle it
          // But ensure we resolve after a short delay if nothing happened
          if (!finished) {
            setTimeout(() => {
              if (!finished && !res.headersSent) {
                finish();
                res.status(500).json({ error: 'No response from Express' });
              }
            }, 100);
          }
        });
      } catch (err) {
        console.error('❌ Error calling Express app:', err);
        if (!finished && !res.headersSent) {
          finish();
          res.status(500).json({ error: err.message || 'Internal server error' });
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
  }
};

