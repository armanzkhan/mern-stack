# Testing Your Vercel Deployment

## Quick Test Steps

### 1. After Redeploying, Test the Connection

Open your browser console on https://ressichem-frontend.vercel.app/ and run:

```javascript
// Check which backend URL is being used
console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

### 2. Test API Connection

In browser console:
```javascript
// Test if backend is reachable
fetch('http://143.244.157.74:5000/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ Backend connected:', data))
  .catch(err => console.error('❌ Backend connection failed:', err));
```

### 3. Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Reload the page
4. Look for API requests to `http://143.244.157.74:5000`
5. Check if they're successful (status 200) or failing (CORS errors)

### 4. Common Issues to Check

#### CORS Errors
If you see: `"Access to fetch at 'http://143.244.157.74:5000/...' from origin 'https://ressichem-frontend.vercel.app' has been blocked by CORS policy"`

**Solution**: Update your backend CORS configuration to allow:
```javascript
origin: ['https://ressichem-frontend.vercel.app']
```

#### Mixed Content Warnings
If you see: `"Mixed Content: The page was loaded over HTTPS, but requested an insecure resource"`

**Solution**: This is expected with HTTP backend. Consider:
- Using HTTPS backend (recommended)
- Or accept that some browsers may block requests

#### WebSocket Connection Failed
If WebSocket doesn't connect:
- HTTPS pages can only use `wss://` (secure WebSocket)
- Your backend at `http://143.244.157.74:5000` uses `ws://`
- This will be blocked by browsers

**Solution**: 
- Enable WSS on backend, OR
- Accept that WebSocket won't work from HTTPS frontend

## Expected Behavior

✅ **Working**: API calls should go to `http://143.244.157.74:5000`
✅ **Working**: Authentication should work
✅ **Working**: Data fetching should work
⚠️ **May not work**: WebSocket real-time features (due to HTTPS → HTTP)

## Verification Checklist

- [ ] Environment variables set in Vercel
- [ ] Redeployed after setting variables
- [ ] Backend is accessible: `curl http://143.244.157.74:5000/api/health`
- [ ] Frontend loads without errors
- [ ] API calls in Network tab show requests to `143.244.157.74:5000`
- [ ] No CORS errors in console
- [ ] Login/authentication works
- [ ] Data loads correctly

