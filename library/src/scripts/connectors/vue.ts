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

/** Registers a new subscription to the specified module. */
type UseSubscription = <T>(id: string, reducer?: (state: any) => T) => Ref<UnwrapRef<T>>;

/**
 * Initializes a Vue connection to `store`.
 *
 * @param store Diox store to connect Vue to.
 *
 * @returns `useSubscription` function.
 */
export default function connect(store: Store): UseSubscription {
  const privateStore = (store as unknown as {
    modules: {
      [id: string]: Module & {
        combinedModules: string[];
        actions: { [name: string]: <T2>(api: ActionApi, data?: T2) => void };
      };
    };
    combinedModules: {
      [id: string]: {
        reducer: Reducer;
        moduleIds: string[];
        subscriptions: { [id: string]: Subscription; };
      };
    };
  });
  const defaultReducer = <T>(newState: any): T => newState;
  const getState = <T>(moduleId: string): T => privateStore.modules[moduleId].state;

  return (id, reducer = defaultReducer) => {
    const combiner = privateStore.combinedModules[id];

    if (combiner !== undefined) {
      let subscriptionId: string;
      const state = ref(reducer(combiner.reducer(
        ...combiner.moduleIds.map(getState),
      )));
      // Subscribing to the given combiner at component creation...
      onMounted(() => {
        subscriptionId = store.subscribe(id, (newState) => {
          state.value = reducer(newState) as UnwrapRef<any>;
        });
      });
      onUnmounted(() => {
        store.unsubscribe(id, subscriptionId);
      });
      return state;
    }
    throw new Error(`Could not subscribe to module with id "${id}": module does not exist.`);
  };
}
