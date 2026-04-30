'use client';
import { useState, useEffect } from 'react';
import { hasVideoAdBeenWatched, markVideoAdWatched } from '../../lib/ads';

export default function VideoAd({ adCode }) {
  const [show, setShow] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const watched = hasVideoAdBeenWatched();
    if (!watched && adCode) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [adCode]);

  useEffect(() => {
    if (show && countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
    if (countdown === 0 && !finished) setFinished(true);
  }, [show, countdown, finished]);

  const handleVideoEnd = () => {
    markVideoAdWatched();
    setShow(false);
  };

  if (!show || !adCode) return null;

  if (finished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div dangerouslySetInnerHTML={{ __html: adCode }} />
          <button
            onClick={handleVideoEnd}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Continue to Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="bg-black text-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="text-6xl font-bold mb-4">{countdown}</div>
        <p className="text-xl">Video ad starting in {countdown} seconds...</p>
        <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-1000"
            style={{ width: `${((5 - countdown) / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}