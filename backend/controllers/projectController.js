/**
 * controllers/projectController.js
 * CRUD for the company portfolio/projects showcase.
 */

import Project from '../models/Project.js';

// ─── Get Projects (Public) ────────────────────────────────────────────────────

/**
 * GET /api/projects
 * Public: returns all active projects sorted by display order.
 */
export const getProjects = async (req, res) => {
  const projects = await Project.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  res.json({ success: true, data: { projects } });
};

// ─── Create Project (Admin) ───────────────────────────────────────────────────

/**
 * POST /api/projects
 * Accepts optional image upload via uploadSingle middleware.
 */
export const createProject = async (req, res) => {
  const projectData = { ...req.body };

  if (req.file) {
    projectData.imageUrl = `/uploads/${req.file.filename}`;
  }

  // Parse tags array from form data string
  if (typeof projectData.tags === 'string') {
    try { projectData.tags = JSON.parse(projectData.tags); } catch (_) { /**/ }
  }

  const project = await Project.create(projectData);
  res.status(201).json({ success: true, message: 'Project created.', data: { project } });
};

// ─── Update Project (Admin) ───────────────────────────────────────────────────

/**
 * PUT /api/projects/:id
 */
export const updateProject = async (req, res) => {
  const updates = { ...req.body };

  if (req.file) {
    updates.imageUrl = `/uploads/${req.file.filename}`;
  }

  if (typeof updates.tags === 'string') {
    try { updates.tags = JSON.parse(updates.tags); } catch (_) { /**/ }
  }

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  res.json({ success: true, message: 'Project updated.', data: { project } });
};

// ─── Delete Project (Admin) ───────────────────────────────────────────────────

/**
 * DELETE /api/projects/:id
 * Soft-delete by setting isActive = false.
 */
export const deleteProject = async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  res.json({ success: true, message: 'Project deactivated.' });
};
