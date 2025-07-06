const { verifyToken } = require("../config/jwt")
const User = require("../models/User")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    console.log("🔍 Auth Header:", authHeader)
    console.log("🎫 Token:", token ? "Present" : "Missing")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      })
    }

    try {
      const decoded = verifyToken(token)
      console.log("✅ Token decoded successfully:", { userId: decoded.userId, email: decoded.email })

      // Get user details
      const user = await User.findById(decoded.userId).select("-password")
      if (!user) {
        console.log("❌ User not found in database:", decoded.userId)
        return res.status(401).json({
          success: false,
          message: "User not found",
        })
      }

      console.log("✅ User found:", { id: user._id, name: user.name, email: user.email })

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        name: user.name,
      }

      next()
    } catch (tokenError) {
      console.log("❌ Token verification failed:", tokenError.message)
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
        error: tokenError.message,
      })
    }
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message)
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    })
  }
}

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (token) {
      try {
        const decoded = verifyToken(token)
        const user = await User.findById(decoded.userId).select("-password")

        if (user) {
          req.user = {
            userId: decoded.userId,
            email: decoded.email,
            name: user.name,
          }
        }
      } catch (error) {
        // Continue without authentication if token is invalid
        console.log("⚠️ Optional auth failed, continuing without auth:", error.message)
      }
    }

    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
}
