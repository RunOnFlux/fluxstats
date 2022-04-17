<template>
  <li>
    <slot name="badge">
      <div
        class="timeline-badge"
        :class="badgeType"
      >
        <i :class="badgeIcon" />
      </div>
    </slot>
    <div class="timeline-panel">
      <div class="timeline-heading">
        <slot name="header" />
      </div>
      <div class="timeline-body">
        <slot name="body" />
      </div>
      <h6>
        <slot name="footer" />
      </h6>
    </div>
  </li>
</template>
<script>
export default {
  props: {
    badgeType: {
      type: String,
      default: 'success',
    },
    badgeIcon: {
      type: String,
      default: '',
    },
  },
};
</script>
<style>
</style>
