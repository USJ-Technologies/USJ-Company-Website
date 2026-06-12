/**
 * utils/sendEmail.js
 * Nodemailer-based email utility.
 * Provides a generic sendEmail function plus pre-formatted helpers
 * for inquiry notifications and order confirmations.
 */

import nodemailer from 'nodemailer';
import constants from '../config/constants.js';

// ─── Transporter ──────────────────────────────────────────────────────────────

/**
 * Creates a nodemailer transporter using SMTP credentials from .env.
 * Re-used for every email send (nodemailer handles connection pooling).
 */
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // use STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

// ─── Generic Send ─────────────────────────────────────────────────────────────

/**
 * Sends an email via the configured SMTP transporter.
 * @param {{ to: string, subject: string, html: string, text?: string }} options
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
    ...(text && { text }),
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${to}: ${info.messageId}`);
  return info;
};

// ─── Inquiry Notification ─────────────────────────────────────────────────────

/**
 * Sends a formatted inquiry notification email to the admin.
 * @param {Object} inquiry - Mongoose Inquiry document
 */
export const sendInquiryNotification = async (inquiry) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a56db;">New Inquiry Received — ${constants.COMPANY.NAME}</h2>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding:8px; font-weight:bold;">Name</td><td style="padding:8px;">${inquiry.name}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px; font-weight:bold;">Email</td><td style="padding:8px;">${inquiry.email}</td></tr>
        <tr><td style="padding:8px; font-weight:bold;">Phone</td><td style="padding:8px;">${inquiry.phone || 'N/A'}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px; font-weight:bold;">Organization</td><td style="padding:8px;">${inquiry.organization || 'N/A'}</td></tr>
        <tr><td style="padding:8px; font-weight:bold;">Type</td><td style="padding:8px;">${inquiry.type}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px; font-weight:bold;">Subject</td><td style="padding:8px;">${inquiry.subject || 'N/A'}</td></tr>
      </table>
      <h3 style="margin-top:20px;">Message</h3>
      <p style="background:#f0f4ff; padding:16px; border-radius:4px;">${inquiry.message}</p>
      <p style="color:#888; font-size:12px;">Received at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
    </div>
  `;

  return sendEmail({
    to: process.env.EMAIL_TO_ADMIN,
    subject: `[New Inquiry] ${inquiry.type.toUpperCase()} from ${inquiry.name}`,
    html,
  });
};

// ─── Order Confirmation ───────────────────────────────────────────────────────

/**
 * Sends an order confirmation email to the customer.
 * @param {Object} order - Mongoose Order document
 * @param {Object} user  - Mongoose User document
 */
export const sendOrderConfirmation = async (order, user) => {
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;">${item.name}</td>
        <td style="padding:8px; text-align:center;">${item.qty}</td>
        <td style="padding:8px; text-align:right;">₹${item.price.toLocaleString('en-IN')}</td>
        <td style="padding:8px; text-align:right;">₹${(item.qty * item.price).toLocaleString('en-IN')}</td>
      </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h2 style="color: #1a56db;">Order Confirmed! 🎉</h2>
      <p>Hi ${user.name}, thank you for your order.</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>

      <table style="width:100%; border-collapse:collapse; margin-top:16px;">
        <thead>
          <tr style="background:#1a56db; color:#fff;">
            <th style="padding:8px; text-align:left;">Product</th>
            <th style="padding:8px;">Qty</th>
            <th style="padding:8px;">Unit Price</th>
            <th style="padding:8px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <table style="width:100%; margin-top:16px;">
        <tr><td>Subtotal</td><td style="text-align:right;">₹${order.pricing.subtotal.toLocaleString('en-IN')}</td></tr>
        <tr><td>GST (18%)</td><td style="text-align:right;">₹${order.pricing.gst.toLocaleString('en-IN')}</td></tr>
        <tr><td>Shipping</td><td style="text-align:right;">₹${order.pricing.shipping.toLocaleString('en-IN')}</td></tr>
        <tr style="font-weight:bold; font-size:1.1em;">
          <td>Total</td>
          <td style="text-align:right;">₹${order.pricing.total.toLocaleString('en-IN')}</td>
        </tr>
      </table>

      <h3 style="margin-top:24px;">Shipping Address</h3>
      <p>
        ${order.shippingAddress.name}<br/>
        ${order.shippingAddress.street}<br/>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} — ${order.shippingAddress.pincode}<br/>
        Phone: ${order.shippingAddress.phone}
      </p>

      <p style="color:#888; font-size:12px; margin-top:24px;">
        If you have any questions, reply to this email or contact us at ${constants.COMPANY.EMAIL}.
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Confirmed — ${order.orderNumber} | ${constants.COMPANY.NAME}`,
    html,
  });
};
