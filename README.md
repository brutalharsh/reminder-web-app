# Work Reminder System

An advanced task management application with drag-and-drop functionality, user management, Discord notifications, and task completion tracking. Built with React, TypeScript, Node.js, and MongoDB.

## ✨ Features

### Core Features

- **User Management**: Create and manage users with Discord integration
- **Task Management**: Create, edit, complete, and delete tasks with comprehensive details
- **Category Organization**: Organize tasks into custom categories with special system categories
- **Drag-and-Drop**: Seamlessly move tasks between categories
- **Priority Levels**: Color-coded priorities (Easy/Green, Medium/Yellow, Hard/Red)

### Advanced Features

- **Discord Notifications**: Automatic reminders via Discord webhook when tasks are due
- **Recurring Tasks**: Set tasks to repeat daily, weekly, or monthly
- **Task Completion**: Mark tasks as complete with dedicated "Completed Tasks" category
- **Hidden Categories**: Toggle visibility of Completed and Deleted tasks
- **Smart Filtering**: Filter by priority and due date (Today, This Week, Overdue)
- **Smooth Animations**: Modern UI with gradient designs and smooth transitions

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB connection (already configured in .env)

### One-Command Setup & Run

1. **Clone the repository and navigate to the app folder**

```bash
cd reminder-app
```

2. **Install all dependencies (root, backend, and frontend)**

```bash
npm run install-all
```

3. **Start both backend and frontend with a single command**

```bash
npm start
```

That's it! The application will automatically:

- Start the backend server on http://localhost:5001
- Start the frontend on http://localhost:3000
- Open your browser to the application

### Alternative Manual Setup

If you prefer to run backend and frontend separately:

**Backend:**

```bash
cd backend
npm install
npm run dev
```

**Frontend (in a new terminal):**

```bash
cd frontend
npm install
npm start
```

## 📖 Usage Guide

### User Management

1. Click the **"Users"** button in the header
2. Add users with their name and Discord ID
3. Users will receive Discord notifications for their assigned tasks

### Task Creation

1. Click **"Add Task"** to create a new task
2. Fill in the details:
   - Task name and due date
   - Select category and priority
   - Choose assigned user from dropdown
   - Set repeat interval (none/daily/weekly/monthly)

### Task Management

- **Complete**: Click the ✓ button to mark tasks as complete
- **Edit**: Click the pencil icon to modify task details
- **Delete**: Click the trash icon to move tasks to deleted category
- **Drag & Drop**: Click and drag tasks between categories

### Special Features

- **DC Toggle**: Click "DC" button to show/hide Completed and Deleted tasks
- **Filters**: Use priority and date filters to find specific tasks
- **Discord Notifications**: Automatic reminders sent at 9 AM IST and every 6 hours

## 🛠 Technologies Used

### Frontend

- React 19 with TypeScript
- @dnd-kit for drag-and-drop
- Axios for API calls
- Date-fns for date manipulation
- Lucide React for icons

### Backend

- Node.js with Express
- MongoDB with Mongoose
- Discord webhook integration
- Node-cron for scheduled tasks
- Axios for webhook requests

## 📊 Database Structure

### Collections

- **Users**: Stores user names and Discord IDs
- **Categories**: Regular and special categories (Completed/Deleted)
- **Tasks**: Comprehensive task details with status tracking

### Special Categories

- **Completed Tasks**: Non-deletable category for completed tasks
- **Deleted Tasks**: Non-deletable category for deleted tasks

## 🔧 Configuration

The backend uses environment variables stored in `backend/.env`:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5001
```

Discord webhook URL is configured in `backend/server.js`.

## 📝 Available Scripts

From the root `reminder-app` directory:

- `npm start` - Run both backend and frontend
- `npm run backend` - Run backend only
- `npm run frontend` - Run frontend only
- `npm run install-all` - Install all dependencies
- `npm run dev` - Alias for npm start

## 🎯 Key Features Explained

### Discord Integration

- Sends embedded messages with task details
- Color-coded by priority
- Mentions users via Discord ID
- Tracks last notification to prevent spam

### Recurring Tasks

- Daily: Notifies every 24 hours
- Weekly: Notifies every 7 days
- Monthly: Notifies every 30 days
- Continues until task is completed or deleted

### Task Status Management

- **Active**: Default state for new tasks
- **Completed**: Moved to Completed Tasks category
- **Deleted**: Moved to Deleted Tasks category

## 🌟 UI Features

- Gradient-based modern design
- Smooth category load animations
- Hover effects on all interactive elements
- Responsive layout for all screen sizes
- Loading states with animated spinners

---

Built with ❤️ for efficient task management and team coordination.
