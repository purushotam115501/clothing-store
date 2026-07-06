const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeyforclothingstore';

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'customer', // default role
      wishlist: []
    });

    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        wishlist: newUser.wishlist
      }
    });
  } catch (err) {
    console.error('[Register Error]', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist
      }
    });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check if admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Authorized admins only.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist
      }
    });
  } catch (err) {
    console.error('[Admin Login Error]', err);
    res.status(500).json({ message: 'Server error during admin login.' });
  }
};

// Forgot Password (Mock Flow)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email.' });
    }

    // Simulate sending forgot password reset token (just a mock token)
    const resetToken = Math.random().toString(36).substring(2, 15);
    console.log(`[Mock Forgot Password] Generated reset token "${resetToken}" for ${email}`);
    
    // In production, you would save it or email it. We'll return success to user.
    res.status(200).json({ 
      message: 'Reset instructions have been simulated. Check backend logs or use any mock password to reset.',
      resetToken // sending for frontend convenience in our simulator
    });
  } catch (err) {
    console.error('[Forgot Password Error]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Reset Password (Mock Flow)
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and new password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully. You can now login.' });
  } catch (err) {
    console.error('[Reset Password Error]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      wishlist: user.wishlist
    });
  } catch (err) {
    console.error('[Profile Fetch Error]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist
      }
    });
  } catch (err) {
    console.error('[Profile Update Error]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Wishlist items
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Since we want populated wishlist products
    const wishlistProductIds = user.wishlist || [];
    const products = await Product.find({ _id: { $in: wishlistProductIds } });

    res.status(200).json(products);
  } catch (err) {
    console.error('[Get Wishlist Error]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    res.status(200).json({ message: 'Added to wishlist.', wishlist: user.wishlist });
  } catch (err) {
    console.error('[Add Wishlist Error]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Remove from Wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.wishlist = user.wishlist.filter(id => String(id) !== String(productId));
    await user.save();

    res.status(200).json({ message: 'Removed from wishlist.', wishlist: user.wishlist });
  } catch (err) {
    console.error('[Remove Wishlist Error]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
