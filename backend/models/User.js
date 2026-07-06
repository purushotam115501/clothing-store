const mongoose = require('../config/db');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  wishlist: [{
    type: String, // String corresponding to product _id
    ref: 'Product'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Instance method to compare password (helper for controllers)
userSchema.methods = userSchema.methods || {};
userSchema.methods.comparePassword = async function(candidatePassword, hashedPassword) {
  // If called as instance method, we support both mongoose doc format or normal obj comparison
  const pw = this.password || hashedPassword;
  return bcrypt.compare(candidatePassword, pw);
};

// Static helper to compare passwords since we want it to work on plain objects in mock mode too
userSchema.statics = userSchema.statics || {};
userSchema.statics.compare = async function(candidatePassword, hashedPassword) {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
