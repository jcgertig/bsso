import queryString from 'query-string';

import { base64UrlEncode, generateRandomString, sha256 } from './utils';

export type BSSOInitArguments = {
  clientId: string;
  redirectUri: string;
  codeVerifier?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  expirationTimestamp?: number | null;
};

export class BSSO {
  private _clientId = '';
  private _redirectUri = '';
  private _codeVerifier = '';
  private _accessToken: string | null = null;
  private _refreshToken: string | null = null;
  private _expirationTimestamp: number | null = null;

  public get clientId() {
    return this._clientId;
  }

  public get redirectUri() {
    return this._redirectUri;
  }

  public get codeVerifier() {
    return this._codeVerifier;
  }

  public get accessToken() {
    return this._accessToken;
  }

  public get refreshToken() {
    return this._refreshToken;
  }

  public get expirationTimestamp() {
    return this._expirationTimestamp;
  }

  constructor({
    clientId,
    redirectUri,
    codeVerifier = null,
    accessToken = null,
    refreshToken = null,
    expirationTimestamp = null,
  }: BSSOInitArguments) {
    this._clientId = clientId;
    this._redirectUri = encodeURI(redirectUri);
    // the verifier is very important, we will need to hold on to it
    // after the redirect to verify our identity as per the PKCE workflow
    this._codeVerifier = codeVerifier ?? generateRandomString(43);

    // if possible rehydrate
    this._accessToken = accessToken;
    this._refreshToken = refreshToken;
    this._expirationTimestamp = expirationTimestamp;
  }

  private async createTokenFromRedirectCode(code: string) {
    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('code', code);
    body.append('code_verifier', this.codeVerifier);
    body.append('client_id', this.clientId);
    body.append('redirect_uri', this.redirectUri);

    const rawResponse = await fetch(
      'https://bsso.blpprofessional.com/as/token.oauth2',
      {
        method: 'POST',
        mode: 'cors',
        body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return this.handleTokenResponse(rawResponse);
  }

  private async regenerateToken() {
    if (!this.refreshToken) {
      throw new Error(
        'Have to have a refresh token to regenerate the access token.'
      );
    }

    const body = new URLSearchParams();
    body.append('grant_type', 'refresh_token');
    body.append('refresh_token', this.refreshToken);
    body.append('client_id', this.clientId);

    // because we are getting new tokens, clear the currently
    // existing ones from memory
    this._accessToken = null;
    this._refreshToken = null;

    const response = await fetch(
      'https://bsso.blpprofessional.com/as/token.oauth2',
      {
        method: 'POST',
        mode: 'cors',
        body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return this.handleTokenResponse(response);
  }

  private async handleTokenResponse(fetchResponse: Response) {
    const regenerated = await fetchResponse.json();

    if (regenerated.error) {
      throw new Error(regenerated.error);
    }

    this._accessToken = regenerated.access_token;
    this._refreshToken = regenerated.refresh_token;
    this._expirationTimestamp = Date.now() / 1000 + regenerated.expires_in;

    return this.accessToken;
  }

  public async getToken(code?: string) {
    if (!this.accessToken && !this.refreshToken && !code) {
      throw new Error(
        'Have to have a redirect code to get token the first time.'
      );
    }

    if (this.accessToken && !this.isExpired()) {
      return Promise.resolve(this.accessToken);
    }

    if (!this.accessToken && !this.refreshToken && code) {
      return this.createTokenFromRedirectCode(code);
    }

    return this.regenerateToken();
  }

  public isExpired() {
    if (!this.expirationTimestamp) return true;
    const current = new Date().getTime() / 1000;
    return current > this.expirationTimestamp;
  }

  public async getRedirectURL(token: string, scope = 'sapi blpapi-eps') {
    // hash the verifier via SHA-256, the algorithm we specify below as our code_challenge_method
    const challengeHash = base64UrlEncode(await sha256(this.codeVerifier));

    return queryString.stringifyUrl({
      url: 'https://bsso.blpprofessional.com/as/authorization.oauth2',
      query: {
        client_id: this.clientId,
        code_challenge: challengeHash,
        code_challenge_method: 'S256',
        response_type: 'code',
        redirect_uri: this.redirectUri,
        scope,
        adapter: 'token',
        ssotoken: token,
      },
    });
  }

  public toJSON() {
    return {
      clientId: this.clientId,
      redirectUri: decodeURI(this.redirectUri),
      codeVerifier: this.codeVerifier,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expirationTimestamp: this.expirationTimestamp,
    };
  }
}
