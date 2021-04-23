/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  Json, Module, ActionApi, Reducer, Subscription,
} from 'scripts/core/types';

/** Registered module. */
interface RegisteredModule extends Module {
  combiners: string[];
  actions: { [name: string]: (api: ActionApi, data?: Json) => void };
}

/** Combiner. */
interface Combiner {
  reducer: Reducer;
  modulesHashes: string[];
  subscriptions: { [id: string]: ((newState: Json) => void) };
}

const isPlainObject = (variable: Json): boolean => (
  typeof variable === 'object'
  && variable !== null
  && variable.constructor === Object
  && Object.prototype.toString.call(variable) === '[object Object]'
);

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
  private generateSubscriptionId(): string {
    const subscriptionId = ((this.index += 1) * 100).toString(16) + Date.now().toString(16);
    return subscriptionId;
  }

  /**
   * Class constructor.
   *
   * @returns {void}
   */
  public constructor() {
    this.modules = {};
    this.combiners = {};
    this.middlewares = [];
    this.index = 0;
  }

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
  public register(hash: string, module: Module): string {
    if (this.modules[hash] !== undefined) {
      throw new Error(
        `Could not register module with hash "${hash}": `
        + 'another module with the same hash already exists.',
      );
    }
    this.modules[hash] = {
      state: module.state,
      mutations: {
        ...module.mutations,
        DIOX_INITIALIZE: ({ state }): Record<string, Json> => {
          if (Array.isArray(state)) {
            return [...state];
          }
          if (isPlainObject(state)) {
            return { ...state };
          }
          return state;
        },
      },
      actions: module.actions || {},
      // Storing related combiners' hashes makes it easier to notify them after mutating module.
      combiners: [],
    };
    // A default combiner with the same hash as the module is always created first.
    this.combine(hash, [hash], (newState) => newState);
    this.mutate(hash, 'DIOX_INITIALIZE');
    return hash;
  }

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
  public unregister(hash: string): void {
    if (this.modules[hash] === undefined) {
      throw new Error(
        `Could not unregister module with hash "${hash}": `
        + 'module does not exist.',
      );
    }
    if (this.modules[hash].combiners.length > 1) {
      throw new Error(
        `Could not unregister module with hash "${hash}": `
        + 'all the related user-defined combiners must be uncombined first.',
      );
    }
    // Deleting module and related default combiner...
    delete (this.modules[hash]);
    delete (this.combiners[hash]);
  }

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
  public combine(hash: string, modulesHashes: string[], reducer: Reducer): string {
    if (this.combiners[hash] !== undefined) {
      throw new Error(
        `Could not create combiner with hash "${hash}": `
        + 'another combiner with the same hash already exists.',
      );
    }
    modulesHashes.forEach((moduleHash) => {
      if (this.modules[moduleHash] === undefined) {
        throw new Error(
          `Could not create combiner with hash "${hash}": `
          + `module with hash "${moduleHash}" does not exist.`,
        );
      }
      this.modules[moduleHash].combiners.push(hash);
    });
    this.combiners[hash] = {
      reducer,
      modulesHashes,
      subscriptions: {},
    };
    return hash;
  }

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
  public uncombine(hash: string): void {
    if (this.combiners[hash] === undefined) {
      throw new Error(
        `Could not uncombine combiner with hash "${hash}": `
        + 'combiner does not exist.',
      );
    }
    if (this.modules[hash] !== undefined) {
      throw new Error(
        `Could not uncombine combiner with hash "${hash}": `
        + 'default combiners cannot be uncombined, use `unregister` instead.',
      );
    }
    if (Object.keys(this.combiners[hash].subscriptions).length > 0) {
      throw new Error(
        `Could not uncombine combiner with hash "${hash}": `
        + 'all the related subscriptions must be unsubscribed first.',
      );
    }
    // Removing all the references to this combiner in modules...
    this.combiners[hash].modulesHashes.forEach((moduleHash) => {
      const index = this.modules[moduleHash].combiners.indexOf(hash);
      this.modules[moduleHash].combiners.splice(index, 1);
    });
    delete (this.combiners[hash]);
  }

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
  public subscribe(hash: string, handler: Subscription): string {
    const combiner = this.combiners[hash];
    if (combiner === undefined) {
      throw new Error(
        `Could not subscribe to combiner with hash "${hash}": `
        + 'combiner does not exist.',
      );
    }
    const subscriptionId = this.generateSubscriptionId();
    combiner.subscriptions[subscriptionId] = handler;
    // We trigger the notification a first time with "initial" states.
    const states = combiner.modulesHashes.map((moduleHash) => this.modules[moduleHash].state);
    handler(combiner.reducer(...states));
    return subscriptionId;
  }

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
  public unsubscribe(hash: string, subscriptionId: string): void {
    const combiner = this.combiners[hash];
    if (combiner === undefined) {
      throw new Error(
        `Could not unsubscribe from combiner with hash "${hash}": `
        + 'combiner does not exist.',
      );
    }
    if (combiner.subscriptions[subscriptionId] === undefined) {
      throw new Error(
        `Could not unsubscribe from combiner with hash "${hash}": `
        + `subscription id "${subscriptionId}" does not exist.`,
      );
    }
    delete (combiner.subscriptions[subscriptionId]);
  }

  /**
   * Performs a state mutation on a module.
   *
   * @param {string} hash Hash of the module on which to perform mutation.
   *
   * @param {string} name Name of the mutation to perform.
   *
   * @param {Json} [data] Additional data to pass to the mutation.
   *
   * @returns {void}
   *
   * @throws {Error} If there is no module registered with the given hash.
   *
   * @throws {Error} If mutation's name does not exist on registered module.
   *
   * @throws {Error} If mutation is not a pure function.
   */
  public mutate(hash: string, name: string, data?: Json): void {
    const registeredModule = this.modules[hash];
    if (registeredModule === undefined) {
      throw new Error(
        `Could not perform mutation on module with hash "${hash}": `
        + 'module does not exist.',
      );
    }
    if (registeredModule.mutations[name] === undefined) {
      throw new Error(
        `Could not perform mutation on module with hash "${hash}": `
        + `mutation "${name}" does not exist.`,
      );
    }

    const newState = registeredModule.mutations[name]({
      hash,
      state: registeredModule.state,
      mutate: this.mutate.bind(this),
    }, data);

    const isPrimitive = !isPlainObject(newState) && !Array.isArray(newState);
    if (newState === registeredModule.state && isPrimitive === false) {
      throw new Error(
        `Could not perform mutation on module with hash "${hash}": `
        + 'new state must be a deep copy of module\'s state.',
      );
    }

    registeredModule.state = newState;

    // Notifying all the middlewares of the changes...
    this.middlewares.forEach((middleware) => {
      middleware(newState);
    });

    // Notifying all the combiners' subscriptions of the changes...
    registeredModule.combiners.forEach((combinerHash) => {
      const combiner = this.combiners[combinerHash];
      const states = combiner.modulesHashes.map((moduleHash) => this.modules[moduleHash].state);
      const finalState = combiner.reducer(...states);
      // All subscriptions are called asynchronously to avoid the "mutation in mutation" effect,
      // which happens when performing a mutation on a module inside a subscription to that
      // same module, making any other subscription receiving updates in the wrong order.
      Object.keys(combiner.subscriptions).forEach((subscriptionId) => setTimeout(() => {
        // In some cases, when unsubscribing from a module and mutating it at the same time,
        // subscriptions may be removed while they are triggered. We ensure they still exist
        // before actually calling them.
        /* istanbul ignore next */
        if (combiner.subscriptions[subscriptionId] !== undefined) {
          (combiner.subscriptions[subscriptionId])(finalState);
        }
      }));
    });
  }

  /**
   * Dispatches an asynchronous action to a registered module.
   *
   * @param {string} hash Hash of the module to dispatch action on.
   *
   * @param {string} name Name of the action to perform.
   *
   * @param {Json} [data] Additional data to pass to the action.
   *
   * @returns {void}
   *
   * @throws {Error} If there is no module registered with the given hash.
   *
   * @throws {Error} If action's name does not exist on registered module.
   */
  public dispatch(hash: string, name: string, data?: Json): void {
    const registeredModule = this.modules[hash];
    if (registeredModule === undefined) {
      throw new Error(
        `Could not dispatch action to module with hash "${hash}": `
        + 'module does not exist.',
      );
    }
    if (registeredModule.actions[name] === undefined) {
      throw new Error(
        `Could not dispatch action to module with hash "${hash}": `
        + `action "${name}" does not exist.`,
      );
    }
    registeredModule.actions[name]({
      hash,
      mutate: this.mutate.bind(this),
      dispatch: this.dispatch.bind(this),
      combine: this.combine.bind(this),
      uncombine: this.uncombine.bind(this),
      register: this.register.bind(this),
      unregister: this.unregister.bind(this),
    }, data);
  }

  /**
   * Applies the given middleware to the store.
   *
   * @param {Subscription} middleware Middleware to apply to store.
   *
   * @returns {void}
   */
  public use(middleware: Subscription): void {
    this.middlewares.push(middleware);
  }
}
