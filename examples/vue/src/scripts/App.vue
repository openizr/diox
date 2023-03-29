<script lang="ts" setup>
import store from 'scripts/store';
import connect from 'diox/connectors/vue';

const useCombiner = connect(store);
const router = useCombiner('router');

function goToTestPage(): void {
  store.mutate('router', 'NAVIGATE', '/test');
}
function goToHomePage(): void {
  store.mutate('router', 'NAVIGATE', '/');
}
</script>

<template>
  <section>
    <p>You are here: {{ `http://localhost:5030${router.route}` }}</p>
    <button
      v-if="router.route === '/'"
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
