<template>
  <div>
    <div class="col-12 d-flex flex-wrap">
      <div
        v-for="(btn, idx) in tierFilter.states"
        :key="idx"
      >
        <l-button
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          :title="tierFilter.titles[idx]"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}
        </l-button>
      </div>
    </div>
    <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
      <h2 class="title">
        Flux Network
      </h2>
    </div>
    <p class="category" />
    <div class="col-12">
      <card>
        <div
          class="pull-right"
          style="padding:20px;"
        >
          <l-button
            title="Download CSV"
            @click="downloadCsvFile(queriedData)"
          >
            <i class="nc-icon nc-cloud-download-93" />
          </l-button>
        </div>
        <div
          class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
          style="margin-top: 50px;"
        >
          <el-select
            v-model="tierFilter.default"
            class="select-default mb-3"
            style="width: 220px"
            placeholder="Primary Filters and Links"
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
            placeholder="Secondary Filters"
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
        <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
          <el-table
            stripe
            style="width: 100%;"
            :data="queriedData"
          >
            message: `ip: ${node.ip}\ncountry: ${node.country}\ncontinent: ${node.continent}\norg: ${node.org}\nzelId: ${node.zelId}\npayment address: ${node.paymentAddress}\nconnection in: ${indata}\nconnection out: ${outdata}`,
            <el-table-column type="expand">
              <template slot-scope="props">
                <p><b>IP Address:</b> {{ props.row.ip }} </p>
                <p><b>Country:</b> {{ props.row.country }} </p>
                <p><b>Continent:</b> {{ props.row.continent }} </p>
                <p><b>Organization:</b> {{ props.row.org }} </p>
                <p><b>Zel ID:</b> {{ props.row.zelId }} </p>
                <p><b>Payment Address:</b> {{ props.row.paymentAddress }} </p>
                <p><b>Connection In:</b> {{ props.row.connectionIn }} </p>
                <p><b>Connection Out:</b> {{ props.row.connectionOut }}</p>
              </template>
            </el-table-column>
            <el-table-column
              v-for="column in tableColumns"
              :key="column.label"
              :min-width="column.minWidth"
              :prop="column.prop"
              :label="column.label"
            />
            <el-table-column
              fixed="right"
              label="Actions"
              width="120"
            >
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="setNode(scope.$index, queriedData)"
                >
                  Set
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div
          class="col-12 d-flex flex-wrap"
          style="margin-top:
          30px;"
        >
          <el-input-number
            v-model="offsetX"
            :step="50"
            size="mini"
            :min="-1000"
            :max="1000"
          >
          </el-input-number>
          <el-input-number
            v-model="offsetY"
            :step="50"
            controls-position="right"
            size="mini"
            :min="-1000"
            :max="1000"
          >
          </el-input-number>
        </div>
        <div
          id="workspace"
          style="background-color: #E5E8E8; margin-left: 15px;margin-right: 15px;margin-top: 20px;margin-bottom: 20px;"
        >
          <d3-network
            :net-nodes="nodes"
            :net-links="links"
            :options="options"
            @node-click="onClick"
          />
        </div>
        <vue-element-loading
          :active="isLoading"
          spinner="bar-fade-scale"
        />
      </card>
    </div>
  </div>
