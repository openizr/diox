/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module 'diox/connectors/react' {
  import Store from 'diox';

  /** Registers a new subscription to the specified module. */
  type UseSubscription = <T>(id: string, reducer?: (state: any) => T) => T;

  /**
   * Initializes a React connection to `store`.
   *
   * @param store Diox store to connect React to.
   *
   * @returns `useSubscription` function.
   */
  export default function connect(store: Store): UseSubscription;
}
