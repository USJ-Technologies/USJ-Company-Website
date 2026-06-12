/**
 * models/Project.js
 * Past and current projects/clients displayed as a portfolio on the website.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
    },
    client: { type: String },
    clientType: {
      type: String,
      enum: ['Govt', 'Defence', 'Tech', 'GeM', 'Private'],
    },
    description: { type: String },
    imageUrl: { type: String }, // local upload path
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // display order
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;
