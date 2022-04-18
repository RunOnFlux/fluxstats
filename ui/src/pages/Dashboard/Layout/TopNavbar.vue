<template>
  <nav class="navbar navbar-expand-lg ">
    <div class="container-fluid">
      <div class="navbar-minimize">
        <button
          class="btn btn-outline btn-fill btn-round btn-icon d-none d-lg-block"
          @click="minimizeSidebar"
        >
          <i :class="$sidebar.isMinimized ? 'fa fa-ellipsis-v' : 'fa fa-navicon'" />
        </button>
      </div>
      <button
        type="button"
        class="navbar-toggler navbar-toggler-right"
        :class="{toggled: $sidebar.showSidebar}"
        aria-expanded="false"
        @click="toggleSidebar"
      >
        <span class="navbar-toggler-bar burger-lines" />
        <span class="navbar-toggler-bar burger-lines" />
        <span class="navbar-toggler-bar burger-lines" />
      </button>
      <div class="collapse navbar-collapse justify-content-end" />
    </div>
  </nav>
</template>
<script>
export default {
  data() {
    return {
      activeNotifications: false,
    };
  },
  computed: {
    routeName() {
      const { name } = this.$route;
      return this.capitalizeFirstLetter(name);
    },
  },
  methods: {
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    toggleNotificationDropDown() {
      this.activeNotifications = !this.activeNotifications;
    },
    closeDropDown() {
      this.activeNotifications = false;
    },
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    hideSidebar() {
      this.$sidebar.displaySidebar(false);
    },
    minimizeSidebar() {
      this.$sidebar.toggleMinimize();
    },
  },
};

</script>
<style>
</style>
