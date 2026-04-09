import { useState, useEffect } from 'react';
import { shouldShowInterstitial, markInterstitialShown } from '../../lib/ads';

export default function InterstitialAd({ adCode }) {
  const [showAd, setShowAd] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (shouldShowInterstitial() && adCode) {
      setShowAd(true);
    }
  }, [adCode]);

  useEffect(() => {
    if (showAd && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      setCanClose(true);
    }
  }, [showAd, countdown]);

  const handleClose = () => {
    if (!canClose) return;
    markInterstitialShown();
    setShowAd(false);
  };

  if (!showAd || !adCode) return null;

  return (
    <div className="interstitial-overlay">
      <div className="interstitial-content">
        <button
          onClick={handleClose}
          className={`absolute top-2 right-2 text-gray-500 hover:text-gray-700 ${
            !canClose ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!canClose}
        >
          ✕
        </button>
        <div className="mb-4 text-sm text-gray-500">
          {canClose ? 'You can now close this ad' : `Ad closes in ${countdown} seconds...`}
        </div>
        <div dangerouslySetInnerHTML={{ __html: adCode }} />
      </div>
    </div>
  );
}