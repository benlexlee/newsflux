'use client';
import { useState, useEffect } from 'react';
import { shouldShowInterstitial, markInterstitialShown } from '../../lib/ads';
import AdCodeRenderer from './AdCodeRenderer';

export default function InterstitialAd({ adCode }) {
  const [show, setShow] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (shouldShowInterstitial() && adCode) setShow(true);
  }, [adCode]);

  useEffect(() => {
    if (show && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) setCanClose(true);
  }, [show, countdown]);

  if (!show || !adCode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative bg-gray-900 rounded-lg p-6 max-w-2xl w-full">
        <div className="text-white text-center mb-2">
          {canClose ? 'Ad finished – you may close' : `Ad closes in ${countdown}s`}
        </div>
        <AdCodeRenderer adCode={adCode} />
        {canClose && (
          <button
            onClick={() => { markInterstitialShown(); setShow(false); }}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}