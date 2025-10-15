const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedUser')
            .populate('category')
            .sort({ dueDate: 1, created_at: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new task
router.post('/', async (req, res) => {
    try {
        const { taskName, dueDate, priority, assignedUser, category, repeatInterval } = req.body;
        const newTask = new Task({
            taskName,
            dueDate,
            priority,
            assignedUser,
            category,
            repeatInterval: repeatInterval || 'none',
            status: 'active'
        });
        const savedTask = await newTask.save();
        const populatedTask = await Task.findById(savedTask._id)
            .populate('assignedUser')
            .populate('category');
        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;