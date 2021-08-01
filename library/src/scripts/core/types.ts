/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** Mutation's exposed API as argument. */
interface MutationApi<T> {
  hash: string;
  state: T;
  mutate: (hash: string, name: string, data?: Json) => void;
}

/** Subscription to modules' states changes. */
export type Subscription<T> = (newState: T) => void;

/** Store. */
export interface Store {
  subscribe<T = Json>(hash: string, handler: Subscription<T>): string;
  unsubscribe(hash: string, subscriptionId: string): void;
  mutate(hash: string, name: string, data?: Json): void;
  dispatch(hash: string, name: string, data?: Json): void;
}

/** Reducer, mixes several modules' states into one. */
export type Reducer<T> = (...newState: Json[]) => T;

/** Module. */
export interface Module<T> {
  state: T;
  mutations: { [name: string]: (api: MutationApi<T>, data?: Json) => T };
  actions?: { [name: string]: (api: ActionApi, data?: Json) => void };
}

/** Dispatcher's exposed API as argument. */
export interface ActionApi {
  hash: string;
  mutate: (hash: string, name: string, data?: Json) => void;
  dispatch: (hash: string, name: string, data?: Json) => void;
  register: <T = Json>(hash: string, module: Module<T>) => string;
  unregister: (hash: string) => void;
  combine: <T = Json>(hash: string, modules: string[], reducer: Reducer<T>) => string;
  uncombine: (hash: string) => void;
}

/** Any valid JavaScript primitive. */
export type Json = any; // eslint-disable-line @typescript-eslint/no-explicit-any
