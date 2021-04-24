import Store from 'diox';
import router from 'diox/extensions/router';

const store = new Store();
store.register('router', router(['/', '/test', '/test2']));

export default store;
