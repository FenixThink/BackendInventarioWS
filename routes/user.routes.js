const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, authorize(['admin']), userController.getAllUsers);

// Get user by ID (admin only)
router.get('/:id', authMiddleware, authorize(['admin']), userController.getUserById);

// Create new user (admin only)
router.post('/', authMiddleware, authorize(['admin']), userController.createUser);

// Update user (admin only)
router.put('/:id', authMiddleware, authorize(['admin']), userController.updateUser);

// Toggle user status (admin only)
router.patch('/:id/toggle-status', authMiddleware, authorize(['admin']), userController.toggleUserStatus);

module.exports = router; 