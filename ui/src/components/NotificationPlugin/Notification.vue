<template>
  <div
    data-notify="container"
    class="alert open"
    :class="[
      { 'alert-with-icon': icon },
      verticalAlign,
      horizontalAlign,
      alertType
    ]"
    role="alert"
    :style="customPosition"
    data-notify-position="top-center"
    @click="tryClose"
    @keydown="pressed"
  >
    <button
      v-if="showClose"
      type="button"
      aria-hidden="true"
      class="close col-xs-1"
      data-notify="dismiss"
      @click="close"
    >
      <i class="nc-icon nc-simple-remove" />
    </button>

    <span
      v-if="icon"
      data-notify="icon"
      :class="['alert-icon', icon]"
    />
    <span data-notify="message">
      <span
        v-if="title"
        class="title"
      ><b>{{ title }}<br></b></span>
      <div>{{ message }}</div>
      <span />
      <content-render
        v-if="!message && component"
        :component="component"
      />
    </span>
  </div>
</template>
<script>
export default {
  name: 'Notification',
  components: {
    contentRender: {
      props: ['component'],
      render(h) {
        // register component locally if it's not registered
        const componentsObj = this.$options.components;
        if (!componentsObj[this.component.name]) {
          componentsObj[this.component.name] = this.component;
        }
        return h(this.component);
      },
    },
  },
  props: {
    message: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    verticalAlign: {
      type: String,
      default: 'top',
      validator: (value) => {
        const acceptedValues = ['top', 'bottom'];
        return acceptedValues.indexOf(value) !== -1;
      },
    },
    horizontalAlign: {
      type: String,
      default: 'right',
      validator: (value) => {
        const acceptedValues = ['left', 'center', 'right'];
        return acceptedValues.indexOf(value) !== -1;
      },
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => {
        const acceptedValues = [
          'info',
          'primary',
          'danger',
          'warning',
          'success',
        ];
        return acceptedValues.indexOf(value) !== -1;
      },
    },
    timeout: {
      type: Number,
      default: 5000,
      validator: (value) => value >= 0,
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
    },
    component: {
      type: [Object, Function],
      default() {
        return [];
      },
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    closeOnClick: {
      type: Boolean,
      default: true,
    },
    clickHandler: {
      type: Function,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      elmHeight: 0,
    };
  },
  computed: {
    hasIcon() {
      return this.icon && this.icon.length > 0;
    },
    alertType() {
      return `alert-${this.type}`;
    },
    customPosition() {
      const initialMargin = 20;
      const alertHeight = this.elmHeight + 10;
      let sameAlertsCount = this.$notifications.state.filter((alert) => (
        alert.horizontalAlign === this.horizontalAlign
          && alert.verticalAlign === this.verticalAlign
          && alert.timestamp <= this.timestamp
      )).length;
      if (this.$notifications.settings.overlap) {
        sameAlertsCount = 1;
      }
      const pixels = (sameAlertsCount - 1) * alertHeight + initialMargin;
      const styles = {};
      if (this.verticalAlign === 'top') {
        styles.top = `${pixels}px`;
      } else {
        styles.bottom = `${pixels}px`;
      }
      return styles;
    },
  },
  mounted() {
    this.elmHeight = this.$el.clientHeight;
    if (this.timeout) {
      setTimeout(this.close, this.timeout);
    }
  },
  methods: {
    close() {
      this.$emit('close', this.timestamp);
    },
    tryClose(evt) {
      if (this.clickHandler) {
        this.clickHandler(evt, this);
      }
      if (this.closeOnClick) {
        this.close();
      }
    },
  },
};
</script>
<style lang="scss">
.notifications .alert {
  position: fixed;
  z-index: 10000;

  &[data-notify="container"] {
    width: 400px;
  }

  &.center {
    margin: 0 auto;
  }
  &.left {
    left: 20px;
  }
  &.right {
    right: 20px;
  }
}
</style>
