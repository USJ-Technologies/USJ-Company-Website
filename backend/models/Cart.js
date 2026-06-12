/**
 * models/Cart.js
 * One cart per user. Items reference Products and cache the price
 * at the time the item was added.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

// ─── Cart Item Sub-Schema ─────────────────────────────────────────────────────
const cartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    qty: {
      type: Number,
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
    price: { type: Number }, // snapshot of price when added
  },
  { _id: true }
);

// ─── Cart Schema ──────────────────────────────────────────────────────────────
const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // enforces one-cart-per-user
  },
  items: [cartItemSchema],
  updatedAt: { type: Date, default: Date.now },
});

// Refresh the updatedAt timestamp on every save
cartSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
