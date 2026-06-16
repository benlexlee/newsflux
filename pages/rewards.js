import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdManager from '../components/ads/AdManager';
import { getAdCodes } from '../lib/ads';

export default function RewardsPage() {
  const [adCodes, setAdCodes] = useState({});
  const [videoAdPlaying, setVideoAdPlaying] = useState(false);

  useEffect(() => {
    getAdCodes().then(codes => setAdCodes(codes));
  }, []);

  // 👇 UPDATE THESE LINKS with your own affiliate/referral URLs
  const adProviders = [
    { id: 1, link: 'https://adsterra.com/offer?ref=YOUR_REF' },
    { id: 2, link: 'https://monetag.com/?ref=YOUR_REF' },
    { id: 3, link: 'https://hilltopads.com/?ref=YOUR_REF' },
    { id: 4, link: 'https://admob.google.com/' },
    { id: 5, link: 'https://propellerads.com/offer?ref=YOUR_REF' },
  ];

  return (
    <>
      <Head>
        <title>Rewards - NewsFlux</title>
        <meta name="description" content="Earn rewards by viewing sponsored content" />
      </Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />

      <main className="container mx-auto px-4 py-8">
        {/* Top banner */}
        <AdManager position="top" />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🎁 Rewards & Offers
          </h1>
          <p className="text-gray-400 mt-2">Complete offers to earn rewards</p>
        </div>

        {/* 5 ad cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {adProviders.map((provider, idx) => (
            <div
              key={provider.id}
              className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs bg-blue-600 px-3 py-1 rounded-full text-white">Sponsored</span>
                  <span className="text-xs text-gray-500">#{idx + 1}</span>
                </div>

                {/* Banner ad – uses top banner code from admin panel */}
                <div className="bg-gray-700/50 rounded-lg p-4 mb-4 min-h-[100px] flex items-center justify-center">
                  {adCodes.topBannerCode ? (
                    <div dangerouslySetInnerHTML={{ __html: adCodes.topBannerCode }} />
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>

                <div className="flex gap-3">
                  <a
                    href={provider.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg transition text-sm"
                  >
                    View Offer →
                  </a>
                  <button
                    onClick={() => setVideoAdPlaying(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition text-sm"
                  >
                    ▶️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Middle banner */}
        <div className="my-8 max-w-6xl mx-auto">
          <AdManager position="middle" />
        </div>

        {/* Featured banner – uses bottom banner code */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 text-center">🌟 Featured</h2>
            <div className="bg-gray-700/50 rounded-lg p-6 min-h-[120px] flex items-center justify-center">
              {adCodes.bottomBannerCode ? (
                <div dangerouslySetInnerHTML={{ __html: adCodes.bottomBannerCode }} />
              ) : (
                <div className="w-full h-full"></div>
              )}
            </div>
          </div>
        </div>

        {/* Watch Video Ad section */}
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-gray-800/80 rounded-xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-3">🎬 Watch a Video Ad</h3>
            <p className="text-gray-400 mb-4">Support NewsFlux by watching</p>
            <button
              onClick={() => setVideoAdPlaying(true)}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105"
            >
              ▶️ Watch Video Ad
            </button>
          </div>
        </div>

        <div className="mt-8 max-w-6xl mx-auto">
          <AdManager position="bottom" />
        </div>
      </main>

      {/* Video ad overlay – uses videoAdCode from admin panel */}
      {videoAdPlaying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Video Ad</h3>
              <button
                onClick={() => setVideoAdPlaying(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg min-h-[200px] flex items-center justify-center">
              {adCodes.videoAdCode ? (
                <div dangerouslySetInnerHTML={{ __html: adCodes.videoAdCode }} />
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-gray-400">No video ad configured</p>
                  <button
                    onClick={() => setVideoAdPlaying(false)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}