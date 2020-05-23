# diox

Complete state management for both front and back ends.

[![Build Status](https://travis-ci.org/matthieujabbour/diox.svg?branch=master)](https://travis-ci.org/matthieujabbour/diox)
[![Coverage Status](https://coveralls.io/repos/github/matthieujabbour/diox/badge.svg)](https://coveralls.io/github/matthieujabbour/diox)
[![npm version](https://badge.fury.io/js/diox.svg)](https://badge.fury.io/js/diox)
[![Downloads](https://img.shields.io/npm/dm/diox.svg)](https://www.npmjs.com/package/diox)


## Installation

```bash
yarn add diox
```


## Motivations

This framework is deeply inspired by Redux and Vuex, which I used for some time. To me, both of them have drawbacks that make them complex to manage in large-scale applications. I tried to mix their concepts to get the best of two worlds. Compared to them, diox has several advantages :
- 100% standalone (no dependency)
- Extremely light (~300 lines of code, 1.7Kb gzipped)
- Fast and optimized by design
- Scalable out of the box without using any additional NPM module
- Compatible with any front-end library such as React or VueJS
- Easy to use, with a very small learning curve and simple concepts
- You can "observe" state changes (run callbacks each time a change on state is done), which is not possible in Vuex


## Getting started

Example in diox:

```typescript

import { Module, Store } from 'diox';

// Defining a first module with no dispatcher...
const moduleA : Module = {
  mutator: ({ state }, mutation) => {
    switch (mutation) {
      case 'ADD':
        return {
          increment: state.increment + 1,
        };
      default:
        // If no change need to be done, we juste return a copy of the current state.
        // If this is the very first time mutator is called, internal state has not been defined yet
        // and we must return its initial value.
        return Object.assign({}, state || {
          increment: 0,
        });
    }
  },
};

// Defining a second module with user-defined dispatcher...
const moduleB : Module = {
  mutator: ({ state }, mutation) => {
    switch (mutation) {
      case 'SUB':
        return {
          decrement: state.decrement - 1,
        };
      default:
        // If no change need to be done, we juste return a copy of the current state.
        // If this is the very first time mutator is called, internal state has not been defined yet
        // and we must return its initial value.
        return Object.assign({}, state || {
          decrement: 1000,
        }};
    }
  },
  dispatcher: ({ mutate, hash }, action) => {
    switch (action) {
      case 'ASYNC_SUB':
        setTimeout(() => {
          mutate(hash, 'SUB');
        }, 1000);
        break;
      default:
        break;
    }
  },
};

// Instanciating store...
const store : Store = new Store();

// Adding a global middleware...
store.use((newState) => {
  console.log('New state !', newState);
});

// Registering modules...
store.register('/a', moduleA);
store.register('/b', moduleB);

// Creating a combiner which mixes `/a` and `/b` modules...
store.combine('/c', {
  '/a': newState => ({ a: newState.increment }),
  '/b': newState => ({ b: newState }),
});

// Subscribing to the `/a` default combiner...
store.subscribe('/a', (newState) => {
  console.log('New state from /a !', newState);
});

// Subscribing to the `/c` user-defined combiner...
store.subscribe('/c', (newState) => {
  console.log('New state from /c !', newState);
});

// Performing sync mutations and async actions...
store.mutate('/a', 'ADD');
store.dispatch('/b', 'ASYNC_SUB');

```

The equivalent in Vuex is:

```typescript

import Vuex from 'vuex';

const moduleA = {
  state: {
    increment: 0,
  },
  mutations: {
    ADD (state) {
      state.increment++;
    },
  },
};

const moduleB = {
  state: {
    decrement: 100,
  },
  mutations: {
    SUB (state) {
      state.increment++;
    },
  },
  actions: {
    ASYNC_SUB ({ commit }) {
      setTimeout(() => {
        commit('SUB');
      }, 1000);
    },
  },
};

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  }
});

console.log('New state !', store.state.a);
console.log('New state !', store.state.b);
console.log('New state from /a !', store.state.a);
console.log('New state from /c !', store.state);
storeA.commit('ADD')
console.log('New state !', store.state.a);
console.log('New state from /a !', store.state.a);
console.log('New state from /c !', store.state);
store.dispatch('ASYNC_SUB');
setTimeout(() => {
  console.log('New state !', store.state.b);
  console.log('New state from /c !', store.state);
}, 2000);

```

The above examples will display in console :

```bash
New state ! { increment: 0 }
New state ! { decrement: 1000 }
New state from /a ! { increment: 0 }
New state from /c ! { a: 0, b: { decrement: 1000 } }
New state ! { increment: 1 }
New state from /a ! { increment: 1 }
New state from /c ! { a: 1, b: { decrement: 1000 } }
New state ! { decrement: 999 }
New state from /c ! { a: 1, b: { decrement: 999 } }
```


## Concepts

### Modules

Modules represent the very basis of diox. Each module contains a small part of your app's global state, dealing with a specific concern (e.g. list of users, list of blog articles, app statuses, ...). By registering several modules to the Store, or combining them, you can build large-scale, complex and evolutive apps, where your global state is scalable by design. Each module is composed of a Mutator and a Dispatcher (see below).

### Mutators

Mutators are pure functions that allow user to perform synchronous changes (mutations) on module's internal state, depending on given parameters. It must always return a new copy of module's internal state with desired changes.

### Dispatchers

Dispatchers are also pure functions that allow user to perform asynchronous operations on module's internal state, depending on given parameters. Dispatchers cannot change state on their own, they must use modules mutators instead. Dispatcher can call their own module's mutator, but also any other defined module's mutator, just by specifying its hash.

### Subscriptions

Subscriptions are function called each time a change has been performed on a module's internal state. You can then choose to do anything with that new state (display it, perform further operations, ...). Any number of subscriptions can be defined on the same module.

### Combiners

You can mix the result of several module's changes by using a Combiner. It is a pure function that listens to changes on one or several modules' states, and returns a mix of those states for easier processing. For instance, imagine you have a module containing all the articles of a blog, and another one containing the list of article's authors. Instead of subscibing to both modules, you can create a combiner that will generate a proper structure with all info (articles + authors) so you just have to subscribe to this combiner and forget about handling several sources of data.

### Middlewares

Middlewares can be useful in some situations where you want to listen to all states changes on all modules and trigger similar processing on all of them. For instance, you may want to implement a "time-travel" tool, keeping a complete history of states changes over time to revert them if needed.

### Store

Store is the entity that ties everything together. Modules are registered to the Store, using a unique identifier (so-called "hash"). Once modules have been registered to the store, you can declare subscriptions to them, combine them, apply middlewares, ...


## Integrations with UI frameworks

Several official connectors are available for most common UI frameworks:

- React: [diox-react](https://github.com/matthieujabbour/diox-react)
- VueJS: [diox-vue](https://github.com/matthieujabbour/diox-vue)

In addition, the [diox-cloner](https://github.com/matthieujabbour/diox-cloner) package makes it easy to perform deep copies and deep merges of JavaScript objects to keep your functions pure.


## API documentation

You can find the full API documentation [here](https://matthieujabbour.github.io/diox)


## Contributing

See the [Contribution guide](https://github.com/matthieujabbour/diox/blob/master/CONTRIBUTING.md)


## License

[MIT](https://github.com/matthieujabbour/diox/blob/master/LICENSE)

Copyright (c) Matthieu Jabbour.
