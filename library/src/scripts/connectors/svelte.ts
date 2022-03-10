import Store from 'scripts/core/Store';
import { readable, Readable } from 'svelte/store/index';

/** Registers a new subscription to the specified combiner. */
type UseCombiner = <T>(hash: string, reducer?: (state: Any) => T) => Readable<T>;

/**
 * Initializes a Svelte connection to the given store.
 *
 * @param {Store} store Diox store to connect Svelte to.
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
      const state = reducer(combiner.reducer(
        ...combiner.modulesHashes.map(getState),
      ));
      // Subscribing to the given combiner at component creation...
      return readable(state, (set) => {
        const subscriptionId = store.subscribe(hash, (newState: Any) => {
          set(reducer(newState));
        });
        return () => {
          store.unsubscribe(hash, subscriptionId);
        };
      });
    }
    throw new Error(`Could not use combiner "${hash}": combiner does not exist.`);
  };
}
