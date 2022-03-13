import * as React from 'react';
import store from 'scripts/store';
import * as ReactDOM from 'react-dom';
import connect from 'diox/connectors/react';

const useCombiner = connect(store);

const goToTestPage = (): void => {
  store.mutate('router', 'NAVIGATE', '/test');
};

const goToHomePage = (): void => {
  store.mutate('router', 'NAVIGATE', '/');
};

function Component(): JSX.Element {
  const router = useCombiner<{ route: string; query: Record<string, string>; }>('router', (newState) => ({ route: newState.route, query: {} }));
  return (
    <section>
      <p>{`You are here: http://localhost:5030${router.route}`}</p>
      {(router.route === '/')
        ? (
          <button type="button" onClick={goToTestPage}>
            Go to /test page
          </button>
        )
        : (
          <button type="button" onClick={goToHomePage}>
            Go to / page
          </button>
        )}
    </section>
  );
}

function main(): void {
  ReactDOM.render(<Component />, document.querySelector('#root'));
}

// Ensures DOM is fully loaded before running app's main logic.
// Loading hasn't finished yet...
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
  // `DOMContentLoaded` has already fired...
} else {
  main();
}

// Ensures subscriptions to Store are correctly cleared when page is left, to prevent "ghost"
// processing, by manually unmounting Vue components tree.
window.addEventListener('beforeunload', () => {
  ReactDOM.unmountComponentAtNode(document.querySelector('#root') as Element);
});
