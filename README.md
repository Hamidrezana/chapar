<p align="center">
  <img src="images/full-logo.png" width="600px" height="auto" />
</p>

# Chapar

## About The Project

**Call APIs easier than ever with Chapar**

## Installation

Using npm:

```bash
$ npm install @hamidrezana/chapar
```

Using yarn:

```bash
$ yarn add @hamidrezana/chapar
```

## Usage

Firstly import `Chapar`

```js
import Chapar from '@hamidrezana/chapar';
```

Then create a new instance of Chapar

```js
const chapar = new Chapar({
  baseUrl: 'https://jsonplaceholder.typicode.com',
});
```

Then you can call APIs easily with `sendChapar` method

```js
const response = await chapar.sendChapar('todos/1', { method: 'get' });
```

## Custom adapters

Chapar accepts Axios adapters and preconfigured Axios instances. To use
`react-native-nitro-fetch`, configure Axios's Fetch adapter with Nitro Fetch as its Fetch
implementation:

```ts
import axios from 'axios';
import { fetch as nitroFetch } from 'react-native-nitro-fetch';
import Chapar from '@hamidrezana/chapar';

const api = axios.create({
  adapter: 'fetch',
  env: {
    fetch: nitroFetch,
    Request: null,
    Response: null,
  },
});

const chapar = new Chapar({
  baseUrl: 'https://api.example.com',
  agent: api,
});
```

The same configuration can be passed directly to Chapar:

```ts
const chapar = new Chapar({
  baseUrl: 'https://api.example.com',
  adapter: 'fetch',
  env: {
    fetch: nitroFetch,
    Request: null,
    Response: null,
  },
});
```

Interceptors remain native Axios interceptors regardless of the selected Axios adapter:

```js
chapar.setupInterceptors({
  onRequestFulfilled: request => {
    request.headers['X-Client'] = 'mobile';
  },
  onResponseFulfilled: response => {
    console.log(response.status);
  },
  on401Callback: response => {
    console.log(response.message);
  },
});
```

Setting `Request` and `Response` to `null` disables Axios upload and download progress capture
for the Fetch adapter.

## Roadmap

- [x] Supporting multiple base urls
- [x] Supporting onError callback
- [ ] Complete Documentation
- [ ] Supporting response template
