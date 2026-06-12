/**
 * config/multer.js
 * Configures Multer for local disk file storage.
 * Provides separate upload handlers for images and PDF documents.
 */

import multer from 'multer';
import path from 'path';
import constants from './constants.js';

const { ALLOWED_IMAGE_TYPES, ALLOWED_DOC_TYPES, MAX_SIZE } = constants.UPLOAD;

// ─── Storage Configuration ────────────────────────────────────────────────────

const storage = multer.diskStorage({
  /**
   * Save all uploads to the UPLOAD_DIR defined in .env (default: 'uploads').
   * process.cwd() resolves to the backend root regardless of where the
   * server is launched from.
   */
  destination: (_req, _file, cb) => {
    const dest = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
    cb(null, dest);
  },

  /**
   * Build a collision-resistant filename by prepending the current timestamp.
   * Spaces in the original name are replaced with underscores.
   */
  filename: (_req, file, cb) => {
    const sanitized = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, `${Date.now()}-${sanitized}`);
  },
});

// ─── File Filters ─────────────────────────────────────────────────────────────

/** Allow only image MIME types */
const imageFileFilter = (_req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed image types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
      ),
      false
    );
  }
};

/** Allow only PDF MIME type */
const pdfFileFilter = (_req, file, cb) => {
  if (ALLOWED_DOC_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for this upload.'), false);
  }
};

// ─── Export Upload Handlers ───────────────────────────────────────────────────

const imageUploader = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_SIZE },
});

/** Single image upload — field name: 'image' */
export const uploadSingle = imageUploader.single('image');

/** Multiple image upload — field name: 'images', max 5 files */
export const uploadMultiple = imageUploader.array('images', 5);

/** Single PDF upload — field name: 'catalog' */
export const pdfUpload = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: { fileSize: MAX_SIZE },
}).single('catalog');
