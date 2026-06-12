/**
 * controllers/categoryController.js
 * CRUD operations for product categories.
 */

import Category from '../models/Category.js';
import Product from '../models/Product.js';

// ─── Get All Categories ───────────────────────────────────────────────────────

/**
 * GET /api/categories
 * Returns all active categories sorted by their display order.
 */
export const getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
  res.json({ success: true, data: { categories } });
};

// ─── Create Category ──────────────────────────────────────────────────────────

/**
 * POST /api/categories
 * Admin: creates a new category (slug auto-generated in pre-save hook).
 */
export const createCategory = async (req, res) => {
  const { name, description, image, order } = req.body;

  const category = await Category.create({ name, description, image, order });

  res.status(201).json({
    success: true,
    message: 'Category created.',
    data: { category },
  });
};

// ─── Update Category ──────────────────────────────────────────────────────────

/**
 * PUT /api/categories/:id
 * Admin: updates category fields.
 */
export const updateCategory = async (req, res) => {
  const { name, description, image, order, isActive } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }

  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (order !== undefined) category.order = order;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save(); // triggers slug regeneration if name changed

  res.json({ success: true, message: 'Category updated.', data: { category } });
};

// ─── Delete Category ──────────────────────────────────────────────────────────

/**
 * DELETE /api/categories/:id
 * Admin: hard-deletes the category if no products are linked to it.
 */
export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }

  // Prevent deletion if products are still linked
  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category — ${productCount} product(s) are still assigned to it.`,
    });
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted.' });
};
