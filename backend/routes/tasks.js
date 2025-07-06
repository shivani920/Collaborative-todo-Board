const express = require("express")
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  smartAssignTask,
  resolveConflict,
  reassignTask,
  bulkUpdateTasks,
  getTaskHistory,
} = require("../controllers/taskController")
const { authenticateToken } = require("../middleware/auth")
const { validateCreateTask, validateUpdateTask, validateTaskId } = require("../middleware/validation")

const router = express.Router()

// GET /api/tasks
router.get("/", authenticateToken, getTasks)

// POST /api/tasks
router.post("/", authenticateToken, validateCreateTask, createTask)

// PATCH /api/tasks/:id
router.patch("/:id", authenticateToken, validateUpdateTask, updateTask)

// DELETE /api/tasks/:id
router.delete("/:id", authenticateToken, validateTaskId, deleteTask)

// POST /api/tasks/:id/smart-assign
router.post("/:id/smart-assign", authenticateToken, validateTaskId, smartAssignTask)

// POST /api/tasks/:id/resolve-conflict
router.post("/:id/resolve-conflict", authenticateToken, validateTaskId, resolveConflict)

// POST /api/tasks/:id/reassign - New route for task reassignment
router.post("/:id/reassign", authenticateToken, validateTaskId, reassignTask)

// PATCH /api/tasks/bulk-update - New route for bulk operations
router.patch("/bulk-update", authenticateToken, bulkUpdateTasks)

// GET /api/tasks/:id/history - New route for task history
router.get("/:id/history", authenticateToken, validateTaskId, getTaskHistory)

module.exports = router
