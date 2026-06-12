/**
 * controllers/orderController.js
 * Handles order creation with Razorpay integration, payment verification,
 * and order management for both users and admins.
 */

import crypto from 'crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import razorpay from '../config/razorpay.js';
import constants from '../config/constants.js';
import { sendOrderConfirmation } from '../utils/sendEmail.js';

const { GST_RATE, PAGINATION } = constants;

// ─── Create Order ─────────────────────────────────────────────────────────────

/**
 * POST /api/orders
 * Body: { items, shippingAddress, paymentMethod, notes }
 * Calculates pricing with GST, creates a Razorpay order, persists to DB.
 */
export const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'razorpay', notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
  }

  // ── Calculate Pricing ──────────────────────────────────────────────────
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gst = parseFloat((subtotal * GST_RATE).toFixed(2));
  const shipping = subtotal > 5000 ? 0 : 99; // free shipping above ₹5000
  const total = parseFloat((subtotal + gst + shipping).toFixed(2));

  // ── Create Razorpay Order ──────────────────────────────────────────────
  let razorpayOrderId = null;

  if (paymentMethod === 'razorpay') {
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // Razorpay uses paise
      currency: constants.CURRENCY,
      receipt: `USJ-${Date.now()}`,
    });
    razorpayOrderId = rpOrder.id;
  }

  // ── Persist Order ──────────────────────────────────────────────────────
  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    pricing: { subtotal, gst, shipping, total },
    paymentMethod,
    razorpayOrderId,
    notes,
  });

  res.status(201).json({
    success: true,
    message: 'Order created. Proceed with payment.',
    data: {
      order,
      razorpayOrderId,
      amount: Math.round(total * 100),
      currency: constants.CURRENCY,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  });
};

// ─── Verify Payment ───────────────────────────────────────────────────────────

/**
 * POST /api/orders/verify-payment
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId }
 * Verifies the Razorpay payment signature using HMAC-SHA256.
 */
export const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  // Construct the expected signature
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
  }

  // ── Update order status ────────────────────────────────────────────────
  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  order.paymentStatus = 'paid';
  order.status = 'confirmed';
  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  await order.save();

  // ── Clear user's cart ──────────────────────────────────────────────────
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  // ── Send confirmation email (non-blocking) ────────────────────────────
  sendOrderConfirmation(order, req.user).catch((err) =>
    console.error('Order confirmation email failed:', err.message)
  );

  res.json({
    success: true,
    message: 'Payment verified. Order confirmed!',
    data: { order },
  });
};

// ─── Get User Orders ──────────────────────────────────────────────────────────

/**
 * GET /api/orders
 * Paginated list of the authenticated user's orders.
 */
export const getUserOrders = async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.json({
    success: true,
    data: { orders, total, page, pages: Math.ceil(total / limit) },
  });
};

// ─── Get Order By ID ──────────────────────────────────────────────────────────

/**
 * GET /api/orders/:id
 * Returns a single order. Admins can view any order; users can only view their own.
 */
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Enforce ownership for non-admin users
  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  res.json({ success: true, data: { order } });
};

// ─── Get All Orders (Admin) ───────────────────────────────────────────────────

/**
 * GET /api/orders/admin/all
 * Admin: paginated list of all orders with optional filters.
 */
export const getAllOrders = async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email'),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { orders, total, page, pages: Math.ceil(total / limit) },
  });
};

// ─── Update Order Status (Admin) ──────────────────────────────────────────────

/**
 * PUT /api/orders/:id/status
 * Admin: updates the fulfilment status of an order.
 */
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  if (!constants.ORDER_STATUS.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed values: ${constants.ORDER_STATUS.join(', ')}`,
    });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  res.json({ success: true, message: 'Order status updated.', data: { order } });
};
