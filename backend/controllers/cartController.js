/**
 * controllers/cartController.js
 * Manages the authenticated user's shopping cart (one cart per user).
 */

import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// ─── Get Cart ─────────────────────────────────────────────────────────────────

/**
 * GET /api/cart
 * Returns the user's cart with fully populated product details.
 */
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name images price salePrice stock isActive slug'
  );

  if (!cart) {
    return res.json({ success: true, data: { cart: { items: [] } } });
  }

  res.json({ success: true, data: { cart } });
};

// ─── Add to Cart ──────────────────────────────────────────────────────────────

/**
 * POST /api/cart/add
 * Body: { productId, qty }
 * Adds a product to the cart or increments qty if already present.
 */
export const addToCart = async (req, res) => {
  const { productId, qty = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId is required.' });
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  if (product.stock < qty) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.stock} unit(s) in stock.`,
    });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // Check if the product is already in the cart
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.qty += parseInt(qty);
  } else {
    cart.items.push({
      product: productId,
      qty: parseInt(qty),
      price: product.salePrice || product.price,
    });
  }

  await cart.save();
  await cart.populate('items.product', 'name images price salePrice stock slug');

  res.json({ success: true, message: 'Item added to cart.', data: { cart } });
};

// ─── Update Cart Item ─────────────────────────────────────────────────────────

/**
 * PUT /api/cart/update
 * Body: { productId, qty }
 * Sets a specific item's quantity. If qty < 1, removes the item.
 */
export const updateCartItem = async (req, res) => {
  const { productId, qty } = req.body;

  if (!productId || qty === undefined) {
    return res.status(400).json({ success: false, message: 'productId and qty are required.' });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found.' });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not found in cart.' });
  }

  if (parseInt(qty) < 1) {
    cart.items.splice(itemIndex, 1); // remove item if qty drops to 0
  } else {
    cart.items[itemIndex].qty = parseInt(qty);
  }

  await cart.save();
  await cart.populate('items.product', 'name images price salePrice stock slug');

  res.json({ success: true, message: 'Cart updated.', data: { cart } });
};

// ─── Remove From Cart ─────────────────────────────────────────────────────────

/**
 * DELETE /api/cart/remove/:productId
 * Removes a single product from the cart.
 */
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found.' });
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  res.json({ success: true, message: 'Item removed from cart.', data: { cart } });
};

// ─── Clear Cart ───────────────────────────────────────────────────────────────

/**
 * DELETE /api/cart/clear
 * Empties all items from the user's cart.
 */
export const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.json({ success: true, message: 'Cart cleared.' });
};
