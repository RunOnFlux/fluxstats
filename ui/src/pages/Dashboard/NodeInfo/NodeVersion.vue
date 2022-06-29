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
      <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
        <h2 class="title">
          Version
        </h2>
        <div>
          <l-button v-on:click="downloadCsvFile(dataFilters)"><i class="nc-icon nc-cloud-download-93"></i></l-button>
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
      originalData: null,
      fuseSearch: null,
      myProgress: 0,
      dataFilters: [],
    };
  },
  computed: {
    queriedData() {
      let result;
      if (this.searchQuery !== '') {
        const temp = [];
        result = this.fuseSearch.search(`=${this.searchQuery}`);
        for (let i = 0; i < Object.keys(result).length; i += 1) {
          temp.push(result[i].item);
        }
        result = temp;
      } else {
        result = this.tableData;
      }
      this.setDataFilters(result);
      this.paginationTotal(result.length);
      return result.slice(this.from, this.to);
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
    async getFluxInfo() {
      // Projection being used in this page are ip,daemon,benchmark,flux
      const lsdata = MemoryStorage.get('fluxinfo');
      this.tableData = lsdata;
    },
    setSearch() {
      this.originalData = JSON.stringify(this.tableData);
      this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['ip'] });
      this.myProgress = 100;
    },
    sortChange(sortProps) {
      if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
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
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.ip < b.ip) {
            val = 1;
          } else if (a.ip > b.ip) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Daemon Version' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.daemon.info.version > b.daemon.info.version) {
            val = 1;
          } else if (a.daemon.info.version < b.daemon.info.version) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Daemon Version' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.daemon.info.version < b.daemon.info.version) {
            val = 1;
          } else if (a.daemon.info.version > b.daemon.info.version) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Benchmark Version' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.benchmark.info.version > b.benchmark.info.version) {
            val = 1;
          } else if (a.benchmark.info.version < b.benchmark.info.version) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Benchmark Version' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.benchmark.info.version < b.benchmark.info.version) {
            val = 1;
          } else if (a.benchmark.info.version > b.benchmark.info.version) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Flux Version' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.flux.version > b.flux.version) {
            val = 1;
          } else if (a.flux.version < b.flux.version) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Flux Version' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
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
