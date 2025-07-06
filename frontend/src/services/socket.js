import { io } from "socket.io-client"

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  connect(token) {
    if (this.socket) {
      this.disconnect()
    }

    this.socket = io(process.env.REACT_APP_SERVER_URL || "http://localhost:5000", {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    })

    this.socket.on("connect", () => {
      console.log("Socket connected")
      this.isConnected = true
      this.socket.emit("authenticate", token)
    })

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected")
      this.isConnected = false
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }
}

export default new SocketService()
