/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ref } from 'vue';
import Store from 'scripts/core/Store';
import connect from 'scripts/connectors/vue';

jest.mock('vue');
jest.mock('scripts/core/Store');

describe('connectors/vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should correctly initialize a Vue connection to the store', () => {
    const store = new Store();
    const useCombiner = connect(store);
    expect(typeof useCombiner).toBe('function');
  });

  test('should throw an error if given combiner does not exist', () => {
    const store = new Store();
    const useCombiner = connect(store);
    expect(() => {
      useCombiner('invalid');
    }).toThrow(
      'Could not use combiner "invalid": combiner does not exist.',
    );
  });

  test('should correctly subscribe to an existing combiner', () => {
    const store = new Store();
    const useCombiner = connect(store);
    const state = useCombiner('combiner');

    expect(state).toEqual({ value: { count: 5 } });
    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith({ value: 'test' });
    expect(store.subscribe).toHaveBeenCalledTimes(1);
    expect(store.subscribe).toHaveBeenCalledWith('combiner', expect.any(Function));
    expect(store.unsubscribe).toHaveBeenCalledTimes(1);
    expect(store.unsubscribe).toHaveBeenCalledWith('combiner', 1);
  });
});
