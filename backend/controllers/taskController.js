const Task = require("../models/Task")
const User = require("../models/User")
const Activity = require("../models/Activity")
const { validationResult } = require("express-validator")

// Get all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      tasks,
    })
  } catch (error) {
    console.error("Get tasks error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Create new task
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { title, description, status, priority, assignedTo } = req.body

    // Check for duplicate title
    const existingTask = await Task.findOne({ title })
    if (existingTask) {
      return res.status(400).json({
        success: false,
        message: "Task title must be unique",
      })
    }

    const task = new Task({
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      assignedTo: assignedTo || null,
      createdBy: req.user.userId,
    })

    await task.save()

    // Populate the task
    await task.populate("assignedTo", "name email")
    await task.populate("createdBy", "name email")

    // Log activity
    const activity = new Activity({
      action: "created",
      taskId: task._id,
      taskTitle: task.title,
      user: {
        id: req.user.userId,
        name: req.user.name,
        email: req.user.email,
      },
      details: `Created task with ${task.priority} priority`,
    })
    await activity.save()

    // Emit socket event
    const io = req.app.get("io")
    io.to("board").emit("taskCreated", task)
    io.to("board").emit("activityUpdated", activity)

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    })
  } catch (error) {
    console.error("Create task error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Get current task for conflict detection
    const currentTask = await Task.findById(id)
    if (!currentTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    // Simple conflict detection based on version
    if (updates.version && updates.version !== currentTask.version) {
      const io = req.app.get("io")
      io.to("board").emit("conflict", {
        taskId: id,
        taskTitle: currentTask.title,
        currentVersion: currentTask,
        incomingVersion: updates,
        user1: currentTask.updatedBy?.name || "Unknown",
        user2: req.user.name,
      })

      return res.status(409).json({
        success: false,
        message: "Conflict detected",
        conflict: true,
      })
    }

    // Validate title uniqueness if title is being updated
    if (updates.title && updates.title !== currentTask.title) {
      const existingTask = await Task.findOne({
        title: updates.title,
        _id: { $ne: id },
      })
      if (existingTask) {
        return res.status(400).json({
          success: false,
          message: "Task title must be unique",
        })
      }
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        ...updates,
        version: currentTask.version + 1,
      },
      { new: true },
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    // Log activity
    const actionType = updates.status && updates.status !== currentTask.status ? "moved" : "updated"
    const activity = new Activity({
      action: actionType,
      taskId: id,
      taskTitle: updatedTask.title,
      user: {
        id: req.user.userId,
        name: req.user.name,
        email: req.user.email,
      },
      details:
        actionType === "moved" ? `Moved from ${currentTask.status} to ${updates.status}` : "Updated task details",
    })
    await activity.save()

    // Emit socket event
    const io = req.app.get("io")
    io.to("board").emit("taskUpdated", updatedTask)
    io.to("board").emit("activityUpdated", activity)

    res.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    })
  } catch (error) {
    console.error("Update task error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params

    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    await Task.findByIdAndDelete(id)

    // Log activity
    const activity = new Activity({
      action: "deleted",
      taskId: id,
      taskTitle: task.title,
      user: {
        id: req.user.userId,
        name: req.user.name,
        email: req.user.email,
      },
      details: "Deleted task",
    })
    await activity.save()

    // Emit socket event
    const io = req.app.get("io")
    io.to("board").emit("taskDeleted", id)
    io.to("board").emit("activityUpdated", activity)

    res.json({
      success: true,
      message: "Task deleted successfully",
    })
  } catch (error) {
    console.error("Delete task error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Smart assign task
const smartAssignTask = async (req, res) => {
  try {
    const { id } = req.params

    // Get all users
    const users = await User.find().select("name email")

    // Count active tasks per user
    const taskCounts = await Task.aggregate([
      {
        $match: {
          status: { $in: ["todo", "in-progress"] },
          assignedTo: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$assignedTo",
          count: { $sum: 1 },
        },
      },
    ])

    // Create a map of user task counts
    const userTaskCounts = new Map()
    taskCounts.forEach((item) => {
      userTaskCounts.set(item._id.toString(), item.count)
    })

    // Find user with fewest active tasks
    let selectedUser = users[0]
    let minTasks = userTaskCounts.get(selectedUser._id.toString()) || 0

    for (const user of users) {
      const taskCount = userTaskCounts.get(user._id.toString()) || 0
      if (taskCount < minTasks) {
        minTasks = taskCount
        selectedUser = user
      }
    }

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        assignedTo: selectedUser._id,
      },
      { new: true },
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    // Log activity
    const activity = new Activity({
      action: "assigned",
      taskId: id,
      taskTitle: updatedTask.title,
      user: {
        id: req.user.userId,
        name: req.user.name,
        email: req.user.email,
      },
      details: `Smart assigned to ${selectedUser.name} (${minTasks} active tasks)`,
    })
    await activity.save()

    // Emit socket event
    const io = req.app.get("io")
    io.to("board").emit("taskUpdated", updatedTask)
    io.to("board").emit("activityUpdated", activity)

    res.json({
      success: true,
      message: "Task smart assigned successfully",
      task: updatedTask,
    })
  } catch (error) {
    console.error("Smart assign error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Resolve conflict
const resolveConflict = async (req, res) => {
  try {
    const { id } = req.params
    const { resolution, currentVersion, incomingVersion } = req.body

    let resolvedData

    switch (resolution) {
      case "current":
        resolvedData = currentVersion
        break
      case "incoming":
        resolvedData = incomingVersion
        break
      case "merge":
        // Smart merge: combine non-conflicting changes
        resolvedData = {
          ...currentVersion,
          // Take the most recent timestamp fields
          updatedAt: new Date(
            Math.max(new Date(currentVersion.updatedAt).getTime(), new Date(incomingVersion.updatedAt).getTime()),
          ),
          // Merge description if both exist
          description: incomingVersion.description || currentVersion.description,
          // Take higher priority
          priority:
            ["low", "medium", "high"].indexOf(incomingVersion.priority) >
            ["low", "medium", "high"].indexOf(currentVersion.priority)
              ? incomingVersion.priority
              : currentVersion.priority,
        }
        break
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid resolution type",
        })
    }

    // Update with resolved data
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        ...resolvedData,
        version: Math.max(currentVersion.version, incomingVersion.version) + 1,
      },
      { new: true },
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    // Log conflict resolution
    const activity = new Activity({
      action: "resolved conflict",
      taskId: id,
      taskTitle: updatedTask.title,
      user: {
        id: req.user.userId,
        name: req.user.name,
        email: req.user.email,
      },
      details: `Resolved conflict using ${resolution} strategy`,
    })
    await activity.save()

    // Emit socket event
    const io = req.app.get("io")
    io.to("board").emit("taskUpdated", updatedTask)
    io.to("board").emit("activityUpdated", activity)

    res.json({
      success: true,
      message: "Conflict resolved successfully",
      task: updatedTask,
    })
  } catch (error) {
    console.error("Resolve conflict error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// New function for task reassignment
const reassignTask = async (req, res) => {
  try {
    const { id } = req.params
    const { assignedTo } = req.body

    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    const previousAssignee = task.assignedTo

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        assignedTo: assignedTo || null,
        updatedAt: new Date(),
        updatedBy: req.user.userId,
        version: task.version + 1,
      },
      { new: true },
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    // Get user details for activity logging
    const newAssignee = assignedTo ? await User.findById(assignedTo) : null
    const previousAssigneeUser = previousAssignee ? await User.findById(previousAssignee) : null

    // Log activity
    const activity = new Activity({
      action: "reassigned",
      taskId: id,
      taskTitle: updatedTask.title,
      user: {
        id: req.user.userId,
        name: req.user.name,
        email: req.user.email,
      },
      details: `Reassigned from ${previousAssigneeUser?.name || "Unassigned"} to ${newAssignee?.name || "Unassigned"}`,
    })
    await activity.save()

    // Emit socket event
    const io = req.app.get("io")
    io.to("board").emit("taskUpdated", updatedTask)
    io.to("board").emit("activityUpdated", activity)

    res.json({
      success: true,
      message: "Task reassigned successfully",
      task: updatedTask,
    })
  } catch (error) {
    console.error("Reassign task error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// New function for bulk task updates
const bulkUpdateTasks = async (req, res) => {
  try {
    const { taskIds, updates } = req.body

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Task IDs array is required",
      })
    }

    const updateData = {
      ...updates,
      updatedAt: new Date(),
      updatedBy: req.user.userId,
    }

    const result = await Task.updateMany({ _id: { $in: taskIds } }, { $inc: { version: 1 }, $set: updateData })

    // Get updated tasks for response
    const updatedTasks = await Task.find({ _id: { $in: taskIds } })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    // Log bulk activity
    const activity = new Activity({
      action: "bulk updated",
      taskId: taskIds[0], // Use first task ID as reference
      taskTitle: `${taskIds.length} tasks`,
      user: {
        id: req.user.userId,
        name: req.user.name,
        email: req.user.email,
      },
      details: `Bulk updated ${taskIds.length} tasks`,
    })
    await activity.save()

    // Emit socket events
    const io = req.app.get("io")
    updatedTasks.forEach((task) => {
      io.to("board").emit("taskUpdated", task)
    })
    io.to("board").emit("activityUpdated", activity)

    res.json({
      success: true,
      message: `${result.modifiedCount} tasks updated successfully`,
      tasks: updatedTasks,
    })
  } catch (error) {
    console.error("Bulk update error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// New function for task history
const getTaskHistory = async (req, res) => {
  try {
    const { id } = req.params

    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    const activities = await Activity.find({ taskId: id }).sort({ createdAt: -1 }).limit(50)

    res.json({
      success: true,
      task,
      history: activities,
    })
  } catch (error) {
    console.error("Get task history error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  smartAssignTask,
  resolveConflict,
  reassignTask,
  bulkUpdateTasks,
  getTaskHistory,
}
