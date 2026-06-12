/**
 * config/constants.js
 * Central place for all shared application constants.
 * Import specific values instead of hardcoding them throughout the codebase.
 */

const constants = {
  // GST rate applied to all orders (18%)
  GST_RATE: 0.18,

  // Default currency for transactions
  CURRENCY: 'INR',

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // Allowed lifecycle states for an order
  ORDER_STATUS: [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ],

  // Types of contact/inquiry a visitor can submit
  INQUIRY_TYPES: ['general', 'quote', 'career', 'partnership'],

  // Lifecycle states for an inquiry ticket
  INQUIRY_STATUS: ['new', 'in_progress', 'responded', 'closed'],

  // Available sort options for the product listing page
  PRODUCT_SORT_OPTIONS: ['featured', 'price_asc', 'price_desc', 'newest'],

  // File upload constraints (file size read from env at runtime)
  UPLOAD: {
    MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10 MB default
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    ALLOWED_DOC_TYPES: ['application/pdf'],
  },

  // Static company information used in emails and API responses
  COMPANY: {
    NAME: 'USJ Technologies Pvt Ltd',
    TAGLINE: "Building India's Future Through Technology",
    ADDRESS: 'Dehradun, Uttarakhand, India',
    EMAIL: process.env.EMAIL_FROM,
    PHONE: '+91-XXXXXXXXXX',
    GST_NO: 'PENDING',
    CIN: 'PENDING',
  },
};

export default constants;
