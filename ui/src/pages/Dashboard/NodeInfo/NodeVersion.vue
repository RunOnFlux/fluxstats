<template>
  <div class="row">
    <div class="col-md-12">
      <h2 class="title">
        Version
      </h2>
    </div>
    <p class="category" />
    <div>
      <loading
        :active.sync="isLoading"
        :can-cancel="true"
      />
    </div>
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
          <div class="col-sm-12">
            <el-table
              stripe
              style="width: 100%;"
              :data="queriedData"
              border
            >
              <el-table-column type="expand">
                <template slot-scope="props">
                  <p><b>Flux Info:</b></p>
                  <p><b>Zel ID:</b> {{ props.row.flux.zelid }} </p>
                  <p><b>Crux ID:</b> {{ props.row.flux.cruxid }}</p>
                  <p><b>DOS State:</b> {{ props.row.flux.dos.dosState }}</p>
                  <p><b>DOS Message:</b> {{ props.row.flux.dos.dosMessage }}</p>
                  <br>
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
                  <br>
                  <p><b>Benchmark Info:</b></p>
                  <p><b>RPC Port:</b> {{ props.row.benchmark.info.rpcport }} </p>
                  <p><b>Architecture:</b> {{ props.row.benchmark.bench.architecture }}</p>
                  <p><b>Arm Board:</b> {{ props.row.benchmark.bench.armboard }}</p>
                  <p><b>Time:</b> {{ props.row.benchmark.bench.time }}</p>
                  <p><b>Converted Time:</b> {{ `${new Date(parseInt(props.row.benchmark.bench.time) * 1000).toLocaleDateString()} ${new Date(parseInt(props.row.benchmark.bench.time) * 1000).toLocaleTimeString()}` }}</p>
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
</template>
<script>
import {
  Table, TableColumn, Select, Option,
} from 'element-ui';
import { Pagination as LPagination } from 'src/components/index';
import Fuse from 'fuse.js';
import axios from 'axios';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
  components: {
    LPagination,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    Loading,
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
          minWidth: 250,
        },
        {
          prop: 'benchmark.info.version',
          label: 'Benchmark Version',
          minWidth: 100,
        },
        {
          prop: 'flux.version',
          label: 'Flux Version',
          minWidth: 120,
        },
      ],
      tableData: [],
      fuseSearch: null,
      isLoading: false,
    };
  },
  computed: {
    pagedData() {
      return this.tableData.slice(this.from, this.to);
    },
    /** *
     * Searches through table data and returns a paginated array.
     * Note that this should not be used for table with a lot of data as it might be slow!
     * Do the search and the pagination on the server and display the data retrieved from server instead.
     * @returns {computed.pagedData}
     */
    queriedData() {
      let result = this.tableData;
      if (this.searchQuery !== '') {
        result = this.fuseSearch.search(this.searchQuery);
        this.paginationTotal(result.length);
      }
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
      this.paginationTotal(this.tableData.length);
      return this.tableData.length;
    },
  },
  mounted() {
    this.isLoading = true;
    axios
      .get('https://stats.runonflux.io/fluxinfo?projection=ip,daemon,benchmark,flux')
      .then((response) => {
        this.tableData = response.data.data;
        this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['ip'] });
        this.isLoading = false;
      });
  },
  methods: {
    paginationTotal(value) {
      this.pagination.total = value;
    },
  },
};
</script>
<style>
</style>
