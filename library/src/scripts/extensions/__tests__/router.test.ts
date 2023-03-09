/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment jsdom
 */

import router, { RoutingContext } from 'scripts/extensions/router';

jest.mock('path-to-regexp');

describe('extensions/router', () => {
  const state: RoutingContext = {
    host: '',
    path: '',
    route: '',
    query: {},
    params: {},
    protocol: '',
  };

  beforeAll(() => {
    window.addEventListener = jest.fn((_event, callback) => (callback as () => void)());
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MATCH = '0';
  });

  test('should correctly initialize the router module', () => {
    const module = router(['/home', '/user/:id']);
    expect(module.state).toEqual({
      host: 'localhost',
      params: {},
      path: '/',
      protocol: 'http',
      query: {},
      route: null,
    });
  });

  test('should display a warning when query string format is not valid', () => {
    const consle = console;
    consle.warn = jest.fn();
    const mutate = jest.fn();
    const module = router(['/home', '/user/:id']);
    const newState = module.mutations.NAVIGATE({ mutate, hash: 'router', state }, '/user/125?qazdzad&azdzad');
    expect(newState.query).toEqual({});
    expect(consle.warn).toHaveBeenCalledWith('Invalid query string "?qazdzad&azdzad".');
  });

  test('should correctly perform mutation on module when navigating to another route', () => {
    process.env.MATCH = '1';
    const mutate = jest.fn();
    const module = router(['/user/:id', '/home']);
    const newState = module.mutations.NAVIGATE({ mutate, hash: 'router', state }, '/user/125?q=ok');
    expect(newState).toEqual({
      host: 'localhost',
      params: { id: '125' },
      path: '/user/125?q=ok',
      protocol: 'http',
      query: { q: 'ok' },
      route: '/user/:id',
    });
  });

  test('should not push new state into history when navigating to the same route', () => {
    const mutate = jest.fn();
    const module = router(['/']);
    const historySpy = jest.spyOn(window.history, 'pushState');
    historySpy.mockImplementation(jest.fn);
    module.mutations.NAVIGATE({ mutate, hash: 'router', state: { ...state, path: '/?q=ok' } }, '/?q=ok');
    expect(window.history.pushState).toBeCalledTimes(0);
    historySpy.mockRestore();
  });

  test('should trigger the POP_STATE mutation each time user navigates through history', () => {
    process.env.MATCH = '3';
    const mutate = jest.fn();
    const module = router(['/home', '/user/:id']);
    module.mutations.NAVIGATE({ mutate, hash: 'router', state }, '/home');
    process.env.MATCH = '2';
    module.mutations.NAVIGATE({ mutate, hash: 'router', state }, '/home');
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith('router', 'POP_STATE');
    const newState = module.mutations.POP_STATE({ mutate, hash: 'router', state });
    expect(newState).toEqual({
      host: 'localhost',
      params: {},
      path: '/home',
      protocol: 'http',
      query: {},
      route: '/home',
    });
  });
});
