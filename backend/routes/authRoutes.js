const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.get('/wishlist', verifyToken, authController.getWishlist);
router.post('/wishlist', verifyToken, authController.addToWishlist);
router.delete('/wishlist/:productId', verifyToken, authController.removeFromWishlist);

module.exports = router;
