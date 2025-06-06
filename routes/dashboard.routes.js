const express = require('express');
const Product = require('../models/product.model');
const Transaction = require('../models/transaction.model');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Get dashboard data
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$minQuantity'] }
    })
      .populate('category', 'name')
      .limit(10);

    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Get out of stock products count
    const outOfStockProducts = await Product.countDocuments({ quantity: 0 });

    // Get total inventory value
    const inventoryValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      }
    ]);

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .populate('product', 'name sku')
      .populate('performedBy', 'username')
      .sort({ date: -1 })
      .limit(5);

    // Get transactions by type (for charts)
    const transactionsByType = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top products by quantity
    const topProducts = await Product.find()
      .sort({ quantity: -1 })
      .limit(5)
      .select('name sku quantity');

    res.json({
      lowStockProducts,
      totalProducts,
      outOfStockProducts,
      inventoryValue: inventoryValue.length > 0 ? inventoryValue[0].total : 0,
      recentTransactions,
      transactionsByType,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

module.exports = router;