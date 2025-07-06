"use client"

import { useState, useEffect } from "react"

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token")
        const userData = localStorage.getItem("user")

        console.log("🔍 Auth initialization:", {
          hasToken: !!token,
          hasUserData: !!userData,
        })

        if (token && userData) {
          const parsedUser = JSON.parse(userData)
          console.log("✅ User restored from localStorage:", parsedUser.name)
          setUser(parsedUser)
        } else {
          console.log("❌ No valid auth data found")
        }
      } catch (error) {
        console.error("❌ Failed to parse user data:", error)
        // Clear corrupted data
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = (userData, token) => {
    console.log("✅ Login successful:", userData.name)
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    console.log("👋 Logging out")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  return {
    user,
    loading,
    login,
    logout,
  }
}
