"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { API_CONFIG } from "../config/constants"

export const useSocket = () => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (token) {
      console.log("🔌 Connecting to socket server:", API_CONFIG.SOCKET_URL)

      const newSocket = io(API_CONFIG.SOCKET_URL, {
        transports: ["websocket", "polling"],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5,
      })

      newSocket.on("connect", () => {
        console.log("✅ Connected to socket server")
        setIsConnected(true)
        newSocket.emit("authenticate", token)
      })

      newSocket.on("disconnect", () => {
        console.log("❌ Disconnected from socket server")
        setIsConnected(false)
      })

      newSocket.on("authError", (error) => {
        console.error("❌ Socket authentication error:", error)
      })

      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error)
      })

      newSocket.on("reconnect", (attemptNumber) => {
        console.log("🔄 Reconnected after", attemptNumber, "attempts")
        setIsConnected(true)
      })

      newSocket.on("reconnect_error", (error) => {
        console.error("❌ Reconnection failed:", error)
      })

      setSocket(newSocket)

      return () => {
        console.log("🔌 Closing socket connection")
        newSocket.close()
      }
    }
  }, [])

  return socket
}
