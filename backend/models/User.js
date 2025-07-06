const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next()

  try {
    console.log("🔐 Hashing password for user:", this.email)
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    console.log("✅ Password hashed successfully")
    next()
  } catch (error) {
    console.error("❌ Password hashing error:", error)
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("🔍 Comparing password for user:", this.email)
    const result = await bcrypt.compare(candidatePassword, this.password)
    console.log("🔍 Password comparison result:", result)
    return result
  } catch (error) {
    console.error("❌ Password comparison error:", error)
    return false
  }
}

module.exports = mongoose.model("User", userSchema)
