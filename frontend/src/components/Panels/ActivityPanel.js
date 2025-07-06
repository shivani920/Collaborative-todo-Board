"use client"
import React from "react";
import { useState, useEffect } from "react"
import { getActivities } from "../../services/api"
import { useSocket } from "../../hooks/useSocket"
import { timeAgo } from "../../utils/helpers"

const ActivityPanel = ({ onClose }) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const socket = useSocket()

  useEffect(() => {
    loadActivities()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on("activityUpdated", handleNewActivity)

      return () => {
        socket.off("activityUpdated")
      }
    }
  }, [socket])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const response = await getActivities()

      if (response.success) {
        setActivities(response.activities)
      }
    } catch (error) {
      console.error("Failed to load activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewActivity = (newActivity) => {
    setActivities((prev) => [newActivity, ...prev.slice(0, 19)])
  }

  const getActionIcon = (action) => {
    switch (action.toLowerCase()) {
      case "created":
        return "✨"
      case "updated":
        return "📝"
      case "deleted":
        return "🗑️"
      case "moved":
        return "🔄"
      case "assigned":
        return "👤"
      case "resolved conflict":
        return "⚖️"
      default:
        return "📋"
    }
  }

  return (
    <div className="activity-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="activity-icon">📊</span>
          <h3>Recent Activity</h3>
        </div>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="panel-content">
        {loading ? (
          <div className="panel-loading">
            <div className="loading-spinner"></div>
            <p>Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="empty-activities">
            <div className="empty-icon">📊</div>
            <p>No recent activity</p>
            <span>Actions will appear here as they happen</span>
          </div>
        ) : (
          <div className="activities-list">
            {activities.map((activity) => (
              <div key={activity._id} className="activity-item">
                <div className="activity-icon">{getActionIcon(activity.action)}</div>
                <div className="activity-content">
                  <div className="activity-main">
                    <strong>{activity.user.name}</strong>
                    <span className="action-text">{activity.action.toLowerCase()}</span>
                    <span className="task-name">"{activity.taskTitle}"</span>
                  </div>
                  {activity.details && <div className="activity-details">{activity.details}</div>}
                  <div className="activity-time">{timeAgo(activity.createdAt || activity.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityPanel
