const express = require("express")
const { register, login, getCurrentUser } = require("../controllers/authController")
const { authenticateToken } = require("../middleware/auth")
const { validateRegister, validateLogin } = require("../middleware/validation")

const router = express.Router()

// POST /api/auth/register
router.post("/register", validateRegister, register)

// POST /api/auth/login
router.post("/login", validateLogin, login)

// GET /api/auth/me
router.get("/me", authenticateToken, getCurrentUser)

module.exports = router
