/* eslint-disable */

/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** Any valid JavaScript primitive. */
type Any = any;

/** Reducer, mixes several modules' states into one. */
type Reducer<T> = (...newState: Any[]) => T;

declare module 'diox' {
  /** Mutation's exposed API as argument. */
  export interface MutationApi<T> {
    hash: string;
    state: T;
    mutate: (hash: string, name: string, data?: Any) => void;
  }

  /** Dispatcher's exposed API as argument. */
  export interface ActionApi {
    hash: string;
    mutate: (hash: string, name: string, data?: Any) => void;
    dispatch: (hash: string, name: string, data?: Any) => void;
    register: <T>(hash: string, module: Module<T>) => string;
    unregister: (hash: string) => void;
    combine: <T>(hash: string, modules: string[], reducer: Reducer<T>) => string;
    uncombine: (hash: string) => void;
  }

  /** Module. */
  export interface Module<T> {
    state: T;
    mutations: { [name: string]: (api: MutationApi<T>, data?: Any) => T };
    actions?: { [name: string]: (api: ActionApi, data?: Any) => void };
  }


  /** Subscription to modules' states changes. */
  export type Subscription<T> = (newState: T) => void;

  /** Registered module. */
  export interface RegisteredModule extends Module {
    combiners: string[];
    actions: { [name: string]: <T>(api: ActionApi, data?: T) => void };
  }

  /** Combiner. */
  export interface Combiner {
    reducer: Reducer;
    modulesHashes: string[];
    subscriptions: { [id: string]: (<T>(newState: T) => void) };
  }

  /**
   * Global state manager.
   * Contains all the sub-states, combiners and their subscriptions.
   */
  export default class Store {
    /** List of store middlewares. */
    private middlewares: Subscription[];

    /** Unique index used for subscriptions ids generation. */
    private index: number;

    /** List of store combiners. */
    private combiners: {
      [hash: string]: Combiner;
    };

    /** Global modules registry. */
    private modules: {
      [hash: string]: RegisteredModule;
    };

    /**
     * Generates a unique subscription id.
     *
     * @returns {string} The generated subscription id.
     */
    private generateSubscriptionId(): string;

    /**
     * Registers a new module into the store registry.
     *
     * @param {string} hash Module's unique identifier in registry. Can be Any string, although it
     * is recommended to follow a tree-structure pattern, like `/my_app/module_a/module_b`.
     *
     * @param {Module} module Module to register.
     *
     * @returns {string} Module's hash.
     *
     * @throws {Error} If a module with the same hash already exists in registry.
     */
    public register<T>(hash: string, module: Module<T>): string;

    /**
     * Unregisters a module from the global modules registry.
     *
     * @param {string} hash Hash of the module to unregister.
     *
     * @returns {void}
     *
     * @throws {Error} If there is no module registered with the given hash.
     *
     * @throws {Error} If module still has related user-defined combiners.
     */
    public unregister(hash: string): void;

    /**
     * Combines one or several modules to allow subscriptions on that combination.
     *
     * @param {string} hash Combiner's unique identifier in registry. Can be Any string, although it
     * is recommended to follow a tree-structure pattern, e.g. `/my_app/module_a/module_b`.
     *
     * @param {string[]} modulesHashes Hashes of the modules to combine.
     *
     * @param {Reducer} reducer Transformation function. This function is called with every combined
     * module's state as arguments.
     * For instance: `(stateA, stateB, stateC) => ({ a: stateA.prop, b: stateB, c: stateC.propC })`
     *
     * @returns {string} Combiner's hash.
     *
     * @throws {Error} If a combiner with the same hash already exists in registry.
     *
     * @throws {Error} If one of the modules hashes does not correspond to a registered module.
     */
    public combine<T>(hash: string, modulesHashes: string[], reducer: Reducer<T>): string;

    /**
     * Uncombines a user-defined combiner.
     *
     * @param {string} hash Hash of the combiner to uncombine.
     *
     * @returns {void}
     *
     * @throws {Error} If there is no combiner created with the given hash.
     *
     * @throws {Error} If the given hash corresponds to a default combiner.
     *
     * @throws {Error} If combiner still has subscriptions.
     */
    public uncombine(hash: string): void;

