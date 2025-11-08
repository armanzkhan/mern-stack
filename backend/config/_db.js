// backend/config/_db.js
const mongoose = require("mongoose");

const defaultUri = process.env.CONNECTION_STRING || "mongodb://localhost:27017/Ressichem";
const defaultOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function connect(uri = defaultUri, options = defaultOptions, dbName) {
  const opts = { ...options };
  if (dbName) opts.dbName = dbName;
  try {
    const conn = await mongoose.connect(uri, opts);
    console.log(`MongoDB connected to ${conn.connection.host}${dbName ? "/" + dbName : ""}`);
    return conn;
  } catch (err) {
    console.error("MongoDB connect error:", err);
    throw err;
  }
}

async function disconnect() {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (err) {
    console.error("MongoDB disconnect error:", err);
    throw err;
  }
}

module.exports = { connect, disconnect };
