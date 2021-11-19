/* eslint-disable @typescript-eslint/no-explicit-any */
import fetchMock from 'jest-fetch-mock';

import { BSSO } from '../index';

const TEST_ACCESS_TOKEN = 'test-access-token';
const TEST_REFRESH_TOKEN = 'test-refresh-token';
const DEFAULT_EXPIRES_IN = 100;
function mockTokenResponse(
  expiresIn = DEFAULT_EXPIRES_IN,
  accessToken = TEST_ACCESS_TOKEN
) {
  fetchMock.mockOnce(
    JSON.stringify({
      access_token: accessToken,
      refresh_token: TEST_REFRESH_TOKEN,
      expires_in: expiresIn,
    })
  );
}

const appendMock = jest.fn();
class FormDataMock {
  append(...args: any[]) {
    appendMock(...args);
  }
}

const bssoInitArgs = { clientId: 'test', redirectUri: 'url' };
async function fullSetup(expiresIn = DEFAULT_EXPIRES_IN) {
  const bsso = new BSSO(bssoInitArgs);
  mockTokenResponse(expiresIn);
  await bsso.getToken('test');
  return bsso;
}

beforeAll(() => {
  fetchMock.enableMocks();

  (global.FormData as unknown as any) = FormDataMock;

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

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('should return serialized data with toJSON', () => {
  it('without an active token', () => {
    expect(new BSSO(bssoInitArgs).toJSON()).toEqual({
      clientId: 'test',
      redirectUri: 'url',
      accessToken: null,
      codeVerifier: '1111111111111111111111111111111111111111111',
      expirationTimestamp: null,
      refreshToken: null,
    });
  });

  it('with an active token', async () => {
    const now = Date.now();
    Date.now = jest.fn(() => now);
    const bsso = await fullSetup();
    expect(bsso.toJSON()).toEqual({
      clientId: 'test',
      redirectUri: 'url',
      accessToken: TEST_ACCESS_TOKEN,
      codeVerifier: '1111111111111111111111111111111111111111111',
      expirationTimestamp: now / 1000 + DEFAULT_EXPIRES_IN,
      refreshToken: TEST_REFRESH_TOKEN,
    });
  });

  it('with init', () => {
    expect(
      new BSSO({
        ...bssoInitArgs,
        accessToken: TEST_ACCESS_TOKEN,
        refreshToken: TEST_REFRESH_TOKEN,
        expirationTimestamp: DEFAULT_EXPIRES_IN,
        codeVerifier: 'codeVerifier',
      }).toJSON()
    ).toEqual({
      clientId: 'test',
      redirectUri: 'url',
      accessToken: TEST_ACCESS_TOKEN,
      codeVerifier: 'codeVerifier',
      expirationTimestamp: DEFAULT_EXPIRES_IN,
      refreshToken: TEST_REFRESH_TOKEN,
    });
  });
});

it('should return a redirect url', async () => {
  expect(await new BSSO(bssoInitArgs).getRedirectURL('token')).toEqual(
    'https://bsso.blpprofessional.com/as/authorization.oauth2?adapter=token&client_id=test&code_challenge=AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ&code_challenge_method=S256&redirect_uri=url&response_type=code&scope=sapi%20blpapi-eps&ssotoken=token'
  );
});

describe('should handle getToken', () => {
  it('should return a proper token on full setup', async () => {
    const bsso = await fullSetup();
    expect(bsso.accessToken).toEqual(TEST_ACCESS_TOKEN);
  });

  it('should return a proper token twice on full setup', async () => {
    const bsso = await fullSetup();
    expect(await bsso.getToken()).toEqual(TEST_ACCESS_TOKEN);
  });

  it('should error if not fully setup and no code', async () => {
    const bsso = new BSSO(bssoInitArgs);
    await expect(bsso.getToken()).rejects.toThrow(
      'Have to have a redirect code to get token the first time.'
    );
  });

  it('should regenerate the token on second call if expired', async () => {
    const bsso = await fullSetup(0);
    const secondToken = 'second-test-token';
    mockTokenResponse(100, secondToken);
    expect(await bsso.getToken()).toEqual(secondToken);
  });

  it('should error if api has an error', async () => {
    const errorMessage = 'test api error';
    const bsso = new BSSO(bssoInitArgs);
    fetchMock.mockOnce(
      JSON.stringify({
        error: errorMessage,
      })
    );
    await expect(bsso.getToken('code')).rejects.toThrow(errorMessage);
  });

  it('should error if no refresh token', async () => {
    const bsso = new BSSO(bssoInitArgs);
    fetchMock.mockOnce(
      JSON.stringify({
        access_token: TEST_ACCESS_TOKEN,
        expires_in: 0,
      })
    );
    await bsso.getToken('code');
    await expect(bsso.getToken()).rejects.toThrow(
      'Have to have a refresh token to regenerate the access token.'
    );
  });
});

describe('should handle isExpired properly', () => {
  it('when no token exists yet as true', async () => {
    expect(new BSSO(bssoInitArgs).isExpired()).toEqual(true);
  });

  it('when valid token exists as false', async () => {
    const bsso = await fullSetup();
    expect(bsso.isExpired()).toEqual(false);
  });
});
