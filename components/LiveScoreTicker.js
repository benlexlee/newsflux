import { useState, useEffect } from 'react';

export default function LiveScoreTicker() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch('/api/scores');
        const data = await res.json();
        setMatches(data);
      } catch (error) {
        console.error('Error fetching live scores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
    // Refresh every 60 seconds
    const interval = setInterval(fetchScores, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-green-800 to-green-900 text-white py-2 px-4 rounded-lg mb-4 text-center">
        Loading live scores...
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-gradient-to-r from-green-800 to-green-900 text-white py-2 px-4 rounded-lg mb-4 text-center">
        No live matches at the moment. Check back later!
      </div>
    );
  }

  // Build the ticker text
  const tickerText = matches.map(match =>
    `${match.home} ${match.home_score ?? '?'} - ${match.away_score ?? '?'} ${match.away}`
  ).join(' • ');

  return (
    <div className="bg-gradient-to-r from-green-800 to-green-900 text-white py-2 rounded-lg mb-4 overflow-hidden whitespace-nowrap shadow-md">
      <div className="inline-block animate-[ticker_30s_linear_infinite] font-semibold text-sm px-4">
        ⚽ LIVE SCORES • {tickerText} • Updated every 60s
      </div>
    </div>
  );
}