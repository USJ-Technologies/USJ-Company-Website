/**
 * routes/products.js
 * Product catalogue routes.
 * NOTE: /import-pdf is declared BEFORE /:slug to prevent route conflicts.
 */

import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  importFromPdf,
  createProductsBulk,
} from '../controllers/productController.js';
import verifyToken from '../middleware/auth.js';
import requireAdmin from '../middleware/admin.js';
import { uploadMultiple, pdfUpload } from '../config/multer.js';

const router = Router();

// ── Public Routes ─────────────────────────────────────────────────────────────
router.get('/', getProducts);

// IMPORTANT: This specific route must come before the dynamic /:slug route
router.post(
  '/import-pdf',
  verifyToken,
  requireAdmin,
  pdfUpload,
  importFromPdf
);

router.get('/:slug', getProductBySlug);

// ── Admin Protected Routes ────────────────────────────────────────────────────
router.post('/', verifyToken, requireAdmin, uploadMultiple, createProduct);
router.post('/bulk', verifyToken, requireAdmin, createProductsBulk);
router.put('/:id', verifyToken, requireAdmin, uploadMultiple, updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

export default router;
