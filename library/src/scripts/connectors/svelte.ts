import Store from 'scripts/core/Store';
import { readable, Readable } from 'svelte/store';

/** Registers a new subscription to the specified module. */
type UseSubscription = <T>(id: string, reducer?: (state: any) => T) => Readable<T>;

/**
 * Initializes a Svelte connection to `store`.
 *
 * @param store Diox store to connect Svelte to.
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
      const state = reducer(combiner.reducer(
        ...combiner.moduleIds.map(getState),
      ));
      // Subscribing to the given combiner at component creation...
      return readable(state, (set) => {
        const subscriptionId = store.subscribe(id, (newState) => {
          set(reducer(newState));
        });
        return () => {
          store.unsubscribe(id, subscriptionId);
        };
      });
    }
    throw new Error(`Could not subscribe to module with id "${id}": module does not exist.`);
  };
}
