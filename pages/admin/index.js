import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

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
    setMessage('🔄 Fetching news from NewsAPI...');
    try {
      const res = await axios.post('/api/news', { category: 'general' });
      setMessage(`✅ ${res.data.message}`);
    } catch (err) {
      setMessage('❌ Error fetching news');
    } finally {
      setFetchingNews(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <>
      <Head><title>Admin Panel - NewsFlux</title></Head>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Admin Panel</h1>
        {message && <div className="mb-4 p-3 bg-gray-700 text-green-300 rounded-lg border border-green-500">{message}</div>}
        
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
            <p className="text-gray-300 text-sm mb-4">Fetch the latest headlines from NewsAPI (30 articles per category). Powered by NewsAPI.org.</p>
            <button onClick={handleFetchNews} disabled={fetchingNews} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50">
              {fetchingNews ? 'Fetching...' : '🔄 Fetch News Now'}
            </button>
            <hr className="my-6 border-gray-700" />
            <h3 className="text-lg font-semibold mb-2 text-white">📌 NewsAPI Info</h3>
            <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
              <li>Free tier: 100 requests/day</li>
              <li>Articles come with images</li>
              <li>Sources include Reuters, Bloomberg, ESPN, BBC, etc.</li>
              <li>Click "Fetch News Now" to populate the database</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}