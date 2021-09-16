/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { match } from 'path-to-regexp';
import { Module } from 'scripts/core/types';

/* Route data. */
export interface RoutingContext {
  path: string;
  host: string;
  route: string | null;
  protocol: string;
  query: Record<string, string>;
  params: Record<string, string>;
}

/**
 * Generates the routing context from current URL, gathering many useful informations such as host,
 * parameters, protocol, query string, ...
 *
 * @param routes List of routes the router will serve.
 *
 * @returns {RoutingContext} Generated routing context.
 */
function generateContext(routes: string[]): RoutingContext {
  const { location } = window;
  const path = location.pathname;
  // See https://stackoverflow.com/questions/8648892/how-to-convert-url-parameters-to-a-javascript-object.
  const queryString = decodeURI(location.search.substring(1))
    .replace(/"/g, '\\"')
    .replace(/&/g, '","')
    .replace(/=/g, '":"');

  let routeInfo;
  let routeIndex;
  for (routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
    const routeMatch = match(routes[routeIndex], { decode: decodeURIComponent });
    routeInfo = routeMatch(window.location.pathname);
    if (routeInfo !== false) {
      break;
    }
  }

  return {
    host: location.host,
    path: `${path}${location.search}`,
    protocol: location.protocol.replace(':', ''),
    route: routes[routeIndex] || null,
    params: ((routeInfo === false) ? {} : routeInfo?.params ?? {}) as Record<string, string>,
    query: (queryString !== '') ? JSON.parse(`{"${queryString}"}`) : {},
  };
}

/**
 * Initializes a diox module handling routing for the given configuration.
 *
 * @param {string[]} routes List of routes the router will serve.
 *
 * @return {Module<RoutingContext>} Initialized diox routing module.
 */
export default function router(routes: string[]): Module<RoutingContext> {
  let initialized = false;
  return <Module<RoutingContext>>{
    state: generateContext(routes),
    mutations: {
      // Triggered when user goes back and forth through browser's history.
      POP_STATE() {
        return generateContext(routes);
      },
      // Triggers a new navigation to the given page.
      NAVIGATE({ mutate, hash }, page: string) {
        if (initialized === false) {
          window.addEventListener('popstate', () => mutate(hash, 'POP_STATE'));
          initialized = true;
        }
        /* istanbul ignore next */
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', page);
        }
        return generateContext(routes);
      },
    },
  };
}
