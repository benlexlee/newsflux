import dbConnect, { AdSettings } from './db';

// Session storage keys
const STORAGE_KEYS = {
  VIDEO_WATCHED: 'newsflux_video_watched',
  PAGE_VIEWS: 'newsflux_page_views',
  INTERSTITIAL_SHOWN: 'newsflux_interstitial_shown',
  SESSION_ID: 'newsflux_session_id',
};

// Get current session ID
function getSessionId() {
  if (typeof window === 'undefined') return null;
  let sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
  if (!sessionId) {
    sessionId = Date.now().toString() + Math.random().toString(36);
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }
  return sessionId;
}

// Video ad tracking
export function hasVideoAdBeenWatched() {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEYS.VIDEO_WATCHED) === 'true';
}

export function markVideoAdWatched() {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEYS.VIDEO_WATCHED, 'true');
}

// Page view tracking for interstitial
export function incrementPageViews() {
  if (typeof window === 'undefined') return 0;
  let views = parseInt(localStorage.getItem(STORAGE_KEYS.PAGE_VIEWS) || '0', 10);
  views++;
  localStorage.setItem(STORAGE_KEYS.PAGE_VIEWS, views.toString());
  return views;
}

export function getPageViews() {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(STORAGE_KEYS.PAGE_VIEWS) || '0', 10);
}

export function shouldShowInterstitial() {
  if (typeof window === 'undefined') return false;
  const views = getPageViews();
  const hasBeenShown = sessionStorage.getItem(STORAGE_KEYS.INTERSTITIAL_SHOWN) === 'true';
  return views >= 5 && !hasBeenShown;
}

export function markInterstitialShown() {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEYS.INTERSTITIAL_SHOWN, 'true');
}

// Reset session (on new visit)
export function resetSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEYS.VIDEO_WATCHED);
  sessionStorage.removeItem(STORAGE_KEYS.INTERSTITIAL_SHOWN);
  sessionStorage.removeItem(STORAGE_KEYS.SESSION_ID);
}

// Fetch ad codes from database
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
    console.error('Error fetching ad codes:', error);
    return {
      topBannerCode: '',
      middleBannerCode: '',
      bottomBannerCode: '',
      videoAdCode: '',
      interstitialAdCode: '',
    };
  }
}