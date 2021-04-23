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
import connect from 'scripts/connectors/vue';

jest.mock('vue');
jest.mock('scripts/core/Store');

describe('connectors/vuejs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should correctly connect component to diox Store', () => {
    const store = new Store();
    const container = connect(store, {
      'my-module': (newState) => ({ count: newState.count }),
    })(({ mutate }) => ({
      name: 'MyComponent',
      methods: {
        test(): void {
          mutate('my-module', 'INCREMENT');
        },
      },
    }));
    expect(container.name).toBe('MyComponent');

    // Simulating VueJS component's mounting...
    (container as Json).mounted();
    expect(Vue.extend).toHaveBeenCalledTimes(1);
    expect(store.subscribe).toHaveBeenCalledTimes(1);
    expect(store.unsubscribe).toHaveBeenCalledTimes(0);
    expect((container as Json).count).toBe(5);
    expect((container as Json).$subscriptions).toEqual([1]);

    // Simulating VueJS component's destruction...
    (container as Json).beforeDestroy();
    expect(store.unsubscribe).toHaveBeenCalledTimes(1);
    expect((container as Json).$subscriptions).toEqual([]);
  });
});
