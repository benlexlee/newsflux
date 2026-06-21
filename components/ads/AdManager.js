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
    let cancelled = false;
    async function loadAds() {
      const codes = await getAdCodes();
      if (cancelled) return;
      console.log('[AdManager] codes received from /api/admin:', codes);
      setAdCodes(codes);
    }
    loadAds();
    return () => {
      cancelled = true;
    };
  }, []);

  const codeForPosition =
    position === 'top'
      ? adCodes.topBannerCode
      : position === 'middle'
      ? adCodes.middleBannerCode
      : position === 'bottom'
      ? adCodes.bottomBannerCode
      : null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !codeForPosition) return;

    container.innerHTML = '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = codeForPosition;

    const nodes = Array.from(tempDiv.childNodes);

    nodes.forEach((node) => {
      if (node.nodeType === 1 && node.tagName === 'SCRIPT') {
        const script = document.createElement('script');
        for (const attr of node.attributes) {
          script.setAttribute(attr.name, attr.value);
        }
        if (node.textContent) {
          script.textContent = node.textContent;
        }
        container.appendChild(script);
      } else {
        container.appendChild(node);
      }
    });
  }, [codeForPosition]);

  if (position === 'video') {
    return <VideoAd adCode={adCodes.videoAdCode} />;
  }
  if (position === 'interstitial') {
    return <InterstitialAd adCode={adCodes.interstitialAdCode} />;
  }
  if (position === 'top') {
    return <div className="mb-4" ref={containerRef} />;
  }
  if (position === 'middle') {
    return <div className="my-6" ref={containerRef} />;
  }
  if (position === 'bottom') {
    return <div className="mt-6" ref={containerRef} />;
  }
  return null;
}