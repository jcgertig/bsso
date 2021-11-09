import 'text-encoding';

import { Base64 } from 'js-base64';

export function generateRandomString(length: number) {
  const array = new Uint32Array(length);
  global.crypto.getRandomValues(array);
  return Array.from(array, (uint32) =>
    ('0' + uint32.toString(16)).substr(-1)
  ).join('');
}

export function sha256(str: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return global.crypto.subtle.digest('SHA-256', data);
}

export function base64UrlEncode(hashBuf: ArrayBuffer) {
  return Base64.fromUint8Array(new Uint8Array(hashBuf), true);
}
