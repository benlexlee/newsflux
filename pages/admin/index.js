import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
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

export default function AdminPanel() {
  const [ads, setAds] = useState({
    topBannerCode: '',
    middleBannerCode: '',
    bottomBannerCode: '',
    videoAdCode: '',
    interstitialAdCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fetchingNews, setFetchingNews] = useState(false);
  const [fetchProgress, setFetchProgress] = useState('');

  useEffect(() => {
    fetchAdSettings();
  }, []);

  const fetchAdSettings = async () => {
    try {
      const response = await axios.get('/api/admin');
      if (response.data) setAds(response.data);
    } catch (error) {
      console.error('Error fetching ad settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post('/api/admin', ads);
      setMessage('✅ Ad settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error saving ad settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchNews = async () => {
    setFetchingNews(true);
    setFetchProgress('Starting fetch...');
    const allFeeds = [...feedUrls.finance, ...feedUrls.sports];
    const allArticles = [];
    let completed = 0;

    // Parallel fetch all feeds
    const promises = allFeeds.map(async (url) => {
      try {
        setFetchProgress(`Fetching ${new URL(url).hostname}...`);
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const xml = await response.text();
        const feed = await parser.parseString(xml);
        const articles = feed.items.slice(0, 10).map(item => ({
          originalUrl: item.link,
          title: item.title,
          summary: (item.contentSnippet || item.description || '').substring(0, 1000),
          source: new URL(url).hostname.replace('www.', ''),
          category: url.includes('bloomberg') || url.includes('reuters') || url.includes('nytimes') ? 'finance' : 'sports',
          imageUrl: item.enclosure?.url || '',
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        }));
        allArticles.push(...articles);
      } catch (err) {
        console.error(`Error fetching ${url}:`, err);
      } finally {
        completed++;
        setFetchProgress(`Fetched ${completed}/${allFeeds.length} feeds...`);
      }
    });

    await Promise.all(promises);

    // Deduplicate
    const unique = {};
    for (const a of allArticles) unique[a.originalUrl] = a;
    const final = Object.values(unique);

    setFetchProgress(`Storing ${final.length} articles...`);
    try {
      const res = await axios.post('/api/store-news', { articles: final });
      setMessage(`✅ ${res.data.message}`);
    } catch (err) {
      setMessage('❌ Error storing articles');
    } finally {
      setFetchingNews(false);
      setFetchProgress('');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <>
      <Head><title>Admin Panel - NewsFlux</title></Head>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Admin Panel</h1>
        {message && <div className="mb-4 p-3 bg-gray-700 text-green-300 rounded-lg border border-green-500">{message}</div>}
        {fetchProgress && <div className="mb-4 p-2 bg-blue-900 text-blue-200 rounded-lg text-center">{fetchProgress}</div>}
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Ad Settings Card */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">📢 Ad Codes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Top Banner Ad</label>
                <textarea rows="3" value={ads.topBannerCode} onChange={(e) => setAds({...ads, topBannerCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1">Middle Banner Ad</label>
                <textarea rows="3" value={ads.middleBannerCode} onChange={(e) => setAds({...ads, middleBannerCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1">Bottom Banner Ad</label>
                <textarea rows="3" value={ads.bottomBannerCode} onChange={(e) => setAds({...ads, bottomBannerCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1">Video Ad (once per session)</label>
                <textarea rows="3" value={ads.videoAdCode} onChange={(e) => setAds({...ads, videoAdCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1">Interstitial Ad (after 5 pages)</label>
                <textarea rows="3" value={ads.interstitialAdCode} onChange={(e) => setAds({...ads, interstitialAdCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm" />
              </div>
              <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? 'Saving...' : '💾 Save All Ad Settings'}
              </button>
            </div>
          </div>
          
          {/* News & Actions Card */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">📰 News Aggregation</h2>
            <p className="text-gray-300 text-sm mb-4">Fetch the latest headlines (parallel, faster). Articles will be stored in the database.</p>
            <button onClick={handleFetchNews} disabled={fetchingNews} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50">
              {fetchingNews ? 'Fetching...' : '🔄 Fetch News Now (Parallel)'}
            </button>
            <hr className="my-6 border-gray-700" />
            <h3 className="text-lg font-semibold mb-2 text-white">📌 Instructions</h3>
            <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
              <li>Parallel fetch – much faster (3‑5 seconds).</li>
              <li>Ads are placed automatically across the site.</li>
              <li>Video ad appears once per visit (non‑skippable).</li>
              <li>Interstitial ad appears after 5 page views.</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}