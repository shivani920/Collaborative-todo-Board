// Configuration constants for the frontend
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_SERVER_URL || "http://localhost:5000",
  API_URL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  SOCKET_URL: process.env.REACT_APP_SERVER_URL || "http://localhost:5000",
  TIMEOUT: 10000, // 10 seconds
}

export const APP_CONFIG = {
  NAME: "Collaborative Todo Board",
  VERSION: "1.0.0",
  ENVIRONMENT: process.env.NODE_ENV || "development",
}

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
  },
  TASKS: {
    BASE: "/tasks",
    SMART_ASSIGN: (id) => `/tasks/${id}/smart-assign`,
    RESOLVE_CONFLICT: (id) => `/tasks/${id}/resolve-conflict`,
  },
  USERS: {
    BASE: "/users",
  },
  ACTIVITIES: {
    BASE: "/activities",
  },
}

console.log("🔧 Frontend Config:", {
  apiUrl: API_CONFIG.API_URL,
  socketUrl: API_CONFIG.SOCKET_URL,
  environment: APP_CONFIG.ENVIRONMENT,
})
