const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
)

// Validate title doesn't match column names
taskSchema.pre("save", function (next) {
  const columnNames = ["todo", "in-progress", "done", "to do", "in progress"]
  if (columnNames.includes(this.title.toLowerCase())) {
    const error = new Error("Task title cannot match column names")
    error.status = 400
    return next(error)
  }
  next()
})

module.exports = mongoose.model("Task", taskSchema)
