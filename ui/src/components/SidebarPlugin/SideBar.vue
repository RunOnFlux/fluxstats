<template>
  <div
    class="sidebar"
    :style="sidebarStyle"
    :data-color="backgroundColor"
    :data-image="backgroundImage"
    :data-active-color="activeColor"
  >
    <div
      ref="sidebarScrollArea"
      class="sidebar-wrapper"
    >
      <div class="logo">
        <a class="logo-mini">
          <div class="logo-img">
            <img
              :src="logo"
              alt="logo"
            >
          </div>
        </a>
        <a
          href=""
          class="simple-text logo-normal"
        >
          {{ title }}
        </a>
      </div>
      <slot />
      <ul class="nav">
        <slot name="links">
          <sidebar-item
            v-for="(link, index) in sidebarLinks"
            :key="link.name + index"
            :link="link"
          >
            <sidebar-item
              v-for="(subLink, subindex) in link.children"
              :key="subLink.name + subindex"
              :link="subLink"
            />
          </sidebar-item>
        </slot>
      </ul>
    </div>
  </div>
</template>
<script>

import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

function hasElement(className) {
  return document.getElementsByClassName(className).length > 0;
}

function initScrollbar(className) {
  if (hasElement(className)) {
    new PerfectScrollbar(`.${className}`);
  } else {
    // try to init it later in case this component is loaded async
    setTimeout(() => {
      initScrollbar(className);
    }, 100);
  }
}

export default {
  name: 'Sidebar',
  provide() {
    return {
      autoClose: this.autoClose,
    };
  },
  props: {
    title: {
      type: String,
      default: 'Flux',
    },
    backgroundColor: {
      type: String,
      default: 'black',
      validator: (value) => {
        const acceptedValues = ['', 'blue', 'azure', 'green', 'orange', 'red', 'purple', 'black'];
        return acceptedValues.indexOf(value) !== -1;
      },
    },
    backgroundImage: {
      type: String,
      default: 'static/img/sidebar-5.jpg',
    },
    activeColor: {
      type: String,
      default: 'success',
      validator: (value) => {
        const acceptedValues = ['primary', 'info', 'success', 'warning', 'danger'];
        return acceptedValues.indexOf(value) !== -1;
      },
    },
    logo: {
      type: String,
      default: 'static/img/logo.png',
    },
    sidebarLinks: {
      type: Array,
      default: () => [],
    },
    autoClose: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    sidebarStyle() {
      return {
        backgroundImage: `url(${this.backgroundImage})`,
      };
    },
  },
  mounted() {
    this.initScrollbar();
  },
  methods: {
    initScrollbar() {
      const docClasses = document.body.classList;
      const isWindows = navigator.platform.startsWith('Win');
      if (isWindows) {
        // if we are on windows OS we activate the perfectScrollbar function
        initScrollbar('sidebar-wrapper');

        docClasses.add('perfect-scrollbar-on');
      } else {
        docClasses.add('perfect-scrollbar-off');
      }
    },
  },
};

</script>
<style>
@media (min-width: 992px) {
  .navbar-search-form-mobile,
  .nav-mobile-menu {
    display: none;
  }
}
</style>
