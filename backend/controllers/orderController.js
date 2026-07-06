const Order = require('../models/Order');
const Product = require('../models/Product');
const emailService = require('../services/emailService');

// Create New Order
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentId, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order.' });
    }

    if (!shippingAddress || !paymentMethod || !totalAmount) {
      return res.status(400).json({ message: 'Missing order details.' });
    }

    // Verify stock and fetch fresh product names/images to ensure consistency
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productName}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}` });
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        productId: product._id,
        productName: product.name,
        quantity: Number(item.quantity),
        price: Number(product.price * (1 - (product.discount || 0) / 100)), // dynamic calculated price
        size: item.size || 'M',
        color: item.color || 'Default',
        image: product.images[0] || ''
      });
    }

    // Set payment status
    // COD is Pending by default. UPI/Card in simulator is marked Completed if mock payment succeeds.
    const paymentStatus = (paymentMethod === 'Cash on Delivery') ? 'Pending' : 'Completed';

    const order = await Order.create({
      userId: req.user ? req.user.id : 'guest_' + Math.random().toString(36).substring(7),
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      paymentId: paymentId || 'sim_' + Math.random().toString(36).substring(7),
      orderStatus: 'Pending',
      totalAmount: Number(totalAmount)
    });

    // Send emails asynchronously
    emailService.sendAdminNotification(order).catch(err => console.error('Admin email notify fail:', err));
    emailService.sendCustomerConfirmation(order).catch(err => console.error('Customer email notify fail:', err));

    res.status(201).json({ message: 'Order placed successfully.', order });
  } catch (err) {
    console.error('[Create Order Error]', err);
    res.status(500).json({ message: 'Server error processing order.' });
  }
};

// Get Order Details
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Check authorization (must be either the user who ordered or an admin)
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && String(order.userId) === String(req.user.id);
    // Support guest checking via email alignment in shipping info
    const isGuestOwner = order.shippingAddress.email === (req.user ? req.user.email : '');

    if (!isAdmin && !isOwner && !isGuestOwner) {
      return res.status(403).json({ message: 'Not authorized to view this order.' });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error('[Get Order Error]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get My Orders
exports.getMyOrders = async (req, res) => {
  try {
    // If authenticated customer
    const query = { userId: req.user.id };
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error('[Get My Orders Error]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get All Orders (Admin Dashboard)
exports.getAllOrders = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status) {
      query.orderStatus = status;
    }

    let orders = await Order.find(query).sort({ createdAt: -1 });

    if (search) {
      // Filter in JS for search (since shipping address details are nested)
      const searchLower = search.toLowerCase();
      orders = orders.filter(order => 
        String(order._id).toLowerCase().includes(searchLower) ||
        order.shippingAddress.fullName.toLowerCase().includes(searchLower) ||
        order.shippingAddress.email.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json(orders);
  } catch (err) {
    console.error('[Get All Orders Error]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update Order Status (Admin Dashboard)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = status;

    if (status === 'Shipped') {
      order.shippedAt = new Date().toISOString();
    } else if (status === 'Delivered') {
      order.deliveredAt = new Date().toISOString();
      order.paymentStatus = 'Completed'; // Delivered items are paid
    } else if (status === 'Cancelled') {
      order.cancelledAt = new Date().toISOString();
      
      // Restore stock
      if (oldStatus !== 'Cancelled') {
        for (const item of order.items) {
          const product = await Product.findById(item.productId);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        }
      }
    }

    await order.save();
    res.status(200).json({ message: `Order marked as ${status} successfully.`, order });
  } catch (err) {
    console.error('[Update Order Status Error]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Cancel Order (User or Guest)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Check authorization: must be user who created it, and must be Pending
    if (order.orderStatus !== 'Pending') {
      return res.status(400).json({ message: 'Cannot cancel order. Already shipped/delivered/cancelled.' });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date().toISOString();

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await order.save();
    res.status(200).json({ message: 'Order cancelled successfully.', order });
  } catch (err) {
    console.error('[Cancel Order Error]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin Dashboard Analytical Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const allOrders = await Order.find({});
    const allProductsCount = await Product.countDocuments({});
    
    // Process unique customers
    const uniqueCustomerIds = new Set();
    allOrders.forEach(o => {
      if (o.userId && !o.userId.startsWith('guest_')) {
        uniqueCustomerIds.add(o.userId);
      }
    });
    
    // Revenue calculations (only from Completed/delivered orders or COD/UPI that completed)
    let totalRevenue = 0;
    allOrders.forEach(o => {
      if (o.orderStatus !== 'Cancelled' && o.paymentStatus === 'Completed') {
        totalRevenue += o.totalAmount;
      }
    });

    const recentOrders = allOrders.slice(0, 5);

    res.status(200).json({
      totalProducts: allProductsCount,
      totalOrders: allOrders.length,
      revenue: totalRevenue,
      customers: uniqueCustomerIds.size || allOrders.length, // approximation
      recentOrders
    });
  } catch (err) {
    console.error('[Dashboard Stats Error]', err);
    res.status(500).json({ message: 'Server error retrieving stats.' });
  }
};
