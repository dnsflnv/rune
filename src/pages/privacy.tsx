import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';

export const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Privacy Policy" />

      {/* Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8">
              <div className="prose prose-lg text-gray-700 space-y-6">
                <p>
                  At Runestone Safari, we take your privacy seriously. This policy describes how we collect, use, and
                  protect your personal information.
                </p>

                <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Information We Collect</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Account information (email, password) when you create an account</li>
                  <li>Usage data to improve our services</li>
                  <li>Location data when you use the map features</li>
                </ul>

                <h2 className="text-xl font-semibold text-primary mt-8 mb-4">How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>To provide and maintain our service</li>
                  <li>To notify you about changes to our service</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information to improve our service</li>
                  <li>To monitor the usage of our service</li>
                  <li>To detect, prevent and address technical issues</li>
                </ul>

                <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Data Storage and Security</h2>
                <p>
                  We use Supabase for secure data storage and authentication. Your data is protected using
                  industry-standard security measures.
                </p>

                <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Third-Party Services</h2>
                <p>We use the following third-party services:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Supabase for database and authentication</li>
                  <li>Cloudflare for hosting and security</li>
                  <li>OpenFreeMap for map tiles</li>
                </ul>

                <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Request restriction of processing your data</li>
                  <li>Request transfer of your data</li>
                  <li>Withdraw consent</li>
                </ul>

                <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:
                  <br />
                  <a
                    href="mailto:privacy.runestonesafari.1atjf@simplelogin.com"
                    className="text-primary hover:underline"
                  >
                    privacy.runestonesafari.1atjf@simplelogin.com
                  </a>
                </p>

                <p className="text-sm text-gray-500 mt-8">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  © 2025 Runestone Safari, Developed by Denis Filonov in 2025, Täby, Sweden.
                </div>
                <Link
                  to="/"
                  className="inline-block px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary/90 transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
