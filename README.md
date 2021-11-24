# Bloomberg SSO js utilities
[![NPM Version](https://img.shields.io/npm/v/bsso.svg)][package-url]
[![Build Status](https://app.travis-ci.com/jcgertig/bsso.svg?branch=master)](https://app.travis-ci.com/github/jcgertig/bsso)
[![Code Climate](https://codeclimate.com/github/jcgertig/bsso/badges/gpa.svg)](https://codeclimate.com/github/jcgertig/bsso)
[![Test Coverage](https://codeclimate.com/github/jcgertig/bsso/badges/coverage.svg)](https://codeclimate.com/github/jcgertig/bsso/coverage)

## Install

```
yarn add bsso
```

## ! Usage with react native !
First setup [react-native-get-random-values](https://github.com/LinusU/react-native-get-random-values) and [react-native-webview-crypto](https://github.com/webview-crypto/react-native-webview-crypto) and [react-native-url-polyfill](https://github.com/charpeni/react-native-url-polyfill).


## Simple Usage
```js
import { BSSO } from 'bsso';

const bsso = new BSSO({
  clientId: 'se-mobile-app',
  redirectUri: 'http://localhost:8080/'
});

const tokenFromRedirectUrl = new URLSearchParams(window.location.hash).get('#token');
	
if (tokenFromRedirectUrl) {
  // if we have #token, we are ready for redirect
  console.log('redirect');
  window.location.replace(await bsso.getRedirectURL(tokenFromRedirectUrl));
} else {
  const code = new URLSearchParams(window.location.search).get("code");

  if (code) {
    // if we have the code, we are ready to continue getting token for authorization
    const activeToken = await bsso.getToken(code);
    console.log('activeToken', activeToken);
  }
}
```

-------------------------------

## BSSO API


| Method         | Arguments                     | Return  |
|----------------|-------------------------------|---------|
| getToken       | code?: string                 | string  |
| isExpired      |                               | boolean |
| getRedirectURL | token: string, scope?: string | string  |
| toJSON         |                               | object  |


[package-url]: https://npmjs.com/package/bsso