</template>
<script>
import {
  Table,
  TableColumn,
  Select,
  Option,
} from 'element-ui';
import D3Network from 'vue-d3-network';
import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { MemoryStorage } from 'ttl-localstorage';
import { ExportToCsv } from 'export-to-csv';
import VueElementLoading from 'vue-element-loading';
import CsvService from '../Service/CsvService';
import TransformationService from '../Service/TransformationService';
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
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    VueElementLoading,
  },
  data() {
    return {
      offsetX: 0,
      offsetY: 0,
      searchQuery: {
        default: [],
        others: [],
      },
      tierFilter: {
        default: [],
        others: ['CUMULUS', 'NIMBUS', 'STRATUS', 'IN', 'OUT', '2ND LEVEL DATA',
          'TIER', 'COUNTRY', 'CONTINENT',
          'ORGANIZATION', 'ZEL ID', 'PAYMENT ADDRESS',
          'CONNECTION IN', 'CONNECTION OUT'],
        states: [],
        titles: ['Filter Cumulus Nodes', 'Filter Nimbus Nodes', 'Filter Stratus Nodes', 'Filter Connection Type In', 'Filter Connection Type Out', 'Enable 2nd Level Data of Nodes',
          'Enable Node Tier Association', 'Enable Node Country Association', 'Enable Node Continent Association',
          'Enable Node Organization Association', 'Enable Node Zel Id Association', 'Enable Node Payment Address Association',
          'Enable Node Connection In Association', 'Enable Node Connection Out Association'],
      },
      tierFilterOthers: {
        default: [],
        others: [],
      },
      tableColumns: [
        {
          prop: 'ip',
          label: 'Node Information',
          minWidth: 200,
        },
      ],
      values: [],
      nodes: [],
      links: [],
      nodeData: [],
      isLoading: true,
    };
  },
  computed: {
    queriedData() {
      return this.nodeData;
    },
    options() {
      return {
        force: 1500,
        size: { w: 1600, h: 1000 },
        nodeSize: 30,
        nodeLabels: true,
        fontSize: 8,
        canvas: false,
        offset: { x: this.offsetX, y: this.offsetY },
      };
    },
  },
  async mounted() {
    try {
      await httpRequestFluxInfo(axios, MemoryStorage);
      const info = MemoryStorage.get('fluxinfo');
      info.map((i) => {
        this.searchQuery.others.push(i.ip);
        return i;
      });
      if (Object.keys(this.searchQuery.default).length > 0) {
        this.$notify(
          {
            component: FluxNetwork,
            icon: 'nc-icon nc-app',
          },
        );
      }
      this.tierFilter.others.forEach((value) => {
        this.tierFilter.states.push({
          name: value,
          state: false,
        });
      });
      this.isLoading = false;
    } catch (e) {
      this.$router.push('/flux/maintenance/error').catch(() => {});
    }
  },
  methods: {
    async processFilters(key) {
      if (!this.tierFilter.default.includes(key)) {
        this.tierFilter.default.push(key);
      } else {
        this.tierFilter.default = this.tierFilter.default.filter((value) => value !== key);
      }
      const keys = this.tierFilter.default;
      this.processState(keys);
      await this.processQueriedData();
    },
    async processState(keys) {
      this.tierFilter = TransformationService.processState(keys, this.tierFilter);
    },
    async processQueriedData() {
      try {
        if (Object.keys(this.searchQuery.default).length <= 0) {
          this.tierFilterOthers.default = [];
          this.tierFilterOthers.others = [];
          this.nodeData = [];
        }
        if (Object.keys(this.searchQuery.default).length > 0) {
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
    async setNode(index, data) {
      this.searchQuery.default = data[index].ip;
      await this.processQueriedData();
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
          tier: item.tier,
          connectionin: item.connectionin,
          connectionout: item.connectionout,
          _color: this.processColorsByTier('root'),
        });

        this.onClick(undefined, nodemap[0]);

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
            tier: cin.tier,
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
            tier: cout.tier,
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

        if (this.tierFilter.default.includes('TIER')) {
          this.processTierAssociation(nodemap, line);
        }

        if (this.tierFilter.default.includes('COUNTRY')) {
          this.processCountryAssociation(nodemap, line);
        }

        if (this.tierFilter.default.includes('CONTINENT')) {
          this.processContinentAssociation(nodemap, line);
        }

        if (this.tierFilter.default.includes('ORGANIZATION')) {
          this.processOrganizationAssociation(nodemap, line);
        }

        if (this.tierFilter.default.includes('ZEL ID')) {
          this.processZelIdAssociation(nodemap, line);
        }

        if (this.tierFilter.default.includes('PAYMENT ADDRESS')) {
          this.processPaymentAddressAssociation(nodemap, line);
        }

        if (this.tierFilter.default.includes('CONNECTION IN')) {
          this.processConnectionInAssociation(nodemap, line);
        }

        if (this.tierFilter.default.includes('CONNECTION OUT')) {
          this.processConnectionOutAssociation(nodemap, line);
        }

        nodemap = [];
        rootNodeId += 1;
        return item;
      });
    },
    async processTierAssociation(nodemap, line) {
      const cumulus = nodemap.filter((i) => i.tier === 'CUMULUS');
      const nimbus = nodemap.filter((i) => i.tier === 'NIMBUS');
      const stratus = nodemap.filter((i) => i.tier === 'STRATUS');
      for (let c = 0; c < Object.keys(cumulus).length; c += 1) {
        this.links.push({
          tid: cumulus[c].id,
          sid: cumulus[c + 1 < Object.keys(cumulus).length ? c + 1 : c].id,
          _color: line,
        });
      }
      for (let c = 0; c < Object.keys(nimbus).length; c += 1) {
        this.links.push({
          tid: nimbus[c].id,
          sid: nimbus[c + 1 < Object.keys(nimbus).length ? c + 1 : c].id,
          _color: line,
        });
      }
      for (let c = 0; c < Object.keys(stratus).length; c += 1) {
        this.links.push({
          tid: stratus[c].id,
          sid: stratus[c + 1 < Object.keys(stratus).length ? c + 1 : c].id,
          _color: line,
        });
      }
    },
    async processCountryAssociation(nodemap, line) {
      const countries = [];
      nodemap.map((i) => {
        if (!countries.includes(i.country)) {
          countries.push(i.country);
        }
        return i;
      });
      countries.map((i) => {
        const filtered = nodemap.filter((j) => j.country === i);
        for (let c = 0; c < Object.keys(filtered).length; c += 1) {
          this.links.push({
            tid: filtered[c].id,
            sid: filtered[c + 1 < Object.keys(filtered).length ? c + 1 : c].id,
            _color: line,
          });
        }
        return i;
      });
    },
    async processContinentAssociation(nodemap, line) {
      const continents = [];
      nodemap.map((i) => {
        if (!continents.includes(i.continent)) {
          continents.push(i.continent);
        }
        return i;
      });
      continents.map((i) => {
        const filtered = nodemap.filter((j) => j.continent === i);
        for (let c = 0; c < Object.keys(filtered).length; c += 1) {
          this.links.push({
            tid: filtered[c].id,
            sid: filtered[c + 1 < Object.keys(filtered).length ? c + 1 : c].id,
            _color: line,
          });
        }
        return i;
      });
    },
    async processOrganizationAssociation(nodemap, line) {
      const organization = [];
      nodemap.map((i) => {
        if (!organization.includes(i.org)) {
          organization.push(i.org);
        }
        return i;
      });
      organization.map((i) => {
        const filtered = nodemap.filter((j) => j.org === i);
        for (let c = 0; c < Object.keys(filtered).length; c += 1) {
          this.links.push({
            tid: filtered[c].id,
            sid: filtered[c + 1 < Object.keys(filtered).length ? c + 1 : c].id,
            _color: line,
          });
        }
        return i;
      });
    },
    async processZelIdAssociation(nodemap, line) {
      const zelIds = [];
      nodemap.map((i) => {
        if (!zelIds.includes(i.zelId)) {
          zelIds.push(i.zelId);
        }
        return i;
      });
      zelIds.map((i) => {
        const filtered = nodemap.filter((j) => j.zelId === i);
        for (let c = 0; c < Object.keys(filtered).length; c += 1) {
          this.links.push({
            tid: filtered[c].id,
            sid: filtered[c + 1 < Object.keys(filtered).length ? c + 1 : c].id,
            _color: line,
          });
        }
        return i;
      });
    },
    async processPaymentAddressAssociation(nodemap, line) {
      const paymentAddresses = [];
      nodemap.map((i) => {
        if (!paymentAddresses.includes(i.paymentAddress)) {
          paymentAddresses.push(i.paymentAddress);
        }
        return i;
      });
      paymentAddresses.map((i) => {
        const filtered = nodemap.filter((j) => j.paymentAddress === i);
        for (let c = 0; c < Object.keys(filtered).length; c += 1) {
          this.links.push({
            tid: filtered[c].id,
            sid: filtered[c + 1 < Object.keys(filtered).length ? c + 1 : c].id,
            _color: line,
          });
        }
        return i;
      });
    },
    async processConnectionInAssociation(nodemap, line) {
      const filtered = nodemap.filter((j) => j.connectionType === 'in');
      for (let c = 0; c < Object.keys(filtered).length; c += 1) {
        this.links.push({
          tid: filtered[c].id,
          sid: filtered[c + 1 < Object.keys(filtered).length ? c + 1 : c].id,
          _color: line,
        });
      }
    },
    async processConnectionOutAssociation(nodemap, line) {
      const filtered = nodemap.filter((j) => j.connectionType === 'out');
      for (let c = 0; c < Object.keys(filtered).length; c += 1) {
        this.links.push({
          tid: filtered[c].id,
          sid: filtered[c + 1 < Object.keys(filtered).length ? c + 1 : c].id,
          _color: line,
        });
      }
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
      if (Object.keys(this.searchQuery.default).length <= 0) {
        return;
      }
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
      this.nodeData = [{
        ip: node.ip,
        tier: node.tier,
        country: node.country,
        continent: node.continent,
        org: node.org,
        zelId: node.zelId,
        paymentAddress: node.paymentAddress,
        connectionIn: indata,
        connectionOut: outdata,
      }];
    },
    processDataForCsv(data) {
      const values = [];
      data.forEach((item) => {
        values.push({
          ip: !item.ip ? '' : item.ip,
          tier: !item.tier ? '' : item.tier,
          country: !item.country ? '' : item.country,
          continent: !item.continent ? '' : item.continent,
          org: !item.org ? '' : item.org,
          zelId: !item.zelId ? '' : item.zelId,
          paymentAddress: !item.paymentAddress ? '' : item.paymentAddress,
          connectionin: !item.connectionIn ? '' : item.connectionIn,
          connectionout: !item.connectionOut ? '' : item.connectionOut,
        });
      });
      return values;
    },
    downloadCsvFile(data) {
      const module = 'Node';
      const headers = [
        'IP Address',
        'Tier',
        'Country',
        'Continent',
        'Organization',
        'ZelId',
        'PaymentAddress',
        'Connection In',
        'Connection Out',
      ];
      CsvService.Download(this.processDataForCsv(data), headers, module, ExportToCsv);
    },
  },
};
</script>
<style>
</style>
