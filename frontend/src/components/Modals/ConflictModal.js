"use client"
import React from "react";
import { useState } from "react"
import { resolveConflict } from "../../services/api"

const ConflictModal = ({ conflict, onResolve, onClose }) => {
  const [selectedResolution, setSelectedResolution] = useState("current")
  const [isLoading, setIsLoading] = useState(false)

  const handleResolve = async () => {
    setIsLoading(true)

    try {
      const response = await resolveConflict(conflict.taskId, {
        resolution: selectedResolution,
        currentVersion: conflict.currentVersion,
        incomingVersion: conflict.incomingVersion,
      })

      if (response.success) {
        onResolve()
      } else {
        alert("Failed to resolve conflict. Please try again.")
      }
    } catch (error) {
      console.error("Failed to resolve conflict:", error)
      alert("Failed to resolve conflict. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="conflict-modal">
        <div className="modal-header conflict-header">
          <div className="conflict-icon">⚠️</div>
          <div>
            <h2>Conflict Detected</h2>
            <p>Multiple users edited "{conflict.taskTitle}" simultaneously</p>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="conflict-content">
          <div className="conflict-info">
            <p>
              <strong>{conflict.user1}</strong> and <strong>{conflict.user2}</strong>
              made conflicting changes. Choose how to resolve:
            </p>
          </div>

          <div className="resolution-options">
            <div className={`resolution-option ${selectedResolution === "current" ? "selected" : ""}`}>
              <input
                type="radio"
                id="current"
                name="resolution"
                value="current"
                checked={selectedResolution === "current"}
                onChange={(e) => setSelectedResolution(e.target.value)}
              />
              <label htmlFor="current">
                <div className="option-header">
                  <strong>Keep Current Version</strong>
                  <span className="user-badge">{conflict.user1}</span>
                </div>
                <div className="version-preview">
                  <div>
                    <strong>Title:</strong> {conflict.currentVersion.title}
                  </div>
                  <div>
                    <strong>Status:</strong> {conflict.currentVersion.status}
                  </div>
                  <div>
                    <strong>Priority:</strong> {conflict.currentVersion.priority}
                  </div>
                </div>
              </label>
            </div>

            <div className={`resolution-option ${selectedResolution === "incoming" ? "selected" : ""}`}>
              <input
                type="radio"
                id="incoming"
                name="resolution"
                value="incoming"
                checked={selectedResolution === "incoming"}
                onChange={(e) => setSelectedResolution(e.target.value)}
              />
              <label htmlFor="incoming">
                <div className="option-header">
                  <strong>Use Incoming Version</strong>
                  <span className="user-badge">{conflict.user2}</span>
                </div>
                <div className="version-preview">
                  <div>
                    <strong>Title:</strong> {conflict.incomingVersion.title}
                  </div>
                  <div>
                    <strong>Status:</strong> {conflict.incomingVersion.status}
                  </div>
                  <div>
                    <strong>Priority:</strong> {conflict.incomingVersion.priority}
                  </div>
                </div>
              </label>
            </div>

            <div className={`resolution-option ${selectedResolution === "merge" ? "selected" : ""}`}>
              <input
                type="radio"
                id="merge"
                name="resolution"
                value="merge"
                checked={selectedResolution === "merge"}
                onChange={(e) => setSelectedResolution(e.target.value)}
              />
              <label htmlFor="merge">
                <div className="option-header">
                  <strong>Smart Merge</strong>
                  <span className="merge-badge">Automatic</span>
                </div>
                <div className="version-preview">Automatically combine non-conflicting changes from both versions</div>
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button onClick={onClose} className="cancel-button" disabled={isLoading}>
              Cancel
            </button>
            <button
              onClick={handleResolve}
              className={`resolve-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Resolving...
                </>
              ) : (
                "Resolve Conflict"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConflictModal
