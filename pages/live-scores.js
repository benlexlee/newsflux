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
      <main className="container mx-auto px-4 py-6">
        <AdManager position="top" />
        <h1 className="text-3xl font-bold mb-6 text-center">⚽ Live Scores</h1>

        {/* Live Scores Widget */}
        <div className="w-full mb-8">
          <iframe
            src="https://sportscore.com/embed/fixtures/football/live/"
            width="100%"
            height="700"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            style={{ border: '1px solid #dce3ef', borderRadius: '8px' }}
            title="Live Football Scores"
          />
        </div>

        {/* Suggestions - Popular Leagues */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-gray-800 p-4 rounded-lg text-center hover:bg-gray-700 transition">
            <span className="text-xl">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
            <p className="text-sm font-semibold mt-1">Premier League</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center hover:bg-gray-700 transition">
            <span className="text-xl">🇪🇸</span>
            <p className="text-sm font-semibold mt-1">La Liga</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center hover:bg-gray-700 transition">
            <span className="text-xl">🇩🇪</span>
            <p className="text-sm font-semibold mt-1">Bundesliga</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center hover:bg-gray-700 transition">
            <span className="text-xl">🇮🇹</span>
            <p className="text-sm font-semibold mt-1">Serie A</p>
          </div>
        </div>

        <div className="text-center mt-6 text-gray-400 text-sm">
          🔔 Upcoming: Champions League • Europa League • World Cup Qualifiers
        </div>

        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}