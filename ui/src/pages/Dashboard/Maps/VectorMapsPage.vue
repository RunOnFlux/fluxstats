<template>
  <vector-map></vector-map>
</template>
<script>
  /*  We lazy load (async) the VectorMaps component because it contains 2 big libraries (jquery and fullcalendar)
      If the component is not loaded within 100ms, we display a loading component in the meanwhile.
      This way, we don't bloat the main bundle with 2 unnecessary libs that we only need for this page :)
   */
  import Loading from 'src/pages/Dashboard/Layout/LoadingMainPanel.vue'
  const VectorMap = () => ({
    component: import('./VectorMaps.vue'),
    loading: Loading,
    delay: 200
  })
  export default {
    components: {
      VectorMap
    }
  }
</script>
<style>
</style>
