import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdManager from '../components/ads/AdManager';
import MarketTicker from '../components/market/Ticker';
import HeadlineTicker from '../components/HeadlineTicker';
import { incrementPageViews } from '../lib/ads';

export default function Home() {
  const router = useRouter();
  const { category } = router.query;
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incrementPageViews();
    if (!sessionStorage.getItem('session_initialized')) {
      sessionStorage.setItem('session_initialized', 'true');
    }
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const cat = category || 'general';
      const res = await fetch(`/api/news?category=${cat}`);
      const data = await res.json();
      setNews(data);
      setLoading(false);
    };
    fetchNews();
  }, [category]);

  return (
    <>
      <Head>
        <title>NewsFlux - Latest Financial & Sports News</title>
        <meta name="description" content="Aggregated financial and sports news" />
      </Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />
      <main className="container mx-auto px-4 py-6">
        <AdManager position="top" />
        <MarketTicker />
        <HeadlineTicker />
        <div className="flex space-x-4 mb-8 border-b pb-2 mt-6">
          <Link href="/" className={`px-4 py-2 font-semibold ${!category ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>All</Link>
          <Link href="/?category=finance" className={`px-4 py-2 font-semibold ${category === 'finance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Finance</Link>
          <Link href="/?category=sports" className={`px-4 py-2 font-semibold ${category === 'sports' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Sports</Link>
        </div>
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading news...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, index) => (
              <div key={item._id} className="news-card">
                {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />}
                <div className="p-5">
                  <div className="text-sm text-blue-600 font-medium mb-2">{item.source}</div>
                  <h2 className="text-xl font-bold mb-2 line-clamp-2">{item.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{item.summary}</p>
                  <Link href={item._id.startsWith('http') ? item._id : `/news/${item._id}`} className="text-blue-600 hover:underline font-medium">Read more →</Link>
                </div>
                {index === 1 && <AdManager position="middle" />}
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