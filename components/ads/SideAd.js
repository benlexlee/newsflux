import { useState, useEffect } from 'react';
import { getAdCodes } from '../../lib/ads';

export default function SideAd() {
  const [adCodes, setAdCodes] = useState({
    topBannerCode: '',
    videoAdCode: '',
  });

  useEffect(() => {
    async function loadAds() {
      const codes = await getAdCodes();
      setAdCodes(codes);
    }
    loadAds();
  }, []);

  return (
    <div className="space-y-6 sticky top-24">
      <div className="glass-card p-4">
        <div className="text-xs text-gray-400 mb-2 text-center tracking-wider">ADVERTISEMENT</div>
        <div dangerouslySetInnerHTML={{ __html: adCodes.topBannerCode }} />
      </div>
      <div className="glass-card p-4">
        <div className="text-xs text-gray-400 mb-2 text-center tracking-wider">VIDEO AD</div>
        <div dangerouslySetInnerHTML={{ __html: adCodes.videoAdCode }} />
      </div>
    </div>
  );
}