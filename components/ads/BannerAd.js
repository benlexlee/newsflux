'use client';
import AdCodeRenderer from './AdCodeRenderer';

export default function BannerAd({ adCode, className = '' }) {
  if (!adCode) return null;
  return <AdCodeRenderer adCode={adCode} className={className} />;
}