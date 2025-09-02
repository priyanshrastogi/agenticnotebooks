import Link from 'next/link';
import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Intellicharts',
  description: 'Intellicharts privacy policy detailing how we protect your data and privacy.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="mb-6 text-lg">
          Last Updated:{' '}
          {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">1. Introduction</h2>
        <p>
          Welcome to Intellicharts. We are committed to protecting your privacy and ensuring the
          security of your data. This Privacy Policy explains how we collect, use, and safeguard
          your information when you use our service.
        </p>
        <p>
          <strong>Intellicharts is designed with privacy as a core principle.</strong> Our approach to
          data processing is fundamentally different from most web applications, as we prioritize
          keeping your actual data within your browser.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">2. Browser-Based Processing</h2>
        <p>
          Unlike most data analysis tools, Intellicharts processes your spreadsheet data entirely within
          your browser. This means:
        </p>
        <ul className="my-4 list-disc pl-6">
          <li>Your actual spreadsheet data (cell values) never leaves your device</li>
          <li>Analysis operations are performed locally in your browser</li>
          <li>We don&apos;t store, access, or transmit the contents of your spreadsheets</li>
        </ul>
        <p>
          This architecture provides an unparalleled level of privacy protection, as your sensitive
          data never travels over the internet to our servers.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">3. Information We Collect</h2>

        <h3 className="mb-3 mt-6 text-xl font-medium">3.1 Metadata</h3>
        <p>
          To provide our service, we collect and process only the following metadata about your
          spreadsheets:
        </p>
        <ul className="my-4 list-disc pl-6">
          <li>Column names and headers</li>
          <li>Data types of columns (text, number, date, etc.)</li>
          <li>Structure information (number of sheets, rows, and columns)</li>
        </ul>
        <p>
          This metadata allows our AI to understand the structure of your data without accessing the
          actual values.
        </p>

        <h3 className="mb-3 mt-6 text-xl font-medium">3.2 Account Information</h3>
        <p>If you create an account, we collect:</p>
        <ul className="my-4 list-disc pl-6">
          <li>Email address</li>
          <li>Name (optional)</li>
          <li>Password (stored securely as a hash)</li>
        </ul>

        <h3 className="mb-3 mt-6 text-xl font-medium">3.3 Usage Information</h3>
        <p>We collect anonymized usage data to improve our service, including:</p>
        <ul className="my-4 list-disc pl-6">
          <li>Types of analysis performed (without the actual queries or data)</li>
          <li>Features used</li>
          <li>Error occurrences</li>
          <li>Performance metrics</li>
        </ul>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">4. How We Use Your Information</h2>
        <p>We use the collected information for the following purposes:</p>
        <ul className="my-4 list-disc pl-6">
          <li>To provide and maintain our service</li>
          <li>To improve and optimize our AI capabilities</li>
          <li>To personalize your experience</li>
          <li>To communicate with you about your account or our services</li>
          <li>To detect and prevent errors or service abuse</li>
        </ul>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">5. Data Storage</h2>
        <p>
          Since your actual spreadsheet data never leaves your browser, we don&apos;t store this
          information. For the information we do collect:
        </p>
        <ul className="my-4 list-disc pl-6">
          <li>Account information is stored in our secure database</li>
          <li>Metadata is temporarily processed for analysis but not permanently stored</li>
          <li>Usage information is stored in anonymized form</li>
        </ul>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">6. Cookies and Local Storage</h2>
        <p>We use cookies and local storage for the following purposes:</p>
        <ul className="my-4 list-disc pl-6">
          <li>To maintain your authentication status</li>
          <li>To store your preferences</li>
          <li>To analyze usage patterns (anonymized)</li>
        </ul>
        <p>You can configure your browser to reject cookies, but this may limit functionality.</p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">7. Data Sharing</h2>
        <p>
          We do not sell, trade, or rent your personal information to third parties. We may share
          limited information with:
        </p>
        <ul className="my-4 list-disc pl-6">
          <li>Service providers who help us operate our platform</li>
          <li>Legal authorities when required by law</li>
        </ul>
        <p>
          All service providers are bound by confidentiality agreements and data processing
          restrictions.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">8. Security</h2>
        <p>We implement robust security measures to protect your information:</p>
        <ul className="my-4 list-disc pl-6">
          <li>All communications are encrypted using TLS/SSL</li>
          <li>Passwords are stored as secure hashes, not plaintext</li>
          <li>Regular security audits and updates</li>
          <li>Strict access controls for our employees</li>
        </ul>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">9. Your Rights</h2>
        <p>You have several rights regarding your personal information:</p>
        <ul className="my-4 list-disc pl-6">
          <li>Access your personal information</li>
          <li>Correct inaccurate or incomplete information</li>
          <li>Delete your account and associated data</li>
          <li>Export your account information</li>
          <li>Object to certain types of processing</li>
        </ul>
        <p>To exercise these rights, please contact us at privacy@intellicharts.com.</p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">10. Children&apos;s Privacy</h2>
        <p>
          Our service is not intended for individuals under 16 years of age. We do not knowingly
          collect personal information from children under 16. If you believe a child has provided
          us with personal information, please contact us.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">11. Changes to this Policy</h2>
        <p>
          We may update this Privacy Policy periodically to reflect changes in our practices or for
          legal reasons. We will notify you of significant changes by email (for account holders)
          and by posting a notice on our website.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">12. Contact Us</h2>
        <p>
          If you have questions or concerns about this Privacy Policy or our data practices, please
          contact us at:
        </p>
        <p>Email: privacy@intellicharts.com</p>

        <div className="mt-12 border-t pt-6">
          <p>By using Intellicharts, you consent to the privacy practices described in this policy.</p>
          <p className="mt-4">
            <Link href="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
