<template>
  <section>
    <p>You are here: {{ url }}</p>
    <button
      v-if="route === '/'"
      @click="goToTestPage"
    >
      Go to /test page
    </button>
    <button
      v-else
      @click="goToHomePage"
    >
      Go to / page
    </button>
  </section>
</template>

<script lang="ts">
import store from 'scripts/store';
import useStore from 'diox/connectors/vue';

const [useCombiner, mutate] = useStore(store);

export default useCombiner('router', {
  computed: {
    url(): string {
      return `http://localhost:5030${(this as unknown as { route: string; }).route}`;
    },
  },
  methods: {
    goToTestPage(): void {
      mutate('router', 'NAVIGATE', '/test');
    },
    goToHomePage(): void {
      mutate('router', 'NAVIGATE', '/');
    },
  },
});
</script>
