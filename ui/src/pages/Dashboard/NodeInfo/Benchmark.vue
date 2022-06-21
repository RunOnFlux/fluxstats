<template>
  <div>
    <div class="row" style="position: absolute; left: 45%; top: 40%;" v-if="myProgress < 100">
      <vue-ellipse-progress
        :half="false"
        :progress="myProgress"
        line-mode="in 10"
        color="Silver"
        :gap="10"
        fontSize="3rem">
      </vue-ellipse-progress>
    </div>
    <div class="row" v-if="myProgress >= 100">
      <div class="col-md-12">
        <l-button wide v-if="temp[0] = filter.get(`network - cumulus upload speed < 25`)">Cumulus &#60; 25 Upload Speed: {{ temp[0] === undefined ? 0 : temp[0].length }}</l-button>&nbsp;
        <l-button wide v-if="temp[1] = filter.get(`network - nimbus upload speed < 50`)">Nimbus &#60; 50 Upload Speed: {{ temp[1] === undefined ? 0 : temp[1].length }}</l-button>&nbsp;
        <l-button wide v-if="temp[2] = filter.get(`network - stratus upload speed < 100`)">Stratus &#60; 100 Upload Speed: {{ temp[2] === undefined ? 0 : temp[2].length }}</l-button>&nbsp;
        <l-button wide v-if="temp[3] = filter.get(`network - cumulus download speed < 25`)">Cumulus &#60; 25 Download Speed: {{ temp[3] === undefined ? 0 : temp[3].length }}</l-button>&nbsp;
        <l-button wide v-if="temp[4] = filter.get(`network - nimbus download speed < 50`)">Nimbus &#60; 50 Download Speed: {{ temp[4] === undefined ? 0 : temp[4].length }}</l-button>&nbsp;
        <l-button wide v-if="temp[5] = filter.get(`network - stratus download speed < 100`)">Stratus &#60; 100 Download Speed: {{ temp[5] === undefined ? 0 : temp[5].length }}</l-button>&nbsp;
      </div>
      <div class="col-md-12" style="padding-top: 25px;">
        <l-button wide v-if="temp[6] = filter.get(`upnp enabled - TRUE`)">UPnP Enabled: {{ temp[6] === undefined ? 0 : temp[6].length }}</l-button>&nbsp;
        <l-button wide v-if="temp[7] = filter.get(`failed nodes - cumulus`)">Failed Cumulus: {{ temp[7] === undefined ? 0 : temp[7].length }}</l-button>&nbsp;
        <l-button wide v-if="temp[8] = filter.get(`failed nodes - nimbus`)">Failed Nimbus: {{ temp[8] === undefined ? 0 : temp[8].length }}</l-button>&nbsp;
        <l-button wide v-if="temp[9] = filter.get(`failed nodes - stratus`)">Failed Stratus: {{ temp[9] === undefined ? 0 : temp[9].length }}</l-button>&nbsp;
        <l-button wide v-if="temp[10] = filter.get(`failed nodes - no tier`)">Failed No Tier: {{ temp[10] === undefined ? 0 : temp[10].length }}</l-button>&nbsp;
        <l-button wide v-if="temp[11] = filter.get(`node tier - no tier`)">No Tier Nodes: {{ temp[11] === undefined ? 0 : temp[11].length }}</l-button>&nbsp;
        <l-button wide v-if="temp[12] = filter.get(`organization - `)">No Organization Nodes: {{ temp[12] === undefined ? 0 : temp[12].length }}</l-button>&nbsp;
      </div>
      <div class="col-md-12">
        <h2 class="title">
          Benchmark
        </h2>
      </div>
      <p class="category" />
      <div class="col-12">
        <card>
          <div>
            <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
              <el-select
                v-model="pagination.perPage"
                class="select-default mb-3"
                style="width: 200px"
                placeholder="Per page"
              >
                <el-option
                  v-for="item in pagination.perPageOptions"
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
                  v-model="filters.default"
                  class="select-default mb-3"
                  style="width: 450px"
                  multiple
                  collapse-tags
                  placeholder="Filters"
                >
                  <el-option
                    v-for="item in filters.others"
                    :key="item"
                    class="select-default"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </div>
              <div
                col-md-3
                offset-md-6
              >
                <el-input
                  v-model="searchQuery"
                  type="search"
                  class="mb-3"
                  style="width: 200px"
                  placeholder="Search IP"
                  aria-controls="datatables"
                />
              </div>
            </div>
            <div
              slot="header"
              class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
              style="padding:20px;"
            >
              <div class="">
                <p class="card-category">
                  Showing {{ from + 1 }} to {{ to }} of {{ total }} entries
                </p>
              </div>
              <l-pagination
                v-model="pagination.currentPage"
                class="pagination-no-border"
                :per-page="pagination.perPage"
                :total="pagination.total"
              />
            </div>
            <div class="col-sm-12">
              <el-table
                stripe
                style="width: 100%;"
                :data="queriedData"
                border
                @sort-change="sortChange"
              >
                <el-table-column type="expand">
                  <template slot-scope="props">
                    <p><b>RPC Port:</b> {{ props.row.benchmark.info.rpcport }} </p>
                    <p><b>Benchmarking:</b> {{ props.row.benchmark.status.benchmarking }} </p>
                    <p><b>Flux:</b> {{ props.row.benchmark.status.flux }} </p>
                    <p><b>Architecture:</b> {{ props.row.benchmark.bench.architecture }}</p>
                    <p><b>Arm Board:</b> {{ props.row.benchmark.bench.armboard }}</p>
                    <p><b>Time:</b> {{ props.row.benchmark.bench.time }}</p>
                    <p><b>Converted Time:</b> {{ `${new Date(parseInt(props.row.benchmark.bench.time) * 1000).toLocaleString()}` }}</p>
                    <p><b>Real Cores:</b> {{ props.row.benchmark.bench.real_cores }}</p>
                    <p><b>Cores:</b> {{ props.row.benchmark.bench.cores }}</p>
                    <p><b>RAM:</b> {{ props.row.benchmark.bench.ram }}</p>
                    <p><b>HDD:</b> {{ props.row.benchmark.bench.hdd }}</p>
                    <p><b>Total Storage:</b> {{ props.row.benchmark.bench.totalstorage }}</p>
                    <p><b>Disk:</b> {{ props.row.benchmark.bench.disksinfo.disk }}</p>
                    <p><b>Disk Size:</b> {{ props.row.benchmark.bench.disksinfo.size }}</p>
                    <p><b>Disk Write Speed:</b> {{ props.row.benchmark.bench.disksinfo.writespeed }}</p>
                    <p><b>EPS:</b> {{ props.row.benchmark.bench.eps }}</p>
                    <p><b>Errors:</b> {{ props.row.benchmark.bench.error }}</p>
                  </template>
                </el-table-column>
                <el-table-column
                  v-for="column in tableColumns"
                  :key="column.label"
                  :min-width="column.minWidth"
                  :prop="column.prop"
                  :label="column.label"
                  sortable
                />
              </el-table>
            </div>
          </div>
          <div
            slot="footer"
            class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
          >
            <div class="">
              <p class="card-category">
                Showing {{ from + 1 }} to {{ to }} of {{ total }} entries
              </p>
            </div>
            <l-pagination
              v-model="pagination.currentPage"
              class="pagination-no-border"
              :per-page="pagination.perPage"
              :total="pagination.total"
            />
          </div>
        </card>
      </div>
    </div>
  </div>
