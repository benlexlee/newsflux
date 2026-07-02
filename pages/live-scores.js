import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdManager from '../components/ads/AdManager';
import Link from 'next/link';

export default function LiveScores() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/scores');
      const data = await res.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter matches by status
  const liveMatches = matches.filter(m => 
    m.status?.toLowerCase().includes('live') || 
    m.status?.toLowerCase().includes('half') ||
    m.status === 'Live'
  );
  const upcomingMatches = matches.filter(m => 
    m.status?.toLowerCase().includes('scheduled') || 
    m.status === 'Scheduled'
  );
  const finishedMatches = matches.filter(m => 
    m.status?.toLowerCase().includes('finished') || 
    m.status?.toLowerCase().includes('full time') ||
    m.status === 'FT'
  );

  const getDisplayMatches = () => {
    if (activeTab === 'live') return liveMatches;
    if (activeTab === 'upcoming') return upcomingMatches;
    return finishedMatches;
  };

  const displayMatches = getDisplayMatches();

  return (
    <>
      <Head>
        <title>Live Scores - NewsFlux</title>
        <meta name="description" content="Live football scores, fixtures, and results" />
      </Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />
      <main className="container mx-auto px-4 py-6">
        <AdManager position="top" />
        <h1 className="text-3xl font-bold mb-6 text-center">⚽ Live Scores</h1>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          <button 
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'live' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            🔴 Live ({liveMatches.length})
          </button>
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            📅 Upcoming ({upcomingMatches.length})
          </button>
          <button 
            onClick={() => setActiveTab('finished')}
            className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'finished' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            ✅ Finished ({finishedMatches.length})
          </button>
        </div>

        {/* Match Cards */}
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading matches...</div>
        ) : displayMatches.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No {activeTab} matches at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {displayMatches.slice(0, 30).map((match, idx) => (
              <div key={idx} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-500 transition">
                <div className="flex justify-between items-center">
                  <div className="flex-1 text-right">
                    <span className="font-semibold text-white">{match.home || 'Team A'}</span>
                  </div>
                  <div className="mx-4 text-center min-w-[60px]">
                    <div className="text-xl font-bold text-white">
                      {match.home_score ?? '?'} - {match.away_score ?? '?'}
                    </div>
                    <div className="text-xs text-gray-400">{match.status || 'Scheduled'}</div>
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-white">{match.away || 'Team B'}</span>
                  </div>
                </div>
                {match.time && (
                  <div className="text-center text-xs text-gray-500 mt-2">
                    🕐 {match.time}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center text-gray-400 text-sm mt-6">
          🔄 Auto‑refreshes every 60 seconds • Data from SportScore
        </div>

        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}