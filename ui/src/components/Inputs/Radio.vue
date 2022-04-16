<template>
  <div class="form-check form-check-radio" :class="inlineClass">
    <label :for="cbId" class="form-check-label">
      <input :id="cbId"
             class="form-check-input"
             type="radio"
             :disabled="disabled"
             :value="label"
             v-model="model" />
      <span class="form-check-sign">
      </span>
      <slot></slot>
    </label>
  </div>
</template>
<script>
  export default {
    name: 'l-radio',
    props: {
      label: [String, Number],
      disabled: [Boolean, String],
      value: [String, Boolean],
      inline: Boolean
    },
    data () {
      return {
        cbId: ''
      }
    },
    computed: {
      model: {
        get () {
          return this.value
        },
        set (value) {
          this.$emit('input', value)
        }
      },
      inlineClass () {
        if (this.inline) {
          return `radio-inline`
        }
        return ''
      }
    },
    created () {
      this.cbId = Math.random().toString(16).slice(2)
    }
  }
</script>
