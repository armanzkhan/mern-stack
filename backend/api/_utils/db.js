// MongoDB connection utility for Vercel serverless functions
// Uses connection pooling to reuse connections across function invocations

const mongoose = require('mongoose');

let cachedConnection = null;

const defaultUri = "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";
const envUri = process.env.CONNECTION_STRING ? process.env.CONNECTION_STRING.trim() : "";
const mongoUri = envUri && envUri.length > 0 ? envUri : defaultUri;

async function connectToDatabase() {
  // Return cached connection if available
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // Close existing connection if it exists but is not ready
  if (cachedConnection && mongoose.connection.readyState !== 1) {
    await mongoose.connection.close();
    cachedConnection = null;
  }

  // Create new connection
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "Ressichem",
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  };

  try {
    cachedConnection = await mongoose.connect(mongoUri, options);
    console.log('✅ MongoDB connected (serverless)');
    return cachedConnection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

module.exports = { connectToDatabase };

