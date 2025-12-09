# Deploy Backend to Render (FREE - No Credit Card Required)

This guide will help you deploy your backend to Render for **FREE** - no credit card required!

## ✅ Render Free Tier

- **100% FREE** - No credit card required
- **Easy deployment** from GitHub
- **Automatic HTTPS**
- **Persistent storage**
- ⚠️ **Spins down after 15 minutes** of inactivity (free tier)
- ⚠️ **Takes ~30 seconds** to wake up after inactivity

## 🚀 Step-by-Step Deployment

### Step 1: Sign Up for Render

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (recommended) or email
4. **No credit card required!**

### Step 2: Push Backend to GitHub

If your backend is not already on GitHub:

```bash
# Navigate to your project root
cd C:\Users\Arman\Desktop\1theme\Ressichem

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for Render deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

**Or if you already have a GitHub repo:**
```bash
git add .
git commit -m "Add backend for Render deployment"
git push
```

### Step 3: Create Web Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub account (if not already connected)
4. Select your repository
5. Click **"Connect"**

### Step 4: Configure Service

Fill in the service configuration:

1. **Name**: Give your service a name (e.g., `ressichem-backend`)
2. **Region**: Choose the closest region to you
3. **Branch**: `main` or `master` (your default branch)
4. **Root Directory**: `backend` ⚠️ **Important!**
5. **Runtime**: `Node`
6. **Build Command**: `npm install`
7. **Start Command**: `node server.js`
8. **Plan**: Select **"Free"** (no credit card required)

### Step 5: Add Environment Variables

Before deploying, add environment variables:

1. Scroll down to **"Environment Variables"** section
2. Click **"Add Environment Variable"**
3. Add these variables one by one:

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

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying your app
3. Watch the build logs in real-time
4. Once deployed, you'll get a URL like: `https://your-app.onrender.com`

### Step 7: Verify Deployment

1. Wait for deployment to complete (usually 2-5 minutes)
2. Click on your service in Render dashboard
3. You'll see your service URL (e.g., `https://your-app.onrender.com`)
4. Test your backend: `https://your-app.onrender.com/api/health`
5. You should see: `{"status":"ok"}`

**Note**: First request might take ~30 seconds if the service was sleeping (free tier spins down after 15 minutes of inactivity).

### Step 8: Get Your Backend URL

1. In Render dashboard, click on your service
2. Your service URL is displayed at the top
3. Copy the URL (e.g., `https://your-app.onrender.com`)

## 🌐 Update Frontend Environment Variables

After getting your Render backend URL, update your frontend (Vercel):

1. Go to Vercel dashboard
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   - `NEXT_PUBLIC_BACKEND_URL` = `https://your-app.onrender.com`
   - `NEXT_PUBLIC_API_URL` = `https://your-app.onrender.com`
5. Redeploy your frontend

## 🔧 Update CORS in Backend

Update `backend/server.js` to allow your frontend domain:

```javascript
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:3000' // for local dev
  ],
  credentials: true
}));
```

Then commit and push:
```bash
git add .
git commit -m "Update CORS for production"
git push
```

Render will automatically redeploy.

## 📋 Environment Variables Checklist

Make sure these are set in Render:

- [ ] `PORT` - Server port (5000)
- [ ] `JWT_SECRET` - JWT secret key
- [ ] `JWT_REFRESH_SECRET` - JWT refresh secret key
- [ ] `CONNECTION_STRING` - MongoDB Atlas connection string
- [ ] `ENCRYPTION_KEY` - Encryption key (if using)
- [ ] `NODE_ENV` - Set to `production`

## 🔄 Updating Your App

After making changes:

1. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Update backend"
   git push
   ```

2. **Render will automatically redeploy** your app

3. **Check deployment status** in Render dashboard

## 🐛 Troubleshooting

### Build Failures

1. **Check build logs** in Render dashboard → Logs tab
2. **Common issues:**
   - Missing dependencies in `package.json`
   - Build script errors
   - Node version mismatch
   - Root directory not set to `backend`

### Service Spins Down (Free Tier)

**This is normal for free tier:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Subsequent requests are fast
- **Solution**: Use a paid plan if you need 24/7 uptime

### MongoDB Connection Error

1. **Check `CONNECTION_STRING`** is set correctly in Render environment variables
2. **Verify MongoDB Atlas IP whitelist:**
   - Go to MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` (allow from anywhere) for now
   - Or add Render IP ranges
3. **Check MongoDB Atlas user permissions**

### App Crashes

1. **Check logs** in Render dashboard → Logs tab
2. **Common issues:**
   - Missing environment variables
   - MongoDB connection error
   - Port binding error

### Port Error

Render automatically sets `PORT` environment variable. Your server should use:

```javascript
const PORT = process.env.PORT || 5000;
```

This is already configured in your `server.js`.

### Slow First Request

**This is normal for free tier:**
- Service spins down after 15 minutes of inactivity
- First request wakes up the service (~30 seconds)
- Subsequent requests are fast
- **Solution**: Use a paid plan or keep service alive with a ping service

## 💡 Tips

1. **Free Tier Limits**: Service spins down after 15 minutes of inactivity
2. **Keep Service Alive**: Use a service like [UptimeRobot](https://uptimerobot.com) to ping your service every 10 minutes (free)
3. **Environment Variables**: Set sensitive variables in Render dashboard, not in code
4. **Logs**: Check Render dashboard for real-time logs
5. **Custom Domain**: You can add a custom domain in Render settings (free)

## 📁 File Uploads

Render provides **persistent storage** for your `/uploads` directory. Files will persist across deployments.

**Note**: For production, consider using cloud storage (AWS S3, Cloudinary) for better scalability.

## 🎯 Complete Deployment Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │         │   Database      │
│   (Next.js)     │────────▶│   (Node.js)     │────────▶│   (MongoDB)     │
│   Vercel        │         │   Render        │         │   MongoDB Atlas │
│   (FREE)        │         │   (FREE)        │         │   (FREE)        │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## 💰 Cost Summary

- **Render Free Tier**: FREE ✅ (no credit card required)
- **MongoDB Atlas**: FREE ✅ (512MB)
- **Total**: **$0/month** 🎉

## ✅ Deployment Checklist

- [ ] Render account created (no credit card)
- [ ] Backend pushed to GitHub
- [ ] Web service created in Render
- [ ] Root directory set to `backend`
- [ ] Environment variables added
- [ ] Service deployed successfully
- [ ] Backend URL tested (`/api/health`)
- [ ] Frontend environment variables updated
- [ ] CORS updated in `backend/server.js`
- [ ] Full stack tested

---

**Need Help?**
- Render Docs: [render.com/docs](https://render.com/docs)
- Render Support: [render.com/support](https://render.com/support)
- Check Render dashboard for deployment status and logs

