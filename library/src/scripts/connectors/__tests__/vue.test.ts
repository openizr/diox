/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Vue from 'vue';
import Store from 'scripts/core/Store';
import { Json } from 'scripts/core/types';
import useStore from 'scripts/connectors/vue';

jest.mock('vue');
jest.mock('scripts/core/Store');

describe('connectors/vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should correctly initialize a VueJS connection to the store', () => {
    const store = new Store();
    const [useCombiner, mutate, dispatch] = useStore(store);
    expect(typeof useCombiner).toBe('function');
    expect(typeof mutate).toBe('function');
    expect(typeof dispatch).toBe('function');
  });

  test('should throw an error if given combiner does not exist', () => {
    const store = new Store();
    const [useCombiner] = useStore(store);
    expect(() => {
      useCombiner('invalid', {
        name: 'MyComponent',
      });
    }).toThrow(
      'Could not use combiner "invalid": combiner does not exist.',
    );
  });

  test('should correctly subscribe to an existing combiner', () => {
    const store = new Store();
    const [useCombiner, mutate, dispatch] = useStore(store);
    const container = useCombiner('combiner', {
      name: 'MyComponent',
      methods: {
        test(): void {
          mutate('module', 'INCREMENT');
        },
        asyncTest(): void {
          dispatch('module', 'ASYNC_INCREMENT');
        },
      },
    });
    expect(container.name).toBe('MyComponent');

    // Simulating VueJS component's mounting...
    (container as Json).mounted();
    expect(Vue.extend).toHaveBeenCalledTimes(1);
    expect(store.subscribe).toHaveBeenCalledTimes(1);
    expect(store.unsubscribe).toHaveBeenCalledTimes(0);
    expect((container as Json).count).toBe(5);
    expect((container as Json).$subscription).toEqual(1);

    // Simulating VueJS component's destruction...
    (container as Json).beforeDestroy();
    expect(store.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
