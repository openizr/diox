/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export interface Store {
  subscribe(hash: string, handler: Subscription): string;
  unsubscribe(hash: string, subscriptionId: string): void;
  mutate(hash: string, name: string, data?: Json): void;
  dispatch(hash: string, name: string, data?: Json): void;
}

/** Mutation's exposed API as argument. */
export interface MutationApi {
  hash: string;
  state: Json;
  mutate: (hash: string, name: string, data?: Json) => void;
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
  mutate: (hash: string, name: string, data?: Json) => void;
  dispatch: (hash: string, name: string, data?: Json) => void;
  register: (hash: string, module: Module) => string;
  unregister: (hash: string) => void;
  combine: (hash: string, modules: string[], reducer: Reducer) => string;
  uncombine: (hash: string) => void;
}

/** Any valid JavaScript primitive. */
export type Json = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Subscription to modules' states changes. */
export type Subscription = (newState: Json) => void;

/** Reducer, mixes several modules' states into one. */
export type Reducer = (...newState: Json[]) => Json;

/** Module. */
export interface Module {
  state: Json;
  mutations: { [name: string]: (api: MutationApi, data?: Json) => Json };
  actions?: { [name: string]: (api: ActionApi, data?: Json) => void };
}

/** Registered module. */
export interface RegisteredModule extends Module {
  combiners: string[];
  actions: { [name: string]: (api: ActionApi, data?: Json) => void };
}

/** Combiner. */
export interface Combiner {
  reducer: Reducer;
  modulesHashes: string[];
  subscriptions: { [id: string]: ((newState: Json) => void) };
}
