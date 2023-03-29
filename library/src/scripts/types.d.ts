/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module 'diox' {
  /** Reducer, mixes several modules' states into one. */
  export type Reducer<T = any> = (...newState: any[]) => T;

  /** Subscription to modules' states changes. */
  export type Subscription<T = any> = (newState: T) => void;

  /** Mutation API. */
  export interface MutationApi<T> {
    /** Module's id. */
    id: string;

    /** Module's current state. */
    state: T;
  }

  /** Action API. */
  export interface ActionApi {
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
  export interface Module<T = any> {
    /** Initial state. */
    state: T;

    /** Setup function, called on module registration. You can use it to perform initializations. */
    setup?: (api: ActionApi) => void;

    /** List of module's mutations. */
    mutations: { [name: string]: <T2>(api: MutationApi<T>, data?: T2) => T };

    /** List of module's actions. */
    actions?: { [name: string]: <T2>(api: ActionApi, data?: T2) => void };
  }

  /**
   * Global state manager.
   * Contains all the sub-states, combined modules and their subscriptions.
   */
  export default class Store {
    /** List of store middlewares. */
    private middlewares: Subscription[];

    /** Unique index used for subscriptions ids generation. */
    private index: number;

    /** List of store combined modules. */
    private combinedModules: {
      [id: string]: {
        reducer: Reducer;
        moduleIds: string[];
        subscriptions: { [id: string]: Subscription; };
      };
    };

    /** Global modules registry. */
    private modules: {
      [id: string]: Module & {
        combinedModules: string[];
        actions: { [name: string]: <T2>(api: ActionApi, data?: T2) => void };
      };
    };

    /**
     * Generates a unique subscription id.
     *
     * @returns The generated subscription id.
     */
    private generateSubscriptionId(): string;

    /**
     * Class constructor.
     */
    public constructor();

    /**
     * Registers a new module into the store registry.
     *
     * @param id Module's unique identifier in registry. Can be any string, although it
     * is recommended to follow a tree-structure pattern, like `/my_app/module_a/module_b`.
     *
     * @param module Module to register.
     *
     * @returns Module's id.
     *
     * @throws If a module with the same id already exists in registry.
     */
    public register<T>(id: string, module: Module<T>): string;

    /**
     * Unregisters module with id `id` from the global modules registry.
     *
     * @param id Id of the module to unregister.
     *
     * @throws If module with id `id` does not exist.
     *
     * @throws If module still has related user-defined combined modules.
     */
    public unregister(id: string): void;

    /**
     * Combines one or several modules to allow subscriptions on that combination.
     *
     * @param id Combined module's unique identifier in registry. Can be any string, although it
     * is recommended to follow a tree-structure pattern, e.g. `/my_app/module_a/module_b`.
     *
     * @param moduleIds Ids of the modules to combine.
     *
     * @param reducer Transformation function. This function is called with every combined
     * module's state as arguments.
     * For instance: `(stateA, stateB, stateC) => ({ a: stateA.prop, b: stateB, c: stateC.propC })`
     *
     * @returns Combined module's id.
     *
     * @throws If a module with the same id already exists in registry.
     *
     * @throws If one of the modules' ids does not exist.
     */
    public combine<T>(id: string, moduleIds: string[], reducer: Reducer<T>): string;

    /**
     * Uncombines user-defined combined module with id `id`.
     *
     * @param id Id of the combined module to uncombine.
     *
     * @throws If combined module with id `id` does not exist.
     *
     * @throws If the given id corresponds to a default combined module.
     *
     * @throws If combined module still has subscriptions.
     */
    public uncombine(id: string): void;

    /**
     * Subscribes to changes on module with id `id`.
     *
     * @param id Id of the module to subscribe to.
     *
     * @param handler Callback to execute each time module notifies changes.
     *
     * @returns Subscription's id, used to unsubscribe handler.
     *
     * @throws If module with id `id` does not exist.
     */
    public subscribe<T>(id: string, handler: Subscription<T>): string;

    /**
     * Unsubscribes from changes on module with id `id`.
     *
     * @param id Id of the module to unsubscribe from.
     *
     * @param subscriptionId Id of the subscription.
     *
     * @throws If module with id `id` does not exist.
     *
     * @throws If subscription with id `id` does not exist on that module.
     */
    public unsubscribe(id: string, subscriptionId: string): void;

    /**
     * Performs a state mutation on module with id `id`.
     *
     * @param id Id of the module on which to perform mutation.
     *
     * @param name Name of the mutation to perform.
     *
     * @param data Additional data to pass to the mutation.
     *
     * @throws If module with id `id` does not exist or is a combined module.
     *
     * @throws If mutation's name does not exist on that module.
     *
     * @throws If mutation is not a pure function.
     */
    public mutate<T>(id: string, name: string, data?: T): void;

    /**
     * Dispatches an asynchronous action to module with id `id`.
     *
     * @param id Id of the module to dispatch action on.
     *
     * @param name Name of the action to perform.
     *
     * @param data Additional data to pass to the action.
     *
     * @throws If module with id `id` does not exist or is a combined module.
     *
     * @throws If action's name does not exist on that module.
     */
    public async dispatch<T>(id: string, name: string, data?: T): Promise<void>;

    /**
     * Applies the given middleware to the store.
     *
     * @param middleware Middleware to apply to store.
     */
    public use(middleware: Subscription): void;
  }
}
