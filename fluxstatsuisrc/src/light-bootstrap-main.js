import './polyfills';
// A plugin file where you could register global components used across the app
import VueTabs from 'vue-nav-tabs';
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale';
import GlobalComponents from './globalComponents';
// A plugin file where you could register global directives
import GlobalDirectives from './globalDirectives';
// Sidebar on the right. Used as a local plugin in DashboardLayout.vue
import SideBar from './components/SidebarPlugin';
import NotificationPlugin from './components/NotificationPlugin';
// Tabs plugin. Used on Panels page.

// element ui language configuration

// asset imports
import 'bootstrap/dist/css/bootstrap.css';
import 'vue-nav-tabs/themes/vue-tabs.scss';
import './assets/sass/light-bootstrap-dashboard.scss';
import './assets/css/demo.css';

locale.use(lang);

export default {
  async install(Vue) {
    Vue.use(GlobalComponents);
    Vue.use(GlobalDirectives);
    Vue.use(SideBar);
    Vue.use(NotificationPlugin);
    Vue.use(VueTabs);
  },
};
