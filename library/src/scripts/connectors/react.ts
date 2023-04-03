/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import Store from 'scripts/core/Store';

/** Registers a new subscription to the specified module. */
type UseSubscription = <T>(id: string, reducer?: (state: any) => T) => T;

/**
 * Initializes a React connection to `store`.
 *
 * @param store Diox store to connect React to.
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
    const combinedModule = privateStore.combinedModules[id];

    if (combinedModule !== undefined) {
      // Subscribing to the given module at component creation...
      const [state, setState] = React.useState(() => reducer(combinedModule.reducer(
        ...combinedModule.moduleIds.map(getState),
      )));
      React.useEffect(() => {
        const subscriptionId = store.subscribe(id, (newState) => {
          setState(reducer(newState));
        });
        return (): void => {
          store.unsubscribe(id, subscriptionId);
        };
      }, []);
      return state;
    }
    throw new Error(`Could not subscribe to module with id "${id}": module does not exist.`);
  };
}
