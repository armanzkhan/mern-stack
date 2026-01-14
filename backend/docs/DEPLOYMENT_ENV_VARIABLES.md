# Environment Variables for Vercel Deployment

## Backend Vercel Project Environment Variables

Set these in your **backend Vercel project** (Settings → Environment Variables):

```bash
# MongoDB Connection (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Ressichem?retryWrites=true&w=majority
# OR use CONNECTION_STRING (both work)
CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/Ressichem?retryWrites=true&w=majority

# JWT Secret (REQUIRED)
JWT_SECRET=your-very-secure-jwt-secret-key-minimum-32-characters

# Node Environment
NODE_ENV=production

# Optional: Firebase (if using push notifications)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Optional: CORS Origins (comma-separated)
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-frontend.vercel.app
```

## Frontend Vercel Project Environment Variables

Set these in your **frontend Vercel project** (Settings → Environment Variables):

```bash
# Backend API URL (REQUIRED - Replace with your actual backend Vercel URL)
NEXT_PUBLIC_BACKEND_URL=https://your-backend-project.vercel.app
# OR use NEXT_PUBLIC_API_URL (both work, but NEXT_PUBLIC_BACKEND_URL takes priority)
NEXT_PUBLIC_API_URL=https://your-backend-project.vercel.app

# Node Environment
NODE_ENV=production
```

## Important Notes

1. **Replace `your-backend-project.vercel.app`** with your actual backend Vercel deployment URL
2. **Replace `your-frontend-project.vercel.app`** with your actual frontend Vercel deployment URL
3. **MongoDB URI** should be your MongoDB Atlas connection string
4. **JWT_SECRET** should be a strong, random string (at least 32 characters)
5. All variables with `NEXT_PUBLIC_` prefix are exposed to the browser
6. Variables without `NEXT_PUBLIC_` are server-side only

## How to Find Your Vercel URLs

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Your production URL will be shown (e.g., `your-project.vercel.app`)

## Verification Steps

After setting environment variables:

1. **Backend:**
   - Visit: `https://your-backend-project.vercel.app/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend:**
   - Visit: `https://your-frontend-project.vercel.app/api/test-connection`
   - Should show connection status to backend

3. **Test Login:**
   - Try logging in through the frontend
   - Check browser console for any errors
   - Verify API calls work

## Common Mistakes

❌ **Don't use localhost URLs in production**
```bash
# WRONG
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

✅ **Use your Vercel backend URL**
```bash
# CORRECT
NEXT_PUBLIC_BACKEND_URL=https://your-backend-project.vercel.app
```

❌ **Don't forget the `NEXT_PUBLIC_` prefix for browser-accessible vars**
```bash
# WRONG (won't work in browser)
BACKEND_URL=https://your-backend-project.vercel.app
```

✅ **Use `NEXT_PUBLIC_` prefix**
```bash
# CORRECT
NEXT_PUBLIC_BACKEND_URL=https://your-backend-project.vercel.app
```

## After Setting Variables

1. **Redeploy both projects** in Vercel (or wait for automatic redeploy)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Test the connection** using the verification steps above

