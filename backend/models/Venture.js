/**
 * models/Venture.js
 * Represents a subsidiary/venture under the USJ Technologies umbrella.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const ventureSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Venture name is required'],
    },
    tagline: { type: String },
    description: { type: String },
    logo: { type: String }, // URL or local upload path
    websiteUrl: { type: String },
    category: { type: String }, // e.g. "Legal Services", "Travel"

    status: {
      type: String,
      enum: ['live', 'coming_soon'],
      default: 'coming_soon',
    },

    // Controls whether the venture is publicly revealed on the website
    isRevealed: { type: Boolean, default: true },

    launchDate: { type: Date },
    order: { type: Number, default: 0 }, // display order
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Venture = mongoose.model('Venture', ventureSchema);
export default Venture;
