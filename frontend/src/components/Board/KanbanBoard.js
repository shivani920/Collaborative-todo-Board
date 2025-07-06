"use client"
import React from "react";
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import TaskColumn from "./TaskColumn"
import TaskModal from "../Modals/TaskModal"
import ConflictModal from "../Modals/ConflictModal"
import ActivityPanel from "../Panels/ActivityPanel"
import Header from "../Common/Header"
import { getTasks, getUsers, updateTask } from "../../services/api"
import { useSocket } from "../../hooks/useSocket"
import "../../styles/board.css"
// Add drag and drop functionality and real-time sync
import { DragDropContext } from "react-beautiful-dnd"

// Update the component to use react-beautiful-dnd for better drag and drop
const KanbanBoard = () => {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [conflictData, setConflictData] = useState(null)
  const [showActivityPanel, setShowActivityPanel] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])

  const navigate = useNavigate()
  const socket = useSocket()

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (socket) {
      // Listen for real-time updates
      socket.on("taskCreated", handleTaskCreated)
      socket.on("taskUpdated", handleTaskUpdated)
      socket.on("taskDeleted", handleTaskDeleted)
      socket.on("conflict", handleConflict)

      // Join the board room
      socket.emit("join-board")

      return () => {
        socket.off("taskCreated")
        socket.off("taskUpdated")
        socket.off("taskDeleted")
        socket.off("conflict")
      }
    }
  }, [socket])

  // Add online users tracking
  useEffect(() => {
    if (socket) {
      socket.on("userJoined", (user) => {
        setOnlineUsers((prev) => [...prev.filter((u) => u.userId !== user.userId), user])
      })

      socket.on("userLeft", (user) => {
        setOnlineUsers((prev) => prev.filter((u) => u.userId !== user.userId))
      })

      socket.on("onlineUsers", (users) => {
        setOnlineUsers(users)
      })

      return () => {
        socket.off("userJoined")
        socket.off("userLeft")
        socket.off("onlineUsers")
      }
    }
  }, [socket])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [tasksResponse, usersResponse] = await Promise.all([getTasks(), getUsers()])

      if (tasksResponse.success) {
        setTasks(tasksResponse.tasks)
      }

      if (usersResponse.success) {
        setUsers(usersResponse.users)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
      setError("Failed to load board data")
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev])
  }

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) => prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)))
  }

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((task) => task._id !== taskId))
  }

  const handleConflict = (conflict) => {
    setConflictData(conflict)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const openTaskModal = (task = null) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const closeTaskModal = () => {
    setIsTaskModalOpen(false)
    setEditingTask(null)
  }

  const handleTaskSaved = () => {
    closeTaskModal()
    loadInitialData() // Refresh data
  }

  const handleConflictResolved = () => {
    setConflictData(null)
    loadInitialData() // Refresh data
  }

  if (loading) {
    return (
      <div className="board-loading">
        <div className="loading-spinner"></div>
        <p>Loading your workspace...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="board-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={loadInitialData} className="retry-button">
          Try Again
        </button>
      </div>
    )
  }

  const todoTasks = tasks.filter((task) => task.status === "todo")
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress")
  const doneTasks = tasks.filter((task) => task.status === "done")

  // Add drag and drop handler
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const newStatus = destination.droppableId
    const taskId = draggableId

    try {
      await updateTask(taskId, { status: newStatus })
      // Real-time update will be handled by socket
    } catch (error) {
      console.error("Failed to move task:", error)
      // Revert the optimistic update
      loadInitialData()
    }
  }

  // Wrap the kanban board with DragDropContext
  return (
    <div className="kanban-container">
      <Header
        onAddTask={() => openTaskModal()}
        onToggleActivity={() => setShowActivityPanel(!showActivityPanel)}
        onLogout={handleLogout}
        showActivityPanel={showActivityPanel}
        onlineUsers={onlineUsers}
      />

      <div className="kanban-content">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            <TaskColumn
              title="To Do"
              status="todo"
              tasks={todoTasks}
              users={users}
              onTaskEdit={openTaskModal}
              onRefresh={loadInitialData}
            />

            <TaskColumn
              title="In Progress"
              status="in-progress"
              tasks={inProgressTasks}
              users={users}
              onTaskEdit={openTaskModal}
              onRefresh={loadInitialData}
            />

            <TaskColumn
              title="Done"
              status="done"
              tasks={doneTasks}
              users={users}
              onTaskEdit={openTaskModal}
              onRefresh={loadInitialData}
            />
          </div>
        </DragDropContext>

        {showActivityPanel && <ActivityPanel onClose={() => setShowActivityPanel(false)} />}
      </div>

      {isTaskModalOpen && (
        <TaskModal task={editingTask} users={users} onClose={closeTaskModal} onSave={handleTaskSaved} />
      )}

      {conflictData && (
        <ConflictModal
          conflict={conflictData}
          onResolve={handleConflictResolved}
          onClose={() => setConflictData(null)}
        />
      )}
    </div>
  )
}

export default KanbanBoard
