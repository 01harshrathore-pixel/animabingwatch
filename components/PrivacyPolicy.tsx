  // components/PrivacyPolicy.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6 transition-colors">
          &larr; Back to Home
        </Link>
        
        <div className="bg-slate-800/50 rounded-lg p-8 backdrop-blur-sm border border-purple-500/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
              Privacy Policy
            </h1>
            <p className="text-slate-400">Last Updated: November 2025</p>
          </div>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <section className="bg-slate-700/30 rounded-lg p-6">
              <p className="text-slate-300 text-lg leading-relaxed">
                At <strong>Animebing</strong>, accessible from <strong>https://animabing.pages.dev</strong>, 
                one of our main priorities is the privacy of our visitors. This Privacy Policy document explains 
                what information we collect and how we use it.
              </p>
              <p className="text-slate-300 mt-4 text-lg leading-relaxed">
                By using our website, you hereby consent to our Privacy Policy and agree to its terms.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">🔹</span> Information We Collect
              </h2>
              <p className="text-slate-300 mb-4">
                We may ask you to provide certain personal information, and the reason for the request will be made clear at the time we ask.
              </p>
              <p className="text-slate-300 font-semibold mb-2">We may also automatically collect:</p>
              <ul className="text-slate-300 list-disc list-inside space-y-2 ml-4">
                <li>IP address</li>
                <li>Browser information</li>
                <li>Pages visited</li>
                <li>Time spent on pages</li>
                <li>Device information and general usage data</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">🔹</span> How We Use Your Information
              </h2>
              <p className="text-slate-300 mb-4">We use collected information to:</p>
              <ul className="text-slate-300 list-disc list-inside space-y-2 ml-4">
                <li>Operate and maintain our website</li>
                <li>Improve, personalize and expand our content</li>
                <li>Understand how users interact with our website</li>
                <li>Develop new features and services</li>
                <li>Prevent fraud and ensure security</li>
                <li>Communicate with you, if necessary</li>
              </ul>
            </section>

            {/* Log Files */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Log Files</h2>
              <p className="text-slate-300">
                Animebing follows a standard procedure for using log files. These logs record visitors when they visit 
                websites — this is a part of web hosting analytics.
              </p>
            </section>

            {/* Cookies & Similar Technologies */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Cookies & Similar Technologies</h2>
              <p className="text-slate-300 mb-4">
                Like most websites, Animebing uses cookies to store visitor preferences and optimize browsing experience.
              </p>
              <p className="text-slate-300">
                You can disable cookies through your browser settings.
              </p>
            </section>

            {/* Google AdSense */}
            <section className="bg-slate-700/30 rounded-lg p-6 border-l-4 border-green-500">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-green-400">✔</span> Google AdSense & Advertising Cookies
              </h2>
              <p className="text-slate-300 mb-4">
                We use Google AdSense to serve ads. Google may use advertising cookies, including the DoubleClick cookie, to:
              </p>
              <ul className="text-slate-300 list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Personalize ads based on your visit to our site and other websites</li>
                <li>Limit repeated ad displays</li>
                <li>Measure ad performance</li>
              </ul>
              <p className="text-slate-300 font-semibold mb-2">Google may collect:</p>
              <ul className="text-slate-300 list-disc list-inside space-y-2 ml-4 mb-4">
                <li>IP address</li>
                <li>Browser type</li>
                <li>User interests and behavior</li>
              </ul>
              <div className="bg-slate-600/30 rounded-lg p-4 mt-4">
                <p className="text-slate-300 mb-2">
                  Users can opt out of personalized advertising anytime:
                </p>
                <a href="https://www.google.com/settings/ads" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-purple-400 hover:text-purple-300 transition-colors block">
                  👉 https://www.google.com/settings/ads
                </a>
                <p className="text-slate-300 mt-3 mb-2">
                  For more information on Google's ad policies:
                </p>
                <a href="https://policies.google.com/technologies/ads" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-purple-400 hover:text-purple-300 transition-colors block">
                  👉 https://policies.google.com/technologies/ads
                </a>
              </div>
            </section>

            {/* Third-Party Advertising Partners */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Third-Party Advertising Partners</h2>
              <p className="text-slate-300 mb-4">
                Third-party ad servers may use Cookies, JavaScript, and Web Beacons. They automatically collect data 
                for ad targeting and measurement. Animebing has no access or control over these cookies.
              </p>
              <p className="text-slate-300">
                Users can disable third-party cookies through browser settings.
              </p>
            </section>

            {/* CCPA Privacy Rights */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">CCPA Privacy Rights (California Users)</h2>
              <p className="text-slate-300 mb-4">
                California consumers have the right to:
              </p>
              <ul className="text-slate-300 list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Know what personal data is collected</li>
                <li>Request deletion of personal data</li>
                <li>Request that personal data not be sold</li>
              </ul>
              <p className="text-slate-300">
                If you make a request, we will respond within 1 month.
              </p>
            </section>

            {/* GDPR Data Protection Rights */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">GDPR Data Protection Rights (EU Users)</h2>
              <p className="text-slate-300 mb-4">
                Every user is entitled to:
              </p>
              <ul className="text-slate-300 list-disc list-inside space-y-2 ml-4">
                <li>Right to access their data</li>
                <li>Right to correct data</li>
                <li>Right to delete data</li>
                <li>Right to restrict processing</li>
                <li>Right to object to processing</li>
                <li>Right to data portability</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section className="bg-slate-700/30 rounded-lg p-6 border-l-4 border-red-500">
              <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
              <p className="text-slate-300 mb-4">
                We do not knowingly collect any Personal Identifiable Information from children under the age of 13.
              </p>
              <p className="text-slate-300">
                If you believe your child provided personal data on our site, please contact us immediately so we can remove such information promptly.
              </p>
            </section>

            {/* Contact Us */}
            <section className="bg-slate-700/30 rounded-lg p-6 border-l-4 border-blue-500">
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="text-slate-300 mb-4">
                If you have any questions about this Privacy Policy, you may contact us at:
              </p>
              <div className="bg-slate-600/30 rounded-lg p-4">
                <p className="text-slate-300 flex items-center gap-2">
                  <span className="text-blue-400">✉</span>
                  Email: <a href="mailto:animebingofficial@gmail.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                    animebingofficial@gmail.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
