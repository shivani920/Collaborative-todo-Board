const { verifyToken } = require("../config/jwt")
const User = require("../models/User")

const handleConnection = (io) => {
  io.on("connection", async (socket) => {
    console.log("🔌 User connected:", socket.id)

    // Handle authentication
    socket.on("authenticate", async (token) => {
      try {
        console.log("🔐 Socket authentication attempt for:", socket.id)

        if (!token) {
          console.log("❌ No token provided for socket:", socket.id)
          socket.emit("authError", "No token provided")
          return
        }

        const decoded = verifyToken(token)
        const user = await User.findById(decoded.userId).select("-password")

        if (user) {
          socket.userId = user._id.toString()
          socket.userName = user.name
          socket.userEmail = user.email

          // Join the board room
          socket.join("board")

          // Notify others that user joined
          socket.to("board").emit("userJoined", {
            userId: socket.userId,
            userName: socket.userName,
          })

          console.log(`✅ User ${user.name} authenticated and joined board`)
          socket.emit("authenticated", { success: true })
        } else {
          console.log("❌ User not found for socket:", socket.id)
          socket.emit("authError", "User not found")
        }
      } catch (error) {
        console.error("❌ Socket authentication error:", error.message)
        socket.emit("authError", "Invalid token: " + error.message)
      }
    })

    // Handle joining board
    socket.on("join-board", (data) => {
      socket.join("board")
      console.log(`📋 Socket ${socket.id} joined board`)
    })

    // Handle task editing (for conflict detection)
    socket.on("task-editing", (data) => {
      socket.to("board").emit("user-editing-task", {
        taskId: data.taskId,
        userId: socket.userId,
        userName: socket.userName,
      })
    })

    // Handle task editing stopped
    socket.on("task-editing-stopped", (data) => {
      socket.to("board").emit("user-stopped-editing-task", {
        taskId: data.taskId,
        userId: socket.userId,
      })
    })

    // Handle typing indicators
    socket.on("typing", (data) => {
      socket.to("board").emit("user-typing", {
        taskId: data.taskId,
        userId: socket.userId,
        userName: socket.userName,
      })
    })

    socket.on("stop-typing", (data) => {
      socket.to("board").emit("user-stopped-typing", {
        taskId: data.taskId,
        userId: socket.userId,
      })
    })

    // Handle cursor position (for collaborative editing)
    socket.on("cursor-position", (data) => {
      socket.to("board").emit("user-cursor-position", {
        taskId: data.taskId,
        userId: socket.userId,
        userName: socket.userName,
        position: data.position,
      })
    })

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("🔌 User disconnected:", socket.id)

      if (socket.userId) {
        // Notify others that user left
        socket.to("board").emit("userLeft", {
          userId: socket.userId,
          userName: socket.userName,
        })
      }
    })

    // Handle errors
    socket.on("error", (error) => {
      console.error("❌ Socket error:", error)
    })
  })
}

module.exports = {
  handleConnection,
}

