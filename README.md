# 🧠 Collaborative Todo Board (Kanban)

A full-stack collaborative Kanban task board with real-time updates, smart assignment logic, and conflict resolution features. Designed for teams to work together efficiently.

---

## 🚀 Live Demo

🌐 **Frontend**: [https://toodoboard.netlify.app](https://toodoboard.netlify.app)
🌐 **Backend**: [https://collaborative-todo-board-1.onrender.com](https://collaborative-todo-board-1.onrender.com)
📽 **Demo Video**: [Watch Demo](https://drive.google.com/file/d/1ocjbbRPnFEe1VY23pcGO5d5sKn3MOP_n/view?usp=drivesdk)

---

## 🛠️ Tech Stack

* **Frontend**: React, React Router, CSS
* **Backend**: Node.js, Express.js, MongoDB, Mongoose, Socket.IO
* **Authentication**: JWT (JSON Web Token)
* **Real-Time Features**: Socket.IO for board collaboration
* **Deployment**:
  ▪ Frontend - Netlify
  ▪ Backend - Render
  ▪ Database - MongoDB Atlas

---

## 📆 Features

* 🔐 User Authentication (Register & Login)
* 🧹 Real-Time Kanban Board with Socket.IO
* 🧠 Smart Task Assignment (based on workload)
* ⚔️ Conflict Handling (real-time updates across users)
* 📊 Activity Logs
* 📌 RESTful APIs for boards, tasks, and users

---

## 🧠 Smart Assign Logic

When a new task is created without a specified assignee:

* The system checks workload (number of tasks) across all users in the board.
* The user with the **least number of assigned tasks** is automatically assigned the new task.
* This balances task distribution across the team.

---

## ⚔️ Conflict Handling Logic

When two or more users modify the same task or board:

* Socket.IO emits the **latest update to all connected clients**.
* The frontend listens and **synchronizes the UI** in real-time.
* If two users edit simultaneously, the **last saved version** is broadcast to all (with optional conflict alerts shown in UI).

---

## 💾 Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/shivani920/Collaborative-todo-Board.git
cd Collaborative-todo-Board
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

#### 🔐 Create `.env` file in `backend/` folder:

```env
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-secret-key
PORT=5000
FRONTEND_URL=https://toodoboard.netlify.app/login
```

```bash
npm run dev
```

---

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

---

## 📝 Logic Document

You can find the logic explanation in [Logic\_Document.md](./Logic_Document.md)

---

## 📹 Demo Video Guide

The video covers:

* ✅ Login/Register flow
* ✅ Real-time board & task management
* ✅ Smart Assign in action
* ✅ Conflict resolution with multiple users
* ✅ Technical overview & insights

📽 [Watch the Demo](https://drive.google.com/file/d/1ocjbbRPnFEe1VY23pcGO5d5sKn3MOP_n/view?usp=drivesdk)

---

## ✉️ Submission Checklist

* ✅ GitHub Repo: [Collaborative-todo-Board](https://github.com/shivani920/Collaborative-todo-Board)
* ✅ Deployed App: [Netlify Frontend](https://toodoboard.netlify.app)
* ✅ Backend Render: [Render API](https://collaborative-todo-board-1.onrender.com)
* ✅ Demo Video: [Drive Link](https://drive.google.com/file/d/1ocjbbRPnFEe1VY23pcGO5d5sKn3MOP_n/view?usp=drivesdk)
* ✅ Logic Document: [Logic\_Document.md](./Logic_Document.md)

---

## 🙌 Thank You!

For any queries or feedback, feel free to reach out.
