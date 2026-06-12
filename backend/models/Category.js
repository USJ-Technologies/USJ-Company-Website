/**
 * models/Category.js
 * Product categories with auto-generated URL-friendly slugs.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

// ─── Helper: slugify ──────────────────────────────────────────────────────────
const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// ─── Category Schema ──────────────────────────────────────────────────────────
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: { type: String },
    image: { type: String }, // URL or local upload path
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // display order on the frontend
  },
  { timestamps: true }
);

// ─── Pre-save Hook: Auto-generate Slug ───────────────────────────────────────
categorySchema.pre('save', function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name);
  }
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
