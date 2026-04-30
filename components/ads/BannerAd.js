'use client';
export default function BannerAd({ adCode, className = '' }) {
  if (!adCode) return null;
  return <div className={`ad-container ${className}`} dangerouslySetInnerHTML={{ __html: adCode }} />;
}