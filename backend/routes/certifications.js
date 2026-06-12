/**
 * routes/certifications.js
 * Certification routes.
 * GET is public; write operations require admin auth.
 * POST/PUT include uploadSingle middleware for image upload.
 * NOTE: /reorder must come before /:id.
 */

import { Router } from 'express';
import {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  reorderCertifications,
} from '../controllers/certificationController.js';
import verifyToken from '../middleware/auth.js';
import requireAdmin from '../middleware/admin.js';
import { uploadSingle } from '../config/multer.js';

const router = Router();

router.get('/', getCertifications);                                           // Public

// IMPORTANT: /reorder before /:id
router.put('/reorder', verifyToken, requireAdmin, reorderCertifications);

router.post('/', verifyToken, requireAdmin, uploadSingle, createCertification);
router.put('/:id', verifyToken, requireAdmin, uploadSingle, updateCertification);
router.delete('/:id', verifyToken, requireAdmin, deleteCertification);

export default router;
