import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdManager from '../components/ads/AdManager';

export default function WorldCup() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/worldcup');
        const data = await res.json();
        setMatches(data.matches || data);
      } catch (error) {
        console.error('Error fetching World Cup data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

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
        {loading && <div className="text-center py-10 text-gray-400">Loading World Cup data...</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {matches.length > 0 ? (
            matches.slice(0, 20).map((match, idx) => (
              <div key={idx} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{match.home_team || match.homeTeam?.name || 'Team A'}</span>
                  <span className="text-lg font-bold">
                    {match.home_score ?? match.score?.fullTime?.home ?? '?'} - {match.away_score ?? match.score?.fullTime?.away ?? '?'}
                  </span>
                  <span className="font-semibold">{match.away_team || match.awayTeam?.name || 'Team B'}</span>
                </div>
                <div className="text-center text-sm text-gray-400">
                  {match.status || 'Scheduled'} • {new Date(match.utcDate || match.datetime).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center text-gray-400">
              No matches found. Check back later for World Cup 2026 updates.
            </div>
          )}
        </div>
        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}