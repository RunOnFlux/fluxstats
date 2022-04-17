<template>
  <div class="notifications">
    <transition-group
      :name="transitionName"
      :mode="transitionMode"
    >
      <notification
        v-for="notification in notifications"
        v-bind="notification"
        :key="notification.timestamp.getTime()"
        :click-handler="notification.onClick"
        @close="removeNotification"
      />
    </transition-group>
  </div>
</template>
<script>
import Notification from './Notification.vue';

export default {
  components: {
    Notification,
  },
  props: {
    transitionName: {
      type: String,
      default: 'list',
    },
    transitionMode: {
      type: String,
      default: 'in-out',
    },
    overlap: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      notifications: this.$notifications.state,
    };
  },
  watch: {
    overlap(newVal) {
      this.$notifications.settings.overlap = newVal;
    },
  },
  created() {
    this.$notifications.settings.overlap = this.overlap;
  },
  methods: {
    removeNotification(timestamp) {
      this.$notifications.removeNotification(timestamp);
    },
  },
};
</script>
<style lang="scss">
.notifications {
  .list-move {
    transition: transform 0.3s, opacity 0.4s;
  }
  .list-item {
    display: inline-block;
  }
  .list-enter-active {
    transition: transform 0.2s ease-in, opacity 0.4s ease-in;
  }
  .list-leave-active {
    transition: transform 1s ease-out, opacity 0.4s ease-out;
  }

  .list-enter {
    opacity: 0;
    transform: scale(1.1);
  }
  .list-leave-to {
    opacity: 0;
    transform: scale(1.2, 0.7);
  }
}
</style>
