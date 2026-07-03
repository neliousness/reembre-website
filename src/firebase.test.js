import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  firebaseConfig,
  initializeFirebase,
} from './firebase.js';

test('exposes the reembr Firebase project config', () => {
  assert.equal(firebaseConfig.projectId, 'reembr-website');
  assert.equal(firebaseConfig.appId, '1:887733734394:web:d396414caa3b9b1dfff243');
  assert.equal(firebaseConfig.measurementId, 'G-RH7D2PS1RV');
});

test('initializes Firebase app and analytics once', async () => {
  const calls = [];
  const app = { name: 'firebase-app' };
  const analytics = { name: 'firebase-analytics' };

  const first = initializeFirebase({
    initializeAppFn: (config) => {
      calls.push(['initializeApp', config.projectId]);
      return app;
    },
    isAnalyticsSupportedFn: async () => {
      calls.push(['isSupported']);
      return true;
    },
    getAnalyticsFn: (appInstance) => {
      calls.push(['getAnalytics', appInstance.name]);
      return analytics;
    },
  });

  const second = initializeFirebase();

  assert.equal(first.app, app);
  assert.equal(second.app, app);
  assert.equal(await first.analytics, analytics);
  assert.equal(await second.analytics, analytics);
  assert.deepEqual(calls, [
    ['initializeApp', 'reembr-website'],
    ['isSupported'],
    ['getAnalytics', 'firebase-app'],
  ]);
});
