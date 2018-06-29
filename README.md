# Diox

The ultimate state management for both front and back ends.


## Installation

```bash
yarn add diox
```


## Motivations

This framework is deeply inspired by Redux and Vuex, which I used for some time. To me, both of them have drawbacks that make them complex to manage in large-scale applications. I tried to mix their concepts to get the best of two worlds. Compared to them, Diox has several advantages :
- Standalone (no dependency)
- Extremely light (~300 lines of code, 5Kb uncompressed)
- Fast and optimized by design
- Scalable out of the box without using any additional NPM module
- Compatible with any front-end library such as React or VueJS
- Easy to use, with a very small learning curve and simple concepts


## Getting started

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
        return state || {
          increment: 0,
        };
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
        return state || {
          decrement: 1000,
        };
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

The above example will display in console :

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


## API documentation

You can find the full documentation [here](https://htmlpreview.github.io/?https://raw.githubusercontent.com/matthieujabbour/diox/master/doc/index.html)


## License

[MIT](https://github.com/matthieujabbour/diox/blob/master/LICENSE)

Copyright (c) 2018 - present, Matthieu Jabbour.
