const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Setup multer memory storage (stores file buffer in memory)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per image
  }
});

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Protected routes (Admin operations)
router.post('/', verifyToken, isAdmin, upload.array('images', 5), productController.addProduct);
router.put('/:id', verifyToken, isAdmin, upload.array('images', 5), productController.editProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

// Customer review route
router.post('/:id/reviews', verifyToken, productController.addProductReview);

module.exports = router;
