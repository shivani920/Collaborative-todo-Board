const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const { createServer } = require("http")
const { Server } = require("socket.io")
const { handleConnection } = require("./socket/socketHandlers")
require("dotenv").config()

const app = express()
const server = createServer(app)

// CORS configuration - MUST be before other middleware
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://collaborative-todo-board-shivi.vercel.app",
       "https://toodoboard.netlify.app/login",
    "https://toodoboard.netlify.app",
    ]

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.log("❌ CORS blocked origin:", origin)
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "X-HTTP-Method-Override",
  ],
  exposedHeaders: ["Authorization"],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false,
}

// Apply CORS FIRST - before any other middleware
app.use(cors(corsOptions))

// Handle preflight requests explicitly
app.options("*", cors(corsOptions))

// Socket.IO with matching CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://collaborative-todo-board-shivi.vercel.app",
     "https://toodoboard.netlify.app/login",
    "https://toodoboard.netlify.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
})

// Other middleware AFTER CORS
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Helmet configuration - less restrictive for development
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
)

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb+srv://shivi-24:i7%239HLa%23-sJwgUv@cluster0.esfp6h9.mongodb.net/collaborative-todo?retryWrites=true&w=majority"

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    process.exit(1)
  }
}

connectDB()

// Socket.IO connection handling
handleConnection(io)
app.set("io", io)

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - Origin: ${req.get("Origin")}`)
  next()
})

// Health check routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Collaborative Todo Board API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: "enabled",
  })
})

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  })
})

// API Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/tasks", require("./routes/tasks"))
app.use("/api/users", require("./routes/users"))
app.use("/api/activities", require("./routes/activities"))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack)

  // Handle CORS errors specifically
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy violation",
      origin: req.get("Origin"),
    })
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  console.log(`🌐 CORS enabled for:`, [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://collaborative-todo-board-shivi.vercel.app",
    "https://toodoboard.netlify.app/login",
    "https://toodoboard.netlify.app",
  ])
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("✅ Process terminated")
    mongoose.connection.close()
  })
})

process.on("unhandledRejection", (err, promise) => {
  console.log("❌ Unhandled Promise Rejection:", err.message)
  server.close(() => {
    process.exit(1)
  })
})
