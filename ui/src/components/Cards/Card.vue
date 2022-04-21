<template>
  <div class="card">
    <div
      v-if="$slots.image"
      class="card-image"
    >
      <slot name="image" />
    </div>
    <div
      v-if="$slots.header || title"
      class="card-header"
    >
      <slot name="header">
        <h4 class="card-title">
          {{ title }}
        </h4>
        <p class="card-category">
          {{ subTitle }}
        </p>
      </slot>
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      class="card-footer"
    >
      <hr>
      <slot name="footer" />
    </div>
  </div>
</template>
<script>
export default {
  name: 'Card',
  props: {
    title: {
      type: String,
      default: '',
    },
    subTitle: {
      type: String,
      default: '',
    },
  },
};
</script>
<style>
</style>
