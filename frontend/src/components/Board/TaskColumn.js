"use client"
import React from "react";
import TaskCard from "./TaskCard"
import { Droppable, Draggable } from "react-beautiful-dnd"

const TaskColumn = ({ title, status, tasks, users, onTaskEdit, onRefresh }) => {
  const getColumnColor = () => {
    switch (status) {
      case "todo":
        return "#ef4444"
      case "in-progress":
        return "#f59e0b"
      case "done":
        return "#10b981"
      default:
        return "#6b7280"
    }
  }

  return (
    <div className="task-column">
      <div className="column-header">
        <div className="column-title">
          <div className="status-indicator" style={{ backgroundColor: getColumnColor() }}></div>
          <h3>{title}</h3>
          <span className="task-count">{tasks.length}</span>
        </div>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            className={`column-content ${snapshot.isDraggingOver ? "drag-over" : ""}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.length === 0 ? (
              <div className="empty-column">
                <div className="empty-icon">📋</div>
                <p>No tasks yet</p>
                <span>Drag tasks here or create new ones</span>
              </div>
            ) : (
              tasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={snapshot.isDragging ? "dragging" : ""}
                    >
                      <TaskCard
                        task={task}
                        users={users}
                        onEdit={() => onTaskEdit(task)}
                        onRefresh={onRefresh}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

export default TaskColumn
