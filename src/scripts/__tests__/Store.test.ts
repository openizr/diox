/**
 * Copyright (c) Matthieu Jabbour.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Module, Store } from 'scripts/Store';

Date.now = jest.fn(() => 1543757462922);

describe('Store', () => {
  let store: Store;
  const moduleA: Module = {
    mutator: ({ state }, mutation) => {
      switch (mutation) {
        case 'ADD':
          return {
            test: state.test + 1,
          };
        default:
          return state || {
            test: 0,
          };
      }
    },
  };
  const moduleB: Module = {
    mutator: ({ state }, mutation) => {
      switch (mutation) {
        case 'ADD':
          return {
            test: state.test + 1,
          };
        default:
          return state || {
            test: 5,
          };
      }
    },
    dispatcher: ({ hash, mutate }, action) => {
      switch (action) {
        case 'ADD':
          mutate(hash, action);
          break;
        default:
          break;
      }
    },
  };
  const moduleC: Module = {
    mutator: ({ state }) => state || 0,
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
    test('correctly registers module if hash is not already used', () => {
      store.register('module', moduleA);
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
      store.combine('combiner', {
        module: jest.fn(),
      });
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
        store.combine('module', { module: jest.fn() });
      }).toThrow(
        'Could not create combiner with hash "module": '
        + 'another combiner with the same hash already exists.',
      );
    });
    test('throws an error if one of the mapped hash does not correspond to a registered module', () => {
      expect(() => {
        store.combine('combiner', { module: jest.fn() });
      }).toThrow(
        'Could not create combiner with hash "combiner": '
        + 'mapped module with hash "module" does not exist.',
      );
    });
    test('correctly creates combiner if all mapped hashes exist', () => {
      store.register('moduleA', moduleA);
      store.register('moduleB', moduleB);
      store.combine('combiner', {
        moduleA: jest.fn(),
        moduleB: jest.fn(),
      });
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
        + 'default combiners cannot be uncombined.',
      );
    });
    test('throws an error if the given hash corresponds to a default combiner', () => {
      store.register('module', moduleA);
      store.combine('combiner', { module: jest.fn() });
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
      store.combine('combiner', { module: (newState) => newState });
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
      const handler: jest.Mock = jest.fn().mockImplementationOnce(() => {
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
      store.combine('combiner', {
        moduleA: (newState) => ({ a: newState.test }),
        moduleB: (newState) => ({ b: newState }),
      });
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
    // Issue #1 (https://github.com/matthieujabbour/diox/issues/1).
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
    test('throws an error if module\'s mutator does not return an object', () => {
      expect(() => {
        store.register('module', moduleC);
      }).toThrow(
        'Could not perform mutation on module with hash "module": '
        + 'new state must be an object.',
      );
    });
    test('correctly performs mutation on the given module if it exists', (done) => {
      const handler: jest.Mock = jest.fn().mockImplementationOnce(() => {
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
    test('correctly dispatches default action on the given module if it exists', () => {
      const handler: jest.Mock = jest.fn();
      store.register('module', moduleA);
      store.subscribe('module', handler);
      store.dispatch('module', 'ADD');
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('use', () => {
    test('correctly applies middleware to store', () => {
      const middleware: jest.Mock = jest.fn();
      store.use(middleware);
      store.register('module', moduleA);
      expect(middleware).toHaveBeenCalledTimes(1);
      expect(middleware).toHaveBeenCalledWith({ test: 0 });
    });
  });
});
