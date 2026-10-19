// Minimal Google service-account auth: signs a JWT with the key file's private
// key and exchanges it for an access token. No SDK needed for read-only calls.

import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const b64url = (value) => Buffer.from(value).toString('base64url');

export async function getAccessToken(keyFile, scope) {
  const key = JSON.parse(await readFile(keyFile, 'utf8'));
  if (key.type !== 'service_account') throw new Error(`${keyFile} is not a service account key`);

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({ iss: key.client_email, scope, aud: key.token_uri, iat: now, exp: now + 3600 }),
  );
  const signature = createSign('RSA-SHA256').update(`${header}.${claims}`).sign(key.private_key, 'base64url');

  const response = await fetch(key.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Google auth failed: ${body.error_description ?? body.error}`);
  return { token: body.access_token, email: key.client_email };
}

export async function googleApi(token, url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`${url}: ${response.status} ${body.error?.message ?? JSON.stringify(body)}`);
  return body;
}
