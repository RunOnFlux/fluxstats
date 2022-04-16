<template>
  <router-view></router-view>
</template>

<script>
  import NotificationSample from 'src/pages/Dashboard/Components/NotificationSample';
  export default {
    mounted () {
      this.$notify(
        {
          component: NotificationSample,
          icon: 'nc-icon nc-app'
        })
    }
  }
</script>