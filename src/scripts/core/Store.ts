/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  mixed,
  Module,
  Mapper,
  Combiner,
  subscription,
  RegisteredModule,
} from 'scripts/types';

/**
 * Global state manager.
 * Contains all the sub-states, combiners and their subscriptions.
 */
export default class Store {
  /** List of store middlewares. */
  private middlewares: subscription[];

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
      state: { ...module.state },
      mutations: {
        ...module.mutations,
        DIOX_INITIALIZE: ({ state }): Record<string, mixed> => ({ ...state }),
      },
      actions: module.actions || {},
      // Storing related combiners' hashes makes it easier to notify them after mutating module.
      combiners: [],
    };
    // A default combiner with the same hash as the module is always created first.
    this.combine(hash, { [hash]: (newState) => newState });
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
   * @param {Mapper} mapper Contains transformation functions, indexed by their related module hash.
   * Each transformation function is called with a `newState` parameter, which contains the current
   * module's state. For instance :
   * { '/my_app/my_module': (newState) => ({ prop: newState.prop }) }
   *
   * @returns {string} Combiner's hash.
   *
   * @throws {Error} If a combiner with the same hash already exists in registry.
   *
   * @throws {Error} If one of the mapped hashes does not correspond to a registered module.
   */
  public combine(hash: string, mapper: Mapper): string {
    if (this.combiners[hash] !== undefined) {
      throw new Error(
        `Could not create combiner with hash "${hash}": `
        + 'another combiner with the same hash already exists.',
      );
    }
    Object.keys(mapper).forEach((moduleHash) => {
      if (this.modules[moduleHash] === undefined) {
        throw new Error(
          `Could not create combiner with hash "${hash}": `
          + `mapped module with hash "${moduleHash}" does not exist.`,
        );
      }
      this.modules[moduleHash].combiners.push(hash);
    });
    this.combiners[hash] = {
      mapper,
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
        + 'default combiners cannot be uncombined.',
      );
    }
    if (Object.keys(this.combiners[hash].subscriptions).length > 0) {
      throw new Error(
        `Could not uncombine combiner with hash "${hash}": `
        + 'all the related subscriptions must be unsubscribed first.',
      );
    }
    // Removing all the references to this combiner in modules...
    Object.keys(this.combiners[hash].mapper).forEach((moduleHash) => {
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
   * @param {subscription} handler Callback to execute each time combiner notifies changes.
   *
   * @returns {string} The subscription id, used to unsubscribe handler.
   *
   * @throws {Error} If there is no combiner created with the given hash.
   */
  public subscribe(hash: string, handler: subscription): string {
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
    const mappedModules = Object.keys(combiner.mapper);
    const combinedState = mappedModules.reduce((state, moduleHash) => {
      const moduleState = this.modules[moduleHash].state;
      return Object.assign(state, combiner.mapper[moduleHash](moduleState));
    }, {});
    handler(combinedState);
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
   * @param {mixed} [data] Additional data to pass to the mutation.
   *
   * @returns {void}
   *
   * @throws {Error} If there is no module registered with the given hash.
   *
   * @throws {Error} If mutation's name does not exist on registered module.
   *
   * @throws {Error} If mutation is not a pure function.
   */
  public mutate(hash: string, name: string, data?: mixed): void {
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

    if (newState === registeredModule.state) {
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
    registeredModule.combiners.forEach((combiner) => {
      const mappedModules = Object.keys(this.combiners[combiner].mapper);
      const combinedState = mappedModules.reduce((state, moduleHash) => {
        const moduleState = this.modules[moduleHash].state;
        return Object.assign(state, this.combiners[combiner].mapper[moduleHash](moduleState));
      }, {});
      Object.keys(this.combiners[combiner].subscriptions).forEach((subscriptionId) => {
        this.combiners[combiner].subscriptions[subscriptionId](combinedState);
      });
    });
  }

  /**
   * Dispatches an asynchronous action to a registered module.
   *
   * @param {string} hash Hash of the module to dispatch action on.
   *
   * @param {string} name Name of the action to perform.
   *
   * @param {mixed} [data] Additional data to pass to the action.
   *
   * @returns {void}
   *
   * @throws {Error} If there is no module registered with the given hash.
   *
   * @throws {Error} If action's name does not exist on registered module.
   */
  public dispatch(hash: string, name: string, data?: mixed): void {
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
   * @param {subscription} middleware Middleware to apply to store.
   *
   * @returns {void}
   */
  public use(middleware: subscription): void {
    this.middlewares.push(middleware);
  }
}
