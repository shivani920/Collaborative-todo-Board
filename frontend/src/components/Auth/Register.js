"use client"
import React from "react";

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { register } from "../../services/api"
import { useAuth } from "../../hooks/useAuth"
import "../../styles/auth.css"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()

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

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
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
      console.log("📝 Attempting registration...")
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      if (response.success) {
        console.log("✅ Registration successful, redirecting to board...")
        authLogin(response.user, response.token)
        navigate("/board", { replace: true })
      } else {
        setErrors({ general: response.message || "Registration failed" })
      }
    } catch (error) {
      console.error("❌ Registration error:", error)
      setErrors({
        general: error.response?.data?.message || "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join the collaborative workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && (
              <div className="error-alert">
                <span className="error-icon">⚠</span>
                {errors.general}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? "error" : ""}`}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? "error" : ""}`}
                placeholder="Create a password"
                disabled={isLoading}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className={`auth-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
