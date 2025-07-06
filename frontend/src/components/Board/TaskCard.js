"use client"
import React from "react";
import { useState } from "react"
import { deleteTask, smartAssignTask } from "../../services/api"
import { formatDate, getPriorityColor } from "../../utils/helpers"
import { useSocket } from "../../hooks/useSocket"

const TaskCard = ({ task, users, onEdit, onRefresh, isDragging }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const socket = useSocket()

  // Add editing state management for conflict detection
  const handleEditStart = () => {
    setIsEditing(true)
    if (socket) {
      socket.emit("task-editing", { taskId: task._id })
    }
  }

  const handleEditStop = () => {
    setIsEditing(false)
    if (socket) {
      socket.emit("task-editing-stopped", { taskId: task._id })
    }
  }

  const handleCardClick = () => {
    if (!isDragging) {
      setIsFlipped(true)
      setTimeout(() => setIsFlipped(false), 3000)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(task._id)
        onRefresh()
        setShowMenu(false)
      } catch (error) {
        console.error("Failed to delete task:", error)
        alert("Failed to delete task. Please try again.")
      }
    }
  }

  const handleSmartAssign = async () => {
    try {
      await smartAssignTask(task._id)
      onRefresh()
      setShowMenu(false)
    } catch (error) {
      console.error("Failed to smart assign task:", error)
      alert("Failed to assign task. Please try again.")
    }
  }

  const handleEdit = () => {
    handleEditStart()
    onEdit()
    setShowMenu(false)
  }

  const assignedUser = users.find((user) => user.id === task.assignedTo?._id)

  // Add pulse animation for high priority tasks
  const getPulseClass = () => {
    return task.priority === "high" ? "pulse-animation" : ""
  }

  return (
    <div
      className={`task-card ${isDragging ? "dragging" : ""} ${isFlipped ? "flipped" : ""} ${getPulseClass()}`}
      onClick={handleCardClick}
    >
      <div className="card-inner">
        {/* Front of card */}
        <div className="card-front">
          <div className="card-header">
            <div
              className="priority-dot"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
              title={`${task.priority} priority`}
            ></div>

            <div className="card-menu">
              <button
                className="menu-trigger"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
              >
                ➕
              </button>

              {showMenu && (
                <div className="menu-dropdown">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit()
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSmartAssign()
                    }}
                  >
                    ⚡ Smart Assign
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete()
                    }}
                    className="delete-option"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="card-body">
            <h4 className="task-title">{task.title}</h4>
            {task.description && <p className="task-description">{task.description}</p>}
          </div>

          <div className="card-footer">
            <div className="assignee-info">
              <div className="avatar">{assignedUser ? assignedUser.name.charAt(0).toUpperCase() : "?"}</div>
              <span className="assignee-name">{assignedUser ? assignedUser.name : "Unassigned"}</span>
            </div>
            <div className="task-date">{formatDate(task.createdAt)}</div>
          </div>
        </div>

        {/* Back of card */}
        <div className="card-back">
          <div className="card-details">
            <h4>Task Details</h4>
            <div className="detail-row">
              <strong>Created by:</strong>
              <span>{task.createdBy?.name || "Unknown"}</span>
            </div>
            <div className="detail-row">
              <strong>Priority:</strong>
              <span className={`priority-badge ${task.priority}`}>{task.priority.toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <strong>Status:</strong>
              <span>{task.status.replace("-", " ").toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <strong>Last updated:</strong>
              <span>{formatDate(task.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
