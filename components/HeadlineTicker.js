import { useState, useEffect } from 'react';

const headlines = [
  "Bitcoin hits new all-time high above $70,000",
  "Real Madrid advances to Champions League semis",
  "Fed signals rate cuts coming later this year",
  "Lakers take Game 1 against Warriors in OT thriller",
  "Gold prices surge amid economic uncertainty",
  "New AI breakthrough announced by tech giants",
];

export default function HeadlineTicker() {
  const [displayHeadlines, setDisplayHeadlines] = useState([...headlines, ...headlines]);

  return (
    <div className="bg-blue-900 text-white py-3 overflow-hidden whitespace-nowrap rounded-lg mb-4">
      <div className="inline-block animate-ticker text-lg font-medium">
        {displayHeadlines.map((headline, idx) => (
          <span key={idx} className="mx-8">
            🔴 {headline}
          </span>
        ))}
      </div>
    </div>
  );
}