/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Store from 'scripts/core/Store';
import { useState as reactUseState, useEffect as reactUseEffect } from 'react';

/** Registers a new subscription to the specified combiner. */
type UseCombiner = <T>(hash: string, reducer?: (state: Any) => T) => T;

/**
 * Initializes a React connection to the given store.
 *
 * @param {Store} store Diox store to connect React to.
 *
 * @returns {UseCombiner} `useCombiner` function.
 *
 * @throws {Error} If combiner with the given hash does not exist in store.
 */
export default function connect(store: Store): UseCombiner {
  const privateStore = (store as Any);
  const getState = (moduleHash: string): Any => privateStore.modules[moduleHash].state;

  return (hash, reducer = (newState): Any => newState) => {
    const combiner = privateStore.combiners[hash];

    if (combiner !== undefined) {
      // Subscribing to the given combiner at component creation...
      const [state, setState] = reactUseState(() => reducer(combiner.reducer(
        ...combiner.modulesHashes.map(getState),
      )));
      reactUseEffect(() => {
        const subscriptionId = store.subscribe<Any>(hash, (newState) => {
          setState(reducer(newState));
        });
        return (): void => {
          store.unsubscribe(hash, subscriptionId);
        };
      }, []);
      return state;
    }
    throw new Error(`Could not use combiner "${hash}": combiner does not exist.`);
  };
}
