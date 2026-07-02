import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdManager from '../components/ads/AdManager';

export default function WorldCup() {
  return (
    <>
      <Head>
        <title>World Cup 2026 - NewsFlux</title>
        <meta name="description" content="World Cup 2026 fixtures, results, and standings" />
      </Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />
      <main className="container mx-auto px-4 py-6">
        <AdManager position="top" />
        <h1 className="text-3xl font-bold mb-6 text-center">🏆 World Cup 2026</h1>
        <div className="flex justify-center">
          <iframe
            src="https://sportscore.com/embed/competition/world-cup/"
            width="100%"
            height="800"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            style={{ border: '1px solid #dce3ef', borderRadius: '6px', maxWidth: '1200px' }}
            title="World Cup 2026"
          />
        </div>
        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}