const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const compression = require("compression")
const morgan = require("morgan")
const cron = require("node-cron")
require("dotenv").config()

const app = express()

// Import services
const weatherService = require("./services/weatherService")
const schemeService = require("./services/schemeService")

// Initialize whatsappService only if Twilio credentials are available
let whatsappService;
try {
  whatsappService = require("./services/whatsappService");
} catch (error) {
  console.warn("⚠️  WhatsApp service not available. Twilio credentials not configured.");
}

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
)
app.use(compression())
app.use(morgan("combined"))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
})
app.use("/api/", limiter)

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files
app.use("/uploads", express.static("uploads"))

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/kisan-mitra", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    setTimeout(connectDB, 5000) // Retry after 5 seconds
  }
}

connectDB()

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/weather", require("./routes/weather"))
app.use("/api/crops", require("./routes/crops"))
app.use("/api/market", require("./routes/market"))
app.use("/api/schemes", require("./routes/schemes"))
app.use("/api/ideas", require("./routes/ideas"))
app.use("/api/user", require("./routes/user"))
app.use("/api/community", require("./routes/community"))
app.use("/api/expert", require("./routes/expert"))
app.use("/api/doctor", require("./routes/doctor"))
app.use("/api/disease", require("./routes/disease"))
app.use("/api/videos", require("./routes/videos"))
app.use("/api/alerts", require("./routes/alerts"))
app.use("/api/whatsapp", require("./routes/whatsapp"))
app.use("/api/upload", require("./routes/upload"))
app.use("/api/assistant", require("./routes/assistant"))
app.use("/api/community", require("./routes/community"))
 

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Kisan Mitra API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      weather: "active",
      whatsapp: "active",
    },
  })
})

// Scheduled tasks
// Daily weather alerts at 6 AM
cron.schedule("0 6 * * *", async () => {
  console.log("🌤️ Running daily weather alert job...")
  try {
    await weatherService.sendDailyWeatherAlerts()
  } catch (error) {
    console.error("Weather alert job failed:", error)
  }
})

// Weekly scheme updates on Sunday at 8 AM
cron.schedule("0 8 * * 0", async () => {
  console.log("📢 Running weekly scheme update job...")
  try {
    await schemeService.updateGovernmentSchemes()
  } catch (error) {
    console.error("Scheme update job failed:", error)
  }
})

// Market price updates every 4 hours
cron.schedule("0 */4 * * *", async () => {
  console.log("📈 Running market price update job...")
  try {
    const marketService = require("./services/marketService")
    await marketService.updateMarketPrices()
  } catch (error) {
    console.error("Market price update job failed:", error)
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server Error:", error)
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.stack : "Something went wrong",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    availableEndpoints: [
      "/api/auth",
      "/api/weather",
      "/api/crops",
      "/api/market",
      "/api/schemes",
      "/api/community",
      "/api/expert",
      "/api/doctor",
      "/api/videos",
      "/api/assistant",
      "/api/community",
    ],
  })
})

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`🚀 Kisan Mitra Server running on port ${PORT}`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`)
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`)
})

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received, shutting down gracefully...`)
  server.close(() => {
    console.log("HTTP server closed")
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed")
      process.exit(0)
    })
  })
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))

module.exports = app
