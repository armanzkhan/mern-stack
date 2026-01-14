# Render Deployment - Quick Start Guide

## 🚀 Deploy Your Backend to Render (FREE - No Credit Card Required)

Follow these steps to deploy your backend to Render in **5 minutes**.

## ✅ Prerequisites

1. **GitHub Account** (free)
2. **Backend code** ready
3. **MongoDB Atlas connection string** ready

## 📋 Step-by-Step Guide

### Step 1: Push Your Code to GitHub

If your code is not already on GitHub:

```bash
# Navigate to your project root
cd C:\Users\Arman\Desktop\1theme\Ressichem

# Check if git is initialized
git status

# If not initialized, run:
git init
git add .
git commit -m "Initial commit - ready for Render deployment"

# Create a new repository on GitHub (github.com/new)
# Then connect it:
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

### Step 2: Sign Up for Render

1. Go to **[render.com](https://render.com)**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (recommended) or email
4. **No credit card required!**

### Step 3: Create Web Service

1. In Render dashboard, click **"New +"** (top right)
2. Select **"Web Service"**
3. If prompted, connect your GitHub account
4. Select your repository
5. Click **"Connect"**

### Step 4: Configure Your Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `ressichem-backend` (or any name you like) |
| **Region** | Choose closest to you (e.g., `Oregon (US West)`) |
| **Branch** | `main` (or `master` if that's your default branch) |
| **Root Directory** | `backend` ⚠️ **IMPORTANT!** |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | **Free** (no credit card required) |

**Important**: Make sure **Root Directory** is set to `backend`!

### Step 5: Add Environment Variables

Before clicking "Create Web Service", scroll down to **"Environment Variables"** section and add:

1. Click **"Add Environment Variable"**
2. Add each variable one by one:

```env
PORT=5000
```

```env
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-secure
```

```env
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here-make-it-very-long-and-secure
```

```env
CONNECTION_STRING=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
```

```env
ENCRYPTION_KEY=1PkGcK8xkXi8lZKQSCNgjzjJwTkEoXy08QZEVt9AqfA=
```

```env
NODE_ENV=production
```

**Important**: 
- Replace `username`, `password`, and `cluster0.xxxxx` with your actual MongoDB Atlas connection string
- If your password has special characters, URL-encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`

### Step 6: Deploy

1. Click **"Create Web Service"** (bottom of page)
2. Render will start building and deploying your app
3. Watch the build logs in real-time
4. Wait for deployment to complete (usually 2-5 minutes)

### Step 7: Get Your Backend URL

1. Once deployed, you'll see your service dashboard
2. Your service URL is displayed at the top (e.g., `https://ressichem-backend.onrender.com`)
3. Copy this URL

### Step 8: Test Your Backend

1. Visit: `https://your-app-name.onrender.com/api/health`
2. You should see: `{"status":"ok"}`

**Note**: First request might take ~30 seconds if the service was sleeping (free tier spins down after 15 minutes of inactivity).

### Step 9: Update Frontend Environment Variables

1. Go to **Vercel dashboard** (or your frontend hosting)
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   - `NEXT_PUBLIC_BACKEND_URL` = `https://your-app-name.onrender.com`
   - `NEXT_PUBLIC_API_URL` = `https://your-app-name.onrender.com`
5. **Redeploy** your frontend

### Step 10: Update CORS in Backend

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

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created (no credit card)
- [ ] Web service created
- [ ] Root directory set to `backend`
- [ ] Environment variables added
- [ ] Service deployed successfully
- [ ] Backend URL tested (`/api/health`)
- [ ] Frontend environment variables updated
- [ ] CORS updated in `backend/server.js`
- [ ] Full stack tested

## 🐛 Common Issues

### Build Fails

**Check:**
- Root Directory is set to `backend`
- Build Command is `npm install`
- Start Command is `node server.js`
- All dependencies are in `package.json`

### Service Not Starting

**Check:**
- Environment variables are set correctly
- MongoDB connection string is correct
- Check logs in Render dashboard

### Slow First Request

**This is normal!** Free tier spins down after 15 minutes. First request takes ~30 seconds to wake up.

### MongoDB Connection Error

**Check:**
- MongoDB Atlas IP whitelist includes `0.0.0.0/0` (allow from anywhere)
- Connection string is correct
- Username and password are correct

## 💡 Tips

1. **Keep Service Alive**: Use [UptimeRobot](https://uptimerobot.com) (free) to ping your service every 10 minutes
2. **Monitor Logs**: Check Render dashboard → Logs tab for real-time logs
3. **Auto-Deploy**: Every push to GitHub automatically redeploys your app
4. **Custom Domain**: You can add a custom domain in Render settings (free)

## 📚 Full Guide

For detailed troubleshooting and advanced configuration, see: **`RENDER_DEPLOYMENT.md`**

## 🎉 You're Done!

Your backend is now deployed to Render for **FREE**!

**Next Steps:**
1. Test your backend endpoints
2. Update frontend to use your Render backend URL
3. Test the full stack

---

**Need Help?**
- Render Docs: [render.com/docs](https://render.com/docs)
- Check Render dashboard for logs and status
- See `RENDER_DEPLOYMENT.md` for detailed troubleshooting

