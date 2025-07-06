const mongoose = require("mongoose")

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["created", "updated", "deleted", "moved", "assigned", "resolved conflict"],
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    taskTitle: {
      type: String,
      required: true,
    },
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    details: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Activity", activitySchema)
