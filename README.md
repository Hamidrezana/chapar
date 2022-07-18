# Chapar

## About The Project

**Call APIs easier than ever with**

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

- [ ] Complete Documentation
- [X] Supporting multiple base urls
- [X] Supporting onError callback
- [ ] Supporting response template
