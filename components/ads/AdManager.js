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
  });

  useEffect(() => {
    async function loadAds() {
      const codes = await getAdCodes();
      setAdCodes(codes);
    }
    loadAds();
  }, []);

  switch (position) {
    case 'video':
      return <VideoAd adCode={adCodes.videoAdCode} />;
    case 'interstitial':
      return <InterstitialAd adCode={adCodes.interstitialAdCode} />;
    case 'top':
      return <BannerAd adCode={adCodes.topBannerCode} className="mb-4" />;
    case 'middle':
      return <BannerAd adCode={adCodes.middleBannerCode} className="my-6" />;
    case 'bottom':
      return <BannerAd adCode={adCodes.bottomBannerCode} className="mt-6" />;
    default:
      return null;
  }
}