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
- Compatible with any front-end library such as React or VueJS
- Easy to use, with a very small learning curve and simple concepts
- Based on the Observer Design Pattern, which means you can subscribe to state changes, (not possible in Vuex for instance)


## Concepts

### Subscription

A subscription is a [pure function](https://en.wikipedia.org/wiki/Pure_function) that takes an
object in parameter (the state) and performs any operation with it. Subscriptions are called each
time a change happens on the state.

```typescript

const subscription = (newState) => {
  console.log('State has changed!', newState);
};

```

### Mutators

A mutator is also a pure function that returns a copy of an object (the state) depending on the
desired type of change (mutation). In diox, mutators are in charge of performing synchronous changes
on the internal state.

```typescript

const myMutator = ({ state }, mutation) => {
  if (mutation === 'ADD') {
    return {
      count: state.count + 1,
    };
  }
  // If this is the very first time mutator is called, state has not been defined yet and we must
  // return an initial value.
  if (state === undefined) {
    return {
      count: 0,
    };
  }
  // By default, just return a copy of the current state.
  return Object.assign({}, state);
};

```

### Dispatchers

A dispatcher is a function that performs one or several calls to mutators depending on the desired
type of action. Dispatchers cannot update state directly as it's the mutators' job.

```typescript

const myDispatcher = ({ mutate, hash }, action) => {
  if (action === 'ASYNC_ADD') {
    // `hash` tells diox which mutator should be called with the given mutation (see Modules).
    setTimeout(() => mutate(hash, 'ADD'), 500);
  }
};

```

### Modules

A module contains a part of your app's global state, managing a specific concern (e.g. list of users,
list of blog articles, app status, ...). By creating several modules, and combining them, you can
build complex, evolutive, infinitely scalable apps without worrying about performance. Each module
is composed of a Mutator and optionally a Dispatcher.

```typescript

const myModule = {
  mutator: myMutator,
  dispatcher: myDispatcher,
};

```

### Store

The Store is the entity that ties everything together. Modules are registered into the Store,
using a unique identifier (so-called "hash"). You can subscribe to changes on registered modules,
combine modules, or apply middlewares to achieve more complex goals.

```typescript

// Instanciating store...
const store = new Store();

// Adding a global middleware triggered at each state change on any module...
store.use((newState) => {
  console.log('New state !', newState);
});

// Registering modules...
store.register('a', moduleA);
store.register('b', moduleB);

// Creating a combiner which mixes `a` and `b` modules...
store.combine('c', {
  'a': newState => ({ a: newState.increment }),
  'b': newState => ({ b: newState }),
});

// Subscribing to the combination of `a`  and `b` modules...
store.subscribe('c', (newState) => {
  console.log('New mixed state!', newState.a, newState.b);
});


```

### Combiners

You can mix the result of several module's changes by using a Combiner. It is a pure function that
listens to changes on one or several modules, and returns a mix of their states for easier processing.
For instance, imagine you have a module containing all the articles of a blog, and another one
containing the list of article's authors. Instead of subscibing to both modules, you can create a
combiner that will generate a proper structure with all info (articles + authors) so you just have
to subscribe to this combiner and forget about managing several sources of data.

### Middlewares

Middlewares can be useful in some situations where you want to listen to all states changes on all
modules and trigger similar processing on all of them. For instance, you may want to implement a
"time-travel" tool, keeping a complete history of states changes over time to revert them if necessary.

### Complete example

Example in diox:

```typescript

import { Store } from 'diox';

const moduleA = {
  mutator: ({ state }, mutation) => {
    if (mutation === 'ADD') {
      return {
        increment: state.increment + 1,
      };
    }
    return (state === undefined)
      ? { increment: 0 }
      : Object.assign({}, state);
  },
};

const moduleB = {
  mutator: ({ state }, mutation) => {
    if (mutation === 'SUB') {
      return {
        decrement: state.decrement - 1,
      };
    }
    return (state === undefined)
      ? { decrement: 1000 }
      : Object.assign({}, state);
  },
  dispatcher: ({ mutate, hash }, action) => {
    if (action === 'ASYNC_SUB') {
      setTimeout(() => { mutate(hash, 'SUB'); }, 1000);
    }
  },
};

const store : Store = new Store();

store.use((newState) => {
  console.log('New state !', newState);
});

store.register('a', moduleA);
store.register('b', moduleB);

store.combine('c', {
  'a': newState => ({ a: newState.increment }),
  'b': newState => ({ b: newState }),
});

store.subscribe('a', (newState) => {
  console.log('New state from a !', newState);
});

store.subscribe('c', (newState) => {
  console.log('New state from c !', newState);
});

store.mutate('a', 'ADD');
store.dispatch('b', 'ASYNC_SUB');

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
console.log('New state from a !', store.state.a);
console.log('New state from c !', store.state);
storeA.commit('ADD')
console.log('New state !', store.state.a);
console.log('New state from a !', store.state.a);
console.log('New state from c !', store.state);
store.dispatch('ASYNC_SUB');
setTimeout(() => {
  console.log('New state !', store.state.b);
  console.log('New state from c !', store.state);
}, 2000);

```

