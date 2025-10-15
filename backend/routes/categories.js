const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ isSpecial: 1, created_at: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new category
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const newCategory = new Category({
            name,
            isSpecial: false,
            isDeletable: true
        });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'Category name already exists' });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
});

// DELETE category by ID
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        if (!category.isDeletable) {
            return res.status(403).json({ error: 'Cannot delete special category' });
        }
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;