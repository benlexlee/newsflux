'use client';
import { useState, useEffect, useRef } from 'react';
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
  const containerRef = useRef(null);

  useEffect(() => {
    async function loadAds() {
      const codes = await getAdCodes();
      setAdCodes(codes);
    }
    loadAds();
  }, []);

  // Helper to render ad code with script execution
  const renderAdCode = (code) => {
    if (!code) return null;

    // If it contains <script src="...">, extract and load the script
    const scriptMatch = code.match(/<script\s+src=["']([^"']+)["']/i);
    if (scriptMatch) {
      const scriptUrl = scriptMatch[1];
      // Load the script dynamically
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      document.body.appendChild(script);
      // Also render the surrounding HTML (if any)
      return <div dangerouslySetInnerHTML={{ __html: code.replace(/<script[\s\S]*?<\/script>/i, '') }} />;
    }

    // If it's a regular HTML block (like the red banner test)
    return <div dangerouslySetInnerHTML={{ __html: code }} />;
  };

  if (position === 'video') {
    return <VideoAd adCode={adCodes.videoAdCode} />;
  }
  if (position === 'interstitial') {
    return <InterstitialAd adCode={adCodes.interstitialAdCode} />;
  }
  if (position === 'top') {
    return <div className="mb-4" ref={containerRef}>{renderAdCode(adCodes.topBannerCode)}</div>;
  }
  if (position === 'middle') {
    return <div className="my-6" ref={containerRef}>{renderAdCode(adCodes.middleBannerCode)}</div>;
  }
  if (position === 'bottom') {
    return <div className="mt-6" ref={containerRef}>{renderAdCode(adCodes.bottomBannerCode)}</div>;
  }
  return null;
}