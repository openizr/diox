/* eslint-disable */

/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module 'diox/connectors/vue' {
  import Store from 'diox';
  import { Ref, UnwrapRef } from 'vue';

  /** Registers a new subscription to the specified combiner. */
  export type UseCombiner = <T>(hash: string, reducer?: (state: Any) => T) => Ref<UnwrapRef<T>>;

  /**
   * Initializes a Vue connection to the given store.
   *
   * @param {Store} store Diox store to connect Vue to.
   *
   * @returns {UseCombiner} `useCombiner` function.
   *
   * @throws {Error} If combiner with the given hash does not exist in store.
   */
  export default function connect(store: Store): UseCombiner;
}

