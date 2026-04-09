import { useState, useEffect } from 'react';
import { hasVideoAdBeenWatched, markVideoAdWatched } from '../../lib/ads';

export default function VideoAd({ adCode }) {
  const [showAd, setShowAd] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [videoFinished, setVideoFinished] = useState(false);

  useEffect(() => {
    const watched = hasVideoAdBeenWatched();
    if (!watched && adCode) {
      const timer = setTimeout(() => setShowAd(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [adCode]);

  useEffect(() => {
    if (showAd && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    if (countdown === 0 && !videoFinished) {
      setVideoFinished(true);
    }
  }, [showAd, countdown, videoFinished]);

  const handleVideoEnd = () => {
    markVideoAdWatched();
    setShowAd(false);
  };

  if (!showAd || !adCode) return null;

  if (videoFinished) {
    return (
      <div className="video-ad-overlay">
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
    <div className="video-ad-overlay">
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