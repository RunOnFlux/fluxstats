<template>
  <div class="row">
    <div class="col-md-12">
      <h2 class="title">
        Node
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
            <div col-md-6 offset-md-3>
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
            <div col-md-3 offset-md-6>
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
              @sort-change="sortChange"
              border
            >
              <el-table-column type="expand">
                <template slot-scope="props">
                  <p><b>Collateral:</b> {{ props.row.node.status.collateral }} </p>
                  <p><b>Txn Hash:</b> {{ props.row.node.status.txhash }}</p>
                  <p><b>Added Height:</b> {{ props.row.node.status.added_height }}</p>
                  <p><b>Confirmed Height:</b> {{ props.row.node.status.confirmed_height }}</p>
                  <p><b>Last Confirmed Height:</b> {{ props.row.node.status.last_confirmed_height }}</p>
                  <p><b>Last Paid Height:</b> {{ props.row.node.status.last_paid_height }}</p>
                  <p><b>Payment Address:</b> {{ props.row.node.status.payment_address }}</p>
                  <p><b>Zel ID:</b> {{ props.row.flux.zelid }}</p>
                  <p><b>Active Since:</b> {{ props.row.node.status.activesince }}</p>
                  <p><b>Active Since Converted:</b> {{ new Date(parseInt(props.row.node.status.activesince * 1000)).toLocaleDateString() }} {{ new Date(parseInt(props.row.node.status.activesince * 1000)).toLocaleTimeString() }}</p>
                  <p><b>Last Paid:</b> {{ props.row.node.status.lastpaid }}</p>
                  <p><b>Last Paid Converted:</b> {{ new Date(parseInt(props.row.node.status.lastpaid * 1000)).toLocaleDateString() }} {{ new Date(parseInt(props.row.node.status.lastpaid * 1000)).toLocaleTimeString() }}</p>
                  <p><b>Amount:</b> {{ props.row.node.status.amount }}</p>
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
      propsToSearch: ['node.status.ip'],
      tableColumns: [
        {
          prop: 'node.status.ip',
          label: 'IP Address',
          minWidth: 70,
        },
        {
          prop: 'node.status.network',
          label: 'Network Protocol',
          minWidth: 40,
        },
        {
          prop: 'node.status.tier',
          label: 'Tier',
          minWidth: 90,
        },
        {
          prop: 'node.status.status',
          label: 'Status',
          minWidth: 50,
        },
        {
          prop: 'node.status.rank',
          label: 'Payment Rank',
          minWidth: 70,
        },
      ],
      tableData: [],
      originalData: null,
      values: [],
      daemon: [],
      fuseSearch: null,
      isLoading: false,
      filter1: new Map(),
      filter2: new Map(),
      filterValue1: [],
      filterValue2: [],
      ranks: new Map(),
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
      let val1 = this.filterValue1[0];
      let val2 = this.filterValue2[0];
      if (this.searchQuery !== '') {
        const temp = [];
        result = this.fuseSearch.search(`=${this.searchQuery}`);
        for (let i = 0; i < Object.keys(result).length; i += 1) {
          temp.push(result[i].item);
        }
        result = temp;
      } else if (this.filters.default === 'node version') {
        val1 = this.filtersval.default === 'none' || !this.filter1.has(this.filtersval.default) ? val1 : this.filtersval.default;
        this.setFilterFieldValues(val1, this.filterValue1);
        result = this.filter1.get(this.filtersval.default);
      } else if (this.filters.default === 'node hashes') {
        val2 = this.filtersval.default === 'none' || !this.filter2.has(this.filtersval.default) ? val2 : this.filtersval.default;
        this.setFilterFieldValues(val2, this.filterValue2);
        result = this.filter2.get(this.filtersval.default);
      } else {
        result = this.tableData;
        this.setFilterValues('filter off', ['filter off', 'node version', 'node hashes']);
        this.setFilterFieldValues('none');
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
      } else if (this.filters.default === 'node version') {
        result = this.filter1.get(this.filtersval.default);
      } else if (this.filters.default === 'node hashes') {
        result = this.filter2.get(this.filtersval.default);
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
    await this.getDaemonInfo();
    await this.processDaemonInfo();
    await this.processFluxInfo();
    this.setSearch();
    this.setLoading(false);
  },
  methods: {
    paginationTotal(value) {
      this.pagination.total = value;
    },
    setFilterValues(defaultValues, othersValues) {
      this.filters.default = defaultValues;
      this.filters.others = othersValues;
    },
    setFilterFieldValues(defaultFieldValues, othersFieldValues) {
      this.filtersval.default = defaultFieldValues;
      this.filtersval.others = othersFieldValues;
    },
    async getFluxInfo() {
      const lsdata = MemoryStorage.get('fluxinfo?projection=node,flux,appsHashesTotal');
      if (!lsdata) {
        const response = await axios.get('https://stats.runonflux.io/fluxinfo?projection=node,flux,appsHashesTotal');
        MemoryStorage.put('fluxinfo?projection=node,flux,appsHashesTotal', response.data.data, 600);
        this.values = response.data.data;
      } else {
        this.values = lsdata;
      }
    },
    async getDaemonInfo() {
      const lsdata = MemoryStorage.get('daemon/viewdeterministiczelnodelist');
      if (!lsdata) {
        const response = await axios.get('https://api.runonflux.io/daemon/viewdeterministiczelnodelist');
        MemoryStorage.put('daemon/viewdeterministiczelnodelist', response.data.data, 600);
        this.daemon = response.data.data;
      } else {
        this.daemon = lsdata;
      }
    },
    async processDaemonInfo() {
      this.daemon.map((el) => {
        if (!this.ranks.has(el.ip)) {
          this.ranks.set(el.ip, el.rank);
        }
        return el;
      });
    },
    async processFluxInfo() {
      this.values.map((el) => {
        const values = el;
        let temp;
        values.node.status.network = 'ipv4';
        values.node.status.rank = this.ranks.get(el.node.status.ip) === undefined ? 0 : this.ranks.get(el.node.status.ip);
        temp = this.filter1.has(values.flux.version) ? this.filter1.get(values.flux.version) : [];
        if (!this.filter1.has(values.flux.version)) {
          this.filterValue1.push(values.flux.version);
        }
        temp.push(values);
        this.filter1.set(values.flux.version, temp);
        temp = this.filter2.has(values.appsHashesTotal) ? this.filter2.get(values.appsHashesTotal) : [];
        if (!this.filter2.has(values.appsHashesTotal)) {
          this.filterValue2.push(values.appsHashesTotal);
        }
        temp.push(values);
        this.filter2.set(values.appsHashesTotal, temp);
        return values;
      });
      this.tableData = this.values;
    },
    setSearch() {
      this.originalData = JSON.stringify(this.tableData);
      this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['node.status.ip'] });
    },
    setLoading(value) {
      this.isLoading = value;
    },
    sortChange(sortProps) {
      if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.node.status.ip > b.node.status.ip) {
            val = 1;
          } else if (a.node.status.ip < b.node.status.ip) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.node.status.ip < b.node.status.ip) {
            val = 1;
          } else if (a.node.status.ip > b.node.status.ip) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Network Protocol' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.node.status.network > b.node.status.network) {
            val = 1;
          } else if (a.node.status.network < b.node.status.network) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Network Protocol' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.node.status.network < b.node.status.network) {
            val = 1;
          } else if (a.node.status.network > b.node.status.network) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Tier' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.node.status.tier > b.node.status.tier) {
            val = 1;
          } else if (a.node.status.tier < b.node.status.tier) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Tier' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.node.status.tier < b.node.status.tier) {
            val = 1;
          } else if (a.node.status.tier > b.node.status.tier) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Status' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.node.status.status > b.node.status.status) {
            val = 1;
          } else if (a.node.status.status < b.node.status.status) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Status' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.node.status.status < b.node.status.status) {
            val = 1;
          } else if (a.node.status.status > b.node.status.status) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Payment Rank' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.node.status.rank > b.node.status.rank) {
            val = 1;
          } else if (a.node.status.rank < b.node.status.rank) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Payment Rank' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.node.status.rank < b.node.status.rank) {
            val = 1;
          } else if (a.node.status.rank > b.node.status.rank) {
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
