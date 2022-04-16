<template>
  <div class="form-group"
       :class="[
       {'input-group': hasIcon},
       {'has-right-slot': addonRightIcon || this.$slots.addonRight},
       {'has-error': error},
       {'input-group-focus': focused},
       {'has-label': label || $slots.label},
       {'has-success': !error && touched && hadError}]">
    <slot name="label">
      <label v-if="label" :class="labelClasses">
        {{label}}
        <span v-if="required">*</span>
      </label>
    </slot>

    <span v-if="addonLeftIcon || $slots.addonLeft" class="input-group-addon input-group-prepend">
      <slot name="addonLeft">
        <i :class="addonLeftIcon"></i>
      </slot>
    </span>
    <slot>
      <input
        :value="value"
        v-on="listeners"
        v-bind="$attrs"
        class="form-control"
        :class="[{valid: value && !error}, inputClasses]"
        aria-describedby="addon-right addon-left">
    </slot>
    <span v-if="addonRightIcon || $slots.addonRight" class="input-group-addon input-group-append">
      <slot name="addonRight">
        <i :class="addonRightIcon"></i>
      </slot>
    </span>

    <slot name="infoBlock"></slot>
    <slot name="helpBlock">
      <div class="text-danger invalid-feedback" style="display: block;" :class="{'mt-2': hasIcon}" v-if="error">
        {{ error }}
      </div>
    </slot>
  </div>
</template>
<script>
  export default {
    inheritAttrs: false,
    name: 'fg-input',
    props: {
      required: Boolean,
      label: String,
      error: String,
      labelClasses: String,
      inputClasses: String,
      value: [String, Number],
      addonRightIcon: String,
      addonLeftIcon: String
    },
    data () {
      return {
        touched: false,
        focused: false,
        hadError: false
      }
    },
    computed: {
      listeners () {
        return {
          ...this.$listeners,
          input: this.updateValue,
          focus: this.onFocus,
          blur: this.onBlur
        }
      },
      hasIcon () {
        const {addonRight, addonLeft} = this.$slots
        return addonRight !== undefined || addonLeft !== undefined || this.addonRightIcon !== undefined || this.addonLeftIcon !== undefined
      }
    },
    methods: {
      updateValue (evt) {
        let value = evt.target.value
        if (!this.touched && value) {
          this.touched = true
        }
        this.$emit('input', value)
      },
      onFocus (value) {
        this.focused = true
        this.$emit('focus', value)
      },
      onBlur (value) {
        this.focused = false
        this.$emit('blur', value)
      }
    },
    watch: {
      error (value) {
        if (value) {
          this.hadError = true
        }
      }
    }
  }
</script>
<style>
  .input-group.has-right-slot input{
    border-right: 0;
  }

</style>
