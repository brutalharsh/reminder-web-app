const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Category = require('../models/Category');

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

// PUT update task by ID
router.put('/:id', async (req, res) => {
    try {
        const { taskName, dueDate, priority, assignedUser, category, repeatInterval } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { taskName, dueDate, priority, assignedUser, category, repeatInterval },
            { new: true, runValidators: true }
        )
        .populate('assignedUser')
        .populate('category');

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE task by ID (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Find deleted tasks category
        const deletedCategory = await Category.findOne({ name: 'Deleted Tasks' });
        if (deletedCategory) {
            task.category = deletedCategory._id;
            task.status = 'deleted';
            await task.save();
        } else {
            await Task.findByIdAndDelete(req.params.id);
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;