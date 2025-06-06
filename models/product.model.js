const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters long']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  minQuantity: {
    type: Number,
    required: [true, 'Minimum quantity is required'],
    min: [0, 'Minimum quantity cannot be negative'],
    default: 0
  },
  supplier: {
    name: String,
    contact: String,
    email: String,
    phone: String
  },
  location: {
    warehouse: String,
    shelf: String,
    bin: String
  },
  imageUrl: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (!this.cost || !this.price) return 0;
  return ((this.price - this.cost) / this.price) * 100;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.quantity <= 0) return 'out_of_stock';
  if (this.quantity <= this.minQuantity) return 'low_stock';
  return 'in_stock';
});

// Indexes for faster searches
productSchema.index({ name: 'text', sku: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ stockStatus: 1 });
productSchema.index({ isActive: 1 });

// Update the 'updatedAt' field on save
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;