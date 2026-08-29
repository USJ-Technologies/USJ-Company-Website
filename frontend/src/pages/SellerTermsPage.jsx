import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';

export default function SellerTermsPage() {
  return (
    <>
      <SEOHead
        title="Seller Agreement & Marketplace Terms - USJ Technologies"
        description="Terms and conditions for sellers on USJ Technologies marketplace. Understand vendor requirements, commission structure, and policies."
        canonical="https://www.usjtechnologies.com/seller-terms"
      />

      <div className="bg-white">
        {/* Back Button */}
        <div className="bg-[#F8F9FA] border-b border-[#E2E8F0]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link to="/" className="flex items-center gap-2 text-sm text-[#0A1628] hover:text-[#0A1628] font-semibold">
              <ArrowLeft size={18} /> Home
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-[#0A1628] mb-2">Seller Agreement & Marketplace Terms</h1>
          <p className="text-[#718096] mb-8">
            Last updated: August 29, 2026
          </p>

          <div className="prose prose-sm max-w-none text-[#4A5568] space-y-6">
            {/* 1. Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-[#0A1628] mb-3">1. Introduction</h2>
              <p>
                These Seller Agreement and Marketplace Terms ("Terms") govern your participation as a seller on the USJ Technologies marketplace ("Platform"). By registering as a seller and listing products, you agree to be bound by these Terms and all applicable laws and regulations.
              </p>
              <p>
                USJ Technologies Pvt Ltd ("Platform Operator", "we", "us") operates the marketplace to facilitate commerce between sellers and buyers. You acknowledge that USJ Technologies is not a party to transactions between you and buyers, but rather provides the platform infrastructure and services.
              </p>
            </section>

            {/* 2. Seller Registration & Eligibility */}
            <section>
              <h2 className="text-2xl font-bold text-[#0A1628] mb-3">2. Seller Registration & Eligibility</h2>
              <h3 className="text-lg font-semibold text-[#0A1628] mb-2">2.1 Who Can Sell</h3>
              <p>
                To become a seller on our Platform, you must:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be a registered business entity in India</li>
                <li>Have a valid GST registration (for businesses with turnover above applicable threshold)</li>
                <li>Have a valid PAN (Permanent Account Number)</li>
                <li>Be at least 18 years of age</li>
                <li>Comply with all KYC (Know Your Customer) requirements</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#0A1628] mb-2 mt-4">2.2 KYC & Verification</h3>
              <p>
                You must provide accurate and complete information during registration, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Business name and official registration documents</li>
                <li>GST certificate and PAN details</li>
                <li>Bank account information (for payouts)</li>
                <li>Valid identity and address proof</li>
                <li>KYC document upload (e.g., Aadhaar, Passport, PAN)</li>
              </ul>
              <p>
                The Platform reserves the right to reject applications that do not meet verification standards or may pose compliance risks. Verification is typically completed within 2-3 business days.
              </p>

              <h3 className="text-lg font-semibold text-[#0A1628] mb-2 mt-4">2.3 Seller Account Status</h3>
              <p>
                Your account status may be:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Pending:</strong> Application under review</li>
                <li><strong>Approved:</strong> Seller is authorized to list products and accept orders</li>
                <li><strong>Suspended:</strong> Account temporarily restricted due to policy violations</li>
                <li><strong>Rejected:</strong> Application declined; you may reapply after addressing concerns</li>
              </ul>
            </section>

            {/* 3. Seller Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-[#0A1628] mb-3">3. Seller Responsibilities</h2>
              <h3 className="text-lg font-semibold text-[#0A1628] mb-2">3.1 Product Listing</h3>
              <p>
                As a seller, you are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ensuring all product information is accurate, complete, and up-to-date</li>
                <li>Providing genuine product images and specifications</li>
                <li>Clearly stating pricing, including all applicable taxes and shipping costs</li>
                <li>Ensuring products comply with Indian laws and regulations</li>
                <li>Maintaining accurate stock levels and inventory</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#0A1628] mb-2 mt-4">3.2 Order Fulfillment</h3>
              <p>
                You commit to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Accepting orders as listed and confirmed</li>
                <li>Preparing and shipping orders within the specified timeframe</li>
                <li>Using secure, trackable shipping methods</li>
                <li>Ensuring products are packaged properly to avoid damage</li>
                <li>Providing order updates and tracking information to buyers</li>
                <li>Resolving disputes and returns as per this Terms and Platform policies</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#0A1628] mb-2 mt-4">3.3 Prohibited Products</h3>
              <p>
                You may not list products that are:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Counterfeit, fraudulent, or stolen</li>
                <li>Illegal or restricted under Indian law</li>
                <li>Dangerous, hazardous, or defective</li>
                <li>Infringing on third-party intellectual property</li>
                <li>Violating Platform content policies</li>
              </ul>
            </section>

            {/* 4. Payments & Commissions */}
            <section>
              <h2 className="text-2xl font-bold text-[#0A1628] mb-3">4. Payments & Commissions</h2>
              <h3 className="text-lg font-semibold text-[#0A1628] mb-2">4.1 Commission Structure</h3>
              <p>
                Currently, the Platform is in early stages and no commission is charged for seller transactions. This may change in future as marketplace services expand. Any future commission changes will be communicated with 30 days' notice.
              </p>

              <h3 className="text-lg font-semibold text-[#0A1628] mb-2 mt-4">4.2 Payout Policy</h3>
              <p>
                Payment for orders is processed as follows:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payments are deposited to your registered bank account after order confirmation and fulfillment</li>
                <li>Payouts are typically processed within 5-7 business days</li>
                <li>GST, TDS, and other statutory deductions are applied as per applicable law</li>
                <li>You remain responsible for all tax compliance and reporting</li>
              </ul>
            </section>

            {/* 5. Seller Conduct & Policies */}
            <section>
              <h2 className="text-2xl font-bold text-[#0A1628] mb-3">5. Seller Conduct & Policies</h2>
              <h3 className="text-lg font-semibold text-[#0A1628] mb-2">5.1 Code of Conduct</h3>
              <p>
                You must:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Treat all customers with respect and professionalism</li>
                <li>Respond to customer inquiries within 24 hours</li>
                <li>Be honest and transparent in all dealings</li>
                <li>Not engage in harassment, discrimination, or abusive behavior</li>
                <li>Not spam or mislead customers</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#0A1628] mb-2 mt-4">5.2 Intellectual Property</h3>
              <p>
                You represent and warrant that you own or have the right to use all content you upload, including product images and descriptions. You agree to indemnify the Platform against any claims of IP infringement.
              </p>

              <h3 className="text-lg font-semibold text-[#0A1628] mb-2 mt-4">5.3 Performance Standards</h3>
              <p>
                Sellers are expected to maintain:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Order Accuracy:</strong> Products match listing descriptions</li>
                <li><strong>Fulfillment Rate:</strong> Timely shipping and delivery</li>
                <li><strong>Response Rate:</strong> Respond to customer messages</li>
                <li><strong>Product Quality:</strong> Items arrive in promised condition</li>
              </ul>
            </section>

            {/* 6. Returns, Refunds & Disputes */}
            <section>
              <h2 className="text-2xl font-bold text-[#0A1628] mb-3">6. Returns, Refunds & Disputes</h2>
              <p>
                Seller and buyer responsibilities for returns and disputes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All returns must be initiated within 7 days of delivery</li>
                <li>Seller must respond to return requests within 48 hours</li>
                <li>Refunds are processed within 10 business days of return acceptance</li>
                <li>Disputes are resolved through the Platform dispute resolution process</li>
                <li>Platform may mediate but both parties are expected to cooperate in good faith</li>
              </ul>
            </section>

            {/* 7. Termination & Suspension */}
            <section>
              <h2 className="text-2xl font-bold text-[#0A1628] mb-3">7. Termination & Suspension</h2>
              <p>
                The Platform may suspend or terminate your seller account if:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You violate these Terms or Platform policies</li>
                <li>You engage in fraudulent or illegal activities</li>
                <li>You consistently fail performance standards</li>
                <li>You receive multiple customer complaints</li>
                <li>Your KYC documents become invalid or fraudulent</li>
              </ul>
              <p>
                Suspensions are typically temporary and include a notice period to remedy violations. Termination is permanent and may result in forfeiture of pending payouts (minus regulatory holds).
              </p>
            </section>

            {/* 8. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-[#0A1628] mb-3">8. Limitation of Liability</h2>
              <p>
                The Platform is provided on an "as-is" basis. To the extent permitted by law:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>Our total liability is limited to the commissions paid (if any) in the 12 months prior</li>
                <li>We are not responsible for third-party actions, including buyer non-payment or chargebacks</li>
              </ul>
            </section>

            {/* 9. Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-[#0A1628] mb-3">9. Governing Law & Dispute Resolution</h2>
              <p>
                These Terms are governed by the laws of India. Disputes shall first be resolved through Platform mediation, and if unresolved, through arbitration under the Arbitration and Conciliation Act, 1996.
              </p>
            </section>

            {/* 10. Contact */}
            <section>
              <h2 className="text-2xl font-bold text-[#0A1628] mb-3">10. Contact & Questions</h2>
              <p>
                For questions about these Terms or your seller account, contact us at:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Email:</strong> sellers@usjtechnologies.com</li>
                <li><strong>Phone:</strong> +91-7500000000</li>
                <li><strong>Address:</strong> Dehradun, Uttarakhand, India</li>
              </ul>
            </section>

            {/* Amendment Notice */}
            <section className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> These Terms may be updated periodically. Continued use of the Platform after updates constitutes acceptance of the new Terms. For material changes, we will provide 30 days' notice.
              </p>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-[#718096] mb-4">
              Ready to become a seller?
            </p>
            <Link
              to="/become-a-seller"
              className="inline-block px-6 py-3 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
