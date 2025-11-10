# Converting Backend to Vercel Serverless Functions

## Overview

This guide explains how to convert your Express backend to Vercel serverless functions.

## Architecture Changes

### Before (Express Server)
```
Express App → Routes → Controllers → Database
```

### After (Vercel Serverless)
```
Vercel Function → Handler → Controller → Database
```

## Key Differences

1. **No persistent server**: Each request is a new function invocation
2. **Connection pooling**: MongoDB connections must be cached/reused
3. **Execution time limits**: 10 seconds (free), 60 seconds (pro)
4. **No WebSocket**: Must use alternative (Pusher, Ably, etc.)
5. **No file system**: Use external storage (Cloudinary, S3, etc.)

## Conversion Steps

### 1. Create Serverless Functions

Each Express route becomes a serverless function in `backend/api/`:

**Express Route:**
```javascript
// routes/authRoutes.js
router.post('/login', login);
```

**Vercel Function:**
```javascript
// api/auth/login.js
const { createHandler } = require('../_utils/handler');
const { login } = require('../../controllers/authController');
module.exports = createHandler(login, { requireAuth: false });
```

### 2. MongoDB Connection

Use the connection utility in `api/_utils/db.js` which handles connection pooling:

```javascript
const { connectToDatabase } = require('../_utils/db');
await connectToDatabase();
```

### 3. Middleware

Auth middleware works the same, but wrapped in the handler:

```javascript
module.exports = createHandler(controller, { requireAuth: true });
```

### 4. File Uploads

**Before (Express with Multer):**
```javascript
const upload = multer({ dest: 'uploads/' });
router.post('/upload', upload.single('file'), handler);
```

**After (Vercel with External Storage):**
```javascript
// Use Cloudinary, S3, or Vercel Blob Storage
const cloudinary = require('cloudinary').v2;
// Handle upload in controller
```

## Converting All Routes

### Quick Conversion Script

For each route file in `backend/routes/`:

1. Create corresponding function in `backend/api/`
2. Import controller
3. Wrap with `createHandler`
4. Add to `vercel.json` routes

### Example: Converting userRoutes

**Original:** `routes/userRoutes.js`
```javascript
router.get('/', auth, userController.getAllUsers);
router.post('/', auth, userController.createUser);
```

**Converted:** `api/users/index.js`
```javascript
const { createHandler } = require('../_utils/handler');
const userController = require('../../controllers/userController');

// GET /api/users
module.exports = createHandler(userController.getAllUsers, { requireAuth: true });
```

**For multiple routes in one file:**
```javascript
// api/users/index.js - handles all /api/users/* routes
const express = require('express');
const router = express.Router();
const userRoutes = require('../../routes/userRoutes');
router.use('/', userRoutes);
// Then use expressRouterToVercel adapter
```

## WebSocket Alternative

Since Vercel doesn't support WebSocket, you need an alternative:

### Option 1: Pusher (Recommended)
```bash
npm install pusher
```

```javascript
const Pusher = require('pusher');
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
});

// Replace WebSocket with Pusher
pusher.trigger('notifications', 'new-notification', data);
```

### Option 2: Ably
```bash
npm install ably
```

## File Uploads

### Option 1: Cloudinary (Recommended)
```bash
npm install cloudinary
```

```javascript
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload
const result = await cloudinary.uploader.upload(file);
```

### Option 2: Vercel Blob Storage
```bash
npm install @vercel/blob
```

## Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

```
CONNECTION_STRING=mongodb+srv://...
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=production
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
CLOUDINARY_CLOUD_NAME=...
```

## Testing Locally

Install Vercel CLI:
```bash
npm install -g vercel
```

Run locally:
```bash
cd backend
vercel dev
```

## Deployment

1. Push to GitHub
2. Connect Vercel to GitHub repo
3. Set root directory to `backend`
4. Add environment variables
5. Deploy

## Limitations

- ⚠️ **Execution time**: 10s free, 60s pro
- ⚠️ **No WebSocket**: Use Pusher/Ably
- ⚠️ **No file system**: Use external storage
- ⚠️ **Cold starts**: First request may be slow
- ⚠️ **Connection limits**: MongoDB connection pooling required

## Next Steps

1. Convert all routes to serverless functions
2. Set up Pusher for WebSocket alternative
3. Set up Cloudinary for file uploads
4. Test locally with `vercel dev`
5. Deploy to Vercel

