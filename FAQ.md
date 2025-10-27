# Frequently Asked Questions (FAQ)

## General Questions

### Question 1: What is the Work Reminder System?
The Work Reminder System is an advanced full-stack task management application that helps you organize tasks with drag-and-drop functionality, user management, Discord notifications, and comprehensive task completion tracking.

### Question 2: What technologies are used in this project?
The project uses React with TypeScript for the frontend, Node.js with Express for the backend, and MongoDB for the database. It also integrates Discord webhooks for notifications and uses libraries like @dnd-kit for drag-and-drop functionality.

### Question 3: How do I install and run the application?
Navigate to the backend folder and run `npm install` then `npm run dev` to start the backend server on port 5001. Then navigate to the frontend folder, run `npm install` and `npm start` to start the frontend on port 3000.

### Question 4: Do I need a MongoDB database to run this application?
Yes, you need a MongoDB database. Configure the MongoDB URI in a `.env` file in the backend directory with the variable `MONGODB_URI`.

## Features and Functionality

### Question 5: What is the DC toggle feature?
The DC toggle is a feature that shows or hides special categories like "Completed Tasks" and "Deleted Tasks" in the UI, helping you keep your workspace clean and focused.

### Question 6: How does the drag-and-drop functionality work?
Using the @dnd-kit library, you can drag tasks between different category columns. When you drop a task in a new category, it automatically updates in the database and reflects the change across the application.

### Question 7: What are the priority levels available for tasks?
Tasks can have three priority levels: Easy (displayed in green), Medium (displayed in yellow), and Hard (displayed in red). This helps you quickly identify task urgency.

### Question 8: What repeat options are available for tasks?
Tasks can be set to repeat with four options: none (one-time task), daily, weekly, or monthly. The system automatically handles recurring reminders based on your selection.

### Question 9: How does the Discord notification system work?
The application sends notifications to Discord via webhooks at scheduled times (9 AM IST daily and every 6 hours). Notifications are color-coded by priority and mention assigned users via their Discord ID.

### Question 10: What happens when I complete a task?
When you click the complete button on a task, it automatically moves to the "Completed Tasks" category with a status change to "completed" in the database.

### Question 11: Are deleted tasks permanently removed?
No, deleted tasks are moved to the "Deleted Tasks" category rather than being permanently deleted. This allows you to recover tasks if needed.

## User Management

### Question 12: How do I add users to the system?
Click the user management button in the header to open the user management modal. From there, you can add new users by entering their name and Discord ID.

### Question 13: What is the Discord ID used for?
The Discord ID is used to mention and notify specific users in Discord when tasks assigned to them are due or require attention.

### Question 14: Can I delete users from the system?
Yes, you can delete users through the user management modal. However, ensure that no active tasks are assigned to that user before deletion.

### Question 15: How are users assigned to tasks?
When creating or editing a task through the AddTaskModal, you can select a user from a dropdown that displays both their name and Discord ID.

## Categories and Organization

### Question 16: What are special categories?
Special categories are "Completed Tasks" and "Deleted Tasks". These categories are automatically created, cannot be deleted (isDeletable: false), and can be hidden using the DC toggle.

### Question 17: Can I create custom categories?
Yes, you can create custom categories to organize your tasks. All custom categories can be renamed or deleted unless marked as special.

### Question 18: How are tasks organized within categories?
Tasks are organized within category columns and linked to categories via MongoDB ObjectId references. You can drag tasks between categories to reorganize them.

## Technical Questions

### Question 19: What API endpoints are available?
The application provides REST API endpoints for users (GET, POST, DELETE at `/api/users`), categories (GET, POST, DELETE at `/api/categories`), and tasks (full CRUD operations at `/api/tasks` plus completion at `/api/tasks/:id/complete`).

### Question 20: How does the application handle timezones?
The application uses IST (Indian Standard Time) for scheduled notifications and date handling, implemented through the date-fns library for date manipulation.

### Question 21: What are the scheduled jobs in the application?
The application runs cron jobs for Discord notifications at 9 AM IST daily and every 6 hours. These jobs check for due tasks and send notifications to assigned users, tracking the last notification time to prevent spam.
