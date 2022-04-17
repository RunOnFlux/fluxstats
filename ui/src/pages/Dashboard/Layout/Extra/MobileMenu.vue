<template>
  <ul class="nav nav-mobile-menu">
    <form
      class="navbar-form navbar-left navbar-search-form"
      role="search"
    >
      <div class="input-group">
        <i class="nc-icon nc-zoom-split" />
        <input
          type="text"
          value=""
          class="form-control"
          placeholder="Search..."
        >
      </div>
    </form>
    <drop-down>
      <template slot="title">
        <i class="nc-icon nc-planet" />
      </template>
      <a
        class="dropdown-item"
        href="#"
      >Create New Post</a>
      <a
        class="dropdown-item"
        href="#"
      >Manage Something</a>
      <a
        class="dropdown-item"
        href="#"
      >Do Nothing</a>
      <a
        class="dropdown-item"
        href="#"
      >Submit to Live</a>
      <a
        class="dropdown-item"
        href="#"
      >Another action</a>
    </drop-down>
    <drop-down>
      <template slot="title">
        <i class="nc-icon nc-bell-55" />
        <span class="notification">5</span>
        <span class="d-lg-none">Notification</span>
      </template>
      <a
        class="dropdown-item"
        href="#"
      >Notification 1</a>
      <a
        class="dropdown-item"
        href="#"
      >Notification 2</a>
      <a
        class="dropdown-item"
        href="#"
      >Notification 3</a>
      <a
        class="dropdown-item"
        href="#"
      >Notification 4</a>
      <a
        class="dropdown-item"
        href="#"
      >Another notification</a>
    </drop-down>

    <drop-down>
      <template slot="title">
        <i class="nc-icon nc-bullet-list-67" />
      </template>
      <a
        class="dropdown-item"
        href="#"
      >
        <i class="nc-icon nc-umbrella-13" /> Help Center
      </a>
      <a
        class="dropdown-item"
        href="#"
      >
        <i class="nc-icon nc-email-85" /> Messages
      </a><a
        class="dropdown-item"
        href="#"
      >
        <i class="nc-icon nc-settings-90" /> Settings
      </a>
      <div class="divider" />
      <a
        class="dropdown-item"
        href="#"
      >
        <i class="nc-icon nc-lock-circle-open" /> Lock Screen
      </a>
      <a
        href="#"
        class="dropdown-item text-danger"
      >
        <i class="nc-icon nc-button-power" /> Log out
      </a>
    </drop-down>
  </ul>
</template>
<script>
import DropDown from 'src/components/Dropdown.vue';

export default {
  components: {
    DropDown,
  },
};
</script>
<style>
</style>
