import DashboardLayout from 'src/pages/Dashboard/Layout/DashboardLayout.vue'

// Dashboard pages
import Overview from 'src/pages/Dashboard/Dashboard/Overview.vue'
import Stats from 'src/pages/Dashboard/Dashboard/Stats.vue'

// NodeInfo pages
const ActiveNodes = () => import('@/pages/Dashboard/NodeInfo/ActiveNodes.vue')
const NodesVersion = () => import('@/pages/Dashboard/NodeInfo/NodesVersion.vue')
const NodesLocation = () => import('@/pages/Dashboard/NodeInfo/NodesLocation.vue')

// NodeHistory pages
const HistoryStats = () => import('@/pages/Dashboard/NodeHistory/HistoryStats.vue')

// Calendar
const Calendar = () => import('src/pages/Dashboard/Calendar/CalendarRoute.vue')

// Charts
const Charts = () => import('src/pages/Dashboard/Charts.vue')

let nodeInfo = {
  path: '/nodeinfo',
  component: DashboardLayout,
  redirect: '/nodeinfo/active',
  children: [
    {
      path: 'active',
      name: 'Active Nodes',
      component: ActiveNodes
    },
    {
      path: 'version',
      name: 'Nodes Version',
      component: NodesVersion
    },
    {
      path: 'location',
      name: 'Nodes Location',
      component: NodesLocation
    },]
}

let nodeHistory = {
  path: '/nodehistory',
  component: DashboardLayout,
  redirect: '/nodehistory/historystats',
  children: [
    {
      path: 'historystats',
      name: 'History Stats',
      component: HistoryStats
    }]
}

const routes = [
  {
    path: '/',
    redirect: '/admin/overview'
  },
  nodeInfo,
  nodeHistory,
  {
    path: '/admin',
    component: DashboardLayout,
    redirect: '/admin/overview',
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: Overview
      },
      {
        path: 'stats',
        name: 'Stats',
        component: Stats
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: Calendar
      },
      {
        path: 'charts',
        name: 'Charts',
        component: Charts
      }
    ]
  },
  {path: '*', redirect: '/admin/overview'}
]

export default routes
