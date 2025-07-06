"use client"
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Auth/Login"
import Register from "./components/Auth/Register"
import KanbanBoard from "./components/Board/KanbanBoard"
import { useAuth } from "./hooks/useAuth"
import Loading from "./components/Common/Loading"

function App() {
  const { user, loading } = useAuth()

  console.log("🔍 App state:", { user: user?.name, loading })

  if (loading) {
    return <Loading message="Loading your workspace..." />
  }

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to="/board" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/board" replace /> : <Register />} />

          {/* Protected routes */}
          <Route path="/board" element={user ? <KanbanBoard /> : <Navigate to="/login" replace />} />

          {/* Default route */}
          <Route path="/" element={<Navigate to={user ? "/board" : "/login"} replace />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to={user ? "/board" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
