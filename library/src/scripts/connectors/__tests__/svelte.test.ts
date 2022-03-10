/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Store from 'scripts/core/Store';
import { readable } from 'svelte/store/index';
import connect from 'scripts/connectors/svelte';

jest.mock('scripts/core/Store');
jest.mock('svelte/store/index', () => {
  const set = jest.fn();
  return ({
    readable: jest.fn((_state, callback) => {
      callback(set)();
      return { value: 'test' };
    }),
  });
});

describe('connectors/svelte', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should correctly initialize a Svelte connection to the store', () => {
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

    expect(state).toEqual({ value: 'test' });
    expect(readable).toHaveBeenCalledTimes(1);
    expect(readable).toHaveBeenCalledWith({ value: 'test' }, expect.any(Function));
    expect(store.subscribe).toHaveBeenCalledTimes(1);
    expect(store.subscribe).toHaveBeenCalledWith('combiner', expect.any(Function));
    expect(store.unsubscribe).toHaveBeenCalledTimes(1);
    expect(store.unsubscribe).toHaveBeenCalledWith('combiner', 1);
  });
});
