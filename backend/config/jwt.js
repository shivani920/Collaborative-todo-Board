const jwt = require("jsonwebtoken")

// Use a consistent JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "collaborative-todo-secret-key-2024-development"
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d"

console.log("🔑 JWT Secret configured:", JWT_SECRET.substring(0, 10) + "...")

const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    })
    console.log("✅ Token generated successfully for user:", payload.userId)
    return token
  } catch (error) {
    console.error("❌ Token generation failed:", error.message)
    throw error
  }
}

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log("✅ Token verified successfully for user:", decoded.userId)
    return decoded
  } catch (error) {
    console.error("❌ Token verification failed:", error.message)
    throw new Error("Invalid token: " + error.message)
  }
}

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET,
}
