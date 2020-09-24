/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Vue from 'vue';
import { mixed } from 'scripts/types';
import Store from 'scripts/core/Store';
import connect from 'scripts/connectors/vuejs';

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
    (container as mixed).mounted();
    expect(Vue.extend).toHaveBeenCalledTimes(1);
    expect(store.subscribe).toHaveBeenCalledTimes(1);
    expect(store.unsubscribe).toHaveBeenCalledTimes(0);
    expect((container as mixed).count).toBe(5);
    expect((container as mixed).$subscriptions).toEqual([1]);

    // Simulating VueJS component's destruction...
    (container as mixed).beforeDestroy();
    expect(store.unsubscribe).toHaveBeenCalledTimes(1);
    expect((container as mixed).$subscriptions).toEqual([]);
  });
});
