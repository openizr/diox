/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useEffect } from 'react';
import { mixed, Store } from 'scripts/types';

type HookApi = [
  /** `useCombiner` function, making component subscribe to the specified combiner. */
  (hash: string, reducer: (state: mixed) => mixed) => mixed[],

  /** `mutate` function, allowing mutations on store. */
  (hash: string, name: string, data?: mixed) => void,

  /** `dispatch` function, allowing mutations on store. */
  (hash: string, name: string, data?: mixed) => void,
];

/**
 * Initializes a React connection to the given store.
 *
 * @param {Store} store Diox store to connect React to.
 *
 * @returns {HookApi} Set of methods to manipulate the store.
 *
 * @throws {Error} If combiner with the given hash does not exist in store.
 */
export default function useStore(store: Store): HookApi {
  return [
    (hash: string, reducer: (state: mixed) => mixed): mixed[] => {
      const combiner = (store as mixed).combiners[hash];
      if (combiner !== undefined) {
        // Retrieving combiner's initial state from its related modules...
        let initialState = {};
        Object.keys(combiner.mapper).forEach((moduleHash: string) => {
          const module = (store as mixed).modules[moduleHash];
          initialState = Object.assign(initialState, combiner.mapper[moduleHash](module.state));
        });
        // Subscribing to the given combiner at component creation...
        const [state, setState] = useState(reducer(initialState));
        useEffect(() => {
          const subscriptionId = store.subscribe(hash, (newState) => {
            setState(reducer(newState));
          });
          return (): void => {
            store.unsubscribe(hash, subscriptionId);
          };
        }, []);
        return [state];
      }
      throw new Error(`Could not use combiner "${hash}": combiner does not exist.`);
    },
    store.mutate.bind(store),
    store.dispatch.bind(store),
  ];
}
