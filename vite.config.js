import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        checklist: resolve(__dirname, 'checklist.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        support: resolve(__dirname, 'support.html'),
        accountDeletion: resolve(__dirname, 'account-deletion.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        blogForgettingThings: resolve(
          __dirname,
          'blog/how-to-stop-forgetting-things-when-you-leave-the-house.html',
        ),
        blogGeofenceExplainer: resolve(
          __dirname,
          'blog/what-is-a-geofence-reminder.html',
        ),
        blogWaysToRemember: resolve(
          __dirname,
          'blog/ways-to-remember-keys-wallet-charger-before-you-leave.html',
        ),
        blogArrivalChecklist: resolve(
          __dirname,
          'blog/remind-me-when-i-get-home.html',
        ),
        blogBestApps: resolve(
          __dirname,
          'blog/best-apps-for-remembering-things-before-you-leave-the-house.html',
        ),
        blogPrivacyExplainer: resolve(
          __dirname,
          'blog/does-a-geofence-app-track-your-location.html',
        ),
        blogNativeHowto: resolve(
          __dirname,
          'blog/how-to-set-a-location-reminder-iphone-android.html',
        ),
        blogWhyForget: resolve(
          __dirname,
          'blog/why-do-you-forget-things-when-you-leave-the-house.html',
        ),
      },
    },
  },
});
