import * as React from 'react';
import store from 'scripts/store';
import * as ReactDOM from 'react-dom';
import useStore from 'diox/connectors/react';

const [useCombiner, mutate] = useStore(store);

const goToTestPage = (): void => {
  mutate('router', 'NAVIGATE', '/test');
};

const goToHomePage = (): void => {
  mutate('router', 'NAVIGATE', '/');
};

const Component = (): JSX.Element => {
  const [router] = useCombiner<{ route: string; query: Record<string, string>; }>('router', (newState) => ({
    route: newState.route,
    query: {},
  }));
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
};

// Webpack HMR interface.
interface ExtendedNodeModule extends NodeModule {
  hot: { accept: () => void };
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

// Enables Hot Module Rendering.
if ((module as ExtendedNodeModule).hot) {
  (module as ExtendedNodeModule).hot.accept();
}
