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
import { MemoryStorage } from 'ttl-localstorage';

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
          prop: 'flux.version',
          label: 'Flux Version',
          minWidth: 120,
        },
        {
          prop: 'daemon.info.version',
          label: 'Daemon Version',
          minWidth: 100,
        },
        {
          prop: 'benchmark.info.version',
          label: 'Benchmark Version',
          minWidth: 100,
        },
      ],
      tableData: [],
      originalData: null,
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
      this.paginationTotal(result.length);
      return result.length;
    },
  },
  async mounted() {
    this.setLoading(true);
    await this.getFluxInfo();
    this.setSearch();
    this.setLoading(false);
  },
  methods: {
    paginationTotal(value) {
      this.pagination.total = value;
    },
    async getFluxInfo() {
      const lsdata = MemoryStorage.get('fluxinfo?projection=ip,daemon,benchmark,flux');
      if (!lsdata) {
        const response = await axios.get('https://stats.runonflux.io/fluxinfo?projection=ip,daemon,benchmark,flux');
        MemoryStorage.put('fluxinfo?projection=ip,daemon,benchmark,flux', response.data.data, 600);
        this.tableData = response.data.data;
      } else {
        this.tableData = lsdata;
      }
    },
    setSearch() {
      this.originalData = JSON.stringify(this.tableData);
      this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['ip'] });
    },
    setLoading(value) {
      this.isLoading = value;
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
  },
};
</script>
<style>
</style>
