import { API_CONFIG, ENDPOINTS } from "../config/constants"

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

const handleResponse = async (response) => {
  const data = await response.json()

  if (!response.ok) {
    // If unauthorized, clear local storage
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      // Only redirect if we're not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }

    throw {
      response: {
        status: response.status,
        data,
      },
    }
  }

  return data
}

const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.API_URL}${endpoint}`

  const config = {
    headers: getAuthHeaders(),
    ...options,
  }

  console.log(`🌐 API Request: ${options.method || "GET"} ${url}`)

  try {
    const response = await fetch(url, config)
    const result = await handleResponse(response)
    console.log(`✅ API Success: ${endpoint}`)
    return result
  } catch (error) {
    console.error(`❌ API Error: ${endpoint}`, error)
    throw error
  }
}

// Auth API
export const login = async (credentials) => {
  return makeRequest(ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    body: JSON.stringify(credentials),
  })
}

export const register = async (userData) => {
  return makeRequest(ENDPOINTS.AUTH.REGISTER, {
    method: "POST",
    body: JSON.stringify(userData),
  })
}

export const getCurrentUser = async () => {
  return makeRequest(ENDPOINTS.AUTH.ME)
}

// Tasks API
export const getTasks = async () => {
  return makeRequest(ENDPOINTS.TASKS.BASE)
}

export const createTask = async (taskData) => {
  return makeRequest(ENDPOINTS.TASKS.BASE, {
    method: "POST",
    body: JSON.stringify(taskData),
  })
}

export const updateTask = async (taskId, updates) => {
  return makeRequest(`${ENDPOINTS.TASKS.BASE}/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })
}

export const deleteTask = async (taskId) => {
  return makeRequest(`${ENDPOINTS.TASKS.BASE}/${taskId}`, {
    method: "DELETE",
  })
}

export const smartAssignTask = async (taskId) => {
  return makeRequest(ENDPOINTS.TASKS.SMART_ASSIGN(taskId), {
    method: "POST",
  })
}

export const resolveConflict = async (taskId, resolutionData) => {
  return makeRequest(ENDPOINTS.TASKS.RESOLVE_CONFLICT(taskId), {
    method: "POST",
    body: JSON.stringify(resolutionData),
  })
}

// Users API
export const getUsers = async () => {
  return makeRequest(ENDPOINTS.USERS.BASE)
}

// Activities API
export const getActivities = async (limit = 20) => {
  return makeRequest(`${ENDPOINTS.ACTIVITIES.BASE}?limit=${limit}`)
}
