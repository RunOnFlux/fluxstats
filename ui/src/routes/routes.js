import DashboardLayout from 'src/pages/Dashboard/Layout/DashboardLayout.vue';

// Dashboard pages
import Overview from 'src/pages/Dashboard/Dashboard/Overview.vue';

// NodeInfo pages
const Node = () => import('@/pages/Dashboard/NodeInfo/Node.vue');
const NodeDaemon = () => import('@/pages/Dashboard/NodeInfo/NodeDaemon.vue');
const NodeLocation = () => import('@/pages/Dashboard/NodeInfo/NodeLocation.vue');
const NodeUptime = () => import('@/pages/Dashboard/NodeInfo/NodeUptime.vue');
const NodeApp = () => import('@/pages/Dashboard/NodeInfo/NodeApp.vue');
const NodeAppHash = () => import('@/pages/Dashboard/NodeInfo/NodeAppHash.vue');
const NodeConnection = () => import('@/pages/Dashboard/NodeInfo/NodeConnection.vue');
const NodeAddressInfo = () => import('@/pages/Dashboard/NodeInfo/NodeAddressInfo.vue');
const NodeBenchmark = () => import('@/pages/Dashboard/NodeInfo/NodeBenchmark.vue');
const FluxNetwork = () => import('@/pages/Dashboard/Visualization/FluxNetwork.vue');

// NodeHistory pages
const HistoryInfo = () => import('@/pages/Dashboard/NodeHistory/HistoryInfo.vue');

// Maintenance pages
const Error = () => import('@/pages/Dashboard/Maintenance/Error.vue');

const nodeInfo = {
  path: '/flux/nodeinfo',
  component: DashboardLayout,
  name: 'nodeinfo',
  redirect: '/flux/nodeinfo/node',
  children: [
    {
      path: 'uptime',
      name: 'uptime',
      component: NodeUptime,
    },
    {
      path: 'hashes',
      name: 'hashes',
      component: NodeAppHash,
    },
    {
      path: 'node',
      name: 'node',
      component: Node,
    },
    {
      path: 'daemon',
      name: 'daemon',
      component: NodeDaemon,
    },
    {
      path: 'app',
      name: 'app',
      component: NodeApp,
    },
    {
      path: 'connection',
      name: 'connection',
      component: NodeConnection,
    },
    {
      path: 'location',
      name: 'location',
      component: NodeLocation,
    },
    {
      path: 'address',
      name: 'address',
      component: NodeAddressInfo,
    },
    {
      path: 'benchmark',
      name: 'Benchmark',
      component: NodeBenchmark,
    }],
};

const nodeHistory = {
  path: '/flux/nodehistory',
  component: DashboardLayout,
  name: 'nodehistory',
  redirect: '/flux/nodehistory/historyinfo',
  children: [
    {
      path: 'historyinfo',
      name: 'historyinfo',
      component: HistoryInfo,
    }],
};

const maintenance = {
  path: '/flux/maintenance/error',
  component: Error,
  name: 'error',
};

const fluxnetwork = {
  path: '/flux/network',
  component: DashboardLayout,
  name: 'network',
  redirect: '/flux/network/visualization',
  children: [
    {
      path: 'visualization',
      name: 'visualization',
      component: FluxNetwork,
    },
  ],
};

const dashboard = {
  path: '/flux/dashboard',
  component: DashboardLayout,
  redirect: '/flux/dashboard/overview',
  name: 'overview',
  children: [
    {
      path: 'overview',
      name: 'overview',
      component: Overview,
    },
  ],
};

const root = {
  path: '/',
  redirect: '/flux/dashboard/overview',
  name: 'root',
};

const routes = [
  nodeInfo,
  nodeHistory,
  maintenance,
  dashboard,
  fluxnetwork,
  root,
];

export default routes;
