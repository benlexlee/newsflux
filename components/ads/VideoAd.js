import { useState, useEffect } from 'react';

export default function VideoAd({ adCode }) {
  const [show, setShow] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    const watched = sessionStorage.getItem('video_watched');
    if (!watched && adCode) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [adCode]);
  useEffect(() => {
    if (show && countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c-1), 1000);
      return () => clearInterval(timer);
    }
    if (countdown === 0 && !finished) setFinished(true);
  }, [show, countdown, finished]);
  if (!show || !adCode || finished) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="bg-black text-white rounded-lg p-8 text-center">
        <div className="text-6xl font-bold mb-4">{countdown}</div>
        <p className="text-xl">Video ad starting in {countdown} seconds...</p>
      </div>
    </div>
  );
}