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
import Parser from 'rss-parser';

const parser = new Parser();

const feedUrls = {
  finance: [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://feeds.reuters.com/reuters/businessNews',
    'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
  ],
  sports: [
    'https://www.espn.com/espn/rss/news',
    'https://feeds.bbci.co.uk/sport/rss.xml',
    'https://sports.yahoo.com/top/rss.xml',
  ],
};

// Hardcoded fallback news (always shows if fetch fails)
const fallbackNews = [
  { _id: '1', title: 'Bitcoin Surges Past $75,000', summary: 'Bitcoin reaches new all-time high amid institutional demand.', source: 'Reuters', category: 'finance', link: 'https://www.reuters.com', imageUrl: '' },
  { _id: '2', title: 'Real Madrid Advances to Champions League Final', summary: 'Late goal secures dramatic victory.', source: 'BBC Sport', category: 'sports', link: 'https://www.bbc.com/sport', imageUrl: '' },
  { _id: '3', title: 'Federal Reserve Signals Rate Cuts', summary: 'Powell hints at easing later this year.', source: 'Bloomberg', category: 'finance', link: 'https://www.bloomberg.com', imageUrl: '' },
  { _id: '4', title: 'Lakers Take Game 1 Against Warriors', summary: 'LeBron James scores 35 points in overtime thriller.', source: 'ESPN', category: 'sports', link: 'https://www.espn.com', imageUrl: '' },
];

export default function Home() {
  const router = useRouter();
  const { category } = router.query;
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incrementPageViews();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      let feedList;
      if (category === 'finance') feedList = feedUrls.finance;
      else if (category === 'sports') feedList = feedUrls.sports;
      else feedList = [...feedUrls.finance, ...feedUrls.sports];

      const allArticles = [];
      // Try multiple CORS proxies
      const proxies = [
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/',
        'https://corsproxy.io/?url=',
      ];

      for (const url of feedList) {
        let success = false;
        for (const proxy of proxies) {
          try {
            const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl, { timeout: 8000 });
            if (!response.ok) throw new Error('Proxy failed');
            const xml = await response.text();
            const feed = await parser.parseString(xml);
            const articles = feed.items.slice(0, 6).map(item => ({
              _id: item.link,
              title: item.title,
              summary: (item.contentSnippet || item.description || '').substring(0, 200),
              source: new URL(url).hostname.replace('www.', ''),
              category: category === 'finance' ? 'finance' : category === 'sports' ? 'sports' : 'general',
              imageUrl: item.enclosure?.url || '',
              publishedAt: item.pubDate || new Date().toISOString(),
              link: item.link,
            }));
            allArticles.push(...articles);
            success = true;
            break;
          } catch (err) {
            continue;
          }
        }
        if (!success) console.warn(`All proxies failed for ${url}`);
      }

      if (allArticles.length > 0) {
        const shuffled = allArticles.sort(() => 0.5 - Math.random());
        setNews(shuffled.slice(0, 15));
      } else {
        // Use fallback news filtered by category
        let filtered = fallbackNews;
        if (category === 'finance') filtered = fallbackNews.filter(n => n.category === 'finance');
        else if (category === 'sports') filtered = fallbackNews.filter(n => n.category === 'sports');
        setNews(filtered);
      }
      setLoading(false);
    };
    fetchNews();
  }, [category]);

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
                  <Link href={`/news/${encodeURIComponent(item.link)}`} className="text-blue-600 hover:underline font-medium">Read more →</Link>
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