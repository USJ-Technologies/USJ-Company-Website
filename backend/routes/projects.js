/**
 * routes/projects.js
 * Portfolio project routes.
 * GET is public; write operations require admin auth + image upload.
 */

import { Router } from 'express';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import verifyToken from '../middleware/auth.js';
import requireAdmin from '../middleware/admin.js';
import { uploadSingle } from '../config/multer.js';

const router = Router();

router.get('/', getProjects);                                            // Public
router.post('/', verifyToken, requireAdmin, uploadSingle, createProject);
router.put('/:id', verifyToken, requireAdmin, uploadSingle, updateProject);
router.delete('/:id', verifyToken, requireAdmin, deleteProject);

export default router;
