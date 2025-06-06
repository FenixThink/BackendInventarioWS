const Product = require('../models/product.model');
const Transaction = require('../models/transaction.model');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Get a single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      createdBy: req.user._id
    });
    
    const savedProduct = await product.save();
    
    // Record transaction for initial stock
    if (savedProduct.quantity > 0) {
      const transaction = new Transaction({
        product: savedProduct._id,
        type: 'purchase',
        quantity: savedProduct.quantity,
        previousQuantity: 0,
        newQuantity: savedProduct.quantity,
        notes: 'Initial inventory',
        performedBy: req.user._id
      });
      
      await transaction.save();
    }
    
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const oldQuantity = product.quantity;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    // If quantity changed, create a transaction
    if (req.body.quantity !== undefined && req.body.quantity !== oldQuantity) {
      const transaction = new Transaction({
        product: updatedProduct._id,
        type: req.body.quantity > oldQuantity ? 'purchase' : 'sale',
        quantity: Math.abs(req.body.quantity - oldQuantity),
        previousQuantity: oldQuantity,
        newQuantity: req.body.quantity,
        notes: 'Stock update from product edit',
        performedBy: req.user._id
      });
      
      await transaction.save();
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete associated transactions
    await Transaction.deleteMany({ product: req.params.id });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const query = req.params.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).populate('category', 'name');
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error searching products', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
}; 