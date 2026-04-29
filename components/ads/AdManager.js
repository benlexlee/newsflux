import { useState, useEffect } from 'react';
import { getAdCodes } from '../../lib/ads';
import BannerAd from './BannerAd';
import VideoAd from './VideoAd';
import InterstitialAd from './InterstitialAd';
import GameInterstitialAd from './GameInterstitialAd';

// inside the component:
if (position === 'game-interstitial') {
  return <GameInterstitialAd adCode={adCodes.interstitialAdCode} onClose={props.onClose} />;
}

export default function AdManager({ position }) {
  const [codes, setCodes] = useState({});
  useEffect(() => { getAdCodes().then(setCodes); }, []);
  if (position === 'video') return <VideoAd adCode={codes.videoAdCode} />;
  if (position === 'interstitial') return <InterstitialAd adCode={codes.interstitialAdCode} />;
  if (position === 'top') return <BannerAd adCode={codes.topBannerCode} className="mb-4" />;
  if (position === 'middle') return <BannerAd adCode={codes.middleBannerCode} className="my-6" />;
  if (position === 'bottom') return <BannerAd adCode={codes.bottomBannerCode} className="mt-6" />;
  return null;
}
