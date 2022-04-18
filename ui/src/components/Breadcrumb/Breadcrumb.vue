<template>
  <nav
    aria-label="breadcrumb"
    role="navigation"
  >
    <ol class="breadcrumb">
      <slot />
    </ol>
  </nav>
</template>
<script>
export default {
  name: 'Breadcrumb',
};
</script>
<style>
</style>
