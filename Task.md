USJ Technologies — Full Website Build Prompt
Click any section to expand. Copy individual sections or the full prompt below.


PROJECT: USJ Technologies Pvt Ltd — Corporate + Ecommerce Website
STACK: MERN (MongoDB, Express.js, React.js, Node.js)
STYLING: Tailwind CSS
STATE MANAGEMENT: Redux Toolkit
AUTH: JWT + bcrypt
PAYMENTS: Razorpay (primary, India), Stripe (international)
FILE STORAGE: AWS S3 or Cloudinary (product images, certificates)
EMAIL: Nodemailer + SendGrid
PDF CATALOG: Products auto-imported from PDF catalog via parsing

TARGET USERS:
- Government / Defence procurement officers
- General consumers (ecommerce)
- Business clients (B2B inquiries)
- Potential employees / partners

DESIGN PHILOSOPHY:
- Light theme, professional, clean
- Inspired by Amazon's product showcase + Apple's corporate polish
- Navy blue (#0A1628) + White + Gold/Amber (#C9A84C) accent palette
- Trust signals prominent throughout (certificates, GeM, Startup India)
- Government-appropriate: no gimmicks, no loud colors, no carousels that auto-play

Copy
PAGES & ROUTES:

PUBLIC PAGES:
/ ...................... Homepage (hero, highlights, ventures, products teaser)
/about ................. About USJ Technologies
/services .............. Services (IT, Govt/Defence, GeM Tenders)
/ventures .............. Our Ventures (Bail & Beyond, Doon Travelers, + upcoming)
/projects .............. Projects showcase (like Amazon's "Our work")
/certifications ........ Certificates (Startup India, GeM, others — with placeholders)
/careers ............... Join us page
/contact ............... Contact + inquiry form

ECOMMERCE:
/shop .................. Product listing (category filters, search)
/shop/:category ........ Category page
/shop/product/:slug .... Product detail page
/cart .................. Shopping cart
/checkout .............. Checkout flow
/orders ................ Order history (auth required)
/wishlist .............. Wishlist (auth required)

AUTH:
/login ................. User login
/register .............. User registration
/profile ............... Profile & order history

ADMIN PANEL (/admin/*):
/admin/dashboard ....... Stats overview
/admin/products ........ Add / edit / delete products
/admin/orders .......... Manage orders
/admin/inquiries ....... View contact inquiries
/admin/ventures ........ Manage ventures content
/admin/certifications .. Upload & manage certificates

Copy
HOMEPAGE SECTIONS (top to bottom):

1. NAVBAR
   - Logo (USJ Technologies) left
   - Nav links: Home, About, Services, Ventures, Shop, Certifications, Contact
   - Right: Search icon, Cart icon (with badge count), Login/Profile
   - Sticky on scroll, white bg, navy bottom border
   - Mobile: hamburger menu

2. HERO SECTION
   - Full-width, light bg with subtle geometric pattern (not loud)
   - Headline: "Building India's Future Through Technology"
   - Subheadline: Brief 2-line about the company
   - Two CTAs: "Explore Our Work" (primary, navy) + "Shop Products" (outlined)
   - Trust badges row: "GeM Registered", "Startup India Certified", "ISO Compliant", "Govt. & Defence Projects"
   - NO auto-playing video or carousel

3. WHAT WE DO (3-column grid)
   - Card 1: Government & Defence Solutions (icon: shield)
   - Card 2: Technology Products & Solutions (icon: cpu)
   - Card 3: GeM Tender Projects (icon: file-certificate)
   - Each card: icon, title, 2-line description, "Learn More" link

4. FEATURED PRODUCTS (Amazon-style grid)
   - Section title: "Our Products"
   - Horizontal scrollable row on mobile, 4-col grid on desktop
   - Each product: image, name, category badge, price (or "Inquiry" if B2B), Add to Cart / Get Quote button
   - "View All Products" link to /shop

5. OUR VENTURES (horizontal cards)
   - Title: "Our Ventures & Platforms"
   - Card 1: Bail & Beyond Law Chambers — legal services platform — "Visit" + "Learn More"
   - Card 2: Doon Travelers — tours & travel — "Visit" + "Learn More"
   - Card 3: "More Coming Soon" — locked card with teaser animation
   - Cards: light bg, venture logo/icon, short description, external link

6. PROJECTS & WORK SHOWCASE
   - "Our Work" section (3-col grid)
   - Show 3 recent/notable projects with category tags (Govt, Defence, Tech, GeM)
   - Each: image/icon, project name, client type, brief description, "View Details"
   - CTA: "See All Projects"

7. CERTIFICATIONS STRIP
   - Horizontal strip: "Trusted & Certified"
   - Show certificate thumbnails (use placeholder/dummy images now — admin will replace)
   - Startup India logo, GeM badge, any other certificates
   - Clicking opens a modal with certificate image and details

8. WHY CHOOSE US (stats + copy)
   - 4 stat boxes: X+ Projects Delivered, X+ Govt Clients, X+ Products, X States Served
   - Brief paragraph about company values

9. INQUIRY / CONTACT CTA BANNER
   - Full-width navy bg section
   - "Have a Project in Mind? Let's Talk."
   - Button: "Send an Inquiry" → /contact
   - For government/defence: "Request Quotation via GeM"

10. FOOTER
    - Logo + tagline
    - Links: Quick Links, Our Ventures, Legal (Privacy, Terms)
    - Address: Dehradun, Uttarakhand, India
    - Social icons (LinkedIn, Twitter/X, Instagram)
    - "GeM Registered Seller" badge + Startup India badge
    - Copyright: © 2024 USJ Technologies Pvt Ltd. All rights reserved.

Copy
CERTIFICATIONS PAGE (/certifications):

This page must be built with PLACEHOLDER content first.
Admin can replace images and text via the admin panel later.

LAYOUT:
- Page hero: "Our Certifications & Recognitions"
- Subtitle: "USJ Technologies is recognized by leading government and industry bodies."

CERTIFICATE CARDS (grid of 2-3 per row):
Each card contains:
  - Certificate thumbnail image (placeholder grey box with "Certificate Image" text)
  - Certificate name (e.g., "Startup India Recognition")
  - Issuing body (e.g., "DPIIT, Government of India")
  - Issue date (placeholder: "January 2024")
  - Certificate ID / Registration number (placeholder: "DIPP12345")
  - Short description (1-2 lines about what this certifies)
  - "View Certificate" button → opens image in full-screen modal/lightbox

PLACEHOLDER CERTIFICATES TO CREATE:
1. Startup India Certificate (DPIIT)
2. GeM (Government e-Marketplace) Seller Registration
3. MSME / Udyam Registration
4. Any ISO certificate (placeholder)
5. "More Certifications Coming" — locked card

ADMIN FUNCTIONALITY:
- Upload real certificate image (replaces placeholder)
- Edit all text fields
- Toggle visibility (show/hide)
- Reorder cards via drag-and-drop

NOTE FOR DEVELOPER: Use a CertificateCard component with all fields editable from admin. Store in MongoDB. Image in S3/Cloudinary.

Copy
ECOMMERCE MODULE (Electronics Products):

PRODUCT MODEL (MongoDB Schema):
{
  name: String,
  slug: String (auto-generated),
  sku: String,
  description: String (rich text),
  shortDescription: String,
  price: Number,
  salePrice: Number,
  category: String,        // e.g. "Surveillance", "Networking", "Power"
  subCategory: String,
  brand: String,
  images: [String],        // S3/Cloudinary URLs
  stock: Number,
  unit: String,            // "piece", "set", "meter", etc.
  specifications: [{key: String, value: String}],  // for tech specs table
  tags: [String],
  isB2B: Boolean,          // If true, show "Get Quote" instead of price
  isFeatured: Boolean,
  isActive: Boolean,
  catalogSource: String,   // "pdf_import" or "manual"
  createdAt: Date
}

PDF CATALOG IMPORT:
- Build an admin tool: Upload PDF catalog → parse product names, specs, prices
- Use pdf-parse (npm) on the backend to extract text
- Display parsed results for admin to review/edit before publishing
- Each catalog product maps to the Product schema above

SHOP PAGE (/shop):
- Search bar (full-text search on name, description, tags)
- Sidebar filters: Category, Brand, Price range, In Stock only, B2B/Retail
- Product grid: 4 cols desktop, 2 cols tablet, 1 col mobile
- Sort: Featured, Price Low-High, Price High-Low, Newest
- Pagination (20 per page)

PRODUCT DETAIL PAGE (/shop/product/:slug):
- Image gallery (main image + thumbnails, zoom on hover)
- Product name, SKU, brand
- Price (or "Contact for Quote" if isB2B)
- Stock availability badge
- Specifications table (key-value pairs from schema)
- Add to Cart / Add to Wishlist
- Quantity selector
- "Bulk / Government Inquiry" button → opens inquiry form
- Related products (same category)

CART (/cart):
- Item list with image, name, qty selector, remove
- Price summary (subtotal, GST 18%, shipping, total)
- "Proceed to Checkout" button
- "Continue Shopping" link

CHECKOUT (/checkout):
- Step 1: Delivery Address (form or saved addresses)
- Step 2: Order Summary review
- Step 3: Payment (Razorpay integration)
- Order confirmation page with order ID

ORDERS (/orders):
- List of past orders: order ID, date, status badge, total
- Order detail: items, shipping address, payment info, invoice download

WISHLIST:
- Saved products, move to cart, remove

GOVERNMENT / B2B INQUIRY FLOW:
- "Request Quotation" button on any product
- Form: Name, Organization, Designation, Email, Phone, Quantity, Requirements
- Stored in MongoDB Inquiries collection
- Admin receives email notification
- Admin can respond with custom quote via admin panel

Copy
VENTURES PAGE (/ventures):

Build this as a dynamic page — ventures are managed from admin panel.

VENTURE CARD COMPONENT:
{
  name: String,           // "Bail & Beyond Law Chambers"
  tagline: String,        // "Expert Legal Services"
  description: String,    // 2-3 lines
  logo: String,           // image URL
  websiteUrl: String,     // external link
  category: String,       // "Legal", "Travel", "Tech", etc.
  status: "live" | "coming_soon",
  isRevealed: Boolean,    // if false, shows teaser card
  launchDate: Date        // for "Coming Soon" countdown
}

INITIAL VENTURES TO CREATE:
1. Bail & Beyond Law Chambers
   - Category: Legal Services
   - Status: live (or coming_soon based on actual status)
   - Brief: "Professional legal services platform focused on bail, criminal law, and advisory."

2. Doon Travelers
   - Category: Tours & Travel
   - Status: live (or coming_soon)
   - Brief: "Explore Uttarakhand and beyond with curated travel packages from Dehradun."

3. [UNREVEALED] — status: coming_soon, isRevealed: false
   - Show as locked card: "Something Big is Coming — Stay Tuned"
   - Optional countdown timer

PAGE LAYOUT:
- Hero: "Our Ventures — Building Beyond Technology"
- Grid of venture cards (2-col desktop, 1-col mobile)
- Each card: logo, name, category badge, description, "Visit Platform" (if live) or "Notify Me" (if coming_soon)
- Admin can toggle isRevealed to unveil new ventures

Copy
EXPRESS.JS API ROUTES:

AUTH:
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me (protected)
POST   /api/auth/logout

PRODUCTS:
GET    /api/products              (query: category, brand, search, page, limit, sort)
GET    /api/products/:slug
POST   /api/products              (admin only)
PUT    /api/products/:id          (admin only)
DELETE /api/products/:id          (admin only)
POST   /api/products/import-pdf   (admin only — PDF catalog import)

CATEGORIES:
GET    /api/categories
POST   /api/categories            (admin)
PUT    /api/categories/:id        (admin)

CART (server-side for auth users, localStorage for guests):
GET    /api/cart                  (protected)
POST   /api/cart/add
PUT    /api/cart/update
DELETE /api/cart/remove/:productId

ORDERS:
POST   /api/orders                (create order + Razorpay initiation)
GET    /api/orders                (user's orders, protected)
GET    /api/orders/:id            (order detail)
POST   /api/orders/verify-payment (Razorpay webhook)
GET    /api/orders/admin/all      (admin only)
PUT    /api/orders/:id/status     (admin — update delivery status)

INQUIRIES / QUOTES:
POST   /api/inquiries             (public — contact form + product quote request)
GET    /api/inquiries             (admin only)
PUT    /api/inquiries/:id/respond (admin — send quote reply)

VENTURES:
GET    /api/ventures
POST   /api/ventures              (admin)
PUT    /api/ventures/:id          (admin)

CERTIFICATIONS:
GET    /api/certifications
POST   /api/certifications        (admin — upload image to S3)
PUT    /api/certifications/:id    (admin)
DELETE /api/certifications/:id    (admin)

PROJECTS:
GET    /api/projects
POST   /api/projects              (admin)
PUT    /api/projects/:id          (admin)

Copy
DESIGN SYSTEM:

COLOR PALETTE:
  Primary (Navy):     #0A1628  — headings, navbar, footer bg
  Primary Light:      #1A2E4A  — hover states, secondary nav
  Accent (Gold):      #C9A84C  — CTAs, highlights, badges
  Accent Light:       #F0D585  — hover on gold
  Background:         #F8F9FA  — page background
  Surface:            #FFFFFF  — card backgrounds
  Border:             #E2E8F0  — all borders
  Text Primary:       #0A1628  — headings
  Text Secondary:     #4A5568  — body text
  Text Muted:         #718096  — captions, labels
  Success:            #2D7D46
  Danger:             #C53030

TYPOGRAPHY (use Inter or similar system font):
  Display (H1):  32–48px, weight 700, navy
  H2:            28px, weight 600, navy
  H3:            22px, weight 600, navy
  H4:            18px, weight 500
  Body:          16px, weight 400, #4A5568
  Small/Caption: 13px, weight 400, #718096
  Button:        14px, weight 600, uppercase tracking

COMPONENT STANDARDS:
  Buttons:
    Primary:   bg #0A1628, text white, hover #1A2E4A, radius 6px
    Secondary: border #0A1628, text #0A1628, hover bg #F0F4F8
    Accent:    bg #C9A84C, text white, hover #B8973B
    Radius: 6px, padding: 10px 24px, no rounded-full (professional, not playful)

  Cards:
    bg white, border 1px #E2E8F0, border-radius 8px
    box-shadow: 0 1px 3px rgba(0,0,0,0.08)
    hover: box-shadow 0 4px 12px rgba(0,0,0,0.12), translateY(-2px)

  Badges / Tags:
    Govt:     bg #EBF4FF, text #1A3A5C
    Defence:  bg #FFF3CD, text #6B4C00
    GeM:      bg #D4EDDA, text #155724
    Tech:     bg #E8D5F5, text #4A235A

  Navbar:
    White bg, navy text, gold active indicator underline
    Height: 64px desktop, 56px mobile
    Sticky with backdrop-blur on scroll

LAYOUT:
  Max content width: 1280px (centered)
  Grid: 12-column CSS grid
  Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px
  Section padding: py-16 (64px) desktop, py-10 (40px) mobile

PROFESSIONAL TOUCHES:
  - No gradients except subtle hero overlay
  - No animations except: hover transforms (0.2s ease), 
    scroll reveal (fade-up, once only), skeleton loaders
  - High-quality placeholder images from Unsplash (tech/govt theme)
  - All icons from Lucide React (consistent set)
  - Loading states on all async operations (skeleton, not spinners)
  - Empty states with helpful CTAs

Copy
usj-technologies/
├── client/                    (React frontend)
│   ├── public/
│   ├── src/
│   │   ├── assets/            (logos, placeholder images)
│   │   ├── components/
│   │   │   ├── layout/        (Navbar, Footer, Layout)
│   │   │   ├── ui/            (Button, Card, Badge, Modal)
│   │   │   ├── home/          (HeroSection, VenturesStrip, etc.)
│   │   │   ├── shop/          (ProductCard, ProductGrid, Filters)
│   │   │   ├── cart/          (CartItem, CartSummary)
│   │   │   ├── checkout/      (CheckoutStepper, AddressForm)
│   │   │   ├── certifications/(CertCard, CertModal)
│   │   │   └── admin/         (Dashboard, ProductForm, OrderTable)
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── ServicesPage.jsx
│   │   │   ├── VenturesPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── CertificationsPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   ├── ShopPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   └── admin/
│   │   ├── store/             (Redux Toolkit slices)
│   │   │   ├── authSlice.js
│   │   │   ├── cartSlice.js
│   │   │   ├── productSlice.js
│   │   │   └── store.js
│   │   ├── services/          (API call functions, axios)
│   │   ├── hooks/             (useCart, useAuth, useProducts)
│   │   └── utils/             (formatPrice, slugify, etc.)
│   └── package.json
│
├── server/                    (Node + Express backend)
│   ├── config/                (db.js, cloudinary.js, razorpay.js)
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   ├── Inquiry.js
│   │   ├── Venture.js
│   │   ├── Certification.js
│   │   └── Project.js
│   ├── routes/
│   ├── controllers/
│   ├── middleware/            (auth.js, admin.js, errorHandler.js)
│   ├── utils/                 (sendEmail.js, parsePdf.js)
│   └── server.js
│
└── README.md

Copy
PDF PRODUCT CATALOG IMPORT:

The client will provide a PDF catalog of electronic products.
Build the following flow:

BACKEND (Node.js):
1. Install: npm install pdf-parse multer
2. Route: POST /api/products/import-pdf (admin only, multipart/form-data)
3. Use multer to receive PDF file in memory (no disk write)
4. Use pdf-parse to extract raw text
5. Run a parsing function to identify:
   - Product name (usually bold/heading line)
   - SKU / Part number
   - Price (look for ₹ or numeric patterns)
   - Category (detect from section headers in PDF)
   - Specifications (key: value pairs)
6. Return parsed product list as JSON to frontend for admin review

FRONTEND (Admin panel):
1. Upload PDF → send to backend → receive parsed product array
2. Show editable table of parsed products
3. Admin can: edit any field, remove incorrect rows, add missing data
4. Click "Publish All" → POST each product to /api/products
5. Admin can re-import any time (handles duplicates by SKU)

PARSING NOTE FOR DEVELOPER:
PDF catalogs vary in structure. Write a flexible parser that tries multiple 
heuristics. If parsing fails, show raw text so admin can manually enter products.
Consider using Claude AI API as a fallback parser:
  - Send extracted text to Claude with prompt:
    "Extract products from this catalog text as JSON array with fields:
     name, sku, price, category, specifications[]"
  - This gives highly accurate extraction even for complex PDFs

PRODUCT IMAGES FROM CATALOG:
- If PDF has embedded images, extract with pdf-parse or pdf2pic
- Store in Cloudinary / S3 and link to product
- Admin can also upload additional images manually

Copy
RECOMMENDED BUILD PHASES:

PHASE 1 — Core Corporate Site (2–3 weeks):
  ✓ Project setup (MERN + Tailwind + folder structure)
  ✓ Navbar + Footer
  ✓ Homepage (all sections, static content)
  ✓ About, Services, Ventures pages
  ✓ Certifications page with placeholder cards
  ✓ Projects showcase
  ✓ Contact page with inquiry form → MongoDB + email notification
  ✓ Basic responsive design (mobile + desktop)
  ✓ Deploy frontend (Vercel/Netlify) + backend (Railway/Render)

PHASE 2 — Ecommerce Foundation (2–3 weeks):
  ✓ Auth (register, login, JWT)
  ✓ Product model + admin product management
  ✓ Shop page (listing, search, filters)
  ✓ Product detail page
  ✓ Cart (Redux + backend sync)
  ✓ Wishlist

PHASE 3 — Checkout & Orders (1–2 weeks):
  ✓ Checkout flow (address + review)
  ✓ Razorpay integrations