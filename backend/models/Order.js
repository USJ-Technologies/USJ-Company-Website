/**
 * models/Order.js
 * Captures a confirmed purchase including line items, shipping address,
 * pricing breakdown, and Razorpay payment references.
 */

import mongoose from 'mongoose';
import constants from '../config/constants.js';

const { Schema } = mongoose;
const { ORDER_STATUS } = constants;

// ─── Order Item Sub-Schema ────────────────────────────────────────────────────
const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String }, // snapshot of name at time of order
    image: { type: String }, // snapshot of first image
    qty: { type: Number },
    price: { type: Number }, // unit price at time of order
    sku: { type: String },
  },
  { _id: false }
);

// ─── Shipping Address Sub-Schema ──────────────────────────────────────────────
const shippingAddressSchema = new Schema(
  {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  { _id: false }
);

// ─── Pricing Sub-Schema ───────────────────────────────────────────────────────
const pricingSchema = new Schema(
  {
    subtotal: Number,
    gst: Number,       // 18% GST applied on subtotal
    shipping: Number,
    total: Number,
  },
  { _id: false }
);

// ─── Order Schema ─────────────────────────────────────────────────────────────
const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    pricing: pricingSchema,
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'],
      default: 'razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    // Razorpay-specific references for reconciliation
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    status: {
      type: String,
      enum: ORDER_STATUS,
      default: 'pending',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// ─── Pre-save Hook: Auto-generate Order Number ────────────────────────────────
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `USJ-${Date.now()}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
