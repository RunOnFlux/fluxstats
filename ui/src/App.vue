<template>
  <router-view />
</template>

<script>
import Flux from './pages/Dashboard/Components/Flux.vue';

export default {
  mounted() {
    this.$notify(
      {
        component: Flux,
        icon: 'nc-icon nc-app',
      },
    );
  },
};
</script>
