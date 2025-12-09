// Express-to-Vercel adapter utility
// Converts Express route handlers to Vercel serverless functions

const { connectToDatabase } = require('./db');

/**
 * Wraps an Express route handler to work with Vercel serverless functions
 * @param {Function} handler - Express route handler (req, res) => {}
 * @param {Object} options - Options for the handler
 * @param {boolean} options.requireAuth - Whether to require authentication
 * @param {boolean} options.connectDb - Whether to connect to database
 */
function createHandler(handler, options = {}) {
  const { requireAuth = false, connectDb = true } = options;

  return async (req, res) => {
    try {
      // Connect to database if needed
      if (connectDb) {
        await connectToDatabase();
      }

      // Handle CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-company-id');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      // Require authentication if needed
      if (requireAuth) {
        const authMiddleware = require('../../middleware/authMiddleware');
        // Wrap auth middleware in a promise
        let authPassed = false;
        await new Promise((resolve, reject) => {
          const next = (err) => {
            if (err) {
              reject(err);
            } else {
              authPassed = true;
              resolve();
            }
          };
          authMiddleware(req, res, next);
        });
        
        // If auth failed, the middleware already sent a response
        if (!authPassed && res.headersSent) {
          return;
        }
      }

      // Call the handler
      await handler(req, res);
    } catch (error) {
      console.error('Handler error:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          message: error.message || 'Internal server error' 
        });
      }
    }
  };
}

/**
 * Creates a handler for a specific HTTP method
 */
function methodHandler(method, handler, options = {}) {
  return createHandler(async (req, res) => {
    if (req.method !== method) {
      return res.status(405).json({ 
        success: false, 
        message: `Method ${req.method} not allowed. Use ${method}.` 
      });
    }
    return handler(req, res);
  }, options);
}

module.exports = { createHandler, methodHandler };

