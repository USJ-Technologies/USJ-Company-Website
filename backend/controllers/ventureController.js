/**
 * controllers/ventureController.js
 * CRUD for USJ Technologies' subsidiary ventures.
 */

import Venture from '../models/Venture.js';

// ─── Get Ventures (Public) ────────────────────────────────────────────────────

/**
 * GET /api/ventures
 * Public: returns all active ventures, sorted by display order.
 */
export const getVentures = async (req, res) => {
  const filter = { isActive: true };

  // Optionally expose unrevealed ventures only in admin context
  // (but this route is public, so only show revealed ones)
  filter.isRevealed = true;

  const ventures = await Venture.find(filter).sort({ order: 1, createdAt: 1 });
  res.json({ success: true, data: { ventures } });
};

// ─── Create Venture (Admin) ───────────────────────────────────────────────────

/**
 * POST /api/ventures
 */
export const createVenture = async (req, res) => {
  const venture = await Venture.create(req.body);
  res.status(201).json({ success: true, message: 'Venture created.', data: { venture } });
};

// ─── Update Venture (Admin) ───────────────────────────────────────────────────

/**
 * PUT /api/ventures/:id
 */
export const updateVenture = async (req, res) => {
  const venture = await Venture.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!venture) {
    return res.status(404).json({ success: false, message: 'Venture not found.' });
  }

  res.json({ success: true, message: 'Venture updated.', data: { venture } });
};

// ─── Delete Venture (Admin) ───────────────────────────────────────────────────

/**
 * DELETE /api/ventures/:id
 * Soft-delete by setting isActive = false.
 */
export const deleteVenture = async (req, res) => {
  const venture = await Venture.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!venture) {
    return res.status(404).json({ success: false, message: 'Venture not found.' });
  }

  res.json({ success: true, message: 'Venture deactivated.' });
};
