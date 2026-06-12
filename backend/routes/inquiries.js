/**
 * routes/inquiries.js
 * Inquiry/contact-form routes.
 * POST / is public; all other routes require admin authentication.
 */

import { Router } from 'express';
import {
  createInquiry,
  getInquiries,
  getInquiryById,
  respondToInquiry,
} from '../controllers/inquiryController.js';
import verifyToken from '../middleware/auth.js';
import requireAdmin from '../middleware/admin.js';

const router = Router();

router.post('/', createInquiry);                                          // Public
router.get('/', verifyToken, requireAdmin, getInquiries);
router.get('/:id', verifyToken, requireAdmin, getInquiryById);
router.put('/:id/respond', verifyToken, requireAdmin, respondToInquiry);

export default router;
