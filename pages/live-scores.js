import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdManager from '../components/ads/AdManager';

export default function LiveScores() {
  return (
    <>
      <Head>
        <title>Live Scores - NewsFlux</title>
        <meta name="description" content="Live sports scores, fixtures, and results" />
      </Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />
      <main className="container mx-auto px-4 py-6 flex flex-col min-h-[calc(100vh-250px)]">
        <AdManager position="top" />
        <h1 className="text-3xl font-bold mb-4 text-center">⚽ Live Scores</h1>
        <div className="flex-1 w-full">
          <iframe
            src="https://sportscore.com/embed/fixtures/football/live/"
            width="100%"
            height="100%"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            style={{ border: '1px solid #dce3ef', borderRadius: '8px', minHeight: '700px' }}
            title="Live Football Scores"
          />
        </div>
        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}