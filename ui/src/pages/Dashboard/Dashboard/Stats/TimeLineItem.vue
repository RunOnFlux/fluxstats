<template>
  <li>
    <slot name="badge">
      <div class="timeline-badge" :class="badgeType">
        <i :class="badgeIcon"></i>
      </div>
    </slot>
    <div class="timeline-panel">
      <div class="timeline-heading">
        <slot name="header"></slot>
      </div>
      <div class="timeline-body">
        <slot name="body"></slot>
      </div>
      <h6>
        <slot name="footer"></slot>
      </h6>
    </div>
  </li>
</template>
<script>
  export default {
    props: {
      badgeType: {
        type: String,
        default: 'success'
      },
      badgeIcon: {
        type: String,
        default: ''
      }
    }
  }
</script>
<style>
</style>
