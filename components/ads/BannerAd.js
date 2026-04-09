export default function BannerAd({ adCode, className = '' }) {
  if (!adCode) return null;
  return (
    <div className={`ad-container ${className}`}>
      <div dangerouslySetInnerHTML={{ __html: adCode }} />
    </div>
  );
}