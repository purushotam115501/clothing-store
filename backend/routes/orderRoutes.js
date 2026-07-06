const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, optionalToken, isAdmin } = require('../middleware/auth');

// Order placement and cancellation (accessible by customers & optionally guests)
router.post('/', optionalToken, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getMyOrders);
router.post('/:id/cancel', optionalToken, orderController.cancelOrder);
router.get('/:id', optionalToken, orderController.getOrderById);

// Admin dashboard routes
router.get('/admin/stats', verifyToken, isAdmin, orderController.getDashboardStats);
router.get('/admin/all', verifyToken, isAdmin, orderController.getAllOrders);
router.put('/admin/:id/status', verifyToken, isAdmin, orderController.updateOrderStatus);

module.exports = router;
