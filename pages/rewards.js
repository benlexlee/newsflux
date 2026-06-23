import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdManager from '../components/ads/AdManager';
import { getAdCodes } from '../lib/ads';

export default function RewardsPage() {
  const [adCodes, setAdCodes] = useState({});
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [cardCount, setCardCount] = useState(5);

  useEffect(() => {
    getAdCodes().then(codes => {
      setAdCodes(codes);
      setCardCount(codes.rewardsCardCount || 5);
    });
  }, []);

  const handleWatchAd = () => {
    setShowInterstitial(true);
  };

  return (
    <>
      <Head>
        <title>Rewards - NewsFlux</title>
        <meta name="description" content="Support NewsFlux by watching ads" />
      </Head>
      <Header />

      {showInterstitial && adCodes.interstitialAdCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-gray-900 rounded-2xl p-4 md:p-6 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-bold text-white">Ad</h3>
              <button
                onClick={() => setShowInterstitial(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center">
              <div dangerouslySetInnerHTML={{ __html: adCodes.interstitialAdCode }} />
            </div>
          </div>
        </div>
      )}

      <AdManager position="video" />
      <AdManager position="interstitial" />

      <main className="container mx-auto px-4 py-4 md:py-8">
        <AdManager position="top" />

        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🎁 Rewards
          </h1>
          <p className="text-gray-400 text-sm md:text-base mt-2">Support NewsFlux by watching and exploring ads</p>
        </div>

        {cardCount > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto">
            {[...Array(cardCount)].map((_, idx) => (
              <div
                key={idx}
                className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-4 md:p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs bg-blue-600 px-3 py-1 rounded-full text-white">Sponsored</span>
                    <span className="text-xs text-gray-500">#{idx + 1}</span>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-2 md:p-4 mb-4 min-h-[80px] md:min-h-[100px] flex items-center justify-center overflow-hidden">
                    {adCodes.topBannerCode ? (
                      <div className="w-full max-w-full" dangerouslySetInnerHTML={{ __html: adCodes.topBannerCode }} />
                    ) : (
                      <div className="w-full h-full text-gray-400 text-xs md:text-sm text-center">Ad space</div>
                    )}
                  </div>

                  <button
                    onClick={handleWatchAd}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition text-sm md:text-base"
                  >
                    ▶️ Watch Ad
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AdManager position="middle" />

        <div className="max-w-6xl mx-auto mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-4 md:p-6 border border-gray-700">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 text-center">🌟 Featured Sponsor</h2>
            <div className="bg-gray-700/50 rounded-lg p-3 md:p-6 min-h-[80px] md:min-h-[120px] flex items-center justify-center overflow-hidden">
              {adCodes.bottomBannerCode ? (
                <div className="w-full max-w-full" dangerouslySetInnerHTML={{ __html: adCodes.bottomBannerCode }} />
              ) : (
                <div className="w-full h-full text-gray-400 text-sm text-center">Featured ad space</div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-gray-800/80 rounded-xl p-6 md:p-8 border border-gray-700">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">🎬 Watch a Video Ad</h3>
            <p className="text-gray-400 text-sm md:text-base mb-4">Watch a short video to support NewsFlux</p>
            <button
              onClick={handleWatchAd}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105"
            >
              ▶️ Watch Video Ad
            </button>
          </div>
        </div>

        <AdManager position="bottom" />
      </main>

      <Footer />
    </>
  );
}