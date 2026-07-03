import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  resolveSupportEndpoint,
  validateSupportFields,
} from './support-form.js';

test('derives the support endpoint from the waitlist endpoint', () => {
  assert.equal(
    resolveSupportEndpoint({
      waitlistEndpoint: 'https://staging-reembr-backend.vercel.app/api/waitlist',
    }),
    'https://staging-reembr-backend.vercel.app/api/support',
  );
});

test('uses an explicit support endpoint when configured', () => {
  assert.equal(
    resolveSupportEndpoint({
      supportEndpoint: 'https://api.example.com/contact',
      waitlistEndpoint: 'https://api.example.com/api/waitlist',
    }),
    'https://api.example.com/contact',
  );
});

test('asks for a message before asking for a support topic', () => {
  assert.deepEqual(
    validateSupportFields({ topic: '', message: 'hi' }),
    {
      ok: false,
      field: 'message',
      message: 'Add a little more detail so we can help.',
    },
  );
});

test('accepts a valid topic and message', () => {
  assert.deepEqual(
    validateSupportFields({
      topic: 'technical_issue',
      message: 'The reminder did not appear when I left home.',
    }),
    { ok: true },
  );
});
