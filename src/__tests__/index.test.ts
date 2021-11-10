/* eslint-disable @typescript-eslint/no-explicit-any */
import { BSSO } from '../index';

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

it('should create a class that can be serialized', () => {
  expect(new BSSO({ clientId: 'test', redirectUri: 'url' }).toJSON()).toEqual({
    clientId: 'test',
    redirectUri: 'url',
    accessToken: null,
    codeVerifier: '1111111111111111111111111111111111111111111',
    expirationTimestamp: null,
    refreshToken: null,
  });
});

it('should return a redirect url', async () => {
  expect(
    await new BSSO({ clientId: 'test', redirectUri: 'url' }).getRedirectURL(
      'token'
    )
  ).toEqual(
    'https://bsso.blpprofessional.com/as/authorization.oauth2?adapter=token&client_id=test&code_challenge=AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ&code_challenge_method=S256&redirect_uri=url&response_type=code&scope=sapi%20blpapi-eps&ssotoken=token'
  );
});
