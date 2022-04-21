<template>
  <div
    class="form-check form-check-radio"
    :class="inlineClass"
  >
    <label
      :for="cbId"
      class="form-check-label"
    >
      <input
        :id="cbId"
        v-model="model"
        class="form-check-input"
        type="radio"
        :disabled="disabled"
        :value="label"
      >
      <span class="form-check-sign" />
      <slot />
    </label>
  </div>
</template>
<script>
export default {
  name: 'LRadio',
  props: {
    label: {
      type: [String, Number],
      default: [],
    },
    disabled: {
      type: [Boolean, String],
      default: [],
    },
    value: {
      type: [String, Boolean],
      default: [],
    },
    inline: Boolean,
  },
  data() {
    return {
      cbId: '',
    };
  },
  computed: {
    model: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
    inlineClass() {
      if (this.inline) {
        return 'radio-inline';
      }
      return '';
    },
  },
  created() {
    this.cbId = Math.random().toString(16).slice(2);
  },
};
</script>
