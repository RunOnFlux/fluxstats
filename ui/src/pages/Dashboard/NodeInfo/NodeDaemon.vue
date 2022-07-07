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
            v-if="key.includes('daemon version')"
            style="margin-right: 10px;"
            wide
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key.includes('flux version')"
            style="margin-right: 10px;"
            wide
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key.includes('benchmark version')"
            style="margin-right: 10px;"
            wide
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key.includes('bench version')"
            style="margin-right: 10px;"
            wide
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key.includes('bench speed version')"
            style="margin-right: 10px;"
            wide
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key.includes('protocol version')"
            style="margin-right: 10px;"
            wide
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key.includes('wallet version')"
            style="margin-right: 10px;"
            wide
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
        </div>
      </div>
      <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
        <h2 class="title">
          Daemon
        </h2>
        <div>
          <l-button
            @click="downloadCsvFile(dataFilters)"
          >
            <i class="nc-icon nc-cloud-download-93" />
          </l-button>
        </div>
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
                    <p><b>Daemon Info:</b></p>
                    <p><b>Protocol Version:</b> {{ props.row.daemon.info.protocolversion }} </p>
                    <p><b>Wallet Version:</b> {{ props.row.daemon.info.walletversion }}</p>
                    <p><b>Blocks:</b> {{ props.row.daemon.info.blocks }}</p>
                    <p><b>Time Offset:</b> {{ props.row.daemon.info.timeoffset }}</p>
                    <p><b>Connections:</b> {{ props.row.daemon.info.connections }}</p>
                    <p><b>Proxy:</b> {{ props.row.daemon.info.proxy }}</p>
                    <p><b>Difficulty:</b> {{ props.row.daemon.info.difficulty }}</p>
                    <p><b>Testnet:</b> {{ props.row.daemon.info.testnet }}</p>
                    <p><b>Key Pool Old Test:</b> {{ props.row.daemon.info.keypoololdest }}</p>
                    <p><b>Key Pool Size:</b> {{ props.row.daemon.info.keypoolsize }}</p>
                    <p><b>Pay Txn Fee:</b> {{ props.row.daemon.info.paytxfee }}</p>
                    <p><b>Relay Fee:</b> {{ props.row.daemon.info.relayfee }}</p>
                    <p><b>Errors:</b> {{ props.row.daemon.info.errors }}</p>
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
      propsToSearch: ['ip'],
      tableColumns: [
        {
          prop: 'ip',
          label: 'IP Address',
          minWidth: 200,
        },
        {
          prop: 'daemon.info.version',
          label: 'Daemon Version',
          minWidth: 120,
        },
        {
          prop: 'flux.version',
          label: 'Flux Version',
          minWidth: 100,
        },
        {
          prop: 'benchmark.info.version',
          label: 'Benchmark Version',
          minWidth: 100,
        },
        {
          prop: 'benchmark.bench.bench_version',
          label: 'Bench Version',
          minWidth: 100,
        },
        {
          prop: 'benchmark.bench.speed_version',
          label: 'Bench Speed Version',
          minWidth: 100,
        },
      ],
      tableData: [],
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
      // Projection being used in this page are ip,daemon,benchmark,flux
      const lsdata = MemoryStorage.get('fluxinfo');
      this.values = lsdata;
    },
    async processFluxInfo() {
      this.values.map((value) => {
        let temp;
        const values = value;
        temp = this.filter.has(`daemon version - ${values.daemon.info.version}`) ? this.filter.get(`daemon version - ${values.daemon.info.version}`) : [];
        if (!this.filter.has(`daemon version - ${values.daemon.info.version}`)) {
          this.filterValue.push(`daemon version - ${values.daemon.info.version}`);
        }
        temp.push(values);
        this.filter.set(`daemon version - ${values.daemon.info.version}`, temp);
        temp = this.filter.has(`flux version - ${values.flux.version}`) ? this.filter.get(`flux version - ${values.flux.version}`) : [];
        if (!this.filter.has(`flux version - ${values.flux.version}`)) {
          this.filterValue.push(`flux version - ${values.flux.version}`);
        }
        temp.push(values);
        this.filter.set(`flux version - ${values.flux.version}`, temp);
        temp = this.filter.has(`benchmark version - ${values.benchmark.info.version}`) ? this.filter.get(`benchmark version - ${values.benchmark.info.version}`) : [];
        if (!this.filter.has(`benchmark version - ${values.benchmark.info.version}`)) {
          this.filterValue.push(`benchmark version - ${values.benchmark.info.version}`);
        }
        temp.push(values);
        this.filter.set(`benchmark version - ${values.benchmark.info.version}`, temp);
        temp = this.filter.has(`bench version - ${values.benchmark.bench.bench_version}`) ? this.filter.get(`bench version - ${values.benchmark.bench.bench_version}`) : [];
        if (!this.filter.has(`bench version - ${values.benchmark.bench.bench_version}`)) {
          this.filterValue.push(`bench version - ${values.benchmark.bench.bench_version}`);
        }
        temp.push(values);
        this.filter.set(`bench version - ${values.benchmark.bench.bench_version}`, temp);
        temp = this.filter.has(`bench speed version - ${values.benchmark.bench.speed_version}`) ? this.filter.get(`bench speed version - ${values.benchmark.bench.speed_version}`) : [];
        if (!this.filter.has(`bench speed version - ${values.benchmark.bench.speed_version}`)) {
          this.filterValue.push(`bench speed version - ${values.benchmark.bench.speed_version}`);
        }
        temp.push(values);
        this.filter.set(`bench speed version - ${values.benchmark.bench.speed_version}`, temp);
        temp = this.filter.has(`protocol version - ${values.daemon.info.protocolversion}`) ? this.filter.get(`protocol version - ${values.daemon.info.protocolversion}`) : [];
        if (!this.filter.has(`protocol version - ${values.daemon.info.protocolversion}`)) {
          this.filterValue.push(`protocol version - ${values.daemon.info.protocolversion}`);
        }
        temp.push(values);
        this.filter.set(`protocol version - ${values.daemon.info.protocolversion}`, temp);
        temp = this.filter.has(`wallet version - ${values.daemon.info.walletversion}`) ? this.filter.get(`wallet version - ${values.daemon.info.walletversion}`) : [];
        if (!this.filter.has(`wallet version - ${values.daemon.info.walletversion}`)) {
          this.filterValue.push(`wallet version - ${values.daemon.info.walletversion}`);
        }
        temp.push(values);
        this.filter.set(`wallet version - ${values.daemon.info.walletversion}`, temp);
        return values;
      });
      this.filters.others = this.filterValue.sort();
      this.tableData = this.values;
    },
    setSearch() {
      this.originalData = JSON.stringify(this.tableData);
      this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['ip'] });
      this.myProgress = 100;
    },
    sortChange(sortProps) {
      this.processData(sortProps);
    },
    sorting(sortProps, data) {
      if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val;
          if (a.ip > b.ip) {
            val = 1;
          } else if (a.ip < b.ip) {
            val = -1;
          } else {
            val = 0;
          }
          return val;
        });
      } else if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.ip < b.ip) {
            val = 1;
          } else if (a.ip > b.ip) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Daemon Version' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.daemon.info.version > b.daemon.info.version) {
            val = 1;
          } else if (a.daemon.info.version < b.daemon.info.version) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Daemon Version' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.daemon.info.version < b.daemon.info.version) {
            val = 1;
          } else if (a.daemon.info.version > b.daemon.info.version) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Benchmark Version' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.benchmark.info.version > b.benchmark.info.version) {
            val = 1;
          } else if (a.benchmark.info.version < b.benchmark.info.version) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Benchmark Version' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.benchmark.info.version < b.benchmark.info.version) {
            val = 1;
          } else if (a.benchmark.info.version > b.benchmark.info.version) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Flux Version' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.flux.version > b.flux.version) {
            val = 1;
          } else if (a.flux.version < b.flux.version) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Flux Version' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.flux.version < b.flux.version) {
            val = 1;
          } else if (a.flux.version > b.flux.version) {
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
          ip: !item.ip ? '' : item.ip,
          daemonVersion: !item.daemon.info.version ? '' : item.daemon.info.version,
          fluxVersion: !item.flux.version ? '' : item.flux.version,
          benchmarkVersion: !item.benchmark.info.version ? '' : item.benchmark.info.version,
          benchVersion: !item.benchmark.bench.bench_version ? '' : item.benchmark.bench.bench_version,
          benchSpeedVersion: !item.benchmark.bench.speed_version ? '' : item.benchmark.bench.speed_version,
          protocolVersion: !item.daemon.info.protocolversion ? '' : item.daemon.info.protocolversion,
          walletVersion: !item.daemon.info.walletversion ? '' : item.daemon.info.walletversion,
          blocks: !item.daemon.info.blocks ? '' : item.daemon.info.blocks,
          timeOffset: !item.daemon.info.timeoffset ? '' : item.daemon.info.timeoffset,
          connections: !item.daemon.info.connections ? '' : item.daemon.info.connections,
          proxy: !item.daemon.info.proxy ? '' : item.daemon.info.proxy,
          difficulty: !item.daemon.info.difficulty ? '' : item.daemon.info.difficulty,
          testnet: !item.daemon.info.testnet ? '' : item.daemon.info.testnet,
          keyPoolOldTest: !item.daemon.info.keypoololdest ? '' : item.daemon.info.keypoololdest,
          keyPoolSize: !item.daemon.info.keypoolsize ? '' : item.daemon.info.keypoolsize,
          payTxnFee: !item.daemon.info.paytxfee ? '' : item.daemon.info.paytxfee,
          relayFee: !item.daemon.info.relayfee ? '' : item.daemon.info.relayfee,
          errors: !item.daemon.info.errors ? '' : item.daemon.info.errors,
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
        filename: `Node_Version_${month}${day}${year}`,
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: true,
        title: `Node Version - ${month}/${day}/${year}`,
        useTextFile: false,
        useBom: true,
        headers: [
          'IP Address',
          'Daemon Version',
          'Flux Version',
          'Benchmark Version',
          'Bench Version',
          'Bench Speed Version',
          'Protocol Version',
          'Wallet Version',
          'Blocks',
          'Time Offset',
          'Connections',
          'Proxy',
          'Difficulty',
          'Testnet',
          'Key Pool Old Test',
          'Key Pool Size',
          'Pay Txn Fee',
          'Relay Fee',
          'Errors',
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
