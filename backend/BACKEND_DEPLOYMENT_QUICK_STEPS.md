# Backend Deployment - Quick Steps

## 🎯 Your GitHub Repo
`https://github.com/armanzkhan/mern-stack.git`

## 📝 Step-by-Step

### Step 1: Push Code to GitHub

```bash
cd C:\Users\Arman\Desktop\1theme\Ressichem
git add backend/
git commit -m "Backend ready for Vercel"
git push origin main
```

### Step 2: Create Vercel Project

1. Go to: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import: `armanzkhan/mern-stack`
4. **IMPORTANT Settings:**
   - **Root Directory:** `backend` ⚠️
   - **Framework:** Other
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)

### Step 3: Set Environment Variables

Before deploying, add in **Settings → Environment Variables:**

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Ressichem?retryWrites=true&w=majority
JWT_SECRET=your-secure-secret-key
NODE_ENV=production
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-5 minutes
3. Get your URL: `https://mern-stack-dtgy.vercel.app`

### Step 5: Test

Visit: `https://mern-stack-dtgy.vercel.app/api/health`
Should see: `{"status":"ok","timestamp":"..."}`

## ✅ Done!

Your backend is now deployed. Use the URL for frontend configuration.

