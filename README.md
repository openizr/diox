# diox

Complete state management for both front and back ends.

[![Build Status](https://travis-ci.org/openizr/diox.svg?branch=master)](https://travis-ci.org/openizr/diox)
[![Coverage Status](https://coveralls.io/repos/github/openizr/diox/badge.svg)](https://coveralls.io/github/openizr/diox)
[![npm](https://img.shields.io/npm/v/diox.svg)](https://www.npmjs.com/package/diox)
[![node](https://img.shields.io/node/v/diox.svg)](https://nodejs.org)
[![Downloads](https://img.shields.io/npm/dm/diox.svg)](https://www.npmjs.com/package/diox)


## Table of Contents

1. [Installation](#Installation)
2. [Motivations](#Motivations)
3. [Documentation](#Documentation)
4. [Contributing](#Contributing)
5. [Sponsor](#Sponsor)
6. [Maintainers](#Maintainers)
7. [License](#License)


## Installation

```bash
yarn add diox
```


## Motivations

This framework is a mix between Redux and Vuex. Both of them have some drawbacks which makes
development of large-scale applications more and more complex over time. diox brings significant
improvements:

- 100% standalone (no dependency)
- Extremely light (~300 lines of code, 1.5Kb gzipped)
- Fast and optimized by design
- Scalable out of the box without using any additional NPM module, thanks to the concept of Modules
- Native compatibility with any front-end library such as React or VueJS
- Easy to use, with a very small learning curve and simple concepts
- Based on the Observer Design Pattern, which means you can subscribe to state changes, (not possible in Vuex for instance)


## Documentation

The complete documentation is available [here](https://matthieu-jabbour.gitbook.io/diox/)


## Contributing

You're free to contribute to this project by submitting [issues](https://github.com/openizr/diox/issues) and/or [pull requests](https://github.com/openizr/diox/pulls). For more information, please read the [Contribution guide](https://github.com/openizr/diox/blob/master/CONTRIBUTING.md).


## Sponsor

Love this project and want to support it? You can [buy me a coffee](https://www.buymeacoffee.com/matthieujabbour) :)

Or just sending me a quick message saying "Thanks" is also very gratifying, and keeps me motivated to maintain open-source projects I work on!


## Maintainers

<table>
  <tbody>
    <tr>
      <td align="center">
        <img width="150" height="150" src="https://avatars.githubusercontent.com/u/29428247?v=4&s=150">
        </br>
        <a href="https://github.com/matthieujabbour">Matthieu Jabbour</a>
      </td>
    </tr>
  <tbody>
</table>


## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) Matthieu Jabbour. All Rights Reserved.
