# diox

Complete state management for both front and back ends.

[![Build Status](https://travis-ci.org/openizr/diox.svg?branch=master)](https://travis-ci.org/openizr/diox)
[![Coverage Status](https://coveralls.io/repos/github/openizr/diox/badge.svg)](https://coveralls.io/github/openizr/diox)
[![npm version](https://badge.fury.io/js/diox.svg)](https://badge.fury.io/js/diox)
[![Downloads](https://img.shields.io/npm/dm/diox.svg)](https://www.npmjs.com/package/diox)


## Installation

```bash
yarn add diox
```


## Motivations

This framework is a mix between Redux and Vuex. Both of them have some drawbacks which makes
development of large-scale applications more and more complex over time. diox brings significant
improvements:

- 100% standalone (no dependency)
- Extremely light (~300 lines of code, 1.7Kb gzipped)
- Fast and optimized by design
- Scalable out of the box without using any additional NPM module, thanks to the concept of Modules
- Native compatibility with any front-end library such as React or VueJS
- Easy to use, with a very small learning curve and simple concepts
- Based on the Observer Design Pattern, which means you can subscribe to state changes, (not possible in Vuex for instance)


## Documentation

The complete documentation is available [here](https://matthieu-jabbour.gitbook.io/diox/)


## Contributing

See the [Contribution guide](https://github.com/openizr/diox/blob/master/CONTRIBUTING.md)


## License

[MIT](https://github.com/openizr/diox/blob/master/LICENSE)

Copyright (c) Matthieu Jabbour. All Rights Reserved.
