/**
 * models/User.js
 * Mongoose schema for registered users and admin accounts.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

// ─── Address Sub-Schema ───────────────────────────────────────────────────────
const addressSchema = new Schema(
  {
    label: { type: String, trim: true }, // e.g. "Home", "Office"
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

// ─── User Schema ──────────────────────────────────────────────────────────────
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    phone: {
      type: String,
      trim: true,
    },
    addresses: [addressSchema],
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ─── Pre-save Hook: Hash Password ─────────────────────────────────────────────
userSchema.pre('save', async function () {
  // Only hash if the password field was modified (avoids re-hashing on other updates)
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Instance Method: Compare Password ───────────────────────────────────────
/**
 * Compares a plain-text candidate password with the stored hash.
 * @param {string} candidatePassword - Password provided by the user at login.
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
