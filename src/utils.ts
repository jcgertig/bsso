import { Base64 } from 'js-base64';
import { sha256 as sha } from 'js-sha256';

function slice(uint32: number) {
  return ('0' + uint32.toString(16)).slice(-1);
}

export function generateRandomString(length: number) {
  const array = global.crypto.getRandomValues(new Uint32Array(length));
  return Array.from(array, slice).join('');
}

export function sha256(str: string) {
  return sha.create().update(str).arrayBuffer();
}

export function base64UrlEncode(hashBuf: ArrayBuffer) {
  return Base64.fromUint8Array(new Uint8Array(hashBuf), true);
}
