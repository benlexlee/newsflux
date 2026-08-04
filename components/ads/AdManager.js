'use client';
import { useState, useEffect } from 'react';
import BannerAd from './BannerAd';
import VideoAd from './VideoAd';
import InterstitialAd from './InterstitialAd';
import { getAdCodes } from '../../lib/ads';

export default function AdManager({ position }) {
  const [adCodes, setAdCodes] = useState({
    topBannerCode: '',
    middleBannerCode: '',
    bottomBannerCode: '',
    videoAdCode: '',
    interstitialAdCode: '',
    topBannerCount: 1,
    middleBannerCount: 1,
    bottomBannerCount: 1,
  });

  useEffect(() => {
    async function loadAds() {
      const codes = await getAdCodes();
      setAdCodes(codes);
    }
    loadAds();
  }, []);

  // ✅ Render function for BOTTOM ONLY (side-by-side)
  const renderBottomBanners = (code, count, className = '') => {
    if (!code || count === 0) return null;
    if (count === 1) {
      return <BannerAd adCode={code} />;
    }
    const banners = [];
    for (let i = 0; i < count; i++) {
      banners.push(
        <div key={i} className="flex-1 min-w-[150px] max-w-[50%] md:max-w-[33%]">
          <BannerAd adCode={code} />
        </div>
      );
    }
    return (
      <div className={`flex flex-wrap gap-3 md:gap-4 justify-center ${className}`}>
        {banners}
      </div>
    );
  };

  // ✅ Regular render for Top and Middle (stacked vertically)
  const renderStackedBanners = (code, count, className = '') => {
    if (!code || count === 0) return null;
    const banners = [];
    for (let i = 0; i < count; i++) {
      banners.push(
        <div key={i} className="w-full">
          <BannerAd adCode={code} />
        </div>
      );
    }
    return <div className={`space-y-3 md:space-y-4 ${className}`}>{banners}</div>;
  };

  if (position === 'video') {
    return <VideoAd adCode={adCodes.videoAdCode} />;
  }
  if (position === 'interstitial') {
    return <InterstitialAd adCode={adCodes.interstitialAdCode} />;
  }

  // Top – stacked (unchanged)
  if (position === 'top') {
    return renderStackedBanners(adCodes.topBannerCode, adCodes.topBannerCount || 1, 'mb-4');
  }

  // Middle – stacked (unchanged)
  if (position === 'middle') {
    return renderStackedBanners(adCodes.middleBannerCode, adCodes.middleBannerCount || 1, 'my-6');
  }

  // ✅ Bottom – side‑by‑side (NEW)
  if (position === 'bottom') {
    return renderBottomBanners(adCodes.bottomBannerCode, adCodes.bottomBannerCount || 1, 'mt-6');
  }

  return null;
}