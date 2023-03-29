/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module 'diox/connectors/svelte' {
  import Store from 'diox';
  import { Readable } from 'svelte/store/index';

  /** Registers a new subscription to the specified module. */
  type UseSubscription = <T>(id: string, reducer?: (state: any) => T) => Readable<T>;

  /**
   * Initializes a Svelte connection to `store`.
   *
   * @param store Diox store to connect Svelte to.
   *
   * @returns `useSubscription` function.
   */
  export default function connect(store: Store): UseSubscription;
}
