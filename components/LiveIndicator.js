import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LiveIndicator() {
  const [liveCount, setLiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveCount = async () => {
      try {
        const res = await fetch('/api/scores');
        const data = await res.json();
        // ✅ Ensure data is an array before using .filter()
        if (Array.isArray(data)) {
          const count = data.filter(m => 
            m.status?.toLowerCase().includes('live') || 
            m.status?.toLowerCase().includes('half') ||
            m.status === 'Live'
          ).length;
          setLiveCount(count);
        } else {
          setLiveCount(0);
        }
      } catch (error) {
        console.error('Error fetching live count:', error);
        setLiveCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveCount();
    const interval = setInterval(fetchLiveCount, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-lg px-4 py-2 text-center text-gray-400 text-sm">
        Checking live matches...
      </div>
    );
  }

  if (liveCount === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg px-4 py-2 text-center text-gray-400 text-sm">
        ⚽ No live matches at the moment
      </div>
    );
  }

  return (
    <Link href="/live-scores" className="block">
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg px-4 py-2 text-center text-white font-bold shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] cursor-pointer">
        <span className="inline-block w-3 h-3 bg-red-300 rounded-full animate-pulse mr-2"></span>
        🔴 {liveCount} Live Match{liveCount > 1 ? 'es' : ''} Now – Click to view
      </div>
    </Link>
  );
}