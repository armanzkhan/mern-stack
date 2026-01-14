# Vercel Backend Deployment Guide

## ✅ Conversion Complete!

Your Express backend has been converted to Vercel serverless functions. Here's what was done:

### Created Files

1. **MongoDB Connection Utility** (`api/_utils/db.js`)
   - Handles connection pooling for serverless functions
   - Reuses connections across invocations

2. **Express Router Adapter** (`api/_utils/expressRouter.js`)
   - Converts Express routers to Vercel serverless functions
   - Handles CORS, authentication, and database connections

3. **Handler Utility** (`api/_utils/handler.js`)
   - Wraps individual controllers for serverless use
   - Handles authentication and database connections

4. **Serverless Functions** (`api/**/index.js`)
   - All routes converted to serverless functions
   - Auth routes have individual functions for better performance

5. **Vercel Configuration** (`vercel.json`)
   - Routes configuration
   - Function settings

## 🚀 Deployment Steps

### 1. Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
cd backend
vercel login
```

### 3. Test Locally

```bash
vercel dev
```

This will start a local server that mimics Vercel's serverless environment.

### 4. Deploy to Vercel

**Option A: Via CLI**
```bash
vercel --prod
```

**Option B: Via Dashboard (Recommended)**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Set **Root Directory** to `backend`
4. Vercel will auto-detect the configuration

### 5. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
CONNECTION_STRING=mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
NODE_ENV=production
```

### 6. Get Your Backend URL

After deployment, Vercel will provide a URL like:
- `https://your-backend.vercel.app`

## ⚠️ Important Limitations

### 1. WebSocket Support

Vercel doesn't support WebSocket. You need an alternative:

**Option: Pusher (Recommended)**
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

**Set in Vercel Environment Variables:**
```
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=your-cluster
```

### 2. File Uploads

Vercel doesn't support file system storage. Use external storage:

**Option: Cloudinary (Recommended)**
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

**Set in Vercel Environment Variables:**
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Execution Time Limits

- **Free tier**: 10 seconds per function
- **Pro tier**: 60 seconds per function

If your functions exceed this, consider:
- Optimizing database queries
- Breaking down complex operations
- Using background jobs for long-running tasks

### 4. Cold Starts

First request after inactivity may be slow (1-3 seconds). This is normal for serverless functions.

## 📝 Next Steps

1. **Deploy to Vercel** (follow steps above)
2. **Set up Pusher** for WebSocket alternative
3. **Set up Cloudinary** for file uploads
4. **Update frontend** to use Vercel backend URL
5. **Test all endpoints** to ensure they work

## 🔧 Troubleshooting

### Function Timeout

If functions timeout:
- Check execution time in Vercel logs
- Optimize database queries
- Consider upgrading to Pro tier

### Database Connection Issues

- Check `CONNECTION_STRING` is set correctly
- Verify MongoDB Atlas allows connections from Vercel IPs
- Check connection pooling settings

### CORS Issues

- CORS is handled in the adapter
- If issues persist, check frontend URL is allowed

## 📚 Resources

- [Vercel Serverless Functions Docs](https://vercel.com/docs/functions)
- [Pusher Documentation](https://pusher.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

