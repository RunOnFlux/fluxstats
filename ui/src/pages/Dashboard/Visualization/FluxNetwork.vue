<template>
  <div>
    <div
      v-if="myProgress < 100"
      class="row"
      style="position: absolute; left: 45%; top: 40%;"
    >
      <vue-ellipse-progress
        :half="false"
        :progress="myProgress"
        line-mode="in 10"
        color="Silver"
        :gap="10"
        fontSize="3rem"
      />
    </div>
    <div
      v-if="myProgress >= 100"
      class="row"
    >
      <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
        <h2 class="title">
          Flux Network
        </h2>
      </div>
      <p class="category" />
      <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
        <el-select
          v-model="tierFilter.default"
          class="select-default mb-3"
          style="width: 200px"
          placeholder="Select Filters"
          multiple
          collapse-tags
          filterable
          @change="processQueriedData"
        >
          <el-option
            v-for="item in tierFilter.others"
            :key="item"
            class="select-default"
            :label="item"
            :value="item"
          />
        </el-select>
        <div
          col-md-6
          offset-md-3
        >
        </div>
        <el-input
          v-model="searchQuery"
          class="mb-3"
          style="width: 200px"
          placeholder="Search IP"
          clearable
          @keyup.enter.native="processQueriedData"
        />
      </div>
      <div style="background-color: #E5E8E8; margin-left: 15px;margin-right: 30px;">
        <d3-network :net-nodes="nodes" :net-links="links" :options="options" />
      </div>
    </div>
  </div>
</template>
<script>
import {
  Select,
  Option,
} from 'element-ui';
import D3Network from 'vue-d3-network';
import { VueEllipseProgress } from 'vue-ellipse-progress';
import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { MemoryStorage } from 'ttl-localstorage';
import { getDataVisualization } from '../Request/DataVirtualization';
import FluxNetwork from '../Components/FluxNetwork.vue';
import {
  httpRequestFluxInfo,
  httpRequestFluxConnections,
} from '../Request/HttpRequest';

export default {
  components: {
    D3Network,
    VueEllipseProgress,
    [Select.name]: Select,
    [Option.name]: Option,
  },
  data() {
    return {
      myProgress: 0,
      searchQuery: '',
      tierFilter: {
        default: [],
        others: ['CUMULUS', 'NIMBUS', 'STRATUS', 'IN', 'OUT'],
      },
      values: [],
      nodes: [],
      links: [],
      options: {
        canvas: false,
        force: 3000,
        size: { w: 1600, h: 1000 },
        nodeSize: 30,
        nodeLabels: true,
        fontSize: 8,
      },
    };
  },
  async mounted() {
    try {
      this.myProgress = 20;
      await httpRequestFluxInfo(axios, MemoryStorage);
      this.myProgress = 100;
      this.$notify(
        {
          component: FluxNetwork,
          icon: 'nc-icon nc-app',
        },
      );
    } catch (e) {
      this.$router.push('/flux/maintenance/error').catch(() => {});
    }
  },
  methods: {
    async processQueriedData() {
      try {
        this.nodes = [];
        this.links = [];
        this.values = [];
        await this.assignData();
        await this.processNodesAndLinks();
      } catch (e) {
        this.nodes.push({
          id: 0,
          name: `Cannot find data for: ${this.searchQuery}`,
          _color: '#2C3E50',
        });
      }
    },
    async assignData() {
      if (this.searchQuery !== '') {
        this.values = await getDataVisualization(rateLimit, axios, MemoryStorage, httpRequestFluxConnections, this.searchQuery);
      }
    },
    async processing(values, map, rootId, id, line) {
      let nodeId = id;
      let rootNodeId = rootId;
      let nodemap = map;
      await values.map(async (item) => {
        nodemap.push({
          id: nodeId,
          name: item.ip,
          rootid: rootNodeId,
          _color: this.processColorsByTier('root'),
        });

        await item.connectionin.map(async (cin) => {
          if (
            Object.keys(this.tierFilter.default).length <= 0
            || this.tierFilter.default.includes('IN')
            || this.tierChecking(cin.tier)
          ) {
            nodemap.push({
              id: nodeId += 1,
              name: `in: ${cin.ip}`,
              rootid: rootNodeId,
              connectionin: cin.connectionin,
              connectionout: cin.connectionout,
              _color: this.processColorsByTier(cin.tier),
            });
          }
          return cin;
        });

        await item.connectionout.map(async (cout) => {
          if (
            Object.keys(this.tierFilter.default).length <= 0
            || this.tierFilter.default.includes('OUT')
            || this.tierChecking(cout.tier)
          ) {
            nodemap.push({
              id: nodeId += 1,
              name: `out: ${cout.ip}`,
              rootid: rootNodeId,
              connectionin: cout.connectionin,
              connectionout: cout.connectionout,
              _color: this.processColorsByTier(cout.tier),
            });
          }
          return cout;
        });

        // First Layer Relation
        nodemap.map((i) => {
          this.nodes.push(i);
          if (i.id > 1) {
            this.links.push({
              tid: i.rootid,
              sid: i.id,
              _color: line,
            });
          }
          return i;
        });

        nodemap = [];
        rootNodeId += 1;
        return item;
      });
    },
    async processNodesAndLinks() {
      const line = '#6E2C00';
      const rootNodeId = 1;
      const nodeId = 1;
      const nodemap = [];
      await this.processing(this.values, nodemap, rootNodeId, nodeId, line);
    },
    processColorsByTier(tier) {
      // Colors for cumulus, nimbus and stratus respectively
      const colors = ['#85C1E9', '#F7DC6F', '#E59866'];
      let color = '#73C6B6';
      if (tier === 'CUMULUS') {
        color = colors[0];
      } else if (tier === 'NIMBUS') {
        color = colors[1];
      } else if (tier === 'STRATUS') {
        color = colors[2];
      }
      return color;
    },
    tierChecking(tier) {
      return this.tierFilter.default.includes(tier);
    },
  },
};
</script>
<style>
</style>
