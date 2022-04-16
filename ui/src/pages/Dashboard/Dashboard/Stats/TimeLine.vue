<template>
  <div class="card card-timeline card-plain">
    <div class="card-content">
      <ul class="timeline" :class="{'timeline-simple': type === 'simple'}">
        <slot></slot>
      </ul>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      type: {
        type: String,
        default: ''
      }
    }
  }
</script>
<style>
</style>
