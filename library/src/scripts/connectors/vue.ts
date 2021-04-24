/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Vue, { Component } from 'vue';
import { Json, Store } from 'scripts/core/types';

type VueHookApi = [
  /** `useCombiner` function, making component subscribe to the specified combiner. */
  (hash: string, component: Component, reducer?: (state: Json) => Json) => Component,

  /** `mutate` function, allowing mutations on store. */
  (hash: string, name: string, data?: Json) => void,

  /** `dispatch` function, allowing mutations on store. */
  (hash: string, name: string, data?: Json) => void,
];

/**
 * Initializes a VueJS connection to the given store.
 *
 * @param {Store} store Diox store to connect VueJS to.
 *
 * @returns {VueHookApi} Set of methods to manipulate the store.
 *
 * @throws {Error} If combiner with the given hash does not exist in store.
 */
export default function useStore(store: Store): VueHookApi {
  const getState = (moduleHash: string): Json => (store as Json).modules[moduleHash].state;

  return [
    (hash, component, reducer = (newState: Json): Json => newState): Component => {
      const combiner = (store as Json).combiners[hash];

      if (combiner !== undefined) {
        const initialState = combiner.reducer(...combiner.modulesHashes.map(getState));
        // Subscribing to the given combiner at component creation...
        return Vue.extend({
          mixins: [
            {
              /** Component's subscription id to the store. */
              $subscription: null,

              /** Initial component's state data. */
              data() {
                return initialState;
              },

              /** Subscribes to combiner. */
              mounted(): void {
                this.$subscription = store.subscribe(hash, (newState) => {
                  const newData = reducer(newState);
                  Object.keys(newData).forEach((key: string) => {
                    this[key] = newData[key];
                  });
                });
              },

              /** Unsubscribes from combiner. */
              beforeDestroy(): void {
                store.unsubscribe(hash, this.$subscription);
              },
            } as Json,

            // Actual component.
            component,
          ],
        });
      }
      throw new Error(`Could not use combiner "${hash}": combiner does not exist.`);
    },
    store.mutate.bind(store),
    store.dispatch.bind(store),
  ];
}
