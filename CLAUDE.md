# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Work Reminder System - An advanced full-stack task management application with drag-and-drop functionality, user management, Discord notifications, and task completion tracking. Built with React/TypeScript frontend and Node.js/MongoDB backend.

## Development Commands

### Backend (reminder-app/backend/)

```bash
# Install dependencies
npm install

# Start development server with auto-reload (port 5001)
npm run dev

# Start production server
npm start
```

### Frontend (reminder-app/frontend/)

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Architecture Overview

### Backend Structure

- **server.js**: Express server with MongoDB connection using Mongoose
- **Database Models**:
  - User: Stores user name and Discord ID
  - Category: Stores category names with special flags (isSpecial, isDeletable)
  - Task: Stores task details with status, repeat interval, and user references
- **API Endpoints**:
  - Users: GET, POST, DELETE at `/api/users`
  - Categories: GET, POST, DELETE operations at `/api/categories`
  - Tasks: Full CRUD operations at `/api/tasks`
  - Task completion: PATCH at `/api/tasks/:id/complete`
- **Discord Integration**: Webhook notifications with scheduled checks (cron jobs)
- **Environment**: MongoDB URI configured in `.env` file

### Frontend Structure

- **React TypeScript** application using Create React App
- **Component Architecture**:
  - App.tsx: Main component managing state and drag-drop context
  - Header.tsx: Filtering controls, DC toggle, and user management button
  - CategoryColumn.tsx: Container for tasks with special category handling
  - TaskCard.tsx: Individual task display with complete/edit/delete actions
  - AddTaskModal.tsx: Form for creating/editing tasks with user selection and repeat options
  - UserManagement.tsx: Modal for managing users
- **Key Libraries**:
  - @dnd-kit: Drag and drop functionality
  - axios: API communication
  - date-fns: Date manipulation
  - lucide-react: Icons

## Key Technical Details

### Database Schema

- **Users Collection**: name, discordId, created_at
- **Categories Collection**: name, isSpecial, isDeletable, created_at
- **Tasks Collection**: taskName, dueDate, priority, assignedUser (ref), category (ref), status, repeatInterval, lastNotified, created_at

### Special Features

- **Hidden Categories**: "Completed Tasks" and "Deleted Tasks" are special non-deletable categories
- **DC Toggle**: Shows/hides special categories in the UI
- **Task Status**: active/completed/deleted states
- **Repeat Options**: none/daily/weekly/monthly for recurring reminders
- **Discord Notifications**: Automated via webhook with IST timezone support
- **Scheduled Jobs**: Cron jobs run at 9 AM IST daily and every 6 hours

### UI Features

- Tasks linked to categories via MongoDB ObjectId references
- Drag-and-drop moves tasks between categories
- Complete button moves tasks to "Completed Tasks" category
- Delete moves tasks to "Deleted Tasks" category
- Priority levels: Easy (green), Medium (yellow), Hard (red)
- Overdue tasks automatically highlighted
- Smooth animations on category load and task interactions
- User dropdown in task creation with Discord ID display

### Discord Webhook

- URL: Configured in server.js
- Sends embedded messages with task details
- Color-coded by priority
- Mentions users via Discord ID
- Tracks last notification to prevent spam
