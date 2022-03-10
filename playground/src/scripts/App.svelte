<script lang="ts">
  import store from 'scripts/store';
  import connect from 'diox/connectors/svelte';

  const useCombiner = connect(store);
  const router = useCombiner<{ test: string }>('router', (newState) => ({
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
