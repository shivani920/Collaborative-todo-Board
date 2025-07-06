const { body, param, query } = require("express-validator")

// Auth validation
const validateRegister = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
]

const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
]

// Task validation
const validateCreateTask = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters")
    .custom((value) => {
      const columnNames = ["todo", "in-progress", "done", "to do", "in progress"]
      if (columnNames.includes(value.toLowerCase())) {
        throw new Error("Task title cannot match column names")
      }
      return true
    }),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("status")
    .optional()
    .isIn(["todo", "in-progress", "done"])
    .withMessage("Status must be todo, in-progress, or done"),
  body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Priority must be low, medium, or high"),
  body("assignedTo").optional().isMongoId().withMessage("Assigned user must be a valid user ID"),
]

const validateUpdateTask = [
  param("id").isMongoId().withMessage("Invalid task ID"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters")
    .custom((value) => {
      const columnNames = ["todo", "in-progress", "done", "to do", "in progress"]
      if (columnNames.includes(value.toLowerCase())) {
        throw new Error("Task title cannot match column names")
      }
      return true
    }),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("status")
    .optional()
    .isIn(["todo", "in-progress", "done"])
    .withMessage("Status must be todo, in-progress, or done"),
  body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Priority must be low, medium, or high"),
  body("assignedTo").optional().isMongoId().withMessage("Assigned user must be a valid user ID"),
]

const validateTaskId = [param("id").isMongoId().withMessage("Invalid task ID")]

// User validation
const validateUserId = [param("id").isMongoId().withMessage("Invalid user ID")]

const validateUpdateProfile = [
  body("name").optional().trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),
]

// Activity validation
const validateActivityQuery = [
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
]

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
  validateUserId,
  validateUpdateProfile,
  validateActivityQuery,
}
