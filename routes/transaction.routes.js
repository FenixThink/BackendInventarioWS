const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth.middleware');
const transactionController = require('../controllers/transaction.controller');

const router = express.Router();

// Get all transactions
router.get('/', authMiddleware, transactionController.getAllTransactions);

// Get transactions for a specific product
router.get('/product/:productId', authMiddleware, transactionController.getProductTransactions);

// Create a new transaction
router.post('/', authMiddleware, authorize(['admin', 'manager']), transactionController.createTransaction);

module.exports = router;