const Transaction = require('../models/transaction.model');
const Product = require('../models/product.model');

// Get all transactions
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('product', 'name sku')
      .populate('performedBy', 'username')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

// Get transactions for a specific product
const getProductTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ product: req.params.productId })
      .populate('product', 'name sku')
      .populate('performedBy', 'username')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product transactions', error: error.message });
  }
};

// Create a new transaction
const createTransaction = async (req, res) => {
  try {
    const { productId, type, quantity, notes } = req.body;

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate stock for outgoing transactions
    if (type === 'out' && quantity > product.quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Calculate new quantity
    const previousQuantity = product.quantity;
    const newQuantity = type === 'in' 
      ? previousQuantity + quantity 
      : previousQuantity - quantity;

    // Create transaction
    const transaction = new Transaction({
      product: productId,
      type,
      quantity,
      previousQuantity,
      newQuantity,
      notes,
      performedBy: req.user._id
    });

    // Update product quantity
    await Product.findByIdAndUpdate(productId, { quantity: newQuantity });

    // Save transaction
    const savedTransaction = await transaction.save();
    await savedTransaction.populate([
      { path: 'product', select: 'name sku' },
      { path: 'performedBy', select: 'username' }
    ]);

    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

module.exports = {
  getAllTransactions,
  getProductTransactions,
  createTransaction
}; 