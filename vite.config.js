import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
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
      },
    },
  },
});
