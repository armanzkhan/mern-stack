# Complete Connection Setup: Frontend ↔ Backend ↔ Database

## 🔗 Connection Overview

```
Frontend (Local/Vercel) 
    ↓
Backend (Vercel: https://mern-stack-dtgy.vercel.app)
    ↓
Database (MongoDB Atlas: cluster0.qn1babq.mongodb.net/Ressichem)
```

## ✅ Step 1: Verify Backend ↔ Database Connection

### Backend Database Configuration

**Location:** `backend/api/_utils/db.js`

**Connection String:**
- Environment Variable: `MONGODB_URI` or `CONNECTION_STRING`
- Fallback: `mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority`
- Database Name: `Ressichem`

### Set Environment Variables in Vercel

1. Go to: https://vercel.com/armans-projects-616053b1/mern-stack-dtgy/settings/environment-variables

2. Add these variables for **Production**, **Preview**, and **Development**:

```
MONGODB_URI = mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority
CONNECTION_STRING = mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority
JWT_SECRET = your-jwt-secret-key-here
REFRESH_SECRET = your-refresh-secret-key-here
NODE_ENV = production
```

**Important:** Replace `your-jwt-secret-key-here` with your actual JWT secrets!

### Test Backend ↔ Database Connection

```bash
# Test from command line
curl https://mern-stack-dtgy.vercel.app/api/health

# Expected response:
# {"status":"ok","timestamp":"2025-12-09T07:43:24.040Z"}
```

If you get a response, the backend is working. To test database connection, try a real endpoint that requires DB access.

## ✅ Step 2: Verify Frontend ↔ Backend Connection

### Frontend Configuration

**File:** `frontend/.env.local` (for local development)

```env
NEXT_PUBLIC_BACKEND_URL=https://mern-stack-dtgy.vercel.app
NEXT_PUBLIC_API_URL=https://mern-stack-dtgy.vercel.app
```

**File:** `frontend/src/lib/api.ts` (updated to use `getBackendUrl()`)

### CORS Configuration

**Backend CORS:** `backend/api/index.js` line 18

```javascript
app.use(cors()); // Allows all origins - should work for localhost:3000
```

**If you need to restrict CORS, update to:**

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app',
    // Add other allowed origins
  ],
  credentials: true,
}));
```

### Test Frontend ↔ Backend Connection

1. **Start frontend locally:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open browser:** http://localhost:3000

3. **Check browser console:**
   - Should see: `[getBackendUrl] Using NEXT_PUBLIC_BACKEND_URL: https://mern-stack-dtgy.vercel.app`

4. **Test connection endpoint:**
   - Visit: http://localhost:3000/api/test-connection
   - Should show backend connection status

5. **Test login:**
   - Go to: http://localhost:3000/login
   - Try logging in
   - Check Network tab - requests should go to `https://mern-stack-dtgy.vercel.app/api/auth/login`

## ✅ Step 3: Verify All Connections End-to-End

### Test Script

Create a test file `test-all-connections.js`:

```javascript
// Test all connections
async function testConnections() {
  console.log('🔍 Testing Frontend → Backend → Database connections...\n');
  
  // Test 1: Backend Health
  try {
    const healthRes = await fetch('https://mern-stack-dtgy.vercel.app/api/health');
    const healthData = await healthRes.json();
    console.log('✅ Backend Health:', healthData);
  } catch (error) {
    console.error('❌ Backend Health Failed:', error);
  }
  
  // Test 2: Backend → Database (via a real endpoint)
  try {
    // Try to get users or products (requires DB connection)
    const dbRes = await fetch('https://mern-stack-dtgy.vercel.app/api/products', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Add token if needed
      }
    });
    console.log('✅ Backend → Database:', dbRes.status === 200 ? 'Connected' : 'Failed');
  } catch (error) {
    console.error('❌ Backend → Database Failed:', error);
  }
  
  // Test 3: Frontend → Backend (from browser console)
  console.log('\n📝 To test Frontend → Backend:');
  console.log('1. Open http://localhost:3000');
  console.log('2. Open browser console (F12)');
  console.log('3. Run: fetch("/api/test-connection").then(r => r.json()).then(console.log)');
}

testConnections();
```

