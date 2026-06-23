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
    topBannerCount: 1,
    middleBannerCount: 1,
    bottomBannerCount: 1,
    rewardsCardCount: 5,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
    try {
      await axios.post('/api/news', { category: 'general' });
      setMessage('📰 News aggregation triggered!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error triggering news aggregation');
    }
  };

  return (
    <>
      <Head><title>Admin Panel - NewsFlux</title></Head>
      <Header />
      <main className="container mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white">Admin Panel</h1>
        {message && <div className="mb-4 p-3 bg-gray-700 text-green-300 rounded-lg border border-green-500">{message}</div>}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ad Settings Card */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">📢 Ad Codes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 font-medium mb-1 text-sm md:text-base">Top Banner Ad Code</label>
                <textarea rows="2" value={ads.topBannerCode} onChange={(e) => setAds({...ads, topBannerCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm" />
                <div className="flex items-center gap-4 mt-2">
                  <label className="text-gray-300 text-sm">Count (distributed across page):</label>
                  <input type="number" min="0" max="10" value={ads.topBannerCount || 1} onChange={(e) => setAds({...ads, topBannerCount: parseInt(e.target.value) || 1})} className="w-20 bg-gray-900 text-white border border-gray-600 rounded-lg p-1 text-center" />
                  <span className="text-gray-500 text-xs">(0 = hide)</span>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1 text-sm md:text-base">Middle Banner Ad Code (Native / In-Content)</label>
                <textarea rows="2" value={ads.middleBannerCode} onChange={(e) => setAds({...ads, middleBannerCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm" />
                <div className="flex items-center gap-4 mt-2">
                  <label className="text-gray-300 text-sm">Count (middle section only):</label>
                  <input type="number" min="0" max="10" value={ads.middleBannerCount || 1} onChange={(e) => setAds({...ads, middleBannerCount: parseInt(e.target.value) || 1})} className="w-20 bg-gray-900 text-white border border-gray-600 rounded-lg p-1 text-center" />
                  <span className="text-gray-500 text-xs">(0 = hide)</span>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1 text-sm md:text-base">Bottom Banner Ad Code</label>
                <textarea rows="2" value={ads.bottomBannerCode} onChange={(e) => setAds({...ads, bottomBannerCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm" />
                <div className="flex items-center gap-4 mt-2">
                  <label className="text-gray-300 text-sm">Count (bottom section only):</label>
                  <input type="number" min="0" max="10" value={ads.bottomBannerCount || 1} onChange={(e) => setAds({...ads, bottomBannerCount: parseInt(e.target.value) || 1})} className="w-20 bg-gray-900 text-white border border-gray-600 rounded-lg p-1 text-center" />
                  <span className="text-gray-500 text-xs">(0 = hide)</span>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1 text-sm md:text-base">Video Ad (once per session) / Popunder</label>
                <textarea rows="2" value={ads.videoAdCode} onChange={(e) => setAds({...ads, videoAdCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1 text-sm md:text-base">Interstitial Ad (after 5 pages / rewards watch)</label>
                <textarea rows="2" value={ads.interstitialAdCode} onChange={(e) => setAds({...ads, interstitialAdCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1 text-sm md:text-base">Number of Ad Cards on Rewards Page</label>
                <input type="number" min="0" max="20" value={ads.rewardsCardCount || 5} onChange={(e) => setAds({...ads, rewardsCardCount: parseInt(e.target.value) || 5})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2" />
                <p className="text-xs text-gray-500 mt-1">Set to 0 to hide the cards section entirely.</p>
              </div>
              <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? 'Saving...' : '💾 Save All Ad Settings'}
              </button>
            </div>
          </div>
          
          {/* News Card */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">📰 News Aggregation</h2>
            <p className="text-gray-300 text-sm mb-4">Fetch the latest headlines from NewsAPI.</p>
            <button onClick={handleFetchNews} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
              🔄 Fetch News Now
            </button>
            <hr className="my-6 border-gray-700" />
            <h3 className="text-lg font-semibold mb-2 text-white">📌 Instructions</h3>
            <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
              <li>Top Banner distributes itself across top, middle, bottom based on count.</li>
              <li>Middle and Bottom banners are separate – they stay in their own sections.</li>
              <li>Rewards "Watch Ad" buttons trigger the Interstitial Ad.</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}