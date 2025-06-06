const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth.middleware');
const categoryController = require('../controllers/category.controller');

const router = express.Router();

// Get all categories
router.get('/', authMiddleware, categoryController.getAllCategories);

// Get a single category
router.get('/:id', authMiddleware, categoryController.getCategoryById);

// Create a new category
router.post('/', authMiddleware, authorize(['admin', 'manager']), categoryController.createCategory);

// Update a category
router.put('/:id', authMiddleware, authorize(['admin', 'manager']), categoryController.updateCategory);

// Delete a category
router.delete('/:id', authMiddleware, authorize(['admin']), categoryController.deleteCategory);

module.exports = router;