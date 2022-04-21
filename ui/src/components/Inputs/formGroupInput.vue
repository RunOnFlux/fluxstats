<template>
  <div
    class="form-group"
    :class="[
      {'input-group': hasIcon},
      {'has-right-slot': addonRightIcon || $slots.addonRight},
      {'has-error': error},
      {'input-group-focus': focused},
      {'has-label': label || $slots.label},
      {'has-success': !error && touched && hadError}]"
  >
    <slot name="label">
      <label
        v-if="label"
        :class="labelClasses"
      >
        {{ label }}
        <span v-if="required">*</span>
      </label>
    </slot>

    <span
      v-if="addonLeftIcon || $slots.addonLeft"
      class="input-group-addon input-group-prepend"
    >
      <slot name="addonLeft">
        <i :class="addonLeftIcon" />
      </slot>
    </span>
    <slot>
      <input
        :value="value"
        v-bind="$attrs"
        class="form-control"
        :class="[{valid: value && !error}, inputClasses]"
        aria-describedby="addon-right addon-left"
        v-on="listeners"
      >
    </slot>
    <span
      v-if="addonRightIcon || $slots.addonRight"
      class="input-group-addon input-group-append"
    >
      <slot name="addonRight">
        <i :class="addonRightIcon" />
      </slot>
    </span>

    <slot name="infoBlock" />
    <slot name="helpBlock">
      <div
        v-if="error"
        class="text-danger invalid-feedback"
        style="display: block;"
        :class="{'mt-2': hasIcon}"
      >
        {{ error }}
      </div>
    </slot>
  </div>
</template>
<script>
export default {
  name: 'FgInput',
  inheritAttrs: false,
  props: {
    required: Boolean,
    label: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: '',
    },
    labelClasses: {
      type: String,
      default: '',
    },
    inputClasses: {
      type: String,
      default: '',
    },
    value: {
      type: [String, Number],
      default() {
        return [];
      },
    },
    addonRightIcon: {
      type: String,
      default: '',
    },
    addonLeftIcon: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      touched: false,
      focused: false,
      hadError: false,
    };
  },
  computed: {
    listeners() {
      return {
        ...this.$listeners,
        input: this.updateValue,
        focus: this.onFocus,
        blur: this.onBlur,
      };
    },
    hasIcon() {
      const { addonRight, addonLeft } = this.$slots;
      return addonRight !== undefined || addonLeft !== undefined || this.addonRightIcon !== undefined || this.addonLeftIcon !== undefined;
    },
  },
  watch: {
    error(value) {
      if (value) {
        this.hadError = true;
      }
    },
  },
  methods: {
    updateValue(evt) {
      const { value } = evt.target;
      if (!this.touched && value) {
        this.touched = true;
      }
      this.$emit('input', value);
    },
    onFocus(value) {
      this.focused = true;
      this.$emit('focus', value);
    },
    onBlur(value) {
      this.focused = false;
      this.$emit('blur', value);
    },
  },
};
</script>
<style>
.input-group.has-right-slot input {
  border-right: 0;
}
</style>
