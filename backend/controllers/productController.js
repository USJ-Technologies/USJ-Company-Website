/**
 * controllers/productController.js
 * Full CRUD + advanced filtering/sorting for the product catalogue.
 * Also handles PDF catalog import (parse only — no auto-save).
 */

import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { parsePdfCatalog } from '../utils/parsePdf.js';
import constants from '../config/constants.js';

const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = constants.PAGINATION;

// ─── Get Products (with filtering, sorting, pagination) ───────────────────────

/**
 * GET /api/products
 * Supports query params: page, limit, category, brand, search, minPrice,
 * maxPrice, inStock, isB2B, sort, isFeatured
 */
export const getProducts = async (req, res) => {
  const {
    page = DEFAULT_PAGE,
    limit: rawLimit = DEFAULT_LIMIT,
    category,
    brand,
    search,
    minPrice,
    maxPrice,
    inStock,
    isB2B,
    sort,
    isFeatured,
  } = req.query;

  const limit = Math.min(parseInt(rawLimit), MAX_LIMIT);
  const skip = (parseInt(page) - 1) * limit;

  // ── Build filter object ────────────────────────────────────────────────
  const filter = { isActive: true };

  // Support both Category ObjectId and categoryName string, including comma-separated lists
  if (category) {
    const isObjectId = (str) => /^[0-9a-fA-F]{24}$/.test(str);
    const categoryValues = category.split(',');
    
    const idFilters = categoryValues.filter(val => isObjectId(val));
    const nameFilters = categoryValues.filter(val => !isObjectId(val));
    
    const orConditions = [];
    if (idFilters.length > 0) {
      orConditions.push({ category: { $in: idFilters } });
    }
    if (nameFilters.length > 0) {
      orConditions.push({ categoryName: { $in: nameFilters.map(name => new RegExp('^' + name.trim() + '$', 'i')) } });
    }
    
    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }
  }

  if (brand) filter.brand = new RegExp(brand, 'i');
  if (isB2B !== undefined) filter.isB2B = isB2B === 'true';
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
  if (inStock === 'true') filter.stock = { $gt: 0 };

  // Support price range checking either salePrice (if active) or regular price
  if (minPrice || maxPrice) {
    const min = minPrice ? parseFloat(minPrice) : null;
    const max = maxPrice ? parseFloat(maxPrice) : null;
    
    const priceFilterConditions = [];
    
    // Condition A: salePrice is set and fits within range
    const salePriceCond = {};
    if (min !== null) salePriceCond.salePrice = { $gte: min };
    if (max !== null) salePriceCond.salePrice = { ...salePriceCond.salePrice, $lte: max };
    
    // Condition B: regular price fits within range (and salePrice is not set/valid)
    const regularPriceCond = {
      $or: [{ salePrice: { $exists: false } }, { salePrice: null }, { salePrice: 0 }]
    };
    if (min !== null) regularPriceCond.price = { $gte: min };
    if (max !== null) regularPriceCond.price = { ...regularPriceCond.price, $lte: max };
    
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { salePrice: { $gt: 0 }, ...salePriceCond },
        regularPriceCond
      ]
    });
  }

  // ── Full-text search via MongoDB text index ────────────────────────────
  let sortObj = { createdAt: -1 }; // default: newest first
  if (search) {
    filter.$text = { $search: search };
    sortObj = { score: { $meta: 'textScore' } };
  }

  // ── Apply explicit sort options ────────────────────────────────────────
  if (!search && sort) {
    switch (sort) {
      case 'price_asc':  sortObj = { price: 1 };  break;
      case 'price_desc': sortObj = { price: -1 }; break;
      case 'newest':     sortObj = { createdAt: -1 }; break;
      case 'featured':   sortObj = { isFeatured: -1, createdAt: -1 }; break;
    }
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug'),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    },
  });
};

// ─── Get Product By Slug ──────────────────────────────────────────────────────

/**
 * GET /api/products/:slug
 */
export const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  }).populate('category', 'name slug description');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  res.json({ success: true, data: { product } });
};

