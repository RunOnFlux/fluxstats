<template>
  <div class="bootstrap-switch bootstrap-switch-wrapper bootstrap-switch-animate" :class="switchClass">
    <div class="bootstrap-switch-container" @click="triggerToggle()">
      <span class="bootstrap-switch-handle-on " :class="`bootstrap-switch-${color}`">
        <slot name="on">
            {{onText}}
        </slot>
      </span>
      <span class="bootstrap-switch-label"></span>
      <span class="bootstrap-switch-handle-off bootstrap-switch-default">
        <slot name="off">
            {{offText}}
        </slot>
      </span>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'l-switch',
    props: {
      value: [Array, Boolean],
      onText: String,
      offText: String,
      color: {
        type: String,
        default: '',
        validator: (value) => {
          return ['', 'blue', 'azure', 'green', 'orange', 'red', 'purple', 'black'].includes(value)
        }
      }
    },
    computed: {
      switchClass () {
        let base = 'bootstrap-switch-'
        let state = this.model ? 'on' : 'off'
        let classes = base + state
        if (this.color) {
          classes = `${classes} ${base}${this.color}`
        }
        return classes
      },
      model: {
        get () {
          return this.value
        },
        set (value) {
          this.$emit('input', value)
        }
      }
    },
    methods: {
      triggerToggle () {
        this.model = !this.model
      }
    }
  }
</script>
<style>
</style>
