import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

// ✅ Only import 'cookies' in server components or server actions
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "collaborative-todo-secret-key-2024-production-shivi-consistent"

export async function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user) {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error("❌ Token verification failed:", error)
    return null
  }
}

// ✅ Only call this in server-side functions like route handlers or server actions
export async function verifySession() {
  const cookieStore = cookies() // ✅ Don't use `await` — it's not a promise
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded) return null

  const user = {
    id: decoded.userId,
    name: "Demo User",
    email: decoded.email,
  }

  return { user, token }
}
