"use client"
import React from "react";

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../../services/api"
import { useAuth } from "../../hooks/useAuth"
import "../../styles/auth.css"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
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
      console.log("🔐 Attempting login...")
      const response = await login(formData)

      if (response.success) {
        console.log("✅ Login successful, redirecting to board...")
        authLogin(response.user, response.token)
        navigate("/board", { replace: true })
      } else {
        setErrors({ general: response.message || "Login failed" })
      }
    } catch (error) {
      console.error("❌ Login error:", error)
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
            <h1>Welcome Back</h1>
            <p>Sign in to your collaborative workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && (
              <div className="error-alert">
                <span className="error-icon">⚠</span>
                {errors.general}
              </div>
            )}

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
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <button type="submit" className={`auth-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?
              <Link to="/register" className="auth-link">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
