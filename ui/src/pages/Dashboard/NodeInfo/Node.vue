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
            <div
              col-md-6
              offset-md-3
            >
              <el-select
                v-model="filters.default"
                class="select-default mb-3"
                style="width: 300px"
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
                  <p><b>Collateral:</b> {{ props.row.node.status.collateral }} </p>
                  <p><b>Txn Hash:</b> {{ props.row.node.status.txhash }}</p>
                  <p><b>Added Height:</b> {{ props.row.node.status.added_height }}</p>
                  <p><b>Confirmed Height:</b> {{ props.row.node.status.confirmed_height }}</p>
                  <p><b>Last Confirmed Height:</b> {{ props.row.node.status.last_confirmed_height }}</p>
                  <p><b>Last Paid Height:</b> {{ props.row.node.status.last_paid_height }}</p>
                  <p><b>Payment Address:</b> {{ props.row.node.status.payment_address }}</p>
                  <p><b>Zel ID:</b> {{ props.row.flux.zelid }}</p>
                  <p><b>Active Since:</b> {{ props.row.node.status.activesince }}</p>
                  <p><b>Active Since Converted:</b> {{ new Date(parseInt(props.row.node.status.activesince * 1000)).toLocaleString() }}</p>
                  <p><b>Last Paid:</b> {{ props.row.node.status.lastpaid }}</p>
                  <p><b>Last Paid Converted:</b> {{ new Date(parseInt(props.row.node.status.lastpaid * 1000)).toLocaleString() }}</p>
                  <p><b>Amount:</b> {{ props.row.node.status.amount }}</p>
                  <p><b>Crux ID:</b> {{ props.row.flux.cruxid }}</p>
                  <p><b>DOS State:</b> {{ props.row.flux.dos.dosState }}</p>
                  <p><b>DOS Message:</b> {{ props.row.flux.dos.dosMessage }}</p>
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
        default: [],
        others: [],
      },
      searchQuery: '',
      propsToSearch: ['node.status.ip'],
      tableColumns: [
        {
          prop: 'node.status.ip',
          label: 'IP Address',
          minWidth: 200,
        },
        {
          prop: 'node.status.network',
          label: 'Network Protocol',
          minWidth: 100,
        },
        {
          prop: 'node.status.tier',
          label: 'Tier',
          minWidth: 100,
        },
        {
          prop: 'node.status.status',
          label: 'Status',
          minWidth: 100,
        },
        {
          prop: 'node.status.rank',
          label: 'Payment Rank',
          minWidth: 100,
        },
      ],
      tableData: [],
      originalData: null,
      values: [],
      daemon: [],
      fuseSearch: null,
      isLoading: false,
      filter: new Map(),
      filterValue: [],
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
      if (this.searchQuery !== '') {
        const temp = [];
        result = this.fuseSearch.search(`=${this.searchQuery}`);
        for (let i = 0; i < Object.keys(result).length; i += 1) {
          temp.push(this.result[i].item);
        }
        result = temp;
      } else if (this.filters.default.length) {
        const arr = [];
        const data = [];
        this.filters.default.forEach((item) => {
          const objs = this.filter.get(item);
          objs.forEach((obj) => {
            if (!arr.includes(obj.node.status.ip)) {
              arr.push(obj.node.status.ip);
              data.push(obj);
            }
          });
        });
        result = data;
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
      let result = [];
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
            if (!arr.includes(obj.node.status.ip)) {
              arr.push(obj.node.status.ip);
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
        temp = this.filter.has(`node version - ${values.flux.version}`) ? this.filter.get(`node version - ${values.flux.version}`) : [];
        if (!this.filter.has(`node version - ${values.flux.version}`)) {
          this.filterValue.push(`node version - ${values.flux.version}`);
        }
        temp.push(values);
        this.filter.set(`node version - ${values.flux.version}`, temp);
        temp = this.filter.has(`node hashes - ${values.appsHashesTotal}`) ? this.filter.get(`node hashes - ${values.appsHashesTotal}`) : [];
        if (!this.filter.has(`node hashes - ${values.appsHashesTotal}`)) {
          this.filterValue.push(`node hashes - ${values.appsHashesTotal}`);
        }
        temp.push(values);
        this.filter.set(`node hashes - ${values.appsHashesTotal}`, temp);
        return values;
      });
      this.filters.others = this.filterValue.sort();
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
