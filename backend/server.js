require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const uploadRoutes = require("./routes/upload");
const seoRoutes = require("./routes/seo");
const bannerRoutes = require("./routes/banners");
const backupRoutes = require("./routes/backup");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS must be before other middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const isProduction = process.env.NODE_ENV === "production";
const isHttps = process.env.FRONTEND_URL?.startsWith("https") || false;

app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your77gff99-hhjj88-mmmmmmn-here-12345",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isHttps, // Set to true for HTTPS, false for HTTP
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: isHttps ? "none" : "lax", // 'none' for HTTPS cross-site, 'lax' for HTTP
    },
  })
);

// Ensure static directories exist
const staticDirs = ["static/images", "static/dist"];
staticDirs.forEach((dir) => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Routes
app.use(authRoutes);
app.use(productRoutes);
app.use(uploadRoutes);
app.use(seoRoutes);
app.use(bannerRoutes);
app.use(backupRoutes);

// Serve static images
app.use(
  "/static/images",
  express.static(path.join(__dirname, "static/images"))
);

// Serve React frontend (for production)
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "static/dist");

  // Serve static files from React build
  app.use(express.static(distPath));

  // Serve React app for all routes (React Router handles routing)
  app.get("*", (req, res) => {
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res
        .status(404)
        .json({ error: "Frontend not found. Please build the React app." });
    }
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
});

module.exports = app;
