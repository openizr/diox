import Store, { Module } from 'diox';
import router, { RoutingContext } from 'diox/extensions/router';

interface Test {
  test: string;
}

const store = new Store();
store.register<RoutingContext>('router', router(['/', '/test', '/test2']));
store.subscribe<RoutingContext>('router', (newState) => newState);
store.use<Test>((newState) => newState);
const a: Module<Test> = {
  state: {
    test: 'ok',
  },
  mutations: {
    test({ state }) {
      return { ...state };
    },
  },
  actions: {},
};
store.register('test', a);

store.combine('test2', ['test'], (s1: Test) => ({
  ok: 'test',
  ...s1,
}));

export default store;
