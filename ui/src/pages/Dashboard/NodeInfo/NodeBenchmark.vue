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
      <div class="col-12 d-flex flex-wrap">
        <div
          v-for="[key, value] in filter"
          :key="key"
        >
          <l-button
            v-if="key.includes('<')"
            style="margin-right: 10px;"
            size="sm"
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key.includes('upnp enabled - TRUE')"
            style="margin-right: 10px;"
            size="sm"
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key.includes('failed nodes')"
            style="margin-right: 10px;"
            size="sm"
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key === 'node tier - no tier'"
            style="margin-right: 10px;"
            size="sm"
          >
            no tier: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key === 'organization - '"
            style="margin-right: 10px;"
            size="sm"
          >
            no organization: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key === 'no ip address'"
            style="margin-right: 10px;"
            size="sm"
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
        </div>
      </div>
      <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
        <h2 class="title">
          Benchmark
        </h2>
      </div>
      <p class="category" />
      <div class="col-12">
        <card>
          <div>
            <div
              class="pull-right"
              style="padding:20px;"
            >
              <l-button
                @click="downloadCsvFile(dataFilters)"
              >
                <i class="nc-icon nc-cloud-download-93" />
              </l-button>
            </div>
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
                  filterable
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
              <el-input
                v-model="searchQuery"
                type="search"
                class="mb-3"
                style="width: 200px"
                placeholder="Search IP"
                aria-controls="datatables"
              />
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
                    <p><b>Converted Time:</b> {{ `${new Date(parseInt(props.row.benchmark.bench.time, 10) * 1000).toLocaleString()}` }}</p>
                    <p><b>Real Cores:</b> {{ props.row.benchmark.bench.real_cores }}</p>
                    <p><b>Cores:</b> {{ props.row.benchmark.bench.cores }}</p>
                    <p><b>RAM:</b> {{ props.row.benchmark.bench.ram }}</p>
                    <p><b>HDD:</b> {{ props.row.benchmark.bench.hdd }}</p>
                    <p><b>Total Storage:</b> {{ props.row.benchmark.bench.totalstorage }}</p>
                    <p><b>Disk:</b> {{ props.row.benchmark.bench.disksinfo.disk }}</p>
                    <p><b>Disk Size:</b> {{ props.row.benchmark.bench.disksinfo.size }}</p>
                    <p><b>Disk Write Speed:</b> {{ props.row.benchmark.bench.disksinfo.writespeed }}</p>
                    <p><b>EPS:</b> {{ props.row.benchmark.bench.eps }}</p>
                    <p><b class="text-danger">Errors:</b> {{ props.row.benchmark.bench.error }}</p>
                    <p><b class="text-warning">Needed To Fix Issues:</b> {{ props.row.benchmark.issues }} </p>
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
import { ExportToCsv } from 'export-to-csv';
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
      dataFilters: [],
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
      const result = this.dataFilters;
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
    setDataFilters(data) {
      this.dataFilters = data;
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
        const data = [];
        this.filters.default.forEach((item) => {
          const objs = this.filter.get(item);
          objs.forEach((obj) => {
            data.push(obj);
          });
        });
        result = data;
      } else {
        result = this.tableData;
      }
      if (sortProps) {
        result = this.sorting(sortProps, result);
      }
      this.setDataFilters(result);
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
        let temp;
        let label;
        const values = el;
        const ip = values.benchmark.bench.ipaddress;
        const ipaddress = ip.split(':')[0];
        const benchmarkstatus = values.benchmark.status.benchmarking;
        const nodestatus = values.benchmark.status.status;
        const bencherror = values.benchmark.bench.error;
        const tier = values.node.status.tier ? values.node.status.tier.toLowerCase() : 'no tier';
        const org = values.geolocation.org.length > 30 ? `${values.geolocation.org.slice(0, 30)}...` : values.geolocation.org;
        const filtered = values.apps.runningapps.filter((item) => item.Image !== 'containrrr/watchtower');
        values.benchmark.issues = [];
        values.apps.runningapps = filtered;
        values.apps.count = filtered.length || filtered.length !== 0 ? filtered.length : 0;
        values.benchmark.upnp = values.benchmark.bench.ipaddress.includes(':') ? 'TRUE' : 'FALSE';
        const upnpstatus = values.benchmark.upnp;
        temp = this.filter.has(`status - ${nodestatus}`) ? this.filter.get(`status - ${nodestatus}`) : [];
        if (!this.filter.has(`status - ${nodestatus}`)) {
          this.filterValue.push(`status - ${nodestatus}`);
        }
        temp.push(values);
        this.filter.set(`status - ${nodestatus}`, temp);
        temp = this.filter.has(`node tier - ${tier}`) ? this.filter.get(`node tier - ${tier}`) : [];
        if (!this.filter.has(`node tier - ${tier}`)) {
          this.filterValue.push(`node tier - ${tier}`);
        }
        if (tier === 'no tier' && bencherror === '') {
          values.benchmark.issues.push('No Tier');
        }
        temp.push(values);
        this.filter.set(`node tier - ${tier}`, temp);
        temp = this.filter.has('no ip address') ? this.filter.get('no ip address') : [];
        if ((!ip || ip === '') && !this.filter.has('no ip address')) {
          this.filterValue.push('no ip address');
        }
        if (!ip || ip === '') {
          if (bencherror === '') {
            values.benchmark.issues.push('No IP Address');
          }
          temp.push(values);
          this.filter.set('no ip address', temp);
        }
        temp = this.filter.has(`${benchmarkstatus} nodes - ${tier}`) ? this.filter.get(`${benchmarkstatus} nodes - ${tier}`) : [];
        if (benchmarkstatus === 'failed' && !this.filter.has(`${benchmarkstatus} nodes - ${tier}`)) {
          this.filterValue.push(`${benchmarkstatus} nodes - ${tier}`);
        }
        temp.push(values);
        this.filter.set(`${benchmarkstatus} nodes - ${tier}`, temp);
        temp = this.filter.has(`organization - ${org}`) ? this.filter.get(`organization - ${org}`) : [];
        if (!this.filter.has(`organization - ${org}`)) {
          this.filterValue.push(`organization - ${org}`);
        }
        temp.push(values);
        this.filter.set(`organization - ${org}`, temp);
        temp = this.filter.has(`upnp enabled - ${upnpstatus}`) ? this.filter.get(`upnp enabled - ${upnpstatus}`) : [];
        if (!this.filter.has(`upnp enabled - ${upnpstatus}`)) {
          this.filterValue.push(`upnp enabled - ${upnpstatus}`);
        }
        temp.push(values);
        this.filter.set(`upnp enabled - ${upnpstatus}`, temp);
        temp = this.filter.has(`upnp ip address - ${ipaddress}`) ? this.filter.get(`upnp ip address - ${ipaddress}`) : [];
        if (upnpstatus === 'TRUE' && !this.filter.has(`upnp ip address - ${ipaddress}`)) {
          this.filterValue.push(`upnp ip address - ${ipaddress}`);
        }
        if (upnpstatus === 'TRUE') {
          temp.push(values);
          this.filter.set(`upnp ip address - ${ipaddress}`, temp);
        }
        label = 'network - cumulus upload speed < 25';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (values.benchmark.bench.upload_speed < 25 && tier === 'cumulus' && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (values.benchmark.bench.upload_speed < 25 && tier === 'cumulus') {
          if (bencherror === '') {
            values.benchmark.issues.push('Upload Speed < 25');
          }
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
          if (bencherror === '') {
            values.benchmark.issues.push('Download Speed < 25');
          }
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
          if (bencherror === '') {
            values.benchmark.issues.push('Upload Speed < 50');
          }
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
          if (bencherror === '') {
            values.benchmark.issues.push('Download Speed < 50');
          }
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
          if (bencherror === '') {
            values.benchmark.issues.push('Upload Speed < 100');
          }
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
          if (bencherror === '') {
            values.benchmark.issues.push('Download Speed < 100');
          }
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
        data.sort((a, b) => {
          let val = 0;
          if (a.geolocation.org > b.geolocation.org) {
            val = 1;
          } else if (a.geolocation.org < b.geolocation.org) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Organization' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
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
    processDataForCsv(data) {
      const values = [];
      data.forEach((item) => {
        values.push({
          ip: !item.benchmark.bench.ipaddress ? '' : item.benchmark.bench.ipaddress,
          organization: !item.geolocation.org ? '' : item.geolocation.org,
          tier: !item.node.status.tier ? '' : item.node.status.tier,
          downloadSpeed: !item.benchmark.bench.download_speed ? '' : item.benchmark.bench.download_speed,
          uploadSpeed: !item.benchmark.bench.upload_speed ? '' : item.benchmark.bench.upload_speed,
          ping: !item.benchmark.bench.ping ? '' : item.benchmark.bench.ping,
          status: !item.benchmark.status.status ? '' : item.benchmark.status.status,
          upnpEnabled: !item.benchmark.upnp ? '' : item.benchmark.upnp,
          totalApplicationRunning: !item.apps.count ? 0 : item.apps.count,
          rpcPort: !item.benchmark.info.rpcport ? '' : item.benchmark.info.rpcport,
          benchmarking: !item.benchmark.status.benchmarking ? '' : item.benchmark.status.benchmarking,
          flux: !item.benchmark.status.flux ? '' : item.benchmark.status.flux,
          architecture: !item.benchmark.bench.architecture ? '' : item.benchmark.bench.architecture,
          armBoard: !item.benchmark.bench.armboard ? '' : item.benchmark.bench.armboard,
          time: !item.benchmark.bench.time ? '' : item.benchmark.bench.time,
          convertedTime: !item.benchmark.bench.time ? '' : new Date(parseInt(item.benchmark.bench.time, 10) * 1000).toLocaleString(),
          realCores: !item.benchmark.bench.real_cores ? '' : item.benchmark.bench.real_cores,
          cores: !item.benchmark.bench.cores ? '' : item.benchmark.bench.cores,
          ram: !item.benchmark.bench.ram ? '' : item.benchmark.bench.ram,
          hdd: !item.benchmark.bench.hdd ? '' : item.benchmark.bench.hdd,
          totalStorage: !item.benchmark.bench.totalstorage ? '' : item.benchmark.bench.totalstorage,
          disk: !item.benchmark.bench.disksinfo.disk ? '' : item.benchmark.bench.disksinfo.disk,
          diskSize: !item.benchmark.bench.disksinfo.size ? '' : item.benchmark.bench.disksinfo.size,
          diskWriteSpeed: !item.benchmark.bench.disksinfo.writespeed ? '' : item.benchmark.bench.disksinfo.writespeed,
          eps: !item.benchmark.bench.eps ? '' : item.benchmark.bench.eps,
          errors: !item.benchmark.bench.error ? '' : item.benchmark.bench.error,
          neededToFixIssues: !item.benchmark.issues ? '' : item.benchmark.issues,
        });
      });
      return values;
    },
    downloadCsvFile(data) {
      const date = new Date();
      const month = date.getMonth();
      const day = date.getDate();
      const year = date.getFullYear();
      const options = {
        filename: `Node_Benchmark_${month}${day}${year}`,
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: true,
        title: `Node Benchmark - ${month}/${day}/${year}`,
        useTextFile: false,
        useBom: true,
        headers: [
          'IP Address',
          'Organization',
          'Tier',
          'Download Speed',
          'Upload Speed',
          'Ping',
          'Status',
          'UPnP Enabled',
          'Total Application Running',
          'RPC Port',
          'Benchmarking',
          'Flux',
          'Architecture',
          'Arm Board',
          'Time',
          'Converted Time',
          'Real Cores',
          'Cores',
          'RAM',
          'HDD',
          'Total Storage',
          'Disk',
          'Disk Size',
          'Disk Write Speed',
          'EPS',
          'Errors',
          'Needed To Fix Issues',
        ],
      };
      const csvExporter = new ExportToCsv(options);
      csvExporter.generateCsv(this.processDataForCsv(data));
    },
  },
};
</script>
<style>
</style>
