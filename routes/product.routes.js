const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth.middleware');
const productController = require('../controllers/product.controller');

const router = express.Router();

// Get all products
router.get('/', authMiddleware, productController.getAllProducts);

// Get a single product
router.get('/:id', authMiddleware, productController.getProductById);

// Create a new product
router.post('/', authMiddleware, authorize(['admin', 'manager']), productController.createProduct);

// Update a product
router.put('/:id', authMiddleware, authorize(['admin', 'manager']), productController.updateProduct);

// Delete a product
router.delete('/:id', authMiddleware, authorize(['admin']), productController.deleteProduct);

// Search products
router.get('/search/:query', authMiddleware, productController.searchProducts);

module.exports = router;