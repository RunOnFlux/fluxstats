import Vue from 'vue';
import VueRouter from 'vue-router';
import LightBootstrap from './light-bootstrap-main';
// Plugins
import App from './App.vue';

// router setup
import routes from './routes/routes';
// plugin setup
Vue.use(VueRouter);
Vue.use(LightBootstrap);

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  linkActiveClass: 'active',
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: (h) => h(App),
  router,
});
