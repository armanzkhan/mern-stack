# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster

## Step 2: Get Your Connection String
1. In your MongoDB Atlas dashboard, click "Connect"
2. Choose "Connect your application"
3. Copy the connection string (it will look like this):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/ressichem?retryWrites=true&w=majority
   ```

## Step 3: Create .env File
Create a `.env` file in the `backend` directory with the following content:

```env
# MongoDB Atlas Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ressichem?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-secure
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here-make-it-very-long-and-secure

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Step 4: Update Your Connection String
Replace the following in your `.env` file:
- `username` with your MongoDB Atlas username
- `password` with your MongoDB Atlas password
- `cluster` with your actual cluster name
- `ressichem` with your desired database name

## Step 5: Restart Your Backend Server
After creating the `.env` file, restart your backend server:
```bash
cd backend
npm start
```

## Step 6: Verify Connection
Check the console output for "MongoDB connected" message.

## Important Notes:
- Make sure to add your IP address to the MongoDB Atlas whitelist
- Use strong passwords for JWT secrets
- Never commit your `.env` file to version control
- The `.env` file should be in the `backend` directory, not the root directory
