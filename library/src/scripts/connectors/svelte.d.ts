/* eslint-disable */

/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module 'diox/connectors/svelte' {
  import Store from 'diox';
  import { Readable } from 'svelte/store/index';

  /** Registers a new subscription to the specified combiner. */
  export type UseCombiner = <T>(hash: string, reducer?: (state: Any) => T) => Readable<T>;

  /**
   * Initializes a Svelte connection to the given store.
   *
   * @param {Store} store Diox store to connect Svelte to.
   *
   * @returns {UseCombiner} `useCombiner` function.
   *
   * @throws {Error} If combiner with the given hash does not exist in store.
   */
  export default function connect(store: Store): UseCombiner;
}
