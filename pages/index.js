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

// Large initial news set (shows immediately, no waiting)
const initialNews = [
  { _id: '1', title: 'Bitcoin Surges Past $75,000', summary: 'Bitcoin reaches new all-time high amid institutional demand. Analysts predict further gains as ETFs see record inflows.', source: 'Reuters', category: 'finance', link: '#', imageUrl: '' },
  { _id: '2', title: 'Real Madrid Advances to Champions League Final', summary: 'Late goal secures dramatic victory over Manchester City in extra time.', source: 'BBC Sport', category: 'sports', link: '#', imageUrl: '' },
  { _id: '3', title: 'Federal Reserve Signals Rate Cuts', summary: 'Chairman Powell hints at easing later this year as inflation shows signs of cooling.', source: 'Bloomberg', category: 'finance', link: '#', imageUrl: '' },
  { _id: '4', title: 'Lakers Take Game 1 Against Warriors', summary: 'LeBron James scores 35 points in overtime thriller to take series lead.', source: 'ESPN', category: 'sports', link: '#', imageUrl: '' },
  { _id: '5', title: 'Gold Prices Surge to Record High', summary: 'Gold hits $2,400 per ounce amid global uncertainty and central bank buying.', source: 'Reuters', category: 'finance', link: '#', imageUrl: '' },
  { _id: '6', title: 'NBA Playoffs: Celtics Sweep Heat', summary: 'Boston advances to second round after dominant defensive performance.', source: 'ESPN', category: 'sports', link: '#', imageUrl: '' },
  { _id: '7', title: 'Tesla Announces New Battery Technology', summary: 'Next-gen batteries promise 50% more range and 30% lower cost.', source: 'Bloomberg', category: 'finance', link: '#', imageUrl: '' },
  { _id: '8', title: 'Premier League: Arsenal Top of Table', summary: 'Gunners secure crucial win against Chelsea to maintain lead.', source: 'BBC Sport', category: 'sports', link: '#', imageUrl: '' },
  { _id: '9', title: 'AI Revolution: New Model Outperforms GPT-5', summary: 'Breakthrough in reasoning capabilities sparks industry race.', source: 'Reuters', category: 'finance', link: '#', imageUrl: '' },
  { _id: '10', title: 'US Open: Djokovic Advances to Quarters', summary: 'Serbian star overcomes five-set battle in late night match.', source: 'ESPN', category: 'sports', link: '#', imageUrl: '' },
];

export default function Home() {
  const router = useRouter();
  const { category } = router.query;
  const [news, setNews] = useState(initialNews);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    incrementPageViews();
  }, []);

  useEffect(() => {
    const fetchFreshNews = async () => {
      setLoading(true);
      try {
        // Try multiple sources
        const sources = [
          `https://gnews.io/api/v4/search?q=${category === 'finance' ? 'business' : category === 'sports' ? 'sports' : 'general'}&lang=en&max=30&country=us`,
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://feeds.bloomberg.com/markets/news.rss')}`,
        ];
        let allArticles = [];
        for (const url of sources) {
          try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.articles) {
              const articles = data.articles.slice(0, 15).map((item, idx) => ({
                _id: item.url || idx,
                title: item.title,
                summary: (item.description || item.content || '').substring(0, 200),
                source: item.source?.name || 'News',
                category: category === 'finance' ? 'finance' : category === 'sports' ? 'sports' : 'general',
                imageUrl: item.image || '',
                link: item.url,
              }));
              allArticles.push(...articles);
            } else if (data.items) {
              const articles = data.items.slice(0, 10).map((item, idx) => ({
                _id: item.link || idx,
                title: item.title,
                summary: (item.description || '').substring(0, 200),
                source: new URL(item.link).hostname.replace('www.', ''),
                category: category === 'finance' ? 'finance' : category === 'sports' ? 'sports' : 'general',
                imageUrl: item.enclosure?.link || '',
                link: item.link,
              }));
              allArticles.push(...articles);
            }
          } catch (e) { console.error('Source error:', e); }
        }
        if (allArticles.length > 0) {
          // Remove duplicates by link
          const unique = {};
          for (const a of allArticles) unique[a.link] = a;
          setNews(Object.values(unique).slice(0, 25));
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFreshNews();
  }, [category]);

  const displayedNews = category ? news.filter(item => item.category === category) : news;

  return (
    <>
      <Head><title>NewsFlux - Latest Financial & Sports News</title></Head>
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
        {loading && <div className="text-center py-2 text-gray-400 text-sm">Updating news...</div>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedNews.map((item, index) => (
            <div key={item._id} className="news-card">
              {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />}
              <div className="p-5">
                <div className="text-sm text-blue-600 font-medium mb-2">{item.source}</div>
                <h2 className="text-xl font-bold mb-2 line-clamp-2">{item.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{item.summary}</p>
                <Link href={`/news/${encodeURIComponent(item.link)}`} className="text-blue-600 hover:underline font-medium">Read more →</Link>
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