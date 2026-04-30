'use client';
import { useState, useEffect } from 'react';

export default function GameInterstitialAd({ adCode, onClose }) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const canClose = countdown === 0;

  if (!adCode) {
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative bg-gray-900 rounded-lg p-6 max-w-2xl w-full">
        <div className="text-center text-white mb-2">
          {canClose ? 'Ad finished – continue to game' : `Video ad in ${countdown}s`}
        </div>
        <div dangerouslySetInnerHTML={{ __html: adCode }} />
        {canClose && (
          <button onClick={onClose} className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Continue to Game
          </button>
        )}
      </div>
    </div>
  );
}