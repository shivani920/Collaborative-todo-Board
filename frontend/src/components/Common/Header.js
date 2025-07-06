"use client"
import React from "react";
const Header = ({ onAddTask, onToggleActivity, onLogout, showActivityPanel, onlineUsers = [] }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">Collaborative Board</h1>
        <div className="user-welcome">
          <span className="user-icon">👋</span>
          <span>Welcome, {user.name}</span>
        </div>

        {/* Online users indicator */}
        <div className="online-users">
          <span className="online-indicator">🟢</span>
          <span>{onlineUsers.length + 1} users online</span>
          <div className="users-list">
            <div className="user-avatar current-user" title={user.name}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {onlineUsers.slice(0, 3).map((onlineUser, index) => (
              <div key={onlineUser.userId} className="user-avatar" title={onlineUser.userName}>
                {onlineUser.userName?.charAt(0).toUpperCase()}
              </div>
            ))}
            {onlineUsers.length > 3 && (
              <div className="user-avatar more-users" title={`+${onlineUsers.length - 3} more`}>
                +{onlineUsers.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="header-actions">
        <button onClick={onAddTask} className="header-button primary">
          <span className="button-icon">➕</span>
          Add Task
        </button>

        <button onClick={onToggleActivity} className={`header-button secondary ${showActivityPanel ? "active" : ""}`}>
          <span className="button-icon">📊</span>
          Activity
        </button>

        <button onClick={onLogout} className="header-button danger">
          <span className="button-icon">🚪</span>
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header
