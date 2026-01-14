# Deploy Backend to Railway (FREE)

This guide will help you deploy your backend to Railway for **FREE**.

## ✅ Railway Free Tier

- **FREE tier** with $5 credit/month
- **No credit card required** (for free tier)
- **Easy deployment** from GitHub
- **Automatic HTTPS**
- **Persistent storage**
- **Perfect for Node.js apps**

## 🚀 Step-by-Step Deployment

### Option 1: Deploy from GitHub (Recommended)

**Best for**: Version control, automatic deployments, team collaboration

#### Step 1: Push Backend to GitHub

If your backend is not already on GitHub:

```bash
# Navigate to your project root (not backend folder)
cd C:\Users\Arman\Desktop\1theme\Ressichem

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for Railway deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

**Or if you already have a GitHub repo:**
```bash
git add .
git commit -m "Add backend for Railway deployment"
git push
```

#### Step 2: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (recommended) or email
4. Authorize Railway to access your GitHub account

#### Step 3: Create New Project

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository (the one containing your `backend` folder)
4. Click **"Deploy Now"**

---

### Option 2: Deploy from Local Directory (No GitHub Required)

**Best for**: Quick testing, private projects, one-time deployments

#### Step 1: Install Railway CLI

```bash
# Install Railway CLI globally
npm install -g @railway/cli
```

#### Step 2: Login to Railway

```bash
railway login
```

This will open a browser window for authentication.

#### Step 3: Navigate to Backend Directory

```bash
cd backend
```

#### Step 4: Initialize Railway Project

```bash
railway init
```

This will:
- Create a new Railway project
- Link your local directory to Railway
- Ask you to name your project

#### Step 5: Deploy

```bash
railway up
```

This will:
- Upload your backend code to Railway
- Start the deployment process
- Show you the deployment URL

---

### Option 3: Deploy from GitHub (After Pushing)

**If you want to use GitHub but haven't pushed yet:**

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

**Example:**
```
CONNECTION_STRING=mongodb+srv://admin:MyPass123@cluster0.abc123.mongodb.net/Ressichem?retryWrites=true&w=majority
```

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

### Step 7: Get Your Backend URL

1. In Railway dashboard, click on your service
2. Go to **"Settings"** tab
3. Copy your **Railway URL** (e.g., `https://your-app.railway.app`)

## 🌐 Update Frontend Environment Variables

After getting your Railway backend URL, update your frontend (Vercel):

1. Go to Vercel dashboard
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   - `NEXT_PUBLIC_BACKEND_URL` = `https://your-app.railway.app`
   - `NEXT_PUBLIC_API_URL` = `https://your-app.railway.app`
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

Railway will automatically redeploy.

## 📋 Environment Variables Checklist

Make sure these are set in Railway:

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

2. **Railway will automatically redeploy** your app

3. **Check deployment status** in Railway dashboard

## 🐛 Troubleshooting

### Build Failures

1. **Check build logs** in Railway dashboard → Deployments tab
2. **Common issues:**
   - Missing dependencies in `package.json`
   - Build script errors
   - Node version mismatch

### MongoDB Connection Error

1. **Check `CONNECTION_STRING`** is set correctly in Railway variables
2. **Verify MongoDB Atlas IP whitelist:**
   - Go to MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` (allow from anywhere) for now
   - Or add Railway IP ranges
3. **Check MongoDB Atlas user permissions**

### App Crashes

1. **Check logs** in Railway dashboard → Deployments tab
2. **Common issues:**
   - Missing environment variables
   - MongoDB connection error
   - Port binding error

### Port Error

Railway automatically sets `PORT` environment variable. Your server should use:

```javascript
const PORT = process.env.PORT || 5000;
```

This is already configured in your `server.js`.

## 💰 Cost Management

### Free Tier Limits

- **$5 credit/month** (usually enough for small apps)
- **Automatic scaling** based on usage
- **No credit card required** (for free tier)

### Monitor Usage

1. Go to Railway dashboard
2. Click on your project
3. Check **"Usage"** tab to see current usage

### Upgrade (if needed)

If you exceed free tier:
- **Developer Plan**: $5/month (more resources)
- **Pro Plan**: $20/month (even more resources)

## 📁 File Uploads

Railway provides **persistent storage** for your `/uploads` directory. Files will persist across deployments.

**Note**: For production, consider using cloud storage (AWS S3, Cloudinary) for better scalability.

## 🎯 Complete Deployment Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │         │   Database      │
│   (Next.js)     │────────▶│   (Node.js)     │────────▶│   (MongoDB)     │
│   Vercel        │         │   Railway       │         │   MongoDB Atlas │
│   (FREE)        │         │   (FREE)        │         │   (FREE)        │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## 💡 Tips

1. **Automatic Deployments**: Railway automatically deploys on every push to your main branch
2. **Environment Variables**: Set sensitive variables in Railway dashboard, not in code
3. **Logs**: Check Railway dashboard for real-time logs
4. **Custom Domain**: You can add a custom domain in Railway settings
5. **Monitoring**: Use Railway dashboard to monitor app health and usage

## 📚 Additional Resources

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Railway Status: [status.railway.app](https://status.railway.app)

## ✅ Deployment Checklist

- [ ] Railway account created
- [ ] Project created and connected to GitHub
- [ ] Root directory set to `backend`
- [ ] Environment variables added
- [ ] App deployed successfully
- [ ] Backend URL tested (`/api/health`)
- [ ] Frontend environment variables updated
- [ ] CORS updated in `backend/server.js`
- [ ] Full stack tested

---

**Need Help?**
- Check Railway dashboard for deployment status
- Review logs in Railway dashboard → Deployments tab
- Check environment variables in Railway dashboard → Variables tab