## ✅ Step 4: Environment Variables Checklist

### Backend (Vercel) - Required Variables

- [ ] `MONGODB_URI` or `CONNECTION_STRING` - MongoDB connection string
- [ ] `JWT_SECRET` - Secret for JWT tokens
- [ ] `REFRESH_SECRET` - Secret for refresh tokens
- [ ] `NODE_ENV` - Set to `production`
- [ ] `ENCRYPTION_KEY` - (Optional, has fallback for dev)

### Frontend (Local `.env.local`) - Required Variables

- [x] `NEXT_PUBLIC_BACKEND_URL` - Set to `https://mern-stack-dtgy.vercel.app`
- [x] `NEXT_PUBLIC_API_URL` - Set to `https://mern-stack-dtgy.vercel.app`

### Frontend (Vercel) - Required Variables (for deployment)

- [ ] `NEXT_PUBLIC_BACKEND_URL` - Set to `https://mern-stack-dtgy.vercel.app`
- [ ] `NEXT_PUBLIC_API_URL` - Set to `https://mern-stack-dtgy.vercel.app`

## ✅ Step 5: Verify MongoDB Atlas Access

### Check MongoDB Atlas Network Access

1. Go to: https://cloud.mongodb.com/
2. Navigate to: **Network Access**
3. Ensure **0.0.0.0/0** is allowed (or add Vercel IP ranges)
4. Or add specific IP if needed

### Check MongoDB Atlas Database User

1. Go to: **Database Access**
2. Verify user: `armanzaman4_db_user` exists
3. Verify password is correct
4. Verify user has read/write permissions

## 🔧 Troubleshooting

### Issue: Backend returns 500 errors

**Check:**
1. MongoDB connection string is correct in Vercel
2. MongoDB Atlas allows connections from Vercel (0.0.0.0/0)
3. Database user has correct permissions
4. Check Vercel function logs for errors

### Issue: Frontend can't connect to backend

**Check:**
1. `.env.local` file exists and has correct URLs
2. Restart Next.js dev server after changing `.env.local`
3. Check browser console for CORS errors
4. Verify backend CORS allows `http://localhost:3000`

### Issue: CORS errors in browser

**Solution:**
Update `backend/api/index.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend.vercel.app'],
  credentials: true,
}));
```

### Issue: Database connection timeout

**Check:**
1. MongoDB Atlas cluster is running
2. Network access allows 0.0.0.0/0
3. Connection string is correct
4. Database name is correct (`Ressichem`)

## 📋 Quick Verification Checklist

- [ ] Backend deployed on Vercel: https://mern-stack-dtgy.vercel.app
- [ ] Backend health endpoint works: `/api/health`
- [ ] MongoDB environment variables set in Vercel
- [ ] Frontend `.env.local` configured
- [ ] Frontend can call backend API
- [ ] Backend can connect to MongoDB
- [ ] Login works end-to-end
- [ ] Data loads from database

## 🚀 Next Steps After Verification

1. ✅ Test locally with frontend → backend → database
2. ✅ Deploy frontend to Vercel
3. ✅ Set frontend environment variables in Vercel
4. ✅ Test production deployment
5. ✅ Monitor for any connection issues

## 📞 Test Endpoints

**Backend Health:**
```
GET https://mern-stack-dtgy.vercel.app/api/health
```

**Backend Login (test DB connection):**
```
POST https://mern-stack-dtgy.vercel.app/api/auth/login
Body: { "email": "your-email", "password": "your-password" }
```

**Frontend Test Connection:**
```
GET http://localhost:3000/api/test-connection
```

