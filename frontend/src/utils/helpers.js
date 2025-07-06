// Date formatting utilities
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.abs(now - date) / 36e5

  if (diffInHours < 24) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } else if (diffInHours < 168) {
    // Less than a week
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }
}

export const timeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return "Just now"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  } else {
    return formatDate(dateString)
  }
}

// Priority color utilities
export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
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

// Status color utilities
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
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

// String utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

export const capitalizeFirst = (str) => {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Validation utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

// Local storage utilities
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage:`, error)
    return defaultValue
  }
}

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing to localStorage:`, error)
  }
}

// Debounce utility
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}
