<template>
  <li
    class="breadcrumb-item"
    :class="{active: active}"
  >
    <slot />
  </li>
</template>
<script>
export default {
  name: 'BreadcrumbItem',
  props: {
    active: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style>
</style>
