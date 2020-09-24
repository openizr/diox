/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export interface Store {
  subscribe(hash: string, handler: subscription): string;
  unsubscribe(hash: string, subscriptionId: string): void;
  mutate(hash: string, name: string, data?: mixed): void;
  dispatch(hash: string, name: string, data?: mixed): void;
}

/** Mutation's exposed API as argument. */
export interface MutationApi {
  hash: string;
  state: Record<string, mixed>;
  mutate: (hash: string, name: string, data?: mixed) => void;
}

export interface Context {
  path: string;
  host: string;
  query: string;
  route: string | null;
  protocol: string;
  params: Record<string, string>;
}

/** Dispatcher's exposed API as argument. */
interface ActionApi {
  hash: string;
  mutate: (hash: string, name: string, data?: mixed) => void;
  dispatch: (hash: string, name: string, data?: mixed) => void;
  register: (hash: string, module: Module) => string;
  unregister: (hash: string) => void;
  combine: (hash: string, mapper: Mapper) => string;
  uncombine: (hash: string) => void;
}

/** Any valid JavaScript primitive. */
export type mixed = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Subscription to modules' states changes. */
export type subscription = (newState: Record<string, mixed>) => void;

/** Module. */
export interface Module {
  state: Record<string, mixed>;
  mutations: { [name: string]: (api: MutationApi, data?: mixed) => Record<string, mixed> };
  actions?: { [name: string]: (api: ActionApi, data?: mixed) => void };
}

/** Combiner's mapper. */
export interface Mapper {
  // Hash of each combined module, along with a function of its state.
  [key: string]: (newState: Record<string, mixed>) => mixed;
}

/** Registered module. */
export interface RegisteredModule extends Module {
  combiners: string[];
  actions: { [name: string]: (api: ActionApi, data?: mixed) => void };
}

/** Combiner. */
export interface Combiner {
  mapper: Mapper;
  // User-defined subscriptions.
  subscriptions: { [id: string]: ((newState: Record<string, mixed>) => void) };
}
