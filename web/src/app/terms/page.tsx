import Link from 'next/link';
import React from 'react';

export const metadata = {
  title: 'Terms of Service | Intellicharts',
  description: 'Intellicharts terms of service and user agreement.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>

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
          Welcome to Intellicharts (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing or
          using our website and services (collectively, the &quot;Service&quot;), you agree to
          comply with and be bound by these Terms of Service. Please read these terms carefully
          before using our Service.
        </p>
        <p>If you disagree with any part of these terms, please do not use our Service.</p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">2. Service Description</h2>
        <p>
          Intellicharts is a privacy-focused web-based platform that enables users to analyze and
          visualize spreadsheet data through natural language conversation. Our Service processes
          spreadsheet data entirely within your browser, ensuring that your actual data never leaves
          your device.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">3. User Accounts</h2>
        <p>
          3.1. When you create an account with us, you must provide accurate, complete, and current
          information. Failure to do so constitutes a breach of these Terms, which may result in
          immediate termination of your account.
        </p>
        <p>
          3.2. You are responsible for safeguarding the password used to access your account and for
          any activities or actions under your account. We encourage the use of strong passwords and
          recommend not reusing passwords across different services.
        </p>
        <p>
          3.3. You agree to notify us immediately of any unauthorized access to or use of your
          username, password, or any other breach of security.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">4. Free and Paid Services</h2>
        <p>
          4.1. Intellicharts offers both free and paid subscription plans. By selecting a paid
          subscription, you agree to pay the subscription fees as described at the time of purchase.
        </p>
        <p>
          4.2. Subscription fees are billed in advance on a recurring basis based on your selected
          plan (monthly or annually). You authorize us to charge your payment method for these
          recurring payments.
        </p>
        <p>
          4.3. You may cancel your subscription at any time through your account settings. Upon
          cancellation, your subscription will remain active until the end of your current billing
          period.
        </p>
        <p>
          4.4. We reserve the right to change our subscription fees upon reasonable notice. Any
          price changes will apply to billing periods after the notice.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">5. Acceptable Use</h2>
        <p>
          5.1. You agree to use the Service only for lawful purposes and in accordance with these
          Terms. You agree not to:
        </p>
        <ul className="my-4 list-disc pl-6">
          <li>Use the Service in any way that violates any applicable law or regulation</li>
          <li>Attempt to probe, scan, or test the vulnerability of our systems or network</li>
          <li>
            Use the Service to transmit any material that contains viruses, trojan horses, or other
            harmful code
          </li>
          <li>Interfere with or disrupt the integrity or performance of the Service</li>
          <li>
            Attempt to gain unauthorized access to the Service, other accounts, or computer systems
          </li>
          <li>Harass, abuse, or harm another person</li>
          <li>Impersonate another user or person</li>
        </ul>
        <p>
          5.2. We may terminate or suspend your account immediately for violations of these
          acceptable use policies.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">6. Data Privacy</h2>
        <p>
          6.1. Your privacy is important to us. Our Privacy Policy, incorporated into these Terms,
          explains how we collect, use, and protect your information when you use our Service.
        </p>
        <p>
          6.2. By using our Service, you acknowledge that your spreadsheet data is processed locally
          in your browser. Only metadata (such as column names and data types) is transmitted to our
          servers for processing.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">7. Intellectual Property</h2>
        <p>
          7.1. The Service and its original content, features, and functionality are owned by Sheets
          Assist and are protected by international copyright, trademark, patent, and other
          intellectual property laws.
        </p>
        <p>
          7.2. You retain all rights to your data. We claim no ownership rights over the
          spreadsheets or data you analyze using our Service.
        </p>
        <p>
          7.3. You may not copy, modify, distribute, sell, or lease any part of our Service without
          our explicit permission. You also may not reverse engineer or attempt to extract the
          source code of our software.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">8. Limitation of Liability</h2>
        <p>
          8.1. In no event shall Intellicharts, nor its directors, employees, partners, agents,
          suppliers, or affiliates, be liable for any indirect, incidental, special, consequential,
          or punitive damages, including without limitation, loss of profits, data, use, goodwill,
          or other intangible losses, resulting from:
        </p>
        <ul className="my-4 list-disc pl-6">
          <li>Your access to or use of or inability to access or use the Service</li>
          <li>Any conduct or content of any third party on the Service</li>
          <li>Any content obtained from the Service</li>
          <li>Unauthorized access, use, or alteration of your transmissions or content</li>
        </ul>
        <p>8.2. Our liability is limited to the maximum extent permitted by law.</p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">9. Disclaimer of Warranties</h2>
        <p>
          9.1. Your use of the Service is at your sole risk. The Service is provided on an &quot;AS
          IS&quot; and &quot;AS AVAILABLE&quot; basis.
        </p>
        <p>
          9.2. Intellicharts disclaims all warranties of any kind, whether express or implied, including
          but not limited to the implied warranties of merchantability, fitness for a particular
          purpose, and non-infringement.
        </p>
        <p>
          9.3. Intellicharts does not warrant that: (a) the Service will function uninterrupted, secure,
          or available at any particular time or location; (b) any errors or defects will be
          corrected; (c) the Service is free of viruses or other harmful components; or (d) the
          results of using the Service will meet your requirements.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">10. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless Intellicharts and its licensees, licensors,
          and service providers from and against any claims, liabilities, damages, judgments,
          awards, losses, costs, expenses, or fees (including reasonable attorneys&apos; fees)
          arising out of or relating to your violation of these Terms or your use of the Service.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">11. Termination</h2>
        <p>
          11.1. We may terminate or suspend your account and access to the Service immediately,
          without prior notice or liability, for any reason, including but not limited to a breach
          of these Terms.
        </p>
        <p>11.2. Upon termination, your right to use the Service will immediately cease.</p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">12. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the United
          States. Our failure to enforce any right or provision of these Terms will not be
          considered a waiver of those rights.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">13. Changes to Terms</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. We will provide notice
          of any material changes to these Terms through our Service or by other reasonable means.
          Your continued use of the Service after any changes constitutes your acceptance of the new
          Terms.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-semibold">14. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at:</p>
        <p>Email: terms@intellicharts.com</p>

        <div className="mt-12 border-t pt-6">
          <p>
            By using Intellicharts, you acknowledge that you have read, understood, and agree to be
            bound by these Terms of Service.
          </p>
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
