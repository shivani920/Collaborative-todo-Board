import React from "react";
const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  )
}

export default Loading
