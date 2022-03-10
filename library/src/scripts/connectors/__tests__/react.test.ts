/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Store from 'scripts/core/Store';
import connect from 'scripts/connectors/react';

jest.mock('react');
jest.mock('scripts/core/Store');

describe('connectors/react', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should correctly initialize a React connection to the store', () => {
    const store = new Store();
    const useCombiner = connect(store);
    expect(typeof useCombiner).toBe('function');
  });

  test('should throw an error if given combiner does not exist', () => {
    const store = new Store();
    const useCombiner = connect(store);
    expect(() => {
      useCombiner('invalid', (newState) => newState);
    }).toThrow(
      'Could not use combiner "invalid": combiner does not exist.',
    );
  });

  test('should correctly subscribe to an existing combiner', () => {
    const store = new Store();
    const useCombiner = connect(store);
    const reducer = jest.fn((value) => value.value);
    const state = useCombiner('combiner', reducer);
    expect(reducer).toHaveBeenCalledTimes(2);
    // First time to compute initial state...
    expect(reducer).toHaveBeenCalledWith({ count: 5 });
    // Second time to compute new state after subscription was triggered.
    expect(reducer).toHaveBeenCalledWith({ value: 'test' });
    // Component mounted...
    expect(store.subscribe).toHaveBeenCalledTimes(1);
    expect(store.subscribe).toHaveBeenCalledWith('combiner', expect.any(Function));
    // Component unmounted.
    expect(store.unsubscribe).toHaveBeenCalledTimes(1);
    expect(store.unsubscribe).toHaveBeenCalledWith('combiner', 1);
    expect(state).toBe('test');
    const otherState = useCombiner('combiner'); // With default reducer.
    expect(otherState).toEqual({ value: 'test' });
  });
});
