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

const fallbackNews = [
  { _id: 'f1', title: 'Bitcoin Surges Past $75,000', summary: 'Bitcoin reaches new all-time high.', source: 'Reuters', category: 'finance', link: 'https://www.reuters.com', imageUrl: '' },
  { _id: 'f2', title: 'Real Madrid Advances to Final', summary: 'Late goal secures victory.', source: 'BBC Sport', category: 'sports', link: 'https://www.bbc.com/sport', imageUrl: '' },
  { _id: 'g1', title: 'SpaceX Successfully Launches Starship', summary: 'Fully reusable rocket completes orbital test flight.', source: 'Reuters', category: 'general', link: 'https://www.reuters.com', imageUrl: '' },
];

// Helper to check if a date is older than X hours
const isOlderThan = (dateString, hours = 2) => {
  if (!dateString) return true;
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours > hours;
};

export default function Home() {
  const router = useRouter();
  const { category } = router.query;
  const [news, setNews] = useState(fallbackNews);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');
  const [autoRefreshDone, setAutoRefreshDone] = useState(false);

  // Main function to fetch news from API
  const fetchNews = async () => {
    try {
      const cat = category || 'general';
      const res = await fetch(`/api/news?category=${cat}`);
      if (!res.ok) throw new Error('Failed to fetch news');
      const data = await res.json();
      if (data && data.length > 0) {
        setNews(data);
        // Check if the first article is older than 2 hours → trigger auto-refresh
        const firstItem = data[0];
        if (firstItem.publishedAt && isOlderThan(firstItem.publishedAt, 2) && !autoRefreshDone) {
          setRefreshMessage('🔄 News is stale. Auto‑refreshing...');
          triggerAutoRefresh();
        }
        return data;
      } else {
        setNews(fallbackNews);
        return fallbackNews;
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews(fallbackNews);
      return fallbackNews;
    }
  };

  // Trigger background refresh
  const triggerAutoRefresh = async () => {
    if (autoRefreshDone) return;
    setAutoRefreshDone(true);
    setRefreshing(true);
    try {
      const res = await fetch('/api/auto-fetch');
      if (!res.ok) throw new Error('Auto-refresh failed');
      setRefreshMessage('✅ Auto‑refresh triggered. News will update soon.');
      // Wait a few seconds and refetch
      setTimeout(async () => {
        await fetchNews();
        setRefreshMessage('');
        setRefreshing(false);
      }, 5000);
    } catch (error) {
      setRefreshMessage('❌ Auto‑refresh failed. Please try later.');
      setTimeout(() => setRefreshMessage(''), 4000);
      setRefreshing(false);
    }
  };

  // Load news on mount and when category changes
  useEffect(() => {
    incrementPageViews();
    const load = async () => {
      setLoading(true);
      await fetchNews();
      setLoading(false);
    };
    load();
    // Reset auto-refresh flag when category changes so it can trigger again
    setAutoRefreshDone(false);
  }, [category]);

  // Manual refresh (user‑facing button)
  const handleManualRefresh = async () => {
    setRefreshing(true);
    setRefreshMessage('⏳ Refreshing news...');
    try {
      const res = await fetch('/api/auto-fetch');
      if (!res.ok) throw new Error('Refresh failed');
      setRefreshMessage('✅ News refresh triggered! It may take 10–20 seconds to update.');
      setTimeout(async () => {
        await fetchNews();
        setRefreshMessage('');
        setRefreshing(false);
      }, 5000);
    } catch (error) {
      setRefreshMessage('❌ Failed to refresh news. Try again later.');
      setTimeout(() => setRefreshMessage(''), 4000);
      setRefreshing(false);
    }
  };

  let displayedNews = news;
  if (category === 'finance') {
    displayedNews = news.filter(item => item.category === 'finance');
  } else if (category === 'sports') {
    displayedNews = news.filter(item => item.category === 'sports');
  }

  return (
    <>
      <Head>
        <title>NewsFlux - Latest Financial & Sports News</title>
        <meta name="description" content="Aggregated financial and sports news from top sources" />
      </Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />
      <main className="container mx-auto px-4 py-4 md:py-6">
        <AdManager position="top" />
        <MarketTicker />
        <HeadlineTicker />

        <div className="flex flex-wrap items-center justify-between border-b border-gray-700 pb-2 mt-4 md:mt-6">
          <div className="flex flex-wrap gap-2 md:gap-4">
            <Link href="/" className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm md:text-base font-semibold ${!category ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>All</Link>
            <Link href="/?category=finance" className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm md:text-base font-semibold ${category === 'finance' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Finance</Link>
            <Link href="/?category=sports" className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm md:text-base font-semibold ${category === 'sports' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Sports</Link>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm md:text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center gap-2"
          >
            {refreshing && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            🔄 Refresh News
          </button>
        </div>

        {refreshMessage && (
          <div className={`mt-2 p-2 rounded text-sm ${refreshMessage.includes('✅') ? 'bg-green-800 text-green-200' : refreshMessage.includes('❌') ? 'bg-red-800 text-red-200' : 'bg-blue-800 text-blue-200'}`}>
            {refreshMessage}
          </div>
        )}

        {loading && <div className="text-center py-2 text-gray-400 text-sm">Loading news...</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4">
          {displayedNews.map((item, index) => (
            <div key={item._id} className="news-card">
              {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />}
              <div className="p-4 md:p-5">
                <div className="text-sm text-blue-600 font-medium mb-2">{item.source}</div>
                <h2 className="text-lg md:text-xl font-bold mb-2 line-clamp-2">{item.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm md:text-base">{item.summary}</p>
                <Link href={`/news/${encodeURIComponent(item.link || item.originalUrl)}`} className="text-blue-600 hover:underline font-medium text-sm md:text-base">Read more →</Link>
              </div>
              {index === 1 && <AdManager position="middle" />}
            </div>
          ))}
        </div>
        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}