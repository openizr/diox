/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** Any valid JavaScript primitive. */
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Reducer, mixes several modules' states into one. */
type Reducer<T> = (...newState: Any[]) => T;

/** Mutation's exposed API as argument. */
interface MutationApi<T> {
  hash: string;
  state: T;
  mutate: (hash: string, name: string, data?: Any) => void;
}

/** Dispatcher's exposed API as argument. */
interface ActionApi {
  hash: string;
  mutate: (hash: string, name: string, data?: Any) => void;
  dispatch: (hash: string, name: string, data?: Any) => void;
  register: <T>(hash: string, module: Module<T>) => string;
  unregister: (hash: string) => void;
  combine: <T>(hash: string, modules: string[], reducer: Reducer<T>) => string;
  uncombine: (hash: string) => void;
}

/** Module. */
interface Module<T> {
  state: T;
  mutations: { [name: string]: (api: MutationApi<T>, data?: Any) => T };
  actions?: { [name: string]: (api: ActionApi, data?: Any) => void };
}
