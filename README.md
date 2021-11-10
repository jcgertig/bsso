# Bloomberg SSO js utilities
[![NPM Version][npm-v]][package-url]
[![License][license]][package-url]
[![Build Status](https://travis-ci.org/jcgertig/bsso.svg?branch=master)](https://travis-ci.org/jcgertig/bsso)
[![Code Climate](https://codeclimate.com/github/jcgertig/bsso/badges/gpa.svg)](https://codeclimate.com/github/jcgertig/bsso)
[![Test Coverage](https://codeclimate.com/github/jcgertig/bsso/badges/coverage.svg)](https://codeclimate.com/github/jcgertig/bsso/coverage)

## Install

```
yarn add bsso
```

## ! Usage with react native !
First setup [react-native-get-random-values](https://github.com/LinusU/react-native-get-random-values) and [react-native-webview-crypto](https://github.com/webview-crypto/react-native-webview-crypto).


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
  window.location.replace(bsso.getRedirectURL(tokenFromRedirectUrl));
} else {
  const code = new URLSearchParams(window.location.search).get("code");

  if (code) {
    // if we have the code, we are ready to continue getting token for authorization
    const activeToken = await bsso.getActiveToken(code);
    console.log('activeToken', activeToken);
  }
}
```

-------------------------------

## BSSO API


| Method         | Arguments                     | Return  |
|----------------|-------------------------------|---------|
| getActiveToken | code?: string                 | string  |
| isExpired      |                               | boolean |
| getRedirectURL | token: string, scope?: string | string  |
| toJSON         |                               | object  |


[npm-v]: https://img.shields.io/npm/v/bsso.svg
[license]: https://img.shields.io/npm/l/bsso.svg
[package-url]: https://npmjs.com/package/bsso
