/**
 * controllers/certificationController.js
 * CRUD + reorder for company certifications/accreditations.
 */

import Certification from '../models/Certification.js';

// ─── Get Certifications (Public) ──────────────────────────────────────────────

/**
 * GET /api/certifications
 * Public: returns all visible certifications sorted by order field.
 */
export const getCertifications = async (req, res) => {
  const certifications = await Certification.find({ isVisible: true }).sort({ order: 1 });
  res.json({ success: true, data: { certifications } });
};

// ─── Create Certification (Admin) ─────────────────────────────────────────────

/**
 * POST /api/certifications
 * Accepts optional image upload via uploadSingle middleware.
 */
export const createCertification = async (req, res) => {
  const certData = { ...req.body };

  if (req.file) {
    certData.imageUrl = `/uploads/${req.file.filename}`;
  }

  const certification = await Certification.create(certData);
  res.status(201).json({
    success: true,
    message: 'Certification created.',
    data: { certification },
  });
};

// ─── Update Certification (Admin) ─────────────────────────────────────────────

/**
 * PUT /api/certifications/:id
 */
export const updateCertification = async (req, res) => {
  const updates = { ...req.body };

  if (req.file) {
    updates.imageUrl = `/uploads/${req.file.filename}`;
  }

  const certification = await Certification.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  if (!certification) {
    return res.status(404).json({ success: false, message: 'Certification not found.' });
  }

  res.json({ success: true, message: 'Certification updated.', data: { certification } });
};

// ─── Delete Certification (Admin) ─────────────────────────────────────────────

/**
 * DELETE /api/certifications/:id
 */
export const deleteCertification = async (req, res) => {
  const certification = await Certification.findByIdAndDelete(req.params.id);

  if (!certification) {
    return res.status(404).json({ success: false, message: 'Certification not found.' });
  }

  res.json({ success: true, message: 'Certification deleted.' });
};

// ─── Reorder Certifications (Admin) ───────────────────────────────────────────

/**
 * PUT /api/certifications/reorder
 * Body: [{ id: '...', order: 1 }, { id: '...', order: 2 }, ...]
 * Bulk updates the display order.
 */
export const reorderCertifications = async (req, res) => {
  const updates = req.body; // expected: array of { id, order }

  if (!Array.isArray(updates)) {
    return res.status(400).json({ success: false, message: 'Expected an array of { id, order }.' });
  }

  const bulkOps = updates.map(({ id, order }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: parseInt(order) } },
    },
  }));

  await Certification.bulkWrite(bulkOps);

  res.json({ success: true, message: 'Certifications reordered.' });
};
