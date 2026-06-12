/**
 * routes/categories.js
 * Category CRUD routes.
 */

import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import verifyToken from '../middleware/auth.js';
import requireAdmin from '../middleware/admin.js';

const router = Router();

router.get('/', getCategories);
router.post('/', verifyToken, requireAdmin, createCategory);
router.put('/:id', verifyToken, requireAdmin, updateCategory);
router.delete('/:id', verifyToken, requireAdmin, deleteCategory);

export default router;
