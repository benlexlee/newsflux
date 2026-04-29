'use client';
import { useState, useEffect } from 'react';
import { shouldShowInterstitial, markInterstitialShown } from '../../lib/ads';
// ... rest unchanged
import { useState, useEffect } from 'react';
import { shouldShowInterstitial, markInterstitialShown } from '../../lib/ads';

export default function InterstitialAd({ adCode }) {
  const [show, setShow] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(5);
  useEffect(() => {
    if (shouldShowInterstitial() && adCode) setShow(true);
  }, [adCode]);
  useEffect(() => {
    if (show && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c-1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) setCanClose(true);
  }, [show, countdown]);
  if (!show || !adCode) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative bg-gray-900 rounded-lg p-6 max-w-2xl w-full">
        <div className={`absolute top-2 right-2 ${canClose ? '' : 'opacity-50'}`}>
          {canClose && <button onClick={() => { markInterstitialShown(); setShow(false); }}>✕</button>}
        </div>
        <div>Ad closes in {countdown}s</div>
        <div dangerouslySetInnerHTML={{ __html: adCode }} />
      </div>
    </div>
  );
}