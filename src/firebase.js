import { initializeApp as firebaseInitializeApp } from 'firebase/app';
import {
  getAnalytics as firebaseGetAnalytics,
  isSupported as firebaseIsAnalyticsSupported,
  logEvent as firebaseLogEvent,
} from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: 'AIzaSyClWBBLlnJqoo7aFY5cdpp5I3zzcza9b9s',
  authDomain: 'reembr-website.firebaseapp.com',
  projectId: 'reembr-website',
  storageBucket: 'reembr-website.firebasestorage.app',
  messagingSenderId: '887733734394',
  appId: '1:887733734394:web:d396414caa3b9b1dfff243',
  measurementId: 'G-RH7D2PS1RV',
};

let appInstance = null;
let analyticsPromise = null;

export function initializeFirebase({
  initializeAppFn = firebaseInitializeApp,
  isAnalyticsSupportedFn = firebaseIsAnalyticsSupported,
  getAnalyticsFn = firebaseGetAnalytics,
} = {}) {
  if (!appInstance) {
    appInstance = initializeAppFn(firebaseConfig);
  }

  if (!analyticsPromise) {
    analyticsPromise = Promise.resolve()
      .then(() => isAnalyticsSupportedFn())
      .then((isSupported) => (isSupported ? getAnalyticsFn(appInstance) : null))
      .catch((error) => {
        console.warn('[reembr] Firebase Analytics unavailable.', error);
        return null;
      });
  }

  return {
    app: appInstance,
    analytics: analyticsPromise,
  };
}

export async function trackFirebaseEvent(name, parameters = {}, {
  logEventFn = firebaseLogEvent,
} = {}) {
  const { analytics } = initializeFirebase();
  const analyticsInstance = await analytics;

  if (!analyticsInstance) return;
  logEventFn(analyticsInstance, name, parameters);
}
