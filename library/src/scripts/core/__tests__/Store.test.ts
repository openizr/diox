/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Store from 'scripts/core/Store';

Date.now = jest.fn(() => 1543757462922);

describe('core/Store', () => {
  let store: Store;
  const moduleA: Module<{ test: number; }> = {
    state: {
      test: 0,
    },
    mutations: {
      ADD({ state }) {
        return {
          test: state.test + 1,
        };
      },
      BAD({ state }) {
        return Object.assign(state, { test: 10 });
      },
    },
  };
  const moduleB: Module<{ test: number; }> = {
    state: {
      test: 5,
    },
    mutations: {
      ADD: ({ state }) => ({ test: state.test + 1 }),
    },
    actions: {
      ADD({ mutate, hash }) {
        mutate(hash, 'ADD');
      },
    },
  };

  beforeEach(() => {
    store = new Store();
  });

  describe('constructor', () => {
    test('always correctly instanciates', () => {
      expect(store).toMatchSnapshot();
    });
  });

  describe('register', () => {
    test('throws an error if hash is already used by another module', () => {
      store.register('module', moduleA);
      expect(() => {
        store.register('module', moduleB);
      }).toThrow(
        'Could not register module with hash "module": '
        + 'another module with the same hash already exists.',
      );
    });
    test('correctly registers module if hash is not already used, state is an object', () => {
      store.register('module', moduleA);
      expect(store).toMatchSnapshot();
    });
    test('correctly registers module if hash is not already used, state is an array', () => {
      store.register<string[]>('module', { state: [], mutations: {} });
      expect(store).toMatchSnapshot();
    });
    test('correctly registers module if hash is not already used, state is a primitive', () => {
      store.register<string>('module', { state: 'test', mutations: {} });
      expect(store).toMatchSnapshot();
    });
  });

  describe('unregister', () => {
    test('throws an error if hash does not exist', () => {
      expect(() => {
        store.unregister('module');
      }).toThrow(
        'Could not unregister module with hash "module": '
        + 'module does not exist.',
      );
    });
    test('throws an error if module has still related user-defined combiners', () => {
      store.register('module', moduleA);
      store.combine('combiner', ['module'], jest.fn());
      expect(() => {
        store.unregister('module');
      }).toThrow(
        'Could not unregister module with hash "module": '
        + 'all the related user-defined combiners must be uncombined first.',
      );
    });
    test('correctly unregisters if module does not have related user-defined combiners', () => {
      store.register('module', moduleA);
      store.unregister('module');
      expect(store).toMatchSnapshot();
    });
  });

  describe('combine', () => {
    test('throws an error if hash is already used by another combiner', () => {
      store.register('module', moduleA);
      expect(() => {
        store.combine('module', ['module'], jest.fn());
      }).toThrow(
        'Could not create combiner with hash "module": '
        + 'another combiner with the same hash already exists.',
      );
    });
    test('throws an error if one of the modules\' hashes does not correspond to a registered module', () => {
      expect(() => {
        store.combine('combiner', ['module'], jest.fn());
      }).toThrow(
        'Could not create combiner with hash "combiner": '
        + 'module with hash "module" does not exist.',
      );
    });
    test('correctly creates combiner if all modules\' hashes exist', () => {
      store.register('moduleA', moduleA);
      store.register('moduleB', moduleB);
      store.combine('combiner', ['moduleA', 'moduleB'], jest.fn());
      expect(store).toMatchSnapshot();
    });
  });

  describe('uncombine', () => {
    test('throws an error if hash does not exist', () => {
      expect(() => {
        store.uncombine('combiner');
      }).toThrow(
        'Could not uncombine combiner with hash "combiner": '
        + 'combiner does not exist.',
      );
    });
    test('throws an error if the given hash corresponds to a default combiner', () => {
      store.register('module', moduleA);
      expect(() => {
        store.uncombine('module');
      }).toThrow(
        'Could not uncombine combiner with hash "module": '
        + 'default combiners cannot be uncombined, use `unregister` instead.',
      );
    });
    test('throws an error if the given hash corresponds to a default combiner', () => {
      store.register('module', moduleA);
      store.combine('combiner', ['module'], jest.fn());
      store.subscribe('combiner', jest.fn());
      expect(() => {
        store.uncombine('combiner');
      }).toThrow(
        'Could not uncombine combiner with hash "combiner": '
        + 'all the related subscriptions must be unsubscribed first.',
      );
    });
    test('correctly uncombines the user-defined combiner if it has no more subscriptions', () => {
      store.register('module', moduleA);
      store.combine('combiner', ['module'], jest.fn());
      store.unsubscribe('combiner', store.subscribe('combiner', jest.fn()));
      store.uncombine('combiner');
      expect(store).toMatchSnapshot();
    });
  });

  describe('subscribe', () => {
    test('throws an error if hash does not exist', () => {
      expect(() => {
        store.subscribe('module', () => null);
      }).toThrow(
        'Could not subscribe to combiner with hash "module": '
        + 'combiner does not exist.',
      );
    });
    test('correctly subscribes to the given combiner if it exists', (done) => {
      const handler = jest.fn().mockImplementationOnce(() => {
        expect(store).toMatchSnapshot();
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({
          a: 0,
          b: {
            test: 5,
          },
        });
        done();
      });
      store.register('moduleA', moduleA);
      store.register('moduleB', moduleB);
      store.combine('combiner', ['moduleA', 'moduleB'], (newStateA, newStateB) => ({
        a: newStateA.test,
        b: newStateB,
      }));
      expect(store.subscribe('combiner', handler)).toBe('641676f1d7d8a');
    });
  });

  describe('unsubscribe', () => {
    test('throws an error if hash does not exist', () => {
      expect(() => {
        store.unsubscribe('module', 'abcde13256');
      }).toThrow(
        'Could not unsubscribe from combiner with hash "module": '
        + 'combiner does not exist.',
      );
    });
    test('throws an error if subscription id does not exist', () => {
      expect(() => {
        store.register('module', moduleA);
        store.unsubscribe('module', 'abcde13256');
      }).toThrow(
        'Could not unsubscribe from combiner with hash "module": '
        + 'subscription id "abcde13256" does not exist.',
      );
    });
    test('correctly unsubscribes from the given combiner if it exists', () => {
      store.register('module', moduleA);
      store.unsubscribe('module', (store.subscribe('module', jest.fn())));
      expect(store).toMatchSnapshot();
    });
    // Issue #1 (https://github.com/openizr/diox/issues/1).
    test('correctly unsubscribes several listeners from the given combiner in any order', () => {
      store.register('module', moduleA);
      const firstID: string = store.subscribe('module', jest.fn());
      const secondID: string = store.subscribe('module', jest.fn());
      store.unsubscribe('module', firstID);
      store.unsubscribe('module', secondID);
      expect(store).toMatchSnapshot();
    });
  });

  describe('mutate', () => {
    test('throws an error if hash does not exist', () => {
      expect(() => {
        store.mutate('module', 'ADD');
      }).toThrow(
        'Could not perform mutation on module with hash "module": '
        + 'module does not exist.',
      );
    });
    test('throws an error if mutation does not exist in module', () => {
      expect(() => {
        store.register('module', moduleA);
        store.mutate('module', 'SUB');
      }).toThrow(
        'Could not perform mutation on module with hash "module": '
        + 'mutation "SUB" does not exist.',
      );
    });
    test('throws an error if module\'s mutation is not a pure function', () => {
      expect(() => {
        store.register('module', moduleA);
        store.mutate('module', 'BAD');
      }).toThrow(
        'Could not perform mutation on module with hash "module": '
        + 'new state must be a deep copy of module\'s state.',
      );
    });
    test('correctly performs mutation on the given module if it exists', (done) => {
      const handler = jest.fn().mockImplementationOnce(() => {
        expect(handler).toHaveBeenCalledWith({ test: 0 });
      }).mockImplementationOnce(() => {
        expect(handler).toHaveBeenCalledTimes(2);
        expect(handler).toHaveBeenCalledWith({ test: 0 });
        done();
      });
      store.register('module', moduleA);
      store.subscribe('module', handler);
      store.mutate('module', 'ADD');
    });
    test('asynchronously calls each subscription in the order of their declaration', (done) => {
      const handler = jest.fn((newState) => {
        if (newState.test === 2) {
          expect(handler).toHaveBeenNthCalledWith(1, { test: 0 });
          expect(handler).toHaveBeenNthCalledWith(2, { test: 1 });
          expect(handler).toHaveBeenNthCalledWith(3, { test: 2 });
          done();
        }
      });
      store.register('module', moduleA);
      store.subscribe('module', (newState: { test: number; }) => {
        if (newState.test === 1) {
          store.mutate('module', 'ADD');
        }
      });
      store.subscribe('module', handler);
      store.mutate('module', 'ADD');
    });
  });

  describe('dispatch', () => {
    test('throws an error if hash does not exist', () => {
      expect(() => {
        store.dispatch('module', 'ADD');
      }).toThrow(
        'Could not dispatch action to module with hash "module": '
        + 'module does not exist.',
      );
    });
    test('throws an error if action does not exist in module', () => {
      expect(() => {
        store.register('module', moduleA);
        store.dispatch('module', 'ADD');
      }).toThrow(
        'Could not dispatch action to module with hash "module": '
        + 'action "ADD" does not exist.',
      );
    });
    test('correctly dispatches action on the given module if it exists', (done) => {
      const handler = jest.fn((newState) => {
        if (newState.test === 6) {
          expect(handler).toHaveBeenCalledTimes(2);
          done();
        }
      });
      store.register('module', moduleB);
      store.subscribe('module', handler);
      store.dispatch('module', 'ADD');
    });
  });

  describe('use', () => {
    test('correctly applies middleware to store', () => {
      const middleware = jest.fn();
      store.use(middleware);
      store.register('module', moduleA);
      expect(middleware).toHaveBeenCalledTimes(1);
      expect(middleware).toHaveBeenCalledWith({ test: 0 });
    });
  });
});
