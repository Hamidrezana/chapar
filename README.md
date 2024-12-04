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

Then create new instant of Chapar

```js
const chapar = new Chapar('https://jsonplaceholder.typicode.com');
```

Then you can call APIs easily with `sendChapar` method

```js
const response = await chapar.sendChapar('todos/1', { method: 'get' });
```

## Roadmap

- [x] Supporting multiple base urls
- [x] Supporting onError callback
- [ ] Complete Documentation
- [ ] Supporting response template
