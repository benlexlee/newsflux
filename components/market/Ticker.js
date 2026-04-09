import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MarketTicker() {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await axios.get('/api/market');
        setPrices(response.data);
      } catch (error) {
        console.error('Error fetching prices:', error);
        // Fallback data
        setPrices({
          bitcoin: '42,000',
          gold: '2,050',
          eur_usd: '1.09',
          sp500: '4,500',
        });
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `$${price.toLocaleString()}`;
    }
    return price;
  };

  return (
    <div className="market-ticker py-2">
      <div className="market-ticker-content inline-block whitespace-nowrap">
        <span className="mx-4"><strong>Bitcoin:</strong> {formatPrice(prices.bitcoin)}</span>
        <span className="mx-4"><strong>Gold:</strong> {formatPrice(prices.gold)}</span>
        <span className="mx-4"><strong>EUR/USD:</strong> {formatPrice(prices.eur_usd)}</span>
        <span className="mx-4"><strong>S&P 500:</strong> {formatPrice(prices.sp500)}</span>
      </div>
    </div>
  );
}