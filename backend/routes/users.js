const express = require("express")
const { getUsers, getUserById, updateProfile } = require("../controllers/userController")
const { authenticateToken } = require("../middleware/auth")
const { validateUserId, validateUpdateProfile } = require("../middleware/validation")

const router = express.Router()

// GET /api/users
router.get("/", authenticateToken, getUsers)

// GET /api/users/:id
router.get("/:id", authenticateToken, validateUserId, getUserById)

// PATCH /api/users/profile
router.patch("/profile", authenticateToken, validateUpdateProfile, updateProfile)

module.exports = router
