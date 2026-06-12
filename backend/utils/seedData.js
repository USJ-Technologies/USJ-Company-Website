/**
 * utils/seedData.js
 * Database seeder for initial content: ventures, certifications,
 * projects, and an admin user account.
 *
 * Usage:
 *   node utils/seedData.js --run
 * Or import runSeed() and call programmatically.
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import Venture from '../models/Venture.js';
import Certification from '../models/Certification.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const venturesData = [
  {
    name: 'Bail & Beyond Law Chambers',
    tagline: 'Expert Legal Services in Uttarakhand',
    description:
      'Professional legal services platform focused on bail, criminal law, and legal advisory. Serving clients across Uttarakhand with experienced legal professionals.',
    websiteUrl: process.env.VENTURE_BAIL_URL,
    category: 'Legal Services',
    status: 'live',
    isRevealed: true,
    order: 1,
  },
  {
    name: 'Chalo Kumbh',
    tagline: 'Experience the Sacred Kumbh Mela',
    description:
      'Your complete digital companion for the Kumbh Mela — bookings, guides, and a community for pilgrims from across India and the world.',
    websiteUrl: process.env.VENTURE_KUMBH_URL,
    category: 'Pilgrimage & Travel',
    status: 'live',
    isRevealed: true,
    order: 2,
  },
  {
    name: 'Doon Travelers',
    tagline: 'Explore Uttarakhand & Beyond',
    description:
      'Curated travel packages from Dehradun to the Himalayas, Char Dham, and beyond. Expert local guides and premium experiences.',
    websiteUrl: null,
    category: 'Tours & Travel',
    status: 'coming_soon',
    isRevealed: false,
    order: 3,
  },
];

const certificationsData = [
  {
    name: 'MSME Udyam Registration',
    issuingBody: 'Ministry of MSME, Government of India',
    issueDate: 'January 2024',
    certId: 'UDYAM-UK-XX-XXXXXXX',
    description: 'Registered as a Micro, Small & Medium Enterprise under the MSME Act.',
    isVisible: true,
    order: 1,
  },
  {
    name: 'GeM Portal Registration',
    issuingBody: 'Government e-Marketplace (GeM)',
    issueDate: 'February 2024',
    certId: 'GEM-SELLER-XXXXXXXX',
    description: 'Authorised seller on the Government e-Marketplace for public procurement.',
    isVisible: true,
    order: 2,
  },
  {
    name: 'ISO 9001:2015',
    issuingBody: 'Bureau of Indian Standards',
    issueDate: 'March 2024',
    certId: 'ISO-9001-PENDING',
    description: 'Quality Management System certification (in progress).',
    isVisible: true,
    order: 3,
  },
  {
    name: 'Startup India Recognition',
    issuingBody: 'Department for Promotion of Industry and Internal Trade (DPIIT)',
    issueDate: 'April 2024',
    certId: 'DIPP-PENDING',
    description: 'Recognised startup under the Startup India initiative.',
    isVisible: true,
    order: 4,
  },
  {
    name: 'GST Registration',
    issuingBody: 'Government of India — GST Council',
    issueDate: 'January 2024',
    certId: 'GST-UK-PENDING',
    description: 'Registered under GST for supply of goods and services across India.',
    isVisible: true,
    order: 5,
  },
];

const projectsData = [
  {
    name: 'GeM Procurement Portal Integration',
    client: 'Government of Uttarakhand',
    clientType: 'Govt',
    description:
      'Supply of IT hardware and electronics through the Government e-Marketplace to multiple state departments.',
    tags: ['GeM', 'Hardware', 'IT Supply'],
    isActive: true,
    order: 1,
  },
  {
    name: 'Kumbh Mela Digital Platform',
    client: 'Internal Venture',
    clientType: 'Tech',
    description:
      'End-to-end development of the Chalo Kumbh web platform for pilgrim management and bookings during Maha Kumbh 2025.',
    tags: ['Web App', 'Travel', 'Pilgrimage'],
    isActive: true,
    order: 2,
  },
  {
    name: 'Defence Canteen Supply',
    client: 'Indian Army Canteen Services',
    clientType: 'Defence',
    description:
      'Authorised supply of approved FMCG products and electronics to defence canteen services in the Garhwal region.',
    tags: ['Defence', 'FMCG', 'Supply Chain'],
    isActive: true,
    order: 3,
  },
];

// ─── Seed Runner ──────────────────────────────────────────────────────────────

export const runSeed = async () => {
  await connectDB();

  console.log('🌱 Starting database seed...');

  // ── Ventures ──────────────────────────────────────────────────────────────
  for (const venture of venturesData) {
    const exists = await Venture.findOne({ name: venture.name });
    if (!exists) {
      await Venture.create(venture);
      console.log(`  ✅ Venture created: ${venture.name}`);
    } else {
      console.log(`  ⏭️  Venture already exists: ${venture.name}`);
    }
  }

  // ── Certifications ────────────────────────────────────────────────────────
  for (const cert of certificationsData) {
    const exists = await Certification.findOne({ name: cert.name });
    if (!exists) {
      await Certification.create(cert);
      console.log(`  ✅ Certification created: ${cert.name}`);
    } else {
      console.log(`  ⏭️  Certification already exists: ${cert.name}`);
    }
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  for (const project of projectsData) {
    const exists = await Project.findOne({ name: project.name });
    if (!exists) {
      await Project.create(project);
      console.log(`  ✅ Project created: ${project.name}`);
    } else {
      console.log(`  ⏭️  Project already exists: ${project.name}`);
    }
  }

  // ── Admin User ────────────────────────────────────────────────────────────
  const adminEmail = process.env.EMAIL_TO_ADMIN;
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    await User.create({
      name: 'USJ Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });
    console.log(`  ✅ Admin user created: ${adminEmail}`);
  } else {
    console.log(`  ⏭️  Admin user already exists: ${adminEmail}`);
  }

  console.log('🎉 Seed complete!');
  process.exit(0);
};

// ─── Standalone Execution ─────────────────────────────────────────────────────
if (process.argv[2] === '--run') {
  runSeed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
