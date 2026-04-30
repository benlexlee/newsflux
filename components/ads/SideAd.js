'use client';
import { useState, useEffect } from 'react';
import { getAdCodes } from '../../lib/ads';

export default function SideAd() {
  const [adCode, setAdCode] = useState('');

  useEffect(() => {
    getAdCodes().then(codes => setAdCode(codes.topBannerCode));
  }, []);

  if (!adCode) return null;

  return (
    <div className="w-80 ml-6 space-y-6 sticky top-24">
      <div className="glass-card p-4">
        <div className="text-xs text-gray-400 text-center mb-2">ADVERTISEMENT</div>
        <div dangerouslySetInnerHTML={{ __html: adCode }} />
      </div>
    </div>
  );
}