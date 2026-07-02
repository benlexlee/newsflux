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

// Fallback hardcoded news (only used if the API completely fails)
const fallbackNews = [
  { _id: 'f1', title: 'Bitcoin Surges Past $75,000', summary: 'Bitcoin reaches new all-time high amid institutional demand. ETFs see record inflows.', source: 'Reuters', category: 'finance', link: 'https://www.reuters.com', imageUrl: '' },
  { _id: 'f2', title: 'Federal Reserve Signals Rate Cuts', summary: 'Chairman Powell hints at easing later this year as inflation cools.', source: 'Bloomberg', category: 'finance', link: 'https://www.bloomberg.com', imageUrl: '' },
  { _id: 'f3', title: 'Gold Prices Surge to Record High', summary: 'Gold hits $2,400 per ounce amid global uncertainty.', source: 'Reuters', category: 'finance', link: 'https://www.reuters.com', imageUrl: '' },
  { _id: 's1', title: 'Real Madrid Advances to Champions League Final', summary: 'Late goal secures dramatic victory over Manchester City.', source: 'BBC Sport', category: 'sports', link: 'https://www.bbc.com/sport', imageUrl: '' },
  { _id: 's2', title: 'Lakers Take Game 1 Against Warriors', summary: 'LeBron James scores 35 points in overtime thriller.', source: 'ESPN', category: 'sports', link: 'https://www.espn.com', imageUrl: '' },
  { _id: 'g1', title: 'SpaceX Successfully Launches Starship', summary: 'Fully reusable rocket completes orbital test flight.', source: 'Reuters', category: 'general', link: 'https://www.reuters.com', imageUrl: '' },
];

export default function Home() {
  const router = useRouter();
  const { category } = router.query;
  const [news, setNews] = useState(fallbackNews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incrementPageViews();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const cat = category || 'general';
        const res = await fetch(`/api/news?category=${cat}`);
        if (!res.ok) throw new Error('Failed to fetch news');
        const data = await res.json();
        // If the API returned articles, use them; otherwise fallback
        if (data && data.length > 0) {
          setNews(data);
        } else {
          // If API returns empty, still use fallback
          setNews(fallbackNews);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        // On error, keep the fallback news
        setNews(fallbackNews);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [category]);

  // Filter displayed news by category (if needed)
  let displayedNews = news;
  if (category === 'finance') {
    displayedNews = news.filter(item => item.category === 'finance');
  } else if (category === 'sports') {
    displayedNews = news.filter(item => item.category === 'sports');
  }
  // If category is 'general' or undefined, show all

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
        <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8 border-b border-gray-700 pb-2 mt-4 md:mt-6">
          <Link href="/" className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm md:text-base font-semibold ${!category ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>All</Link>
          <Link href="/?category=finance" className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm md:text-base font-semibold ${category === 'finance' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Finance</Link>
          <Link href="/?category=sports" className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm md:text-base font-semibold ${category === 'sports' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Sports</Link>
        </div>
        {loading && <div className="text-center py-2 text-gray-400 text-sm">Loading news...</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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