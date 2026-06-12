/**
 * middleware/errorHandler.js
 * Global Express error-handling middleware.
 * Normalises common Mongoose, JWT, and Multer errors into structured
 * JSON responses. Must be registered LAST in the Express middleware chain.
 */

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Mongoose Validation Error (e.g. required field missing) ──────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(', ');
  }

  // ── Mongoose CastError (invalid ObjectId format) ──────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field '${err.path}': ${err.value}`;
  }

  // ── MongoDB Duplicate Key Error ───────────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
  }

  // ── JWT Errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  // ── Multer File Size Error ────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    const maxMb = (parseInt(process.env.MAX_FILE_SIZE) || 10485760) / 1048576;
    message = `File too large. Maximum allowed size is ${maxMb} MB.`;
  }

  // ── Log full error in development ─────────────────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // ── Send Response ─────────────────────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    message,
    // Only expose the stack trace in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
