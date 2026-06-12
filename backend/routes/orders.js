/**
 * routes/orders.js
 * Order management routes.
 * NOTE: /admin/all and /verify-payment are declared BEFORE /:id to avoid conflicts.
 */

import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import verifyToken from '../middleware/auth.js';
import requireAdmin from '../middleware/admin.js';

const router = Router();

// ── User Routes ───────────────────────────────────────────────────────────────
router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getUserOrders);

// IMPORTANT: declare specific paths before /:id to prevent route shadowing
router.post('/verify-payment', verifyToken, verifyPayment);
router.get('/admin/all', verifyToken, requireAdmin, getAllOrders);

// ── Dynamic Routes ────────────────────────────────────────────────────────────
router.get('/:id', verifyToken, getOrderById);
router.put('/:id/status', verifyToken, requireAdmin, updateOrderStatus);

export default router;
