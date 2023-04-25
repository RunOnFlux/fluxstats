<template>
  <div>
    <div class="col-12 d-flex flex-wrap">
      <div
        v-for="(btn, idx) in filters.states"
        :key="idx"
      >
        <l-button
          v-if="btn.name.includes('daemon version')"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name.includes('flux version')"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name.includes('benchmark version')"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name.includes('testnet')"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name.includes('bench version')"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name.includes('bench speed version')"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name.includes('protocol version')"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name.includes('wallet version')"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
      </div>
    </div>
    <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
      <h2 class="title">
        Daemon
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
              title="Download CSV"
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
        <vue-element-loading :active="isLoading" spinner="bar-fade-scale" />
      </card>
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
import { MemoryStorage } from 'ttl-localstorage';
import { ExportToCsv } from 'export-to-csv';
import VueElementLoading from 'vue-element-loading';
import CsvService from '../Service/CsvService';
import SearchService from '../Service/SearchService';
import TransformationService from '../Service/TransformationService';
import SortService from '../Service/SortService';
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
    VueElementLoading,
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
        states: [],
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
      dataFilters: [],
      isLoading: true,
    };
  },
  computed: {
    queriedData() {
      return this.processData(false, true);
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
    try {
      await httpRequestFluxInfo(axios, MemoryStorage);
      await httpRequestDaemonInfo(axios, MemoryStorage);
      await httpRequestFluxHistoryStats(axios, MemoryStorage);
      await this.getFluxInfo();
      await this.processFluxInfo();
      this.setSearch();
      this.isLoading = false;
    } catch (e) {
      this.$router.push('/flux/maintenance/error').catch(() => {});
    }
  },
  methods: {
    paginationTotal(value) {
      this.pagination.total = value;
    },
    setDataFilters(data) {
      this.dataFilters = data;
    },
    processData(sortProps, isProcessingState) {
      let result;
      if (this.searchQuery !== '') {
        result = SearchService.search(this.fuseSearch, this.searchQuery);
      } else if (this.filters.default.length) {
        result = TransformationService.processFilters(this.filters, this.filter, 'nodedaemon');
      } else {
        result = this.tableData;
      }
      if (sortProps) {
        result = this.sorting(sortProps, result);
      }
      if (isProcessingState) {
        this.processState(this.filters.default);
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
        const infoversion = values.daemon.info.version;
        const fluxversion = values.flux.version;
        const benchmarkinfoversion = values.benchmark.info.version;
        const benchversion = values.benchmark.bench.bench_version;
        const speedversion = values.benchmark.bench.speed_version;
        const infoprotocolversion = values.daemon.info.protocolversion;
        const infowalletversion = values.daemon.info.walletversion;
        const infotestnet = values.daemon.info.testnet;
        temp = this.filter.has(`daemon version - ${infoversion}`) ? this.filter.get(`daemon version - ${infoversion}`) : [];
        if (!this.filter.has(`daemon version - ${infoversion}`)) {
          this.filterValue.push(`daemon version - ${infoversion}`);
        }
        temp.push(values);
        this.filter.set(`daemon version - ${infoversion}`, temp);
        temp = this.filter.has(`flux version - ${fluxversion}`) ? this.filter.get(`flux version - ${fluxversion}`) : [];
        if (!this.filter.has(`flux version - ${fluxversion}`)) {
          this.filterValue.push(`flux version - ${fluxversion}`);
        }
        temp.push(values);
        this.filter.set(`flux version - ${fluxversion}`, temp);
        temp = this.filter.has(`benchmark version - ${benchmarkinfoversion}`) ? this.filter.get(`benchmark version - ${benchmarkinfoversion}`) : [];
        if (!this.filter.has(`benchmark version - ${benchmarkinfoversion}`)) {
          this.filterValue.push(`benchmark version - ${benchmarkinfoversion}`);
        }
        temp.push(values);
        this.filter.set(`benchmark version - ${benchmarkinfoversion}`, temp);
        temp = this.filter.has(`bench version - ${benchversion}`) ? this.filter.get(`bench version - ${benchversion}`) : [];
        if (!this.filter.has(`bench version - ${benchversion}`)) {
          this.filterValue.push(`bench version - ${benchversion}`);
        }
        temp.push(values);
        this.filter.set(`bench version - ${benchversion}`, temp);
        temp = this.filter.has(`bench speed version - ${speedversion}`) ? this.filter.get(`bench speed version - ${speedversion}`) : [];
        if (!this.filter.has(`bench speed version - ${speedversion}`)) {
          this.filterValue.push(`bench speed version - ${speedversion}`);
        }
        temp.push(values);
        this.filter.set(`bench speed version - ${speedversion}`, temp);
        temp = this.filter.has(`protocol version - ${infoprotocolversion}`) ? this.filter.get(`protocol version - ${infoprotocolversion}`) : [];
        if (!this.filter.has(`protocol version - ${infoprotocolversion}`)) {
          this.filterValue.push(`protocol version - ${infoprotocolversion}`);
        }
        temp.push(values);
        this.filter.set(`protocol version - ${infoprotocolversion}`, temp);
        temp = this.filter.has(`wallet version - ${infowalletversion}`) ? this.filter.get(`wallet version - ${infowalletversion}`) : [];
        if (!this.filter.has(`wallet version - ${infowalletversion}`)) {
          this.filterValue.push(`wallet version - ${infowalletversion}`);
        }
        temp.push(values);
        this.filter.set(`wallet version - ${infowalletversion}`, temp);
        temp = this.filter.has(`testnet - ${infotestnet}`) ? this.filter.get(`testnet - ${infotestnet}`) : [];
        if (!this.filter.has(`testnet - ${infotestnet}`)) {
          this.filterValue.push(`testnet - ${infotestnet}`);
        }
        temp.push(values);
        this.filter.set(`testnet - ${infotestnet}`, temp);
        return values;
      });
      this.filters.others = this.filterValue.sort();
      this.tableData = this.values;
      this.filterValue.forEach((value) => {
        this.filters.states.push({
          name: value,
          state: false,
        });
      });
    },
    setSearch() {
      this.originalData = JSON.stringify(this.tableData);
      this.fuseSearch = SearchService.generateSearch(Fuse, this.tableData, ['ip']);
    },
    sortChange(sortProps) {
      this.processData(sortProps, true);
    },
    sorting(sortProps, data) {
      const ret = SortService.sortNodeDaemon(data, sortProps, this.originalData);
      this.tableData = Object.keys(ret.tableDatas).length > 0 ? ret.tableDatas : this.tableData;
      return ret.datas;
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
      const module = 'Node_Daemon';
      const headers = [
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
      ];
      CsvService.Download(this.processDataForCsv(data), headers, module, ExportToCsv);
    },
    processFilters(key) {
      if (!this.filters.default.includes(key)) {
        this.filters.default.push(key);
      } else {
        this.filters.default = this.filters.default.filter((value) => value !== key);
      }
      const keys = [];
      keys.push(key);
      this.processState(keys);
      return this.processData(false, false);
    },
    processState(keys) {
      this.filters = TransformationService.processState(keys, this.filters);
    },
  },
};
</script>
<style>
</style>
