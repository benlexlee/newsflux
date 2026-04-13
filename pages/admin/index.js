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
      setMessage('Ad settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving ad settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerNews = async () => {
    try {
      await axios.post('/api/news');
      setMessage('News aggregation triggered!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error triggering news aggregation');
    }
  };

  return (
    <>
      <Head><title>Admin Panel - NewsFlux</title></Head>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Admin Panel</h1>
        {message && <div className="mb-4 p-3 bg-green-800 text-green-200 rounded-lg">{message}</div>}
        
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">Ad Settings</h2>
            <div className="space-y-4">
              <div>
                <label>Top Banner Ad Code</label>
                <textarea rows="4" value={ads.topBannerCode} onChange={(e) => setAds({...ads, topBannerCode: e.target.value})} placeholder="Paste your Google AdSense or other ad code here..." />
              </div>
              <div>
                <label>Middle Banner Ad Code</label>
                <textarea rows="4" value={ads.middleBannerCode} onChange={(e) => setAds({...ads, middleBannerCode: e.target.value})} placeholder="Paste your ad code here..." />
              </div>
              <div>
                <label>Bottom Banner Ad Code</label>
                <textarea rows="4" value={ads.bottomBannerCode} onChange={(e) => setAds({...ads, bottomBannerCode: e.target.value})} placeholder="Paste your ad code here..." />
              </div>
              <div>
                <label>Video Ad Code</label>
                <textarea rows="4" value={ads.videoAdCode} onChange={(e) => setAds({...ads, videoAdCode: e.target.value})} placeholder="Paste your video ad code here..." />
              </div>
              <div>
                <label>Interstitial Ad Code</label>
                <textarea rows="4" value={ads.interstitialAdCode} onChange={(e) => setAds({...ads, interstitialAdCode: e.target.value})} placeholder="Paste your interstitial ad code here..." />
              </div>
              <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Ad Settings'}
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">News Aggregation</h2>
            <p className="text-gray-300 text-sm mb-4">Manually fetch the latest news from RSS feeds (Bloomberg, Reuters, ESPN, BBC, etc.)</p>
            <button onClick={handleTriggerNews} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
              Fetch News Now
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}