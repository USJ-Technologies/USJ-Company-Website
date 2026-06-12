/**
 * routes/cart.js
 * Shopping cart routes — all require authentication.
 */

import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import verifyToken from '../middleware/auth.js';

const router = Router();

// All cart routes require a valid JWT
router.get('/', verifyToken, getCart);
router.post('/add', verifyToken, addToCart);
router.put('/update', verifyToken, updateCartItem);
router.delete('/remove/:productId', verifyToken, removeFromCart);
router.delete('/clear', verifyToken, clearCart);

export default router;
