# Vercel Environment Variables Verification

## Current Setup
- **Frontend**: https://ressichem-frontend.vercel.app/
- **Backend**: http://143.244.157.74:5000/

## Required Environment Variables in Vercel

Make sure these are set in your **Vercel Dashboard** → **Settings** → **Environment Variables**:

### For Production, Preview, and Development:

```
NEXT_PUBLIC_BACKEND_URL = http://143.244.157.74:5000
NEXT_PUBLIC_API_URL = http://143.244.157.74:5000
```

## Important: Mixed Content Warning

⚠️ **Your frontend is HTTPS but backend is HTTP** - This can cause issues:

1. **CORS Issues**: Browsers may block HTTP requests from HTTPS pages
2. **WebSocket Issues**: HTTPS pages cannot connect to `ws://` (only `wss://`)
3. **Mixed Content**: Modern browsers block mixed content by default

## Solutions

### Option 1: Use HTTPS Backend (Recommended)
If your backend server supports HTTPS, update the environment variables:

```
NEXT_PUBLIC_BACKEND_URL = https://143.244.157.74:5000
NEXT_PUBLIC_API_URL = https://143.244.157.74:5000
NEXT_PUBLIC_WS_URL = wss://143.244.157.74:5000/ws
```

### Option 2: Use a Reverse Proxy (Nginx/Cloudflare)
Set up a reverse proxy with SSL certificate to forward requests to your backend.

### Option 3: Configure Backend CORS
Make sure your backend allows requests from `https://ressichem-frontend.vercel.app`:

```javascript
// In your backend CORS configuration
const corsOptions = {
  origin: [
    'https://ressichem-frontend.vercel.app',
    'http://localhost:3000',
    // Add other allowed origins
  ],
  credentials: true,
};
```

## Verification Steps

### 1. Check Environment Variables in Vercel
1. Go to https://vercel.com
2. Select your `ressichem-frontend` project
3. Go to **Settings** → **Environment Variables**
4. Verify `NEXT_PUBLIC_BACKEND_URL` is set to `http://143.244.157.74:5000`
5. Make sure it's enabled for **Production**, **Preview**, and **Development**

### 2. Redeploy After Setting Variables
After adding/updating environment variables:
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### 3. Test the Connection
Open your browser console on https://ressichem-frontend.vercel.app/ and check:

```javascript
// In browser console, check which backend URL is being used
console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
```

Or check the Network tab to see if API requests are going to `http://143.244.157.74:5000`

### 4. Check for Errors
Look for these errors in browser console:
- **CORS errors**: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
- **Mixed content errors**: "Mixed Content: The page was loaded over HTTPS, but requested an insecure..."
- **WebSocket errors**: "WebSocket connection failed"

## Troubleshooting

### If API calls are failing:
1. Check browser console for CORS errors
2. Verify backend CORS configuration allows `https://ressichem-frontend.vercel.app`
3. Check if backend is accessible: `curl http://143.244.157.74:5000/api/health`

### If WebSocket is not connecting:
1. HTTPS pages can only use `wss://` (secure WebSocket)
2. If backend doesn't support WSS, WebSocket won't work from HTTPS frontend
3. Consider using polling or upgrading backend to support WSS

### If environment variables aren't working:
1. Make sure variable names start with `NEXT_PUBLIC_` (required for client-side access)
2. Redeploy after adding variables (they're only available in new builds)
3. Check Vercel build logs to verify variables are being used

