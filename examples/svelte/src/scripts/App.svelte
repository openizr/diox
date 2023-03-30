<script lang="ts">
  import store from 'scripts/store';
  import connect from 'diox/connectors/svelte';
  import { RoutingContext } from 'diox/extensions/router';

  const useSubscription = connect(store);
  const router = useSubscription('router', (newState: RoutingContext) => ({
    test: newState.route,
  }));

  function goToTestPage(): void {
    store.mutate('router', 'NAVIGATE', '/test');
  }
  function goToHomePage(): void {
    store.mutate('router', 'NAVIGATE', '/');
  }
</script>

<section>
  <p>You are here: {`http://localhost:5030${$router.test}`}</p>
  {#if $router.test === '/'}
    <button on:click={goToTestPage}> Go to /test page </button>
  {:else}
    <button on:click={goToHomePage}> Go to / page </button>
  {/if}
</section>
