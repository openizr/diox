/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** Reducer, mixes several modules' states into one. */
type Reducer<T = any> = (...newState: any[]) => T;

/** Subscription to modules' states changes. */
type Subscription<T = any> = (newState: T) => void;

/** Mutation API. */
interface MutationApi<T> {
  /** Module's id. */
  id: string;

  /** Module's current state. */
  state: T;
}

/** Action API. */
interface ActionApi {
  /** Module's id. */
  id: string;

  /** Store's `mutate` method. */
  mutate: <T2>(id: string, name: string, data?: T2) => void;

  /** Store's `dispatch` method. */
  dispatch: <T2>(id: string, name: string, data?: T2) => void;

  /** Store's `register` method. */
  register: <T>(id: string, module: Module<T>) => string;

  /** Store's `unregister` method. */
  unregister: (id: string) => void;

  /** Store's `combine` method. */
  combine: <T>(id: string, modules: string[], reducer: Reducer<T>) => string;

  /** Store's `uncombine` method. */
  uncombine: (id: string) => void;
}

/** Module. */
interface Module<T = any> {
  /** Initial state. */
  state: T;

  /** Setup function, called on module registration. You can use it to perform initializations. */
  setup?: (api: ActionApi) => void;

  /** List of module's mutations. */
  mutations: { [name: string]: (api: MutationApi<T>, data?: unknown) => T; };

  /** List of module's actions. */
  actions?: { [name: string]: (api: ActionApi, data?: unknown) => void; };
}
