/**
 * routes/auth.js
 * Authentication routes — register, login, me, logout.
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, logout } from '../controllers/authController.js';
import verifyToken from '../middleware/auth.js';

const router = Router();

// ── Validation rules ──────────────────────────────────────────────────────────

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

// ── Routes ────────────────────────────────────────────────────────────────────

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

export default router;