</template>
<script>
import {
  Table, TableColumn, Select, Option,
} from 'element-ui';
import { Pagination as LPagination } from 'src/components/index';
import Fuse from 'fuse.js';
import axios from 'axios';
import { VueEllipseProgress } from 'vue-ellipse-progress';
import { MemoryStorage } from 'ttl-localstorage';
import {
  httpRequestFluxInfo, httpRequestDaemonInfo, httpRequestFluxHistoryStats,
} from '../Request/HttpRequest';

export default {
  components: {
    LPagination,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    VueEllipseProgress,
  },
  data() {
    return {
      pagination: {
        perPage: 100,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
        total: 0,
      },
      filters: {
        default: [],
        others: [],
      },
      searchQuery: '',
      propsToSearch: ['benchmark.bench.ipaddress'],
      tableColumns: [
        {
          prop: 'benchmark.bench.ipaddress',
          label: 'IP Address',
          minWidth: 150,
        },
        {
          prop: 'geolocation.org',
          label: 'Organization',
          minWidth: 140,
        },
        {
          prop: 'node.status.tier',
          label: 'Tier',
          minWidth: 60,
        },
        {
          prop: 'benchmark.bench.download_speed',
          label: 'Download Speed',
          minWidth: 110,
        },
        {
          prop: 'benchmark.bench.upload_speed',
          label: 'Upload Speed',
          minWidth: 100,
        },
        {
          prop: 'benchmark.bench.ping',
          label: 'Ping',
          minWidth: 100,
        },
        {
          prop: 'benchmark.status.status',
          label: 'Status',
          minWidth: 60,
        },
        {
          prop: 'benchmark.upnp',
          label: 'UPnP Enabled',
          minWidth: 100,
        },
        {
          prop: 'apps.count',
          label: 'Total Application Running',
          minWidth: 140,
        },
      ],
      tableData: [],
      values: [],
      filterValue: [],
      filter: new Map(),
      originalData: null,
      fuseSearch: null,
      myProgress: 0,
      temp: [],
    };
  },
  computed: {
    queriedData() {
      return this.processData();
    },
    to() {
      let highBound = this.from + this.pagination.perPage;
      if (this.total < highBound) {
        highBound = this.total;
      }
      return highBound;
    },
    from() {
      return this.pagination.perPage * (this.pagination.currentPage - 1);
    },
    total() {
      let result;
      if (this.searchQuery !== '') {
        const temp = [];
        result = this.fuseSearch.search(`=${this.searchQuery}`);
        for (let i = 0; i < Object.keys(result).length; i += 1) {
          temp.push(result[i].item);
        }
        result = temp;
      } else if (this.filters.default.length) {
        const arr = [];
        const data = [];
        this.filters.default.forEach((item) => {
          const objs = this.filter.get(item);
          objs.forEach((obj) => {
            if (!arr.includes(obj.benchmark.bench.ipaddress)) {
              arr.push(obj.benchmark.bench.ipaddress);
              data.push(obj);
            }
          });
        });
        result = data;
      } else {
        result = this.tableData;
      }
      this.paginationTotal(result.length);
      return result.length;
    },
  },
  async mounted() {
    this.initialize();
    this.myProgress = await httpRequestFluxInfo(axios, MemoryStorage);
    this.myProgress = await httpRequestDaemonInfo(axios, MemoryStorage);
    this.myProgress = await httpRequestFluxHistoryStats(axios, MemoryStorage);
    await this.getFluxInfo();
    await this.processFluxInfo();
    this.setSearch();
  },
  methods: {
    paginationTotal(value) {
      this.pagination.total = value;
    },
    async initialize() {
      this.myProgress = 20;
    },
    processData(sortProps) {
      let result;
      if (this.searchQuery !== '') {
        const temp = [];
        result = this.fuseSearch.search(`=${this.searchQuery}`);
        for (let i = 0; i < Object.keys(result).length; i += 1) {
          temp.push(result[i].item);
        }
        result = temp;
      } else if (this.filters.default.length) {
        const arr = [];
        const data = [];
        this.filters.default.forEach((item) => {
          const objs = this.filter.get(item);
          objs.forEach((obj) => {
            if (!arr.includes(obj.benchmark.bench.ipaddress)) {
              arr.push(obj.benchmark.bench.ipaddress);
              data.push(obj);
            }
          });
        });
        result = data;
      } else {
        result = this.tableData;
      }
      if (sortProps) {
        result = this.sorting(sortProps, result);
      }
      this.paginationTotal(result.length);
      return result.slice(this.from, this.to);
    },
    async getFluxInfo() {
      // Projection being used in this page are node,benchmark,geolocation,apps
      const lsdata = MemoryStorage.get('fluxinfo');
      this.values = lsdata;
    },
    async processFluxInfo() {
      this.values.map((el) => {
        const values = el;
        const filtered = values.apps.runningapps.filter((item) => item.Image !== 'containrrr/watchtower');
        values.apps.runningapps = filtered;
        values.apps.count = filtered.length !== undefined || filtered.length !== 0 ? filtered.length : 0;
        values.benchmark.upnp = values.benchmark.bench.ipaddress.includes(':') ? 'TRUE' : 'FALSE';
        let temp;
        temp = this.filter.has(`status - ${values.benchmark.status.status}`) ? this.filter.get(`status - ${values.benchmark.status.status}`) : [];
        if (!this.filter.has(`status - ${values.benchmark.status.status}`)) {
          this.filterValue.push(`status - ${values.benchmark.status.status}`);
        }
        temp.push(values);
        this.filter.set(`status - ${values.benchmark.status.status}`, temp);
        const tier = values.node.status.tier !== undefined ? values.node.status.tier.toLowerCase() : 'no tier';
        temp = this.filter.has(`node tier - ${tier}`) ? this.filter.get(`node tier - ${tier}`) : [];
        if (!this.filter.has(`node tier - ${tier}`)) {
          this.filterValue.push(`node tier - ${tier}`);
        }
        temp.push(values);
        this.filter.set(`node tier - ${tier}`, temp);
        temp = this.filter.has(`${values.benchmark.status.benchmarking} nodes - ${tier}`) ? this.filter.get(`${values.benchmark.status.benchmarking} nodes - ${tier}`) : [];
        if (values.benchmark.status.benchmarking === 'failed' && !this.filter.has(`${values.benchmark.status.benchmarking} nodes - ${tier}`)) {
          this.filterValue.push(`${values.benchmark.status.benchmarking} nodes - ${tier}`);
        }
        temp.push(values);
        this.filter.set(`${values.benchmark.status.benchmarking} nodes - ${tier}`, temp);
        const org = values.geolocation.org.length > 30 ? `${values.geolocation.org.slice(0, 30)}...` : values.geolocation.org;
        temp = this.filter.has(`organization - ${org}`) ? this.filter.get(`organization - ${org}`) : [];
        if (!this.filter.has(`organization - ${org}`)) {
          this.filterValue.push(`organization - ${org}`);
        }
        temp.push(values);
        this.filter.set(`organization - ${org}`, temp);
        temp = this.filter.has(`upnp enabled - ${values.benchmark.upnp}`) ? this.filter.get(`upnp enabled - ${values.benchmark.upnp}`) : [];
        if (!this.filter.has(`upnp enabled - ${values.benchmark.upnp}`)) {
          this.filterValue.push(`upnp enabled - ${values.benchmark.upnp}`);
        }
        temp.push(values);
        this.filter.set(`upnp enabled - ${values.benchmark.upnp}`, temp);
        const ip = values.benchmark.bench.ipaddress.split(':')[0];
        temp = this.filter.has(`upnp ip address - ${ip}`) ? this.filter.get(`upnp ip address - ${ip}`) : [];
        if (values.benchmark.upnp === 'TRUE' && !this.filter.has(`upnp ip address - ${ip}`)) {
          this.filterValue.push(`upnp ip address - ${ip}`);
        }
        if (values.benchmark.upnp === 'TRUE') {
          temp.push(values);
          this.filter.set(`upnp ip address - ${ip}`, temp);
        }
        let label = 'network - cumulus upload speed < 25';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (values.benchmark.bench.upload_speed < 25 && tier === 'cumulus' && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (values.benchmark.bench.upload_speed < 25 && tier === 'cumulus') {
          temp.push(values);
          this.filter.set(label, temp);
        }
        label = 'network - cumulus upload speed >= 25';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (values.benchmark.bench.upload_speed >= 25 && tier === 'cumulus' && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (values.benchmark.bench.upload_speed >= 25 && tier === 'cumulus') {
          temp.push(values);
          this.filter.set(label, temp);
        }
        label = 'network - cumulus download speed < 25';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (values.benchmark.bench.download_speed < 25 && tier === 'cumulus' && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (values.benchmark.bench.download_speed < 25 && tier === 'cumulus') {
          temp.push(values);
          this.filter.set(label, temp);
        }
        label = 'network - cumulus download speed >= 25';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (values.benchmark.bench.download_speed >= 25 && tier === 'cumulus' && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (values.benchmark.bench.download_speed >= 25 && tier === 'cumulus') {
          temp.push(values);
          this.filter.set(label, temp);
        }
        label = 'network - nimbus upload speed < 50';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (values.benchmark.bench.upload_speed < 50 && tier === 'nimbus' && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (values.benchmark.bench.upload_speed < 50 && tier === 'nimbus') {
          temp.push(values);
          this.filter.set(label, temp);
        }
        label = 'network - nimbus upload speed >= 50';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (values.benchmark.bench.upload_speed >= 50 && tier === 'nimbus' && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (values.benchmark.bench.upload_speed >= 50 && tier === 'nimbus') {
          temp.push(values);
          this.filter.set(label, temp);
        }
        label = 'network - nimbus download speed < 50';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (values.benchmark.bench.download_speed < 50 && tier === 'nimbus' && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (values.benchmark.bench.download_speed < 50 && tier === 'nimbus') {
          temp.push(values);
          this.filter.set(label, temp);
        }
        label = 'network - nimbus download speed >= 50';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (values.benchmark.bench.download_speed >= 50 && tier === 'nimbus' && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (values.benchmark.bench.download_speed >= 50 && tier === 'nimbus') {
          temp.push(values);
          this.filter.set(label, temp);
        }
        label = 'network - stratus upload speed < 100';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (values.benchmark.bench.upload_speed < 100 && tier === 'stratus' && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (values.benchmark.bench.upload_speed < 100 && tier === 'stratus') {
          temp.push(values);
          this.filter.set(label, temp);
        }
        label = 'network - stratus upload speed >= 100';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (values.benchmark.bench.upload_speed >= 100 && tier === 'stratus' && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (values.benchmark.bench.upload_speed >= 100 && tier === 'stratus') {
          temp.push(values);
          this.filter.set(label, temp);
        }
        label = 'network - stratus download speed < 100';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (values.benchmark.bench.download_speed < 100 && tier === 'stratus' && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (values.benchmark.bench.download_speed < 100 && tier === 'stratus') {
          temp.push(values);
          this.filter.set(label, temp);
        }
        label = 'network - stratus download speed >= 100';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (values.benchmark.bench.download_speed >= 100 && tier === 'stratus' && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (values.benchmark.bench.download_speed >= 100 && tier === 'stratus') {
          temp.push(values);
          this.filter.set(label, temp);
        }
        return values;
      });
      this.filters.others = this.filterValue.sort();
      this.tableData = this.values;
    },
    setSearch() {
      this.originalData = JSON.stringify(this.tableData);
      this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['benchmark.bench.ipaddress'] });
      this.myProgress = 100;
    },
    sortChange(sortProps) {
      this.processData(sortProps);
    },
    sorting(sortProps, data) {
      if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.bechmark.bench.ipaddress > b.bechmark.bench.ipaddress) {
            val = 1;
          } else if (a.bechmark.bench.ipaddress < b.bechmark.bench.ipaddress) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.bechmark.bench.ipaddress < b.bechmark.bench.ipaddress) {
            val = 1;
          } else if (a.bechmark.bench.ipaddress > b.bechmark.bench.ipaddress) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Download Speed' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.benchmark.bench.download_speed > b.benchmark.bench.download_speed) {
            val = 1;
          } else if (a.benchmark.bench.download_speed < b.benchmark.bench.download_speed) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Download Speed' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.benchmark.bench.download_speed < b.benchmark.bench.download_speed) {
            val = 1;
          } else if (a.benchmark.bench.download_speed > b.benchmark.bench.download_speed) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Upload Speed' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.benchmark.bench.upload_speed > b.benchmark.bench.upload_speed) {
            val = 1;
          } else if (a.benchmark.bench.upload_speed < b.benchmark.bench.upload_speed) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Upload Speed' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.benchmark.bench.upload_speed < b.benchmark.bench.upload_speed) {
            val = 1;
          } else if (a.benchmark.bench.upload_speed > b.benchmark.bench.upload_speed) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Ping' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.benchmark.bench.ping > b.benchmark.bench.ping) {
            val = 1;
          } else if (a.benchmark.bench.ping < b.benchmark.bench.ping) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Ping' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.benchmark.bench.ping < b.benchmark.bench.ping) {
            val = 1;
          } else if (a.benchmark.bench.ping > b.benchmark.bench.ping) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Status' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.benchmark.status.status > b.benchmark.status.status) {
            val = 1;
          } else if (a.benchmark.status.status < b.benchmark.status.status) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Status' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.benchmark.status.status < b.benchmark.status.status) {
            val = 1;
          } else if (a.benchmark.status.status > b.benchmark.status.status) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Total Application Running' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.apps.count > b.apps.count) {
            val = 1;
          } else if (a.apps.count < b.apps.count) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Total Application Running' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.apps.count < b.apps.count) {
            val = 1;
          } else if (a.apps.count > b.apps.count) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Tier' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.node.status.tier > b.node.status.tier) {
            val = 1;
          } else if (a.node.status.tier < b.node.status.tier) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Tier' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.node.status.tier < b.node.status.tier) {
            val = 1;
          } else if (a.node.status.tier > b.node.status.tier) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Organization' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.geolocation.org > b.geolocation.org) {
            val = 1;
          } else if (a.geolocation.org < b.geolocation.org) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Organization' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.geolocation.org < b.geolocation.org) {
            val = 1;
          } else if (a.geolocation.org > b.geolocation.org) {
            val = -1;
          }
          return val;
        });
      } else {
        this.tableData = JSON.parse(this.originalData);
      }
      return data;
    },
  },
};
</script>
<style>
</style>
