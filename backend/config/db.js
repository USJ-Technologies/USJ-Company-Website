/**
 * config/db.js
 * Establishes the MongoDB connection using Mongoose.
 * Reads the connection URI from environment variables.
 */

import mongoose from 'mongoose';

/**
 * Connects to MongoDB and logs the result.
 * On failure, logs the error and exits the process.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    const conn = await mongoose.connect(uri);

    // Mask credentials in the log output for security
    const maskedUri = uri.replace(/:\/\/(.*?)@/, '://***:***@');
    console.log(`✅ MongoDB connected: ${conn.connection.host} (${maskedUri})`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
