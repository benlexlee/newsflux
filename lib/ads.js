import dbConnect, { AdSettings } from './db';

export async function getAdCodes() {
  try {
    await dbConnect();
    let settings = await AdSettings.findOne();
    if (!settings) {
      settings = await AdSettings.create({
        topBannerCode: '',
        middleBannerCode: '',
        bottomBannerCode: '',
        videoAdCode: '',
        interstitialAdCode: '',
      });
    }
    return settings;
  } catch (error) {
    console.error('Ad fetch error:', error);
    return {
      topBannerCode: '',
      middleBannerCode: '',
      bottomBannerCode: '',
      videoAdCode: '',
      interstitialAdCode: '',
    };
  }
}

export function incrementPageViews() {
  if (typeof window === 'undefined') return;
  let views = parseInt(localStorage.getItem('newsflux_views') || '0', 10);
  views++;
  localStorage.setItem('newsflux_views', views);
  return views;
}

export function shouldShowInterstitial() {
  if (typeof window === 'undefined') return false;
  const views = parseInt(localStorage.getItem('newsflux_views') || '0', 10);
  const shown = sessionStorage.getItem('interstitial_shown');
  return views >= 5 && !shown;
}

export function markInterstitialShown() {
  sessionStorage.setItem('interstitial_shown', 'true');
}