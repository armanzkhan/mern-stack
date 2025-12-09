# Backend Deployment Guide - Railway (FREE)

Your backend needs to be deployed separately from the frontend. **Railway** is recommended for FREE deployment.

## ✅ Railway Free Tier

- **FREE tier** with $5 credit/month
- **No credit card required** (for free tier)
- **Easy deployment** from GitHub
- **Automatic HTTPS**
- **Persistent storage**
- **Perfect for Node.js apps**

## 🚀 Quick Deployment Steps

### Step 1: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (recommended) or email
4. Authorize Railway to access your GitHub account

### Step 2: Create New Project

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository (the one containing your `backend` folder)
4. Click **"Deploy Now"**

### Step 3: Configure Project

1. Railway will detect your project
2. Click on the service that was created
3. Go to **"Settings"** tab
4. Set **Root Directory** to `backend`:
   - Scroll down to **"Source"** section
   - Set **Root Directory**: `backend`
   - Click **"Save"**

### Step 4: Add Environment Variables

1. In your service settings, go to **"Variables"** tab
2. Add these environment variables:

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-secure
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here-make-it-very-long-and-secure
CONNECTION_STRING=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
ENCRYPTION_KEY=1PkGcK8xkXi8lZKQSCNgjzjJwTkEoXy08QZEVt9AqfA=
NODE_ENV=production
```

**Important**: 
- Replace `username`, `password`, and `cluster0.xxxxx` with your actual MongoDB Atlas connection string
- If your password has special characters (`@`, `#`, `$`, etc.), URL-encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`

### Step 5: Deploy

1. Railway will automatically detect your `package.json` and start building
2. Watch the **"Deployments"** tab for build progress
3. Once deployed, Railway will provide a URL like: `https://your-app.railway.app`

### Step 6: Verify Deployment

1. Click on your service
2. Go to **"Settings"** tab
3. Under **"Domains"**, you'll see your Railway URL
4. Test your backend: `https://your-app.railway.app/api/health`
5. You should see: `{"status":"ok"}`

### Step 7: Update Frontend

After getting your Railway backend URL, update your frontend (Vercel):

1. Go to Vercel dashboard
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   - `NEXT_PUBLIC_BACKEND_URL` = `https://your-app.railway.app`
   - `NEXT_PUBLIC_API_URL` = `https://your-app.railway.app`
5. Redeploy your frontend

## 📚 Detailed Guide

For a complete step-by-step guide with troubleshooting, see: **`RAILWAY_DEPLOYMENT.md`**

## Important Notes

### MongoDB Connection
- Use **MongoDB Atlas** (free tier) for production
- Update `CONNECTION_STRING` in environment variables
- See `MONGODB_ATLAS_SETUP.md` or `../DATABASE_DEPLOYMENT.md` for detailed setup
- **Quick Setup**:
  1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
  2. Create free M0 cluster
  3. Create database user
  4. Whitelist IP addresses (0.0.0.0/0 for production)
  5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/Ressichem?retryWrites=true&w=majority`
  6. Set as `CONNECTION_STRING` environment variable

### CORS Configuration
Update `server.js` to allow your Vercel frontend domain:
```javascript
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:3000' // for local dev
  ],
  credentials: true
}));
```

### File Uploads
- Railway provides persistent storage for your `/uploads` directory
- For production, consider using cloud storage (AWS S3, Cloudinary) for better scalability

## 🔄 Updating Your App

After making changes:

1. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Update backend"
   git push
   ```

2. **Railway will automatically redeploy** your app

3. **Check deployment status** in Railway dashboard

## Environment Variables Checklist

- [ ] `PORT` - Server port (usually 5000)
- [ ] `JWT_SECRET` - Secret for JWT tokens
- [ ] `CONNECTION_STRING` - MongoDB connection string
- [ ] `ENCRYPTION_KEY` - Encryption key
- [ ] `NODE_ENV` - Set to `production`

## After Deployment

1. **Test Backend**: Visit `https://your-backend-url.com/api/health` (if you have a health endpoint)
2. **Update Frontend**: Set `NEXT_PUBLIC_BACKEND_URL` in Vercel
3. **Update CORS**: Add Vercel domain to backend CORS whitelist
4. **Test Full Stack**: Test frontend → backend communication

