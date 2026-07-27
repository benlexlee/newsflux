import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdManager from '../components/ads/AdManager';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - NewsFlux</title>
        <meta name="description" content="Privacy Policy for NewsFlux" />
      </Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <AdManager position="top" />
        
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Introduction</h2>
            <p>
              Welcome to NewsFlux. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you visit our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Log Data:</strong> Your IP address, browser type, pages visited, time and date of visit.</li>
              <li><strong>Cookies:</strong> We use cookies to improve your experience and serve relevant ads.</li>
              <li><strong>Device Information:</strong> Device type, operating system, and screen resolution.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>To operate and improve our website.</li>
              <li>To display personalized ads through Google AdSense and other ad networks.</li>
              <li>To analyze site traffic and user behavior.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">4. Cookies</h2>
            <p>
              We use cookies to enhance your experience. You can control cookie preferences in your browser settings.
              Third-party services (like Google AdSense) may also use cookies to serve ads based on your visits to this and other websites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">5. Third-Party Services</h2>
            <p>We use the following third-party services that may collect your data:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Google AdSense:</strong> For displaying ads. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google's Privacy Policy</a>.</li>
              <li><strong>Vercel:</strong> For hosting our website.</li>
              <li><strong>MongoDB Atlas:</strong> For storing site data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">6. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data. You may also opt out of cookies 
              through your browser settings or by adjusting your ad preferences with Google.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, you can contact us at:  
              <br />
              <span className="text-blue-400">support@newsflux.vercel.app</span>
            </p>
          </section>

          <section className="border-t border-gray-700 pt-4 text-sm text-gray-500">
            <p>This Privacy Policy is subject to change. Please check back regularly for updates.</p>
          </section>
        </div>

        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}