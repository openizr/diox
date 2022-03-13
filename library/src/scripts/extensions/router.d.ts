/* eslint-disable */

/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module 'diox/extensions/router' {
  import { Module } from 'diox';

  /** Route data. */
  export interface RoutingContext {
    path: string;
    host: string;
    route: string | null;
    protocol: string;
    query: Record<string, string>;
    params: Record<string, string>;
  }

  /**
   * Initializes a diox module handling routing for the given configuration.
   *
   * @param {string[]} routes List of routes the router will serve.
   *
   * @return {Module<RoutingContext>} Initialized diox routing module.
   */
  export default function router(routes: string[]): Module<RoutingContext>;
}