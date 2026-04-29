import { useState, useEffect } from 'react';
import { getAdCodes } from '../../lib/ads';

export default function SideAd() {
  const [codes, setCodes] = useState({});
  useEffect(() => { getAdCodes().then(setCodes); }, []);
  return (
    <div className="w-80 ml-6 space-y-6 sticky top-24">
      <div className="glass-card p-4"><div className="text-xs text-gray-400 mb-2">ADVERTISEMENT</div><div dangerouslySetInnerHTML={{ __html: codes.topBannerCode }} /></div>
      <div className="glass-card p-4"><div className="text-xs text-gray-400 mb-2">VIDEO AD</div><div dangerouslySetInnerHTML={{ __html: codes.videoAdCode }} /></div>
    </div>
  );
}