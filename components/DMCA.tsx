  // components/DMCA.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const DMCA: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6 transition-colors">
          &larr; Back to Home
        </Link>
        
        <div className="bg-slate-800/50 rounded-lg p-8 backdrop-blur-sm border border-purple-500/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
              DMCA & Disclaimer
            </h1>
            <p className="text-slate-400">Disclaimer / Terms & Conditions</p>
          </div>
          
          <div className="prose prose-invert max-w-none space-y-6">
            {/* Main Disclaimer */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <p className="text-slate-300 text-lg leading-relaxed">
                <strong>AnimeBing</strong> does not host or store any video files on its servers.
                We only index and embed content that is already publicly available on the internet through third-party services.
              </p>
              <p className="text-slate-300 mt-4 text-lg leading-relaxed">
                We operate similar to how search engines (like Google) index external content.
              </p>
            </section>

            {/* Therefore Section */}
            <section className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Therefore:</h3>
              <ul className="text-yellow-300 list-disc list-inside space-y-2 ml-4">
                <li>We are not responsible for any content hosted on third-party websites</li>
                <li>We do not upload, stream, or manage videos ourselves</li>
                <li>All linked content remains the responsibility of its respective hosting providers</li>
              </ul>
            </section>

            {/* Content Policy */}
            <section className="bg-slate-700/30 rounded-lg p-6 border-l-4 border-green-500">
              <h2 className="text-2xl font-bold text-white mb-4">Content Policy</h2>
              <ul className="text-slate-300 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✔</span>
                  <span>We are not affiliated with any social media account claiming to represent us</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✔</span>
                  <span>We do not store any copyrighted material on our own servers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✔</span>
                  <span>All indexed content is for educational and preview/testing purposes only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✔</span>
                  <span>This website is a promotional search/indexing platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✔</span>
                  <span>We encourage users to legally support anime creators by purchasing official media</span>
                </li>
              </ul>
            </section>

            {/* Important Notice */}
            <section className="bg-red-600/20 border border-red-500/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                <span className="text-red-400">⚠️</span>
                Important Notice
              </h3>
              <p className="text-red-300">
                If you do not agree with these terms, you must exit this website immediately.
                Continued use of this site indicates that you accept and agree to this disclaimer.
              </p>
            </section>

            {/* DMCA Section */}
            <section className="bg-slate-700/30 rounded-lg p-6 border-l-4 border-purple-500">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-red-400">🛑</span>
                DMCA – Digital Millennium Copyright Act Compliance
              </h2>
              <p className="text-slate-300 mb-4">
                AnimeBing complies fully with the Digital Millennium Copyright Act (DMCA) – 17 U.S.C.
                We respond to valid copyright infringement notices and will act promptly to remove indexed links.
              </p>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-4">
                If you believe we have indexed material that infringes your copyright, please send a formal takedown request including:
              </h3>
              
              <div className="bg-slate-600/30 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">1</span>
                  <span className="text-slate-300">Proof that you are authorized to act on behalf of the copyright owner</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">2</span>
                  <span className="text-slate-300">Clear identification of the copyrighted work</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">3</span>
                  <span className="text-slate-300">Direct URLs to the infringing content on our website</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">4</span>
                  <span className="text-slate-300">A statement of good-faith belief that the content is unauthorized</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">5</span>
                  <span className="text-slate-300">A statement that all information provided is accurate and true</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">6</span>
                  <span className="text-slate-300">A valid physical or electronic signature of the authorized complainant</span>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-blue-600/20 border border-blue-500/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">📩</span>
                Contact for DMCA Notice
              </h2>
              <p className="text-blue-300 mb-4">
                Send all copyright/legal removal requests to:
              </p>
              <div className="bg-slate-600/30 rounded-lg p-4">
                <p className="text-blue-300 text-center text-lg">
                  <span className="text-blue-400">📧</span> Email: 
                  <a href="mailto:animebingofficial@gmail.com" 
                     className="text-purple-400 hover:text-purple-300 transition-colors ml-2 font-semibold">
                    animebingofficial@gmail.com
                  </a>
                </p>
                <p className="text-blue-300 text-center text-sm mt-2">
                  Please allow 4–5 business days for action and removal.
                </p>
              </div>
            </section>

            {/* Final Note */}
            <section className="bg-slate-700/30 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">
                Thank you for your understanding and cooperation.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMCA;
