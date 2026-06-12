/**
 * middleware/admin.js
 * Role-based access guard — restricts routes to admin users only.
 * Must be placed AFTER verifyToken in the middleware chain.
 */

/**
 * requireAdmin middleware
 * Checks that the authenticated user has the 'admin' role.
 * Returns 403 Forbidden if not.
 */
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin privileges required.',
  });
};

export default requireAdmin;
