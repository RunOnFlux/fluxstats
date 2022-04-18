<template>
  <router-view />
</template>

<script>
import NotificationSample from './pages/Dashboard/Components/NotificationSample.vue';

export default {
  mounted() {
    this.$notify(
      {
        component: NotificationSample,
        icon: 'nc-icon nc-app',
      },
    );
  },
};
</script>
