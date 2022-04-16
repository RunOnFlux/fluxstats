<template>
  <div class='container-fluid'>
    <div class='row'>
      <div class='col-md-12'>
        <h3 class='text-center'>
          World Map<br/>
          <small>
            Looks great on any resolution. Made by our friends from <a target='_blank' href='http://datamaps.github.io/'>Data Maps</a>.
          </small>
        </h3>
        <div class='card card-plain'>
          <div class='card-content'>
           <world-map></world-map>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import WorldMap from './WorldMap.vue'
  export default{
    components: {
      WorldMap
    }
  }
</script>
<style>
  #worldMap {
    width: 100%;
    height: 500px;
  }
</style>
