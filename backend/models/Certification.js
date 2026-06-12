/**
 * models/Certification.js
 * Company certifications and accreditations displayed on the website.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const certificationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Certification name is required'],
    },
    issuingBody: { type: String },
    issueDate: { type: String }, // human-readable, e.g. "January 2024"
    certId: { type: String },   // registration or certificate number
    description: { type: String },
    imageUrl: { type: String }, // local upload path e.g. /uploads/cert.png
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // display order
  },
  { timestamps: true }
);

const Certification = mongoose.model('Certification', certificationSchema);
export default Certification;
