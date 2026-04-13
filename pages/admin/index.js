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

  const handleTriggerNews = async () => {
    try {
      await axios.post('/api/news');
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
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Admin Panel</h1>
        {message && <div className="mb-4 p-3 bg-gray-700 text-green-300 rounded-lg border border-green-500">{message}</div>}
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Ad Settings Card */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">📢 Ad Codes</h2>
            <p className="text-gray-400 text-sm mb-4">Paste your ad codes (Google AdSense, etc.) into the fields below. They will automatically appear in the correct positions.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Top Banner Ad</label>
                <textarea rows="3" value={ads.topBannerCode} onChange={(e) => setAds({...ads, topBannerCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm focus:outline-none focus:border-blue-500" placeholder='<ins class="adsbygoogle" ...></ins>' />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1">Middle Banner Ad</label>
                <textarea rows="3" value={ads.middleBannerCode} onChange={(e) => setAds({...ads, middleBannerCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm" placeholder="Your ad code here" />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1">Bottom Banner Ad</label>
                <textarea rows="3" value={ads.bottomBannerCode} onChange={(e) => setAds({...ads, bottomBannerCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm" placeholder="Your ad code here" />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1">Video Ad (once per session)</label>
                <textarea rows="3" value={ads.videoAdCode} onChange={(e) => setAds({...ads, videoAdCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm" placeholder="Your video ad code (e.g., YouTube embed)" />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1">Interstitial Ad (after 5 pages)</label>
                <textarea rows="3" value={ads.interstitialAdCode} onChange={(e) => setAds({...ads, interstitialAdCode: e.target.value})} className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-2 font-mono text-sm" placeholder="Your full-page ad code" />
              </div>
              <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? 'Saving...' : '💾 Save All Ad Settings'}
              </button>
            </div>
          </div>
          
          {/* News & Actions Card */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">📰 News Aggregation</h2>
            <p className="text-gray-300 text-sm mb-4">Fetch the latest headlines from Bloomberg, Reuters, ESPN, BBC, and more.</p>
            <button onClick={handleTriggerNews} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
              🔄 Fetch News Now
            </button>
            <hr className="my-6 border-gray-700" />
            <h3 className="text-lg font-semibold mb-2 text-white">📌 Instructions</h3>
            <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
              <li>Ads are placed automatically across the site (top, middle, bottom, video popup, interstitial).</li>
              <li>Video ad appears once per visit (non‑skippable with countdown).</li>
              <li>Interstitial ad appears after 5 page views.</li>
              <li>News feeds update every 5–10 minutes automatically.</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}