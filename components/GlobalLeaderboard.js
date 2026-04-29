import { useState, useEffect } from 'react';

export default function GlobalLeaderboard({ game }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch(`/api/scores?game=${game}&limit=10`);
        const data = await res.json();
        setScores(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [game]);

  if (loading) return <div className="text-center text-gray-400 py-4">Loading global scores...</div>;

  if (scores.length === 0) {
    return <div className="text-center text-gray-400 py-4">No global scores yet. Be the first!</div>;
  }

  return (
    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold text-cyan-400 mb-3">🌍 Global Leaderboard</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th className="text-left py-1">Rank</th>
            <th className="text-left py-1">Player</th>
            <th className="text-right py-1">{game === 'chess' || game === 'sudoku' ? 'Time (sec)' : 'Score'}</th>
            <th className="text-right py-1">Date</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, idx) => (
            <tr key={idx} className={idx === 0 ? 'text-yellow-400' : 'text-gray-300'}>
              <td className="py-1">#{idx + 1}</td>
              <td className="py-1">{score.nickname}</td>
              <td className="text-right py-1">{game === 'chess' || game === 'sudoku' ? score.time?.toFixed(1) : score.score}</td>
              <td className="text-right py-1 text-xs">{new Date(score.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}