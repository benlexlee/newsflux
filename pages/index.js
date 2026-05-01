import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdManager from '../components/ads/AdManager';
import MarketTicker from '../components/market/Ticker';
import HeadlineTicker from '../components/HeadlineTicker';

export default function Home() {
  const router = useRouter();
  const { category } = router.query;
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(category || 'all');

  useEffect(() => {
    setActiveTab(category || 'all');
  }, [category]);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const url = category && category !== 'all' ? `/api/rss?category=${category}` : '/api/rss';
        const res = await fetch(url);
        const data = await res.json();
        setNews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [category]);

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
        
        {/* Modern Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 mt-6 border-b border-gray-700 pb-2">
          <Link
            href="/"
            className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 ${
              !category || category === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🔥 All
          </Link>
          <Link
            href="/?category=finance"
            className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 ${
              category === 'finance'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            📈 Finance
          </Link>
          <Link
            href="/?category=sports"
            className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 ${
              category === 'sports'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            ⚽ Sports
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-lg">No news found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, idx) => (
              <article key={item.id} className="group bg-gray-800/80 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                {item.imageUrl && (
                  <div className="overflow-hidden h-48">
                    <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{item.source}</span>
                    <span className="text-xs text-gray-500">{item.pubDate ? new Date(item.pubDate).toLocaleDateString() : ''}</span>
                  </div>
                  <h2 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-400 transition">{item.title}</h2>
                  <p className="text-gray-300 mb-4 line-clamp-3 text-sm">{item.summary}</p>
                  <Link href={`/news/${encodeURIComponent(item.id)}`} className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium text-sm">
                    Read more
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                {idx === 1 && <AdManager position="middle" />}
              </article>
            ))}
          </div>
        )}
        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}