/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useEffect } from 'react';
import { Any, Store } from 'scripts/core/types';

type ReactHookApi = [
  /** `useCombiner` function, making component subscribe to the specified combiner. */
  <T>(hash: string, reducer?: (state: T) => T) => T[],

  /** `mutate` function, allowing mutations on store. */
  <T>(hash: string, name: string, data?: T) => void,

  /** `dispatch` function, allowing mutations on store. */
  <T>(hash: string, name: string, data?: T) => void,
];

/**
 * Initializes a React connection to the given store.
 *
 * @param {Store} store Diox store to connect React to.
 *
 * @returns {ReactHookApi} Set of methods to manipulate the store.
 *
 * @throws {Error} If combiner with the given hash does not exist in store.
 */
export default function useStore(store: Store): ReactHookApi {
  const getState = (moduleHash: string): Any => (store as Any).modules[moduleHash].state;

  return [
    <T>(hash: string, reducer: (state: Any) => T = (newState): T => newState): T[] => {
      const combiner = (store as Any).combiners[hash];

      if (combiner !== undefined) {
        // Subscribing to the given combiner at component creation...
        const [state, setState] = useState(() => reducer(combiner.reducer(
          ...combiner.modulesHashes.map(getState),
        )));
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