    /**
     * Subscribes to changes on a combiner.
     *
     * @param {string} hash Hash of the combiner to subscribe to.
     *
     * @param {Subscription} handler Callback to execute each time combiner notifies changes.
     *
     * @returns {string} The subscription id, used to unsubscribe handler.
     *
     * @throws {Error} If there is no combiner created with the given hash.
     */
    public subscribe<T>(hash: string, handler: Subscription<T>): string;

    /**
     * Unsubscribes from a combiner changes.
     *
     * @param {string} hash Hash of the combiner to unsubscribe from.
     *
     * @param {string} subscriptionId Id of the subscription.
     *
     * @returns {void}
     *
     * @throws {Error} If there is no combiner created with the given hash.
     *
     * @throws {Error} If subscription id does not exist.
     */
    public unsubscribe(hash: string, subscriptionId: string): void;

    /**
     * Performs a state mutation on a module.
     *
     * @param {string} hash Hash of the module on which to perform mutation.
     *
     * @param {string} name Name of the mutation to perform.
     *
     * @param {Any} [data] Additional data to pass to the mutation.
     *
     * @returns {void}
     *
     * @throws {Error} If there is no module registered with the given hash.
     *
     * @throws {Error} If mutation's name does not exist on registered module.
     *
     * @throws {Error} If mutation is not a pure function.
     */
    public mutate<T>(hash: string, name: string, data?: T): void;

    /**
     * Dispatches an asynchronous action to a registered module.
     *
     * @param {string} hash Hash of the module to dispatch action on.
     *
     * @param {string} name Name of the action to perform.
     *
     * @param {Any} [data] Additional data to pass to the action.
     *
     * @returns {void}
     *
     * @throws {Error} If there is no module registered with the given hash.
     *
     * @throws {Error} If action's name does not exist on registered module.
     */
    public dispatch<T>(hash: string, name: string, data?: T): void;

    /**
     * Applies the given middleware to the store.
     *
     * @param {Subscription} middleware Middleware to apply to store.
     *
     * @returns {void}
     */
    public use<T>(middleware: Subscription<T>): void;
  }
}

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

declare module 'diox/connectors/react' {
  import Store from 'diox';

  /** Registers a new subscription to the specified combiner. */
  export type UseCombiner = <T>(hash: string, reducer?: (state: Any) => T) => T;

  /**
   * Initializes a React connection to the given store.
   *
   * @param {Store} store Diox store to connect React to.
   *
   * @returns {UseCombiner} `useCombiner` function.
   *
   * @throws {Error} If combiner with the given hash does not exist in store.
   */
  export default function connect(store: Store): UseCombiner;
}

declare module 'diox/connectors/vue' {
  import { Ref, UnwrapRef } from 'vue';

  /** Registers a new subscription to the specified combiner. */
  export type UseCombiner = <T>(hash: string, reducer?: (state: Any) => T) => Ref<UnwrapRef<T>>;

  /**
   * Initializes a Vue connection to the given store.
   *
   * @param {Store} store Diox store to connect Vue to.
   *
   * @returns {UseCombiner} `useCombiner` function.
   *
   * @throws {Error} If combiner with the given hash does not exist in store.
   */
  export default function connect(store: Store): UseCombiner;
}

declare module 'diox/connectors/svelte' {
  import { Readable } from 'svelte/store/index';

  /** Registers a new subscription to the specified combiner. */
  export type UseCombiner = <T>(hash: string, reducer?: (state: Any) => T) => Readable<T>;

  /**
   * Initializes a Svelte connection to the given store.
   *
   * @param {Store} store Diox store to connect Svelte to.
   *
   * @returns {UseCombiner} `useCombiner` function.
   *
   * @throws {Error} If combiner with the given hash does not exist in store.
   */
  export default function connect(store: Store): UseCombiner;
}
