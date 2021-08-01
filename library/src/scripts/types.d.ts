/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/** Subscription to modules' states changes. */
type Subscription<T> = (newState: T) => void;

/** Reducer, mixes several modules' states into one. */
type Reducer<T> = (...newState: any[]) => T;

declare module 'diox' {
  /** Mutation's exposed API as argument. */
  interface MutationApi<T> {
    hash: string;
    state: T;
    mutate: (hash: string, name: string, data?: any) => void;
  }

  /** Dispatcher's exposed API as argument. */
  interface ActionApi {
    hash: string;
    mutate: (hash: string, name: string, data?: any) => void;
    dispatch: (hash: string, name: string, data?: any) => void;
    register: <T = any>(hash: string, module: Module<T>) => string;
    unregister: (hash: string) => void;
    combine: <T = any>(hash: string, modules: string[], reducer: Reducer<T>) => string;
    uncombine: (hash: string) => void;
  }

  /** Registered module. */
  interface RegisteredModule extends Module {
    combiners: string[];
    actions: { [name: string]: (api: ActionApi, data?: any) => void };
  }

  /** Combiner. */
  interface Combiner {
    reducer: Reducer;
    modulesHashes: string[];
    subscriptions: { [id: string]: ((newState: any) => void) };
  }

  /** Module. */
  export interface Module<T> {
    state: T;
    mutations: { [name: string]: (api: MutationApi<T>, data?: any) => T };
    actions?: { [name: string]: (api: ActionApi, data?: any) => void };
  }

  /**
   * Global state manager.
   * Contains all the sub-states, combiners and their subscriptions.
   */
  export default class Store {
    /** List of store middlewares. */
    private middlewares: Subscription<any>[];

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
     * @param {string} hash Module's unique identifier in registry. Can be any string, although it
     * is recommended to follow a tree-structure pattern, like `/my_app/module_a/module_b`.
     *
     * @param {Module} module Module to register.
     *
     * @returns {string} Module's hash.
     *
     * @throws {Error} If a module with the same hash already exists in registry.
     */
    public register<T = Json>(hash: string, module: Module<T>): string;

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
     * @param {string} hash Combiner's unique identifier in registry. Can be any string, although it
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
    public combine<T = Json>(hash: string, modulesHashes: string[], reducer: Reducer<T>): string;

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
    public subscribe<T = Json>(hash: string, handler: Subscription<T>): string;

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
     * @param {any} [data] Additional data to pass to the mutation.
     *
     * @returns {void}
     *
     * @throws {Error} If there is no module registered with the given hash.
     *
     * @throws {Error} If mutation's name does not exist on registered module.
     *
     * @throws {Error} If mutation is not a pure function.
     */
    public mutate(hash: string, name: string, data?: any): void;

    /**
     * Dispatches an asynchronous action to a registered module.
     *
     * @param {string} hash Hash of the module to dispatch action on.
     *
     * @param {string} name Name of the action to perform.
     *
     * @param {any} [data] Additional data to pass to the action.
     *
     * @returns {void}
     *
     * @throws {Error} If there is no module registered with the given hash.
     *
     * @throws {Error} If action's name does not exist on registered module.
     */
    public dispatch(hash: string, name: string, data?: any): void;

    /**
     * Applies the given middleware to the store.
     *
     * @param {Subscription} middleware Middleware to apply to store.
     *
     * @returns {void}
     */
    public use<T = Json>(middleware: Subscription<T>): void;
  }
}

declare module 'diox/extensions/router' {

  /** Mutation's exposed API as argument. */
  interface MutationApi<T> {
    hash: string;
    state: T;
    mutate: (hash: string, name: string, data?: any) => void;
  }

  /** Dispatcher's exposed API as argument. */
  interface ActionApi {
    hash: string;
    mutate: (hash: string, name: string, data?: any) => void;
    dispatch: (hash: string, name: string, data?: any) => void;
    register: <T = Json>(hash: string, module: Module<T>) => string;
    unregister: (hash: string) => void;
    combine: <T = Json>(hash: string, modules: string[], reducer: Reducer<T>) => string;
    uncombine: (hash: string) => void;
  }

  /** Module. */
  interface Module<T> {
    state: T;
    mutations: { [name: string]: (api: MutationApi<T>, data?: any) => T };
    actions?: { [name: string]: (api: ActionApi, data?: any) => void };
  }

  /* Route data. */
  export interface RoutingContext {
    path: string;
    host: string;
    query: string;
    route: string | null;
    protocol: string;
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
  /** Store. */
  interface Store {
    subscribe<T = Json>(hash: string, handler: Subscription<T>): string;
    unsubscribe(hash: string, subscriptionId: string): void;
    mutate(hash: string, name: string, data?: any): void;
    dispatch(hash: string, name: string, data?: any): void;
  }

  type ReactHookApi = [
    /** `useCombiner` function, making component subscribe to the specified combiner. */
    <T>(hash: string, reducer?: (state: any) => T) => T[],

    /** `mutate` function, allowing mutations on store. */
    (hash: string, name: string, data?: any) => void,

    /** `dispatch` function, allowing mutations on store. */
    (hash: string, name: string, data?: any) => void,
  ];

  /**
   * Initializes a React connection to the given store.
   *
   * @param {Store} store Diox store to connect React to.
   *
   * @returns {ReactHookApi} Set of methods to manipulate the store.
   *
   * @throws {Error} If combiner with the given hash does not exist in store.
   */
  export default function useStore(store: Store): ReactHookApi;
}

declare module 'diox/connectors/vue' {
  import { Component } from 'vue';
  import { ExtendedVue } from 'vue/types/vue.d';

  /** Store. */
  interface Store {
    subscribe<T = Json>(hash: string, handler: Subscription<T>): string;
    unsubscribe(hash: string, subscriptionId: string): void;
    mutate(hash: string, name: string, data?: any): void;
    dispatch(hash: string, name: string, data?: any): void;
  }

  type VueHookApi = [
    /** `useCombiner` function, making component subscribe to the specified combiner. */
    <T>(hash: string, component: Component, reducer?: (state: any) => T) => ExtendedVue,

    /** `mutate` function, allowing mutations on store. */
    (hash: string, name: string, data?: any) => void,

    /** `dispatch` function, allowing mutations on store. */
    (hash: string, name: string, data?: any) => void,
  ];

  /**
   * Initializes a VueJS connection to the given store.
   *
   * @param {Store} store Diox store to connect VueJS to.
   *
   * @returns {VueHookApi} Set of methods to manipulate the store.
   *
   * @throws {Error} If combiner with the given hash does not exist in store.
   */
  export default function useStore(store: Store): VueHookApi;
}
