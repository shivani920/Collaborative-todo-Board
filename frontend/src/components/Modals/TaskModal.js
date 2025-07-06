"use client"
import React from "react";
import { useState, useEffect } from "react"
import { createTask, updateTask } from "../../services/api"
import { useSocket } from "../../hooks/useSocket"
const TaskModal = ({ task, users, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [version, setVersion] = useState(task?.version || 1)
  const [conflictDetected, setConflictDetected] = useState(false)
  const socket = useSocket()

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        assignedTo: task.assignedTo?._id || "",
      })
    }
  }, [task])

  useEffect(() => {
    if (task && socket) {
      // Listen for conflicts on this specific task
      socket.on("conflict", (conflictData) => {
        if (conflictData.taskId === task._id) {
          setConflictDetected(true)
        }
      })

      // Notify others that we're editing this task
      socket.emit("task-editing", { taskId: task._id })

      return () => {
        socket.off("conflict")
        socket.emit("task-editing-stopped", { taskId: task._id })
      }
    }
  }, [task, socket])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required"
    } else if (formData.title.trim().length > 100) {
      newErrors.title = "Title cannot exceed 100 characters"
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters"
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const taskData = {
        ...formData,
        assignedTo: formData.assignedTo || null,
        version: version, // Include version for conflict detection
      }

      let response
      if (task) {
        response = await updateTask(task._id, taskData)
      } else {
        response = await createTask(taskData)
      }

      if (response.success) {
        onSave()
      } else if (response.conflict) {
        setConflictDetected(true)
        setErrors({ general: "Conflict detected! Another user modified this task." })
      } else {
        setErrors({ general: response.message || "Failed to save task" })
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setConflictDetected(true)
        setErrors({ general: "Conflict detected! Another user modified this task." })
      } else {
        setErrors({
          general: error.response?.data?.message || "Something went wrong. Please try again.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Add conflict warning if detected
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? "Edit Task" : "Create New Task"}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {conflictDetected && (
            <div className="conflict-warning">
              <span className="warning-icon">⚠️</span>
              <div>
                <strong>Conflict Detected!</strong>
                <p>Another user has modified this task. Please refresh and try again.</p>
              </div>
            </div>
          )}

          {errors.general && (
            <div className="error-alert">
              <span className="error-icon">⚠</span>
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`form-input ${errors.title ? "error" : ""}`}
              placeholder="Enter task title"
              disabled={isLoading}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`form-textarea ${errors.description ? "error" : ""}`}
              placeholder="Enter task description"
              rows="3"
              disabled={isLoading}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select"
                disabled={isLoading}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="form-select"
                disabled={isLoading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="assignedTo">Assign To</label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleInputChange}
              className="form-select"
              disabled={isLoading}
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={`save-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : task ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal
