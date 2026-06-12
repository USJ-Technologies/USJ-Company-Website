/**
 * controllers/authController.js
 * Handles user registration, login, profile retrieval, and logout.
 */

import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

// ─── Helper: Generate JWT ─────────────────────────────────────────────────────

/**
 * Signs a JWT containing the user's _id and role.
 * @param {string} id   - User's MongoDB ObjectId
 * @param {string} role - User's role ('user' | 'admin')
 * @returns {string} Signed JWT
 */
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Creates a new user account and returns a JWT.
 */
export const register = async (req, res) => {
  // Run express-validator checks
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, phone } = req.body;

  // Check for duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists.',
    });
  }

  const user = await User.create({ name, email, password, phone });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    },
  });
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Validates credentials and returns a JWT on success.
 */
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  // Explicitly select the password field (it's select:false in the schema)
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.',
    });
  }

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    message: 'Login successful.',
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    },
  });
};

// ─── Get Me ───────────────────────────────────────────────────────────────────

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile (populated by verifyToken).
 */
export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
};

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/logout
 * JWT is stateless — the client is responsible for discarding the token.
 * This endpoint exists as a convention and can be extended for cookie-based sessions.
 */
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully. Please discard your token on the client.',
  });
};
