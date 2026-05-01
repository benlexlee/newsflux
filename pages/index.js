import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdManager from '../components/ads/AdManager';
import MarketTicker from '../components/market/Ticker';
import HeadlineTicker from '../components/HeadlineTicker';
import Parser from 'rss-parser';

const parser = new Parser();
const feeds = [
  { url: 'https://feeds.bbci.co.uk/news/rss.xml', source: 'BBC', category: 'general' },
  { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters', category: 'finance' },
  { url: 'https://www.espn.com/espn/rss/news', source: 'ESPN', category: 'sports' },
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg', category: 'finance' },
];

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const allArticles = [];
      for (const feed of feeds) {
        try {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`;
          const res = await fetch(proxyUrl);
          const xml = await res.text();
          const parsed = await parser.parseString(xml);
          const articles = parsed.items.slice(0, 8).map(item => ({
            id: item.link,
            title: item.title,
            summary: (item.contentSnippet || item.description || '').substring(0, 200),
            source: feed.source,
            category: feed.category,
            imageUrl: item.enclosure?.url || '',
            link: item.link,
            fullContent: item.content || item.description || '',
          }));
          allArticles.push(...articles);
        } catch (err) { console.error(err); }
      }
      // Shuffle and limit
      const shuffled = allArticles.sort(() => 0.5 - Math.random());
      setNews(shuffled.slice(0, 20));
      setLoading(false);
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
                  <Link href={`/news/${encodeURIComponent(item.link)}`} className="text-blue-400 hover:underline">Read more →</Link>
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