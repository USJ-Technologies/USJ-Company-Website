/**
 * routes/ventures.js
 * Venture subsidiary routes.
 * GET is public; create/update/delete require admin auth.
 */

import { Router } from 'express';
import {
  getVentures,
  createVenture,
  updateVenture,
  deleteVenture,
} from '../controllers/ventureController.js';
import verifyToken from '../middleware/auth.js';
import requireAdmin from '../middleware/admin.js';

const router = Router();

router.get('/', getVentures);                                           // Public
router.post('/', verifyToken, requireAdmin, createVenture);
router.put('/:id', verifyToken, requireAdmin, updateVenture);
router.delete('/:id', verifyToken, requireAdmin, deleteVenture);

export default router;
