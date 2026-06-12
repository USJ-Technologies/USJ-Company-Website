/**
 * models/Inquiry.js
 * Stores contact/inquiry form submissions from website visitors.
 * Supports general enquiries, quote requests, career, and partnership types.
 */

import mongoose from 'mongoose';
import constants from '../config/constants.js';

const { Schema } = mongoose;
const { INQUIRY_TYPES, INQUIRY_STATUS } = constants;

const inquirySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    phone: { type: String },
    organization: { type: String },
    designation: { type: String },

    type: {
      type: String,
      enum: INQUIRY_TYPES,
      default: 'general',
    },
    subject: { type: String },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },

    // Optional product reference for quote requests
    productRef: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: { type: Number },

    // Admin workflow fields
    status: {
      type: String,
      enum: INQUIRY_STATUS,
      default: 'new',
    },
    adminResponse: { type: String },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
