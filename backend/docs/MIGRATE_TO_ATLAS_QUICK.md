# Quick Migration Guide: Local MongoDB → MongoDB Atlas

## 🚀 Quick Steps

### 1. Setup MongoDB Atlas (5 minutes)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Sign up (FREE)
2. Create **FREE** cluster (M0 tier)
3. Create database user → **SAVE PASSWORD**
4. Whitelist IP: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Get connection string: Click **"Connect"** → **"Connect your application"**
6. Copy connection string and add database name:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
   ```

### 2. Export Local Database (2 minutes)

```bash
# In your project root
cd C:\Users\Arman\Desktop\1theme\Ressichem

# Export database
mongodump --uri="mongodb://localhost:27017/Ressichem" --out=./mongodb-backup
```

### 3. Import to Atlas (2 minutes)

```bash
# Import to Atlas (replace with your actual connection string)
mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority" ./mongodb-backup/Ressichem
```

### 4. Update Backend (1 minute)

1. Create `backend/.env` file:
   ```env
   CONNECTION_STRING=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key-here
   JWT_REFRESH_SECRET=your-refresh-secret-key-here
   PORT=5000
   NODE_ENV=development
   ```

2. Replace `username`, `password`, and `cluster0.xxxxx` with your Atlas values

### 5. Test Connection (1 minute)

```bash
cd backend
npm start
```

Look for: `✅ MongoDB connected to 'Ressichem' database`

### 6. Verify in Atlas Dashboard

1. Go to Atlas dashboard
2. Click **"Browse Collections"**
3. Verify all collections are there with correct document counts

## ✅ Done!

Your backend is now using MongoDB Atlas instead of local MongoDB.

## 🔄 Switch Back to Local (if needed)

Comment out `CONNECTION_STRING` in `backend/.env`:
```env
# CONNECTION_STRING=mongodb+srv://...
```

The backend will automatically use: `mongodb://localhost:27017/Ressichem`

## ⚠️ Important Notes

- **Password Special Characters**: If your password has `@`, `#`, `$`, etc., URL-encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`

- **Free Tier**: 512MB storage (usually enough for development)

- **Keep Local MongoDB**: You can still use local MongoDB for development by commenting out `CONNECTION_STRING`

## 📚 Full Guide

See `SWITCH_TO_ATLAS.md` for detailed step-by-step instructions.

