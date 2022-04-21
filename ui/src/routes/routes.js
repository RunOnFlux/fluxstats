import DashboardLayout from 'src/pages/Dashboard/Layout/DashboardLayout.vue';

// Dashboard pages
import Overview from 'src/pages/Dashboard/Dashboard/Overview.vue';

// NodeInfo pages
const Node = () => import('@/pages/Dashboard/NodeInfo/Node.vue');
const NodeVersion = () => import('@/pages/Dashboard/NodeInfo/NodeVersion.vue');
const NodeLocation = () => import('@/pages/Dashboard/NodeInfo/NodeLocation.vue');
const NodeUptime = () => import('@/pages/Dashboard/NodeInfo/NodeUptime.vue');
const NodeApp = () => import('@/pages/Dashboard/NodeInfo/NodeApp.vue');
const NodeAppHash = () => import('@/pages/Dashboard/NodeInfo/NodeAppHash.vue');
const NodeConnection = () => import('@/pages/Dashboard/NodeInfo/NodeConnection.vue');

// NodeHistory pages
const HistoryInfo = () => import('@/pages/Dashboard/NodeHistory/HistoryInfo.vue');

const nodeInfo = {
  path: '/flux/nodeinfo',
  component: DashboardLayout,
  redirect: '/flux/nodeinfo/active',
  children: [
    {
      path: 'uptime',
      name: 'UpTime',
      component: NodeUptime,
    },
    {
      path: 'hashes',
      name: 'Hashes',
      component: NodeAppHash,
    },
    {
      path: 'node',
      name: 'Node',
      component: Node,
    },
    {
      path: 'version',
      name: 'Version',
      component: NodeVersion,
    },
    {
      path: 'app',
      name: 'App',
      component: NodeApp,
    },
    {
      path: 'connection',
      name: 'Connection',
      component: NodeConnection,
    },
    {
      path: 'location',
      name: 'Location',
      component: NodeLocation,
    }],
};

const nodeHistory = {
  path: '/flux/nodehistory',
  component: DashboardLayout,
  redirect: '/flux/nodehistory/historyinfo',
  children: [
    {
      path: 'historyinfo',
      name: 'History Info',
      component: HistoryInfo,
    }],
};

const routes = [
  {
    path: '/',
    redirect: '/flux/dashboard/overview',
  },
  nodeInfo,
  nodeHistory,
  {
    path: '/flux/dashboard',
    component: DashboardLayout,
    redirect: '/flux/dashboard/overview',
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: Overview,
      }
    ],
  },
  { path: '*', redirect: '/flux/dashboard/overview' },
];

export default routes;
