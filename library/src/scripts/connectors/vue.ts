/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  ref,
  Ref,
  UnwrapRef,
  onMounted,
  onUnmounted,
} from 'vue';
import Store from 'scripts/core/Store';

/** Registers a new subscription to the specified combiner. */
type UseCombiner = <T>(hash: string, reducer?: (state: Any) => T) => Ref<UnwrapRef<T>>;

/**
 * Initializes a Vue connection to the given store.
 *
 * @param {Store} store Diox store to connect Vue to.
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
      let subscriptionId: string;
      const state = ref(reducer(combiner.reducer(
        ...combiner.modulesHashes.map(getState),
      )));
      // Subscribing to the given combiner at component creation...
      onMounted(() => {
        subscriptionId = store.subscribe<Any>(hash, (newState) => {
          state.value = reducer(newState) as UnwrapRef<Any>;
        });
      });
      onUnmounted(() => {
        store.unsubscribe(hash, subscriptionId);
      });
      return state;
    }
    throw new Error(`Could not use combiner "${hash}": combiner does not exist.`);
  };
}
