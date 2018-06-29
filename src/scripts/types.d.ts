/**
 * Copyright 2018 - present, Matthieu Jabbour <matthieu.jabbour@gmail.com>.
 * All rights reserved.
 */


type mixed = any;


/** Subscription to modules' states changes. */
type subscription = (newState : mixed) => void;


/** Global state's exposed API as argument. */
interface MutateExposedAPI {
  hash : string;
  state : mixed;
  mutate : (hash : string, mutation : mixed) => void;
}


/** Global state's exposed API as argument. */
interface DispatchExposedAPI {
  hash : string;
  mutate : (hash : string, mutation : mixed) => void;
  dispatch : (hash : string, action : mixed) => void;
  register : (module : Module) => string;
  unregister : (hash : string) => void;
  combine : (hash : string, mapper : Mapper) => string;
  uncombine : (hash : string) => void;
}


/** Global state's registered module type declaration. */
interface RegisteredModule {
  state : mixed;
  mutator : (exposedAPI : MutateExposedAPI, mutation : mixed) => mixed;
  dispatcher : (exposedAPI : DispatchExposedAPI, action : mixed) => void;
  combiners : string[];
}


/** Combiner type declaration. */
interface Combiner {
  mapper : Mapper;
  // User-defined subscriptions.
  subscriptions : ((newState : mixed) => void)[];
}


/** Store's combiners list, indexed by their hash. */
interface Combiners {
  [hash : string] : Combiner;
}

/** Store's modules list, indexed by their hash. */
interface RegisteredModules {
  [hash : string] : RegisteredModule;
}


/** Global state's module type declaration. */
export interface Module {
  mutator : (exposedAPI : MutateExposedAPI, mutation : mixed) => mixed;
  dispatcher? : (exposedAPI : DispatchExposedAPI, action : mixed) => void;
}


/** Combiner's mapper type declaration. */
export interface Mapper {
  // Hash of each combined module, along with a function of its state.
  [key : string] : (newState : mixed) => mixed;
}


/**
 * Global state manager.
 * Contains all the sub-states, combiners and their subscriptions.
 */
export class Store {

  /** List of store middlewares. */
  private middlewares : subscription[];

  /** List of store combiners. */
  private combiners : Combiners;

  /** Global modules register. */
  private modules : RegisteredModules;


  /**
   * Class constructor.
   *
   * @returns {void}
   */
  public constructor();


  /**
   * Registers a new module into the global state register.
   *
   * @param {string} hash Hash uniquely identifying module to register. Can be any string, although
   * it is recommended to follow a tree-structure pattern, e.g. `/my_app/module_a/module_b`.
   *
   * @param {Module} module New module to register.
   *
   * @returns {string} The newly registered module's hash.
   *
   * @throws {Error} If a module with the same hash is already registered.
   */
  public register(hash : string, module : Module) : string;


  /**
   * Unregisters a module from the global modules register.
   *
   * @param {string} hash Hash of the module to unregister.
   *
   * @returns {void}
   *
   * @throws {Error} If there is no module registered with the given hash.
   *
   * @throws {Error} If module still has related user-defined combiners.
   */
  public unregister(hash : string) : void;


  /**
   * Combines one or several modules to allow subscriptions on that combination.
   *
   * @param {string} hash Hash uniquely identifying the combiner. Can be any string, although
   * it is recommended to follow a tree-structure pattern, e.g. `/my_app/module_a/module_b`.
   *
   * @param {Mapper} mapper Contains transformation functions, indexed by their related module hash.
   * Each transformation function is called with a `newState` parameter, which contains the current
   * module's state. For instance :
   * { '/my_app/my_module': (newState) => ({ prop: newState.prop }) }
   *
   * @returns {string} The new combiner's hash.
   *
   * @throws {Error} If one of the specified mapped hash does not correspond to a registered module.
   */
  public combine(hash : string, mapper : Mapper) : string;


  /**
   * Uncombines a user-defined combiner.
   *
   * @param {string} hash Hash of the combiner to uncombine.
   *
   * @returns {void}
   *
   * @throws {Error} If the given hash corresponds to a default combiner.
   *
   * @throws {Error} If there is no combiner created with the given hash.
   */
  public uncombine(hash : string) : void;


  /**
   * Subscribes to changes on a combiner.
   *
   * @param {string} hash Hash of the combiner to subscribe to.
   *
   * @param {subscription} handler Callback to execute each time combiner notifies changes.
   *
   * @returns {number} The subscription id, used to unsubscribe handler.
   *
   * @throws {Error} If there is no combiner created with the given hash.
   */
  public subscribe(hash : string, handler : subscription) : number;


  /**
   * Unsubscribes from a combiner changes.
   * @param {string} hash Hash of the combiner to unsubscribe from.
   *
   * @param {number} handlerId Id of the subscribed handler.
   *
   * @returns {void}
   *
   * @throws {Error} If there is no combiner created with the given hash.
   */
  public unsubscribe(hash : string, handlerId : number) : void;


  /**
   * Performs a state mutation on a module.
   *
   * @param {string} hash Hash of the module on which to perform mutation.
   *
   * @param {mixed} mutation Contains all the information about mutation to perform.
   *
   * @returns {void}
   *
   * @throws {Error} If there is no module registered with the given hash.
   */
  public mutate(hash : string, mutation : mixed) : void;


  /**
   * Dispatches an asynchronous action to a registered module.
   *
   * @param {string} hash Hash of the module to dispatch action on.
   *
   * @param {mixed} action Contains all the information about the action to dispatch.
   *
   * @returns {void}
   *
   * @throws {Error} If there is no module registered with the given hash.
   */
  public dispatch(hash : string, action : mixed) : void;


  /**
   * Applies the given middleware to the store.
   *
   * @param {subscription} middleware Middleware to apply to store.
   *
   * @returns {void}
   */
  public use(middleware : subscription) : void;

}
