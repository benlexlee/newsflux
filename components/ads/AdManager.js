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

  // Distribute top banners based on count
  const getDistributedBanners = (position) => {
    const topCode = adCodes.topBannerCode;
    const totalCount = adCodes.topBannerCount || 1;
    if (!topCode || totalCount === 0) return null;

    let topCount = 0, middleCount = 0, bottomCount = 0;
    if (totalCount === 1) {
      topCount = 1;
    } else if (totalCount === 2) {
      topCount = 1;
      middleCount = 1;
    } else {
      topCount = 1;
      bottomCount = 1;
      middleCount = totalCount - 2;
    }

    const count = position === 'top' ? topCount : position === 'middle' ? middleCount : bottomCount;
    if (count === 0) return null;

    const banners = [];
    for (let i = 0; i < count; i++) {
      banners.push(
        <div key={i} className={`w-full ${i > 0 ? 'mt-3 md:mt-4' : ''}`}>
          <BannerAd adCode={topCode} />
        </div>
      );
    }
    return banners;
  };

  const renderRegularBanners = (code, count) => {
    if (!code || count === 0) return null;
    const banners = [];
    for (let i = 0; i < count; i++) {
      banners.push(
        <div key={i} className={`w-full ${i > 0 ? 'mt-3 md:mt-4' : ''}`}>
          <BannerAd adCode={code} />
        </div>
      );
    }
    return banners;
  };

  if (position === 'video') {
    return <VideoAd adCode={adCodes.videoAdCode} />;
  }
  if (position === 'interstitial') {
    return <InterstitialAd adCode={adCodes.interstitialAdCode} />;
  }

  if (position === 'top') {
    const distributed = getDistributedBanners('top');
    return <div className="mb-4 space-y-3 md:space-y-4">{distributed}</div>;
  }

  if (position === 'middle') {
    const distributed = getDistributedBanners('middle');
    const regular = renderRegularBanners(adCodes.middleBannerCode, adCodes.middleBannerCount || 1);
    return (
      <div className="my-6 space-y-3 md:space-y-4">
        {distributed}
        {regular}
      </div>
    );
  }

  if (position === 'bottom') {
    const distributed = getDistributedBanners('bottom');
    const regular = renderRegularBanners(adCodes.bottomBannerCode, adCodes.bottomBannerCount || 1);
    return (
      <div className="mt-6 space-y-3 md:space-y-4">
        {distributed}
        {regular}
      </div>
    );
  }

  return null;
}