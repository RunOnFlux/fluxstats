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
        <el-select
          v-model="tierFilterOthers.default"
          class="select-default mb-3"
          style="width: 400px"
          placeholder="Select Other Filters"
          multiple
          collapse-tags
          filterable
          @change="processQueriedData"
        >
          <el-option
            v-for="item in tierFilterOthers.others"
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
          <el-select
            v-model="searchQuery.default"
            class="select-default mb-3"
            style="width: 200px"
            filterable
            clearable
            placeholder="Search IP"
            @change="processQueriedData"
          >
            <el-option
              v-for="item in searchQuery.others"
              :key="item"
              class="select-default"
              :label="item"
              :value="item"
            />
          </el-select>
        </div>
      </div>
      <div style="background-color: #E5E8E8; margin-left: 15px;margin-right: 30px;">
        <d3-network
          :net-nodes="nodes"
          :net-links="links"
          :options="options"
          @node-click="onClick"
        />
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
import { getDataVisualization } from '../Request/DataVisualization';
import FluxNetwork from '../Components/FluxNetwork.vue';
import FluxConnection from '../Components/FluxConnection.vue';
import FluxConnectionLayer from '../Components/FluxConnectionLayer.vue';
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
      searchQuery: {
        default: [],
        others: [],
      },
      tierFilter: {
        default: [],
        others: ['CUMULUS', 'NIMBUS', 'STRATUS', 'IN', 'OUT', '2ND LEVEL DATA'],
      },
      tierFilterOthers: {
        default: [],
        others: [],
      },
      values: [],
      nodes: [],
      links: [],
    };
  },
  computed: {
    options() {
      return {
        force: 3000,
        size: { w: 1600, h: 1000 },
        nodeSize: 30,
        nodeLabels: true,
        fontSize: 8,
        canvas: false,
      };
    },
  },
  async mounted() {
    try {
      this.myProgress = 20;
      await httpRequestFluxInfo(axios, MemoryStorage);
      const info = MemoryStorage.get('fluxinfo');
      info.map((i) => {
        this.searchQuery.others.push(i.ip);
        return i;
      });
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
        if (Object.keys(this.searchQuery.default).length <= 0) {
          this.tierFilterOthers.default = [];
          this.tierFilterOthers.others = [];
          this.tierFilter.default = [];
          this.tierFilter.others = [];
        }
        this.$notify(
          {
            component: FluxConnection,
            icon: 'nc-icon nc-app',
          },
        );
        if (this.tierFilter.default.includes('2ND LEVEL DATA')) {
          this.$notify(
            {
              component: FluxConnectionLayer,
              icon: 'nc-icon nc-app',
            },
          );
        }
        this.nodes = [];
        this.links = [];
        this.values = [];
        await this.assignData();
        await this.processNodesAndLinks();
      } catch (e) {
        this.nodes.push({
          id: 0,
          name: `Cannot find data for: ${this.searchQuery.default}`,
          _color: '#2C3E50',
        });
      }
    },
    async assignData() {
      if (this.searchQuery !== '') {
        this.values = await getDataVisualization(rateLimit, axios, MemoryStorage, httpRequestFluxConnections, this.searchQuery.default, this.tierFilter.default);
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
          ip: item.ip,
          zelId: item.zelId,
          continent: item.continent,
          country: item.country,
          org: item.org,
          paymentAddress: item.paymentAddress,
          _color: this.processColorsByTier('root'),
        });

        await item.connectionin.map(async (cin) => {
          if (Object.keys(this.tierFilter.default).length > 0) {
            if (this.tierCheckingIncludes()) {
              if (!this.tierChecking(cin.tier)) {
                return cin;
              }
            }
            if (this.connectionCheckingIncludes()) {
              if (!this.tierFilter.default.includes('IN')) {
                return cin;
              }
            }
          }

          let otherFilters = false;
          if (Object.keys(this.tierFilterOthers.default).length > 0) {
            if (this.tierFilterOthers.default.includes(`zelId - ${cin.zelId}`)
              || this.tierFilterOthers.default.includes(`continent - ${cin.continent}`)
              || this.tierFilterOthers.default.includes(`country - ${cin.country}`)
              || this.tierFilterOthers.default.includes(`org - ${cin.org}`)
              || this.tierFilterOthers.default.includes(`payment address - ${cin.paymentAddress}`)
            ) {
              otherFilters = true;
            }
            if (!otherFilters) {
              return cin;
            }
          }

          nodemap.push({
            id: nodeId += 1,
            name: `in: ${cin.ip}`,
            rootid: rootNodeId,
            ip: cin.ip,
            connectionType: 'in',
            zelId: cin.zelId,
            continent: cin.continent,
            country: cin.country,
            org: cin.org,
            paymentAddress: cin.paymentAddress,
            connectionin: cin.connectionin,
            connectionout: cin.connectionout,
            _color: this.processColorsByTier(cin.tier),
          });

          return cin;
        });

        await item.connectionout.map(async (cout) => {
          if (Object.keys(this.tierFilter.default).length > 0) {
            if (this.tierCheckingIncludes()) {
              if (!this.tierChecking(cout.tier)) {
                return cout;
              }
            }
            if (this.connectionCheckingIncludes()) {
              if (!this.tierFilter.default.includes('OUT')) {
                return cout;
              }
            }
          }

          let otherFilters = false;
          if (Object.keys(this.tierFilterOthers.default).length > 0) {
            if (this.tierFilterOthers.default.includes(`zelId - ${cout.zelId}`)
              || this.tierFilterOthers.default.includes(`continent - ${cout.continent}`)
              || this.tierFilterOthers.default.includes(`country - ${cout.country}`)
              || this.tierFilterOthers.default.includes(`org - ${cout.org}`)
              || this.tierFilterOthers.default.includes(`payment address - ${cout.paymentAddress}`)
            ) {
              otherFilters = true;
            }
            if (!otherFilters) {
              return cout;
            }
          }

          nodemap.push({
            id: nodeId += 1,
            name: `out: ${cout.ip}`,
            rootid: rootNodeId,
            ip: cout.ip,
            connectionType: 'out',
            zelId: cout.zelId,
            continent: cout.continent,
            country: cout.country,
            org: cout.org,
            paymentAddress: cout.paymentAddress,
            connectionin: cout.connectionin,
            connectionout: cout.connectionout,
            _color: this.processColorsByTier(cout.tier),
          });

          return cout;
        });

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
      this.processOtherFilters(this.values);
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
    tierCheckingIncludes() {
      return this.tierFilter.default.includes('CUMULUS') || this.tierFilter.default.includes('NIMBUS') || this.tierFilter.default.includes('STRATUS');
    },
    connectionCheckingIncludes() {
      return this.tierFilter.default.includes('IN') || this.tierFilter.default.includes('OUT');
    },
    async processOtherFilters(values) {
      const zelIds = [];
      const continents = [];
      const countries = [];
      const orgs = [];
      const paymentAddresses = [];
      await values[0].connectionin.map((value) => {
        zelIds.push(`zelId - ${value.zelId}`);
        continents.push(`continent - ${value.continent}`);
        countries.push(`country - ${value.country}`);
        orgs.push(`org - ${value.org}`);
        paymentAddresses.push(`payment address - ${value.paymentAddress}`);
        return value;
      });
      await values[0].connectionout.map((value) => {
        zelIds.push(`zelId - ${value.zelId}`);
        continents.push(`continent - ${value.continent}`);
        countries.push(`country - ${value.country}`);
        orgs.push(`org - ${value.org}`);
        paymentAddresses.push(`payment address - ${value.paymentAddress}`);
        return value;
      });
      this.tierFilterOthers.others = this.tierFilterOthers.others.concat(continents);
      this.tierFilterOthers.others = this.tierFilterOthers.others.concat(countries);
      this.tierFilterOthers.others = this.tierFilterOthers.others.concat(orgs);
      this.tierFilterOthers.others = this.tierFilterOthers.others.concat(paymentAddresses);
      this.tierFilterOthers.others = this.tierFilterOthers.others.concat(zelIds);
      this.tierFilterOthers.others = [...new Set(this.tierFilterOthers.others)];
    },
    async onClick(event, node) {
      let indata = '';
      let outdata = '';
      // Tentative implementation on IPs in and out
      if (this.tierFilter.default.includes('2ND LEVEL DATA')) {
        let count = 0;
        node.connectionin.map((i) => {
          indata += `${i.ip},`;
          if (count % 3 === 0 && Object.keys(node.connectionin).length - 1 > count) {
            indata += '\n';
          }
          count += 1;
          return i;
        });
        count = 0;
        node.connectionout.map((i) => {
          outdata += `${i.ip},`;
          if (count % 3 === 0 && Object.keys(node.connectionout).length - 1 > count) {
            outdata += '\n';
          }
          count += 1;
          return i;
        });
      }
      this.$notify({
        title: 'Node Information',
        message: `ip: ${node.ip}\ncountry: ${node.country}\ncontinent: ${node.continent}\norg: ${node.org}\nzelId: ${node.zelId}\npayment address: ${node.paymentAddress}\nconnection in: ${indata}\nconnection out: ${outdata}`,
      });
    },
  },
};
</script>
<style>
</style>
