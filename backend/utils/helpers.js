const crypto = require("crypto")

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString("hex")
}

// Format date for display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Calculate time ago
const timeAgo = (date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000)

  if (diffInSeconds < 60) {
    return "Just now"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? "s" : ""} ago`
  } else {
    return formatDate(date)
  }
}

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Sanitize string (remove HTML tags)
const sanitizeString = (str) => {
  if (typeof str !== "string") return str
  return str.replace(/<[^>]*>/g, "").trim()
}

// Generate task priority color
const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "#ef4444"
    case "medium":
      return "#f59e0b"
    case "low":
      return "#10b981"
    default:
      return "#6b7280"
  }
}

// Generate status color
const getStatusColor = (status) => {
  switch (status) {
    case "todo":
      return "#ef4444"
    case "in-progress":
      return "#f59e0b"
    case "done":
      return "#10b981"
    default:
      return "#6b7280"
  }
}

// Paginate array
const paginate = (array, page, limit) => {
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      current: page,
      total: Math.ceil(array.length / limit),
      hasNext: endIndex < array.length,
      hasPrev: page > 1,
      totalItems: array.length,
    },
  }
}

// Deep merge objects
const deepMerge = (target, source) => {
  const result = { ...target }

  for (const key in source) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }

  return result
}

// Error response helper
const errorResponse = (message, statusCode = 500, details = null) => {
  return {
    success: false,
    message,
    statusCode,
    details,
    timestamp: new Date().toISOString(),
  }
}

// Success response helper
const successResponse = (data, message = "Success") => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }
}

module.exports = {
  generateRandomString,
  formatDate,
  timeAgo,
  isValidEmail,
  sanitizeString,
  getPriorityColor,
  getStatusColor,
  paginate,
  deepMerge,
  errorResponse,
  successResponse,
}