The above examples will display in console :

```bash
New state ! { increment: 0 }
New state ! { decrement: 1000 }
New state from a ! { increment: 0 }
New state from c ! { a: 0, b: { decrement: 1000 } }
New state ! { increment: 1 }
New state from a ! { increment: 1 }
New state from c ! { a: 1, b: { decrement: 1000 } }
New state ! { decrement: 999 }
New state from c ! { a: 1, b: { decrement: 999 } }
```


## Extensions

### diox/extensions/router

```typescript
// main.jsx
// --------------------------
import store from './store.jsx';

store.subscribe('router', (context) => console.log(context));

// store.js
// --------------------------
import Store, { Mapper } from 'diox';
import router from 'diox/extensions/router';

const store = new Store();
store.register('router', router(['/home', '/blog']));
export default store;
```


## Integrations with UI frameworks

Several official connectors are available for most common UI frameworks:

### diox/connectors/react

```typescript
// main.jsx
// --------------------------
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Counter from './Counter.jsx';

ReactDOM.render(<Counter />, document.body);


// store.js
// --------------------------
import { Store } from 'diox';

const store = new Store();
store.register('my-module', {
  mutator: ({ state }, mutation) => {
    switch (mutation) {
      case 'INCREMENT':
        return {
          count: state.count + 1,
        };
      default:
        return { ...state || { count: 0 } };
    }
  },
});

export default store;


// Counter.jsx
// --------------------------
import * as React from 'react';
import useStore from 'diox/connectors/react';
import store from './store.jsx';

const [useCombiner, mutate, dispatch] = useStore(store);

export default function Button(props) {
  const [count] = useCombiner('my-module', (newState) => newState.count);
  const doSomething = () => {
    mutate('my-module', 'INCREMENT');
  };
  return <button type="button" onClick={doSomething}>{count}</button>;
}
```


### diox/connectors/vuejs

```typescript
// main.js
// --------------------------

import Vue from 'vuejs';
import Counter from './Counter.vue';

const app = new Vue({
  el: '#app',
  components: { Counter },
  template: `
    <div class="app">
      <counter></counter>
    </div>
  `
});


// store.js
// --------------------------
import { Store } from 'diox';

const store = new Store();
store.register('my-module', {
  mutator: ({ state }, mutation) => {
    switch (mutation) {
      case 'INCREMENT':
        return {
          count: state.count + 1,
        };
      default:
        return { ...state || { count: 0 } };
    }
  },
});

export default store;


// Counter.vue
// --------------------------
<template>
  <div @click="doSomething">{{ count }}</div>
</template>

<script>
import Vue from 'vuejs';
import connect from 'diox/connectors/vuejs';
import store from './store.js';

const mapper = {
  'my-module': newState => ({ count: newState.count }),
};

export default connect(store, mapper)(({ dispatch }) => ({
  name: 'Counter',
  methods: {
    doSomething() {
      dispatch('my-module', 'incrementAsync');
    },
  },
}));
</script>
```

In addition, the [basx](https://github.com/openizr/basx) library makes it easy to perform deep copies and deep merges of JavaScript objects to keep your functions pure.


## API documentation

The complete API documentation is available [here](https://matthieujabbour.github.io/diox)


## Contributing

See the [Contribution guide](https://github.com/openizr/diox/blob/master/CONTRIBUTING.md)


## License

[MIT](https://github.com/openizr/diox/blob/master/LICENSE)

Copyright (c) Matthieu Jabbour. All Rights Reserved.