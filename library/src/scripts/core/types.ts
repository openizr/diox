/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** Mutation's exposed API as argument. */
interface MutationApi {
  hash: string;
  state: Json;
  mutate: (hash: string, name: string, data?: Json) => void;
}

/** Subscription to modules' states changes. */
export type Subscription = (newState: Json) => void;

/** Store. */
export interface Store {
  subscribe(hash: string, handler: Subscription): string;
  unsubscribe(hash: string, subscriptionId: string): void;
  mutate(hash: string, name: string, data?: Json): void;
  dispatch(hash: string, name: string, data?: Json): void;
}

/** Reducer, mixes several modules' states into one. */
export type Reducer = (...newState: Json[]) => Json;

/** Module. */
export interface Module {
  state: Json;
  mutations: { [name: string]: (api: MutationApi, data?: Json) => Json };
  actions?: { [name: string]: (api: ActionApi, data?: Json) => void };
}

/** Dispatcher's exposed API as argument. */
export interface ActionApi {
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
