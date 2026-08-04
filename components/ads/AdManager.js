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

  // ✅ Distribute banners for TOP (stacked vertically)
  const getDistributedTopBanners = (position) => {
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
        <div key={i} className="w-full">
          <BannerAd adCode={topCode} />
        </div>
      );
    }
    return <div className="space-y-3 md:space-y-4">{banners}</div>;
  };

  // ✅ Distribute banners for BOTTOM (side‑by‑side)
  const getDistributedBottomBanners = (position) => {
    const bottomCode = adCodes.bottomBannerCode;
    const totalCount = adCodes.bottomBannerCount || 1;
    if (!bottomCode || totalCount === 0) return null;

    let topCount = 0, middleCount = 0, bottomCount = 0;
    if (totalCount === 1) {
      bottomCount = 1;
    } else if (totalCount === 2) {
      middleCount = 1;
      bottomCount = 1;
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
        <div key={i} className="flex-1 min-w-[150px] max-w-[50%] md:max-w-[33%]">
          <BannerAd adCode={bottomCode} />
        </div>
      );
    }
    return (
      <div className={`flex flex-wrap gap-3 md:gap-4 justify-center`}>
        {banners}
      </div>
    );
  };

  // ✅ Regular banners for MIDDLE (stacked vertically)
  const renderRegularBanners = (code, count) => {
    if (!code || count === 0) return null;
    const banners = [];
    for (let i = 0; i < count; i++) {
      banners.push(
        <div key={i} className="w-full">
          <BannerAd adCode={code} />
        </div>
      );
    }
    return <div className="space-y-3 md:space-y-4">{banners}</div>;
  };

  if (position === 'video') {
    return <VideoAd adCode={adCodes.videoAdCode} />;
  }
  if (position === 'interstitial') {
    return <InterstitialAd adCode={adCodes.interstitialAdCode} />;
  }

  // ✅ TOP – distributed (stacked)
  if (position === 'top') {
    return <div className="mb-4">{getDistributedTopBanners('top')}</div>;
  }

  // ✅ MIDDLE – distributed top banners (stacked) + regular middle banners (stacked)
  if (position === 'middle') {
    const topDistributed = getDistributedTopBanners('middle');
    const regular = renderRegularBanners(adCodes.middleBannerCode, adCodes.middleBannerCount || 1);
    return (
      <div className="my-6 space-y-3 md:space-y-4">
        {topDistributed}
        {regular}
      </div>
    );
  }

  // ✅ BOTTOM – distributed top banners (stacked) + distributed bottom banners (side‑by‑side)
  if (position === 'bottom') {
    const topDistributed = getDistributedTopBanners('bottom');
    const bottomDistributed = getDistributedBottomBanners('bottom');
    return (
      <div className="mt-6 space-y-3 md:space-y-4">
        {topDistributed}
        {bottomDistributed}
      </div>
    );
  }

  return null;
}