// ─── Create Product ───────────────────────────────────────────────────────────

/**
 * POST /api/products
 * Admin: creates a product. Uploaded images are mapped to /uploads/ paths.
 */
export const createProduct = async (req, res) => {
  const productData = { ...req.body };

  // Map uploaded files to URL paths served statically
  if (req.files && req.files.length > 0) {
    productData.images = req.files.map((f) => `/uploads/${f.filename}`);
  }

  // Denormalise category name for read performance
  if (productData.category) {
    const cat = await Category.findById(productData.category);
    if (cat) productData.categoryName = cat.name;
  }

  // Parse JSON strings from multipart form data
  if (typeof productData.specifications === 'string') {
    try { productData.specifications = JSON.parse(productData.specifications); } catch (_) { /**/ }
  }
  if (typeof productData.tags === 'string') {
    try { productData.tags = JSON.parse(productData.tags); } catch (_) { /**/ }
  }

  const product = await Product.create(productData);

  res.status(201).json({ success: true, message: 'Product created.', data: { product } });
};

// ─── Update Product ───────────────────────────────────────────────────────────

/**
 * PUT /api/products/:id
 * Admin: updates product fields. Appends newly uploaded images.
 */
export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const updates = { ...req.body };

  // Append new uploaded images to existing ones
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => `/uploads/${f.filename}`);
    updates.images = [...(product.images || []), ...newImages];
  }

  // Re-denormalise category name if category changed
  if (updates.category && updates.category !== String(product.category)) {
    const cat = await Category.findById(updates.category);
    if (cat) updates.categoryName = cat.name;
  }

  if (typeof updates.specifications === 'string') {
    try { updates.specifications = JSON.parse(updates.specifications); } catch (_) { /**/ }
  }
  if (typeof updates.tags === 'string') {
    try { updates.tags = JSON.parse(updates.tags); } catch (_) { /**/ }
  }

  Object.assign(product, updates);
  await product.save();

  res.json({ success: true, message: 'Product updated.', data: { product } });
};

// ─── Delete Product ───────────────────────────────────────────────────────────

/**
 * DELETE /api/products/:id
 * Admin: soft-deletes by setting isActive = false.
 */
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  product.isActive = false;
  await product.save();

  res.json({ success: true, message: 'Product deactivated (soft delete).' });
};

// ─── Import From PDF ──────────────────────────────────────────────────────────

/**
 * POST /api/products/import-pdf
 * Admin: receives a PDF catalog, parses it heuristically, and returns
 * the extracted product data for admin review. Does NOT save products.
 */
export const importFromPdf = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
  }

  const fs = await import('fs');
  const buffer = fs.readFileSync(req.file.path);

  const result = await parsePdfCatalog(buffer);

  res.json({
    success: result.success,
    message: result.success
      ? `Parsed ${result.products.length} product(s) from PDF. Review and confirm to import.`
      : 'PDF parsing failed.',
    data: {
      products: result.products,
      rawText: result.rawText,
      ...(result.warning && { warning: result.warning }),
      ...(result.error && { error: result.error }),
    },
  });
};

/**
 * POST /api/products/bulk
 * Admin: bulk creates products from an array of product objects.
 */
export const createProductsBulk = async (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid products data.' });
  }

  const createdProducts = [];
  const errors = [];

  for (const productData of products) {
    try {
      // Find category ID by name or assign a default
      if (productData.categoryName) {
        let cat = await Category.findOne({ name: new RegExp('^' + productData.categoryName + '$', 'i') });
        if (!cat) {
          cat = await Category.create({ name: productData.categoryName });
        }
        productData.category = cat._id;
        productData.categoryName = cat.name;
      }
      
      const product = await Product.create({
        ...productData,
        catalogSource: 'pdf_import'
      });
      createdProducts.push(product);
    } catch (error) {
      errors.push(`Failed to create "${productData.name}": ${error.message}`);
    }
  }

  res.status(201).json({
    success: true,
    message: `Successfully imported ${createdProducts.length} product(s).`,
    data: {
      importedCount: createdProducts.length,
      errors
    }
  });
};
