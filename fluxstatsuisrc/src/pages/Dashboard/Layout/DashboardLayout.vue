<template>
  <div class="wrapper" :class="{'nav-open': $sidebar.showSidebar}">
    <notifications></notifications>
    <side-bar>
      <user-menu></user-menu>
      <mobile-menu></mobile-menu>
      <template slot="links">
        <sidebar-item :link="{name: 'Dashboard', icon: 'nc-icon nc-chart-pie-35', path: '/flux/dashboard/overview'}">
        </sidebar-item>
        <sidebar-item :link="{name: 'Node Info', icon: 'nc-icon nc-app'}">
          <sidebar-item :link="{name: 'Node', path: '/flux/nodeinfo/node'}"></sidebar-item>
          <sidebar-item :link="{name: 'Application', path: '/flux/nodeinfo/app'}"></sidebar-item>
          <sidebar-item :link="{name: 'Hashes', path: '/flux/nodeinfo/hashes'}"></sidebar-item>
          <sidebar-item :link="{name: 'Location', path: '/flux/nodeinfo/location'}"></sidebar-item>
          <sidebar-item :link="{name: 'Connection', path: '/flux/nodeinfo/connection'}"></sidebar-item>
          <sidebar-item :link="{name: 'UpTime', path: '/flux/nodeinfo/uptime'}"></sidebar-item>
          <sidebar-item :link="{name: 'Version', path: '/flux/nodeinfo/version'}"></sidebar-item>
        </sidebar-item>
        <sidebar-item :link="{name: 'History', icon: 'nc-icon nc-notes'}">
          <sidebar-item :link="{name: 'Info', path: '/flux/nodehistory/historyinfo'}"></sidebar-item>
        </sidebar-item>
      </template>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>

      <dashboard-content @click.native="toggleSidebar">

      </dashboard-content>

      <content-footer></content-footer>
    </div>
  </div>
</template>
<script>
  import TopNavbar from './TopNavbar.vue'
  import ContentFooter from './ContentFooter.vue'
  import DashboardContent from './Content.vue'
  import MobileMenu from './Extra/MobileMenu.vue'
  import UserMenu from './Extra/UserMenu.vue'
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
    components: {
      TopNavbar,
      ContentFooter,
      DashboardContent,
      MobileMenu,
      UserMenu
    },
    methods: {
      toggleSidebar () {
        if (this.$sidebar.showSidebar) {
          this.$sidebar.displaySidebar(false)
        }
      },
      initScrollbar() {
        let docClasses = document.body.classList;
        let isWindows = navigator.platform.startsWith('Win');
        if (isWindows) {
          // if we are on windows OS we activate the perfectScrollbar function
          initScrollbar('main-panel');

          docClasses.add('perfect-scrollbar-on');
        } else {
          docClasses.add('perfect-scrollbar-off');
        }
      }
    },
    mounted() {
      this.initScrollbar()
    }
  }

</script>
