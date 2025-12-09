# Backend Deployment from GitHub to Vercel

## 📋 Prerequisites

- ✅ GitHub repository: `https://github.com/armanzkhan/mern-stack.git`
- ✅ Backend code is in the `backend/` folder
- ✅ Vercel account (free tier works)

## Step 1: Prepare Your Backend Code

### 1.1 Verify Backend Structure

Make sure your backend folder has:
- ✅ `backend/api/index.js` (Vercel serverless function)
- ✅ `backend/vercel.json` (Vercel configuration)
- ✅ `backend/package.json` (dependencies)
- ✅ All route files in `backend/routes/`
- ✅ All models in `backend/models/`

### 1.2 Commit and Push to GitHub

```bash
# Navigate to your project root
cd C:\Users\Arman\Desktop\1theme\Ressichem

# Check current status
git status

# Add all backend files (if not already committed)
git add backend/

# Commit changes
git commit -m "Prepare backend for Vercel deployment"

# Push to GitHub
git push origin main
# OR if your branch is named differently:
# git push origin master
```

**Verify on GitHub:**
- Go to: https://github.com/armanzkhan/mern-stack
- Check that `backend/` folder exists
- Verify `backend/vercel.json` is present
- Verify `backend/api/index.js` exists

## Step 2: Connect GitHub Repository to Vercel

### 2.1 Create New Project in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click **"Add New..."** → **"Project"**

2. **Import Git Repository**
   - Click **"Import Git Repository"**
   - Search for: `armanzkhan/mern-stack`
   - Click **"Import"**

3. **Configure Project**
   - **Project Name:** `mern-stack-dtgy` (or your preferred name)
   - **Framework Preset:** Other (or Node.js)
   - **Root Directory:** `backend` ⚠️ **IMPORTANT: Set this to `backend`**
   - **Build Command:** Leave empty (or `npm install`)
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

### 2.2 Important Settings

**Root Directory:**
- Set to: `backend`
- This tells Vercel where your backend code is located

**Framework:**
- Select: **Other** or **Node.js**

**Build Command:**
- Leave empty (backend doesn't need building)

**Output Directory:**
- Leave empty

## Step 3: Configure Environment Variables

### 3.1 Add Environment Variables

Before deploying, add these environment variables:

1. **In Vercel Project Settings:**
   - Go to **Settings** → **Environment Variables**

2. **Add These Variables:**

   ```
   Name: MONGODB_URI
   Value: mongodb+srv://username:password@cluster.mongodb.net/Ressichem?retryWrites=true&w=majority
   Environments: Production, Preview, Development
   ```

   ```
   Name: JWT_SECRET
   Value: your-very-secure-jwt-secret-key-minimum-32-characters
   Environments: Production, Preview, Development
   ```

   ```
   Name: NODE_ENV
   Value: production
   Environments: Production, Preview, Development
   ```

3. **Click "Save"** for each variable

### 3.2 Get MongoDB URI

If you don't have it:
1. Go to MongoDB Atlas Dashboard
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your database password
6. Add `?retryWrites=true&w=majority` at the end

## Step 4: Deploy

### 4.1 Initial Deployment

1. **Click "Deploy"** button in Vercel
2. Wait for deployment to complete (2-5 minutes)
3. Vercel will show you the deployment URL

### 4.2 Verify Deployment

After deployment completes:

1. **Check Deployment URL:**
   - Should be: `https://mern-stack-dtgy.vercel.app` (or similar)
   - Note this URL - you'll need it for frontend

2. **Test Health Endpoint:**
   ```
   https://your-backend-url.vercel.app/api/health
   ```
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Check Deployment Logs:**
   - Go to **Deployments** tab
   - Click on the latest deployment
   - Check **"Functions"** tab for logs
   - Look for: `✅ MongoDB connected (serverless)`

## Step 5: Configure Custom Domain (Optional)

If you want to use a custom domain:

1. Go to **Settings** → **Domains**
2. Add your domain
3. Follow DNS configuration instructions

## Step 6: Verify Everything Works

### 6.1 Test Endpoints

```bash
# Health check
curl https://mern-stack-dtgy.vercel.app/api/health

# Should return:
# {"status":"ok","timestamp":"2025-11-26T..."}
```

### 6.2 Check Logs

1. Go to Vercel Dashboard → Your Project
2. **Deployments** → Latest deployment
3. Click **"Functions"** tab
4. Check for any errors

### 6.3 Test API Routes

Try accessing:
- `https://mern-stack-dtgy.vercel.app/api/health`
- `https://mern-stack-dtgy.vercel.app/api/health/test`

Both should work.

## Step 7: Automatic Deployments (Already Enabled)

Vercel automatically deploys when you push to GitHub:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```

2. **Vercel Auto-Deploys:**
   - Vercel detects the push
   - Automatically starts new deployment
   - You'll see it in Vercel dashboard

## Troubleshooting

### Issue: "Root Directory not found"
**Solution:** Make sure Root Directory is set to `backend` in Vercel project settings

### Issue: "Function not found"
**Solution:** 
- Verify `backend/api/index.js` exists
- Check `backend/vercel.json` routes configuration
- Ensure routes start with `/api/`

### Issue: "Database connection failed"
**Solution:**
- Verify `MONGODB_URI` is set correctly
- Check MongoDB Atlas network access (allow `0.0.0.0/0`)
- Verify database credentials

### Issue: "Build failed"
**Solution:**
- Check `backend/package.json` exists
- Verify all dependencies are listed
- Check Vercel build logs for specific errors

### Issue: "404 on all routes"
**Solution:**
- Verify `backend/vercel.json` has correct routes
- Check that `backend/api/index.js` exports the handler
- Ensure Root Directory is set to `backend`

## Quick Reference

### Git Commands
```bash
# Check status
git status

# Add changes
git add backend/

# Commit
git commit -m "Your message"

# Push to GitHub
git push origin main
```

### Vercel Settings
- **Root Directory:** `backend`
- **Framework:** Other / Node.js
- **Build Command:** (empty)
- **Output Directory:** (empty)
- **Install Command:** `npm install`

### Environment Variables
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
NODE_ENV=production
```

### Test URLs
- Health: `https://mern-stack-dtgy.vercel.app/api/health`
- Health Test: `https://mern-stack-dtgy.vercel.app/api/health/test`

## Next Steps

After backend is deployed:
1. ✅ Note your backend URL (e.g., `https://mern-stack-dtgy.vercel.app`)
2. ✅ Test health endpoint
3. ✅ Configure frontend to use this backend URL
4. ✅ Deploy frontend (separate Vercel project)

## Success Checklist

- [ ] Backend code pushed to GitHub
- [ ] Vercel project created and connected to GitHub
- [ ] Root Directory set to `backend`
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health endpoint works
- [ ] No errors in Vercel logs
- [ ] Database connects successfully

