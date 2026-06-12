/**
 * server.js
 * Main entry point for the USJ Technologies REST API.
 * Connects to MongoDB, registers all middleware and routes,
 * and starts the HTTP server.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// ── Route Imports ─────────────────────────────────────────────────────────────
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
import inquiriesRouter from './routes/inquiries.js';
import venturesRouter from './routes/ventures.js';
import certificationsRouter from './routes/certifications.js';
import projectsRouter from './routes/projects.js';

// ── ES Module __dirname shim ──────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Express App ───────────────────────────────────────────────────────────────
const app = express();

// CORS — allow requests only from the configured frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically at /uploads/<filename>
app.use(
  '/uploads',
  express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads'))
);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    company: 'USJ Technologies Pvt Ltd',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/ventures', venturesRouter);
app.use('/api/certifications', certificationsRouter);
app.use('/api/projects', projectsRouter);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global Error Handler (must be LAST) ──────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 USJ Technologies API running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});
