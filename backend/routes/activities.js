const express = require("express")
const { getActivities, getTaskActivities, cleanupActivities } = require("../controllers/activityController")
const { authenticateToken } = require("../middleware/auth")
const { validateTaskId, validateActivityQuery } = require("../middleware/validation")

const router = express.Router()

// GET /api/activities
router.get("/", authenticateToken, validateActivityQuery, getActivities)

// GET /api/activities/task/:taskId
router.get("/task/:taskId", authenticateToken, validateTaskId, getTaskActivities)

// DELETE /api/activities/cleanup
router.delete("/cleanup", authenticateToken, cleanupActivities)

module.exports = router
