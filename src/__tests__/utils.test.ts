/* eslint-disable @typescript-eslint/no-explicit-any */
import { base64UrlEncode, generateRandomString, sha256 } from '../utils';

beforeAll(() => {
  (global.crypto as unknown as any) = {
    getRandomValues: jest.fn((array: Uint32Array) =>
      new Uint32Array(array.length).fill(1, 0, array.length)
    ),
    subtle: {
      digest: jest.fn(
        (pre: string, array: Uint8Array) =>
          new Uint8Array(array.length).fill(1, 0, array.length).buffer
      ),
    },
  };
});

it('should generateRandomString of length 10', () => {
  expect(generateRandomString(10)).toBe('1111111111');
});

it('should sha256 a string', async () => {
  expect((await sha256('test')).byteLength).toBe(4);
});

it('should base64UrlEncode a string', async () => {
  expect(base64UrlEncode(await sha256('test'))).toBe('AQEBAQ');
});
