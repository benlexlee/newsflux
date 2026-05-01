import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdManager from '../components/ads/AdManager';
import MarketTicker from '../components/market/Ticker';
import HeadlineTicker from '../components/HeadlineTicker';

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/rss');
        const data = await res.json();
        setNews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <>
      <Head><title>NewsFlux - Latest Headlines</title></Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />
      <main className="container mx-auto px-4 py-6">
        <AdManager position="top" />
        <MarketTicker />
        <HeadlineTicker />
        {loading ? (
          <div className="text-center py-20">Loading latest news...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {news.map((item, idx) => (
              <div key={item.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition">
                {item.imageUrl && <img src={item.imageUrl} className="w-full h-48 object-cover" />}
                <div className="p-5">
                  <div className="text-blue-400 text-sm mb-1">{item.source}</div>
                  <h2 className="text-xl font-bold mb-2 line-clamp-2">{item.title}</h2>
                  <p className="text-gray-300 mb-4 line-clamp-3">{item.summary}</p>
                  <Link href={`/news/${encodeURIComponent(item.id)}`} className="text-blue-400 hover:underline">Read more →</Link>
                </div>
                {idx === 1 && <AdManager position="middle" />}
              </div>
            ))}
          </div>
        )}
        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}