<template>
  <div class="row">
    <div class="col-md-12">
      <h2 class="title">
        Benchmark
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
            <div
              col-md-6
              offset-md-3
            >
              <el-select
                v-model="filters.default"
                class="select-default mb-3"
                style="width: 200px"
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
              <el-select
                v-model="filtersval.default"
                class="select-default mb-3"
                style="width: 200px"
                placeholder="Filters"
              >
                <el-option
                  v-for="item in filtersval.others"
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
      filters: {
        default: 'filter off',
        others: ['node version', 'nodes hashes', 'filter off'],
      },
      filtersval: {
        default: 'none',
        others: ['none'],
      },
      searchQuery: '',
      propsToSearch: ['benchmark.bench.ipaddress'],
      tableColumns: [
        {
          prop: 'benchmark.bench.ipaddress',
          label: 'IP Address',
          minWidth: 200,
        },
        {
          prop: 'benchmark.bench.download_speed',
          label: 'Download Speed',
          minWidth: 100,
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
      const lsdata = MemoryStorage.get('fluxinfo?projection=benchmark');
      if (!lsdata) {
        const response = await axios.get('https://stats.runonflux.io/fluxinfo?projection=benchmark');
        MemoryStorage.put('fluxinfo?projection=benchmark', response.data.data, 600);
        this.tableData = response.data.data;
      } else {
        this.tableData = lsdata;
      }
    },
    setSearch() {
      this.originalData = JSON.stringify(this.tableData);
      this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['benchmark.bench.ipaddress'] });
    },
    setLoading(value) {
      this.isLoading = value;
    },
    sortChange(sortProps) {
      if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.bechmark.bench.ipaddress > b.bechmark.bench.ipaddress) {
            val = 1;
          } else if (a.bechmark.bench.ipaddress < b.bechmark.bench.ipaddress) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.bechmark.bench.ipaddress < b.bechmark.bench.ipaddress) {
            val = 1;
          } else if (a.bechmark.bench.ipaddress > b.bechmark.bench.ipaddress) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Download Speed' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.benchmark.bench.download_speed > b.benchmark.bench.download_speed) {
            val = 1;
          } else if (a.benchmark.bench.download_speed < b.benchmark.bench.download_speed) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Download Speed' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.benchmark.bench.download_speed < b.benchmark.bench.download_speed) {
            val = 1;
          } else if (a.benchmark.bench.download_speed > b.benchmark.bench.download_speed) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Upload Speed' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.benchmark.bench.upload_speed > b.benchmark.bench.upload_speed) {
            val = 1;
          } else if (a.benchmark.bench.upload_speed < b.benchmark.bench.upload_speed) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Upload Speed' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.benchmark.bench.upload_speed < b.benchmark.bench.upload_speed) {
            val = 1;
          } else if (a.benchmark.bench.upload_speed > b.benchmark.bench.upload_speed) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Ping' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.benchmark.bench.ping > b.benchmark.bench.ping) {
            val = 1;
          } else if (a.benchmark.bench.ping < b.benchmark.bench.ping) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Ping' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.benchmark.bench.ping < b.benchmark.bench.ping) {
            val = 1;
          } else if (a.benchmark.bench.ping > b.benchmark.bench.ping) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Status' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.benchmark.status.status > b.benchmark.status.status) {
            val = 1;
          } else if (a.benchmark.status.status < b.benchmark.status.status) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Status' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.benchmark.status.status < b.benchmark.status.status) {
            val = 1;
          } else if (a.benchmark.status.status > b.benchmark.status.status) {
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
