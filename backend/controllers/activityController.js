const Activity = require("../models/Activity")

// Get recent activities
const getActivities = async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 20
    const page = Number.parseInt(req.query.page) || 1
    const skip = (page - 1) * limit

    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("taskId", "title status")

    const total = await Activity.countDocuments()

    res.json({
      success: true,
      activities,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get activities error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Get activities for a specific task
const getTaskActivities = async (req, res) => {
  try {
    const { taskId } = req.params

    const activities = await Activity.find({ taskId }).sort({ createdAt: -1 }).populate("taskId", "title status")

    res.json({
      success: true,
      activities,
    })
  } catch (error) {
    console.error("Get task activities error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Delete old activities (cleanup)
const cleanupActivities = async (req, res) => {
  try {
    const daysToKeep = Number.parseInt(req.query.days) || 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const result = await Activity.deleteMany({
      createdAt: { $lt: cutoffDate },
    })

    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} old activities`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Cleanup activities error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

module.exports = {
  getActivities,
  getTaskActivities,
  cleanupActivities,
}
