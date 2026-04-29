import { useState, useEffect } from 'react';

export default function MarketTicker() {
  const [prices, setPrices] = useState({ bitcoin: 42000, gold: 2350, eur_usd: 1.09, sp500: 4800 });
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/market');
        const data = await res.json();
        setPrices(data);
      } catch(e) { console.error(e); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="bg-black/40 backdrop-blur-sm py-2 rounded-lg mb-4 overflow-hidden whitespace-nowrap">
      <div className="inline-block animate-[ticker_30s_linear_infinite] text-cyan-300">
        <span className="mx-4">💰 Bitcoin: ${prices.bitcoin?.toLocaleString()}</span>
        <span className="mx-4">🥇 Gold: ${prices.gold?.toLocaleString()}</span>
        <span className="mx-4">💶 EUR/USD: {prices.eur_usd}</span>
        <span className="mx-4">📈 S&P 500: {prices.sp500?.toLocaleString()}</span>
      </div>
    </div>
  );
}