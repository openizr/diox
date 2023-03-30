import * as React from 'react';
import store from 'scripts/store';
import connect from 'diox/connectors/react';
import { createRoot, Root } from 'react-dom/client';
import { RoutingContext } from 'diox/extensions/router';

type JSXElement = any; // eslint-disable-line @typescript-eslint/no-explicit-any

let app: Root;

const useSubscription = connect(store);

const goToTestPage = (): void => {
  store.mutate('router', 'NAVIGATE', '/test');
};

const goToHomePage = (): void => {
  store.mutate('router', 'NAVIGATE', '/');
};

function Component(): JSX.Element {
  const router = useSubscription<{ route: string | null; query: Record<string, string>; }>('router', (newState: RoutingContext) => ({ route: newState.route, query: {} }));
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
  app = createRoot(document.querySelector('#root') as HTMLElement);
  const StrictMode = React.StrictMode as JSXElement;
  app.render(
    <StrictMode>
      <Component />
    </StrictMode>,
  );
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
  app.unmount();
});
