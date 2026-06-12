/**
 * controllers/inquiryController.js
 * Handles public inquiry submissions and admin inquiry management.
 */

import Inquiry from '../models/Inquiry.js';
import { sendInquiryNotification, sendEmail } from '../utils/sendEmail.js';
import constants from '../config/constants.js';

const { PAGINATION } = constants;

// ─── Create Inquiry (Public) ──────────────────────────────────────────────────

/**
 * POST /api/inquiries
 * Public endpoint. Saves inquiry to DB and notifies admin via email.
 */
export const createInquiry = async (req, res) => {
  const {
    name, email, phone, organization, designation,
    type, subject, message, productRef, quantity,
  } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required.',
    });
  }

  const inquiry = await Inquiry.create({
    name, email, phone, organization, designation,
    type, subject, message, productRef, quantity,
  });

  // Send admin notification email (non-blocking — failure won't break the response)
  sendInquiryNotification(inquiry).catch((err) =>
    console.error('Inquiry notification email failed:', err.message)
  );

  res.status(201).json({
    success: true,
    message: 'Inquiry submitted successfully. We will get back to you shortly.',
    data: { inquiry },
  });
};

// ─── Get All Inquiries (Admin) ────────────────────────────────────────────────

/**
 * GET /api/inquiries
 * Admin: paginated list with optional filters by status and type.
 */
export const getInquiries = async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;

  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('productRef', 'name sku'),
    Inquiry.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { inquiries, total, page, pages: Math.ceil(total / limit) },
  });
};

// ─── Get Inquiry By ID (Admin) ────────────────────────────────────────────────

/**
 * GET /api/inquiries/:id
 */
export const getInquiryById = async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id).populate('productRef', 'name sku price');

  if (!inquiry) {
    return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  }

  res.json({ success: true, data: { inquiry } });
};

// ─── Respond to Inquiry (Admin) ───────────────────────────────────────────────

/**
 * PUT /api/inquiries/:id/respond
 * Admin: saves response, updates status, and emails the inquirer.
 */
export const respondToInquiry = async (req, res) => {
  const { adminResponse } = req.body;

  if (!adminResponse) {
    return res.status(400).json({ success: false, message: 'adminResponse is required.' });
  }

  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) {
    return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  }

  inquiry.adminResponse = adminResponse;
  inquiry.status = 'responded';
  inquiry.respondedAt = new Date();
  await inquiry.save();

  // Email the inquirer with the response
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a56db;">Response to Your Inquiry — ${constants.COMPANY.NAME}</h2>
      <p>Dear ${inquiry.name},</p>
      <p>Thank you for reaching out. Here is our response to your inquiry:</p>
      <blockquote style="background:#f0f4ff; padding:16px; border-left:4px solid #1a56db; border-radius:4px;">
        ${adminResponse}
      </blockquote>
      <p>If you have further questions, please reply to this email or contact us at <a href="mailto:${constants.COMPANY.EMAIL}">${constants.COMPANY.EMAIL}</a>.</p>
      <p>Best regards,<br/><strong>${constants.COMPANY.NAME}</strong></p>
    </div>
  `;

  sendEmail({
    to: inquiry.email,
    subject: `Re: ${inquiry.subject || 'Your Inquiry'} — ${constants.COMPANY.NAME}`,
    html,
  }).catch((err) => console.error('Inquiry response email failed:', err.message));

  res.json({
    success: true,
    message: 'Response sent to inquirer.',
    data: { inquiry },
  });
};
