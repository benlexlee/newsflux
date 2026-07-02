import { useState, useEffect } from 'react';

export default function HeadlineTicker() {
  const [headlines, setHeadlines] = useState([
    'Bitcoin hits new all-time high above $70,000',
    'Real Madrid advances to Champions League semis',
    'Fed signals rate cuts coming later this year',
    'Lakers take Game 1 against Warriors in OT thriller',
    'Gold prices surge amid economic uncertainty',
    'New AI breakthrough announced by tech giants',
  ]);

  useEffect(() => {
    const fetchHeadlines = async () => {
      try {
        const res = await fetch('/api/news?category=general');
        const data = await res.json();
        if (data && data.length > 0) {
          // Take titles from the first 8 articles
          const titles = data.slice(0, 8).map(item => item.title);
          if (titles.length > 0) setHeadlines(titles);
        }
      } catch (error) {
        console.error('Error fetching headlines:', error);
        // Keep the default headlines as fallback
      }
    };
    fetchHeadlines();
    // Optionally refresh every 5 minutes
    const interval = setInterval(fetchHeadlines, 300000);
    return () => clearInterval(interval);
  }, []);

  // Double the headlines for seamless looping (optional)
  const displayHeadlines = [...headlines, ...headlines];

  return (
    <div className="bg-blue-900 text-white py-3 overflow-hidden whitespace-nowrap rounded-lg mb-4">
      <div className="inline-block animate-[ticker_40s_linear_infinite] text-lg font-medium">
        {displayHeadlines.map((headline, idx) => (
          <span key={idx} className="mx-8">
            🔴 {headline}
          </span>
        ))}
      </div>
    </div>
  );
}