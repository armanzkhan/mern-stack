//backend/server.js
const express = require("express");
const os = require("os");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// ===== Import Routes =====
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const companyRoutes = require("./routes/companyRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const roleRoutes = require("./routes/roleRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const permissionGroupRoutes = require("./routes/permissionGroupRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const managerRoutes = require("./routes/managerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const customerLedgerRoutes = require("./routes/customerLedgerRoutes");
const productImageRoutes = require("./routes/productImageRoutes");

// ===== App Setup =====
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ===== Static uploads (profile images etc.) =====
const uploadsRoot = path.join(__dirname, "uploads");
const avatarsDir = path.join(uploadsRoot, "avatars");
try {
  if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot);
  if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir);
} catch {}
app.use("/uploads", express.static(uploadsRoot));

// ===== MongoDB Connection =====
const defaultUri = "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";
const envUri = process.env.CONNECTION_STRING ? process.env.CONNECTION_STRING.trim() : "";
const mongoUri = envUri && envUri.length > 0 ? envUri : defaultUri;

// Debug: Log connection string (without password for security)
console.log("🔍 MongoDB URI:", mongoUri.replace(/:[^:@]+@/, ":****@"));
console.log("🔍 Using environment variable:", !!process.env.CONNECTION_STRING);

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "Ressichem", // Ensure correct DB casing
  })
  .then(() => console.log("✅ MongoDB connected to 'Ressichem' database"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("❌ Connection string length:", mongoUri.length);
    console.error("❌ Connection string starts with:", mongoUri.substring(0, 20));
  });

// ===== Verify & Auto-Create Collections =====
mongoose.connection.once("open", async () => {
  console.log("✅ MongoDB connection is open — verifying collections...");

  const collections = await mongoose.connection.db.listCollections().toArray();
  const existing = collections.map((c) => c.name);

  const requiredCollections = [
    "users",
    "companies",
    "customers",
    "orders",
    "products",
    "roles",
    "permissions",
    "permissiongroups",
    "notifications",
    "invoices",
    "customerledgers",
    "ledgertransactions",
    "advertisements",
  ];

  for (const name of requiredCollections) {
    if (!existing.includes(name)) {
      await mongoose.connection.db.createCollection(name);
      console.log(`🆕 Created missing collection: ${name}`);
    }
  }

  console.log("✅ All required collections verified/created successfully.");
});

// ===== Health Check =====
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/api/health/test", (req, res) =>
  res.json({ status: "ok", route: "/api/health/test", time: new Date().toISOString() })
);

// ===== API Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/permission-groups", permissionGroupRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/product-categories", categoryRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/customer-ledger", customerLedgerRoutes);
app.use("/api/product-images", productImageRoutes);

// ===== WebSocket Setup =====
const http = require("http");
const realtimeService = require("./services/realtimeService");

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0"; // Bind to all interfaces by default
const server = http.createServer(app);

// Initialize WebSocket service
realtimeService.initialize(server);

// Resolve LAN IPv4 for nicer logging
function getLanIp() {
  try {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === "IPv4" && !net.internal) return net.address;
      }
    }
  } catch {}
  return null;
}

server.listen(PORT, HOST, () => {
  const lanIp = getLanIp();
  const lines = [
    `🚀 Server running:`,
    `   • Local:    http://localhost:${PORT}`,
  ];
  if (lanIp) lines.push(`   • Network:  http://${lanIp}:${PORT}`);
  console.log(lines.join("\n"));
});
