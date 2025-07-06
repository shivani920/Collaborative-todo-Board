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
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL, "https://toodoboard.netlify.app/login"]
        : ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  }),
)

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL, "https://toodoboard.netlify.app/login"]
        : ["http://localhost:3000"],
    credentials: true,
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
})
app.use(limiter)

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb+srv://shivi-24:i7%239HLa%23-sJwgUv@cluster0.esfp6h9.mongodb.net/collaborative-todo?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// Socket.IO connection handling
handleConnection(io)

// Make io accessible to routes
app.set("io", io)

// Health check route
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/tasks", require("./routes/tasks"))
app.use("/api/users", require("./routes/users"))
app.use("/api/activities", require("./routes/activities"))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack)
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
  })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("✅ Process terminated")
    mongoose.connection.close()
  })
})
