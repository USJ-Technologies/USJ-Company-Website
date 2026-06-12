/**
 * models/Product.js
 * Full product schema supporting B2B/B2C, PDF import catalogues,
 * full-text search, and rich specifications.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

// ─── Helper: slugify ──────────────────────────────────────────────────────────
const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// ─── Specification Sub-Schema ─────────────────────────────────────────────────
const specSchema = new Schema(
  {
    key: { type: String, trim: true },
    value: { type: String, trim: true },
  },
  { _id: false }
);

// ─── Product Schema ───────────────────────────────────────────────────────────
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true, // allows multiple documents with null SKU
    },
    description: { type: String }, // rich text / HTML allowed
    shortDescription: { type: String, maxlength: 500 },
    price: { type: Number, min: 0 },
    salePrice: { type: Number, min: 0 },

    // Category relationship
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    categoryName: { type: String }, // denormalised for read performance

    subCategory: { type: String },
    brand: { type: String },

    // Images stored as local upload paths e.g. /uploads/filename.jpg
    images: [{ type: String }],

    stock: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: 'piece' },

    specifications: [specSchema],
    tags: [{ type: String }],

    isB2B: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Tracks how the product record was created
    catalogSource: {
      type: String,
      enum: ['manual', 'pdf_import'],
      default: 'manual',
    },
  },
  { timestamps: true }
);

// ─── Text Index for Full-Text Search ─────────────────────────────────────────
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// ─── Pre-save Hook: Auto-generate Slug ───────────────────────────────────────
productSchema.pre('save', function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name);
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
