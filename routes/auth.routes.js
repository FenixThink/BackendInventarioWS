const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;