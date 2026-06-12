/**
 * middleware/auth.js
 * Verifies the JWT Bearer token on protected routes.
 * Attaches the authenticated user to req.user for downstream handlers.
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * verifyToken middleware
 * Extracts the Bearer token from the Authorization header,
 * verifies it, then fetches a fresh copy of the user from the DB
 * (so deactivated accounts are rejected even with a valid token).
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user (checks isActive flag and ensures user still exists)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please log in again.' });
    }
    next(error);
  }
};

export default verifyToken;
