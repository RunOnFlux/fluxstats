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
                v-model="filterssign.default"
                class="select-default mb-3"
                style="width: 200px"
                placeholder="Filters"
              >
                <el-option
                  v-for="item in filterssign.others"
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
      filterssign: {
        default: 'none',
        others: ['none'],
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
      ],
      tableData: [],
      values: [],
      fuseSearch: null,
      isLoading: false,
      filter1: [],
      filter2: [],
      filter3: [],
      filter4: [],
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
      let defaultValues;
      let othersValues;
      let defaultSignValues;
      let othersSignValues;
      if (this.searchQuery !== '') {
        const temp = [];
        result = this.fuseSearch.search(`=${this.searchQuery}`);
        for (let i = 0; i < Object.keys(result).length; i += 1) {
          temp.push(result[i].item);
        }
        result = temp;
      } else if (this.filters.default === 'node version' && (this.filterssign.default === '>=' || this.filterssign.default === 'none')) {
        defaultValues = '3.14.0';
        othersValues = ['3.14.0'];
        defaultSignValues = '>=';
        othersSignValues = ['>=', '<'];
        result = this.filter1;
      } else if (this.filters.default === 'node version' && this.filterssign.default === '<') {
        defaultValues = '3.14.0';
        othersValues = ['3.14.0'];
        defaultSignValues = '<';
        othersSignValues = ['>=', '<'];
        result = this.filter3;
      } else if (this.filters.default === 'nodes hashes' && (this.filterssign.default === '>=' || this.filterssign.default === 'none')) {
        defaultValues = '2400';
        othersValues = ['2400'];
        defaultSignValues = '>=';
        othersSignValues = ['>=', '<'];
        result = this.filter2;
      } else if (this.filters.default === 'nodes hashes' && this.filterssign.default === '<') {
        defaultValues = '2400';
        othersValues = ['2400'];
        defaultSignValues = '<';
        othersSignValues = ['>=', '<'];
        result = this.filter4;
      } else {
        result = this.tableData;
        defaultValues = 'none';
        othersValues = ['none'];
        defaultSignValues = 'none';
        othersSignValues = ['none'];
      }
      this.paginationTotal(result.length);
      this.setFilterValues(defaultValues, othersValues);
      this.setFilterSignValues(defaultSignValues, othersSignValues);
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
      } else if (this.filters.default === 'node version' && this.filterssign.default === '>=') {
        result = this.filter1;
      } else if (this.filters.default === 'node version' && this.filterssign.default === '<') {
        result = this.filter3;
      } else if (this.filters.default === 'nodes hashes' && this.filterssign.default === '>=') {
        result = this.filter2;
      } else if (this.filters.default === 'nodes hashes' && this.filterssign.default === '<') {
        result = this.filter4;
      } else {
        result = this.tableData;
      }
      this.paginationTotal(result.length);
      return result.length;
    },
  },
  mounted() {
    this.isLoading = true;
    axios
      .get('https://stats.runonflux.io/fluxinfo?projection=node,flux,appsHashesTotal')
      .then((response) => {
        this.values = response.data.data;
      }).then(() => {
        for (let i = 0; i < this.values.length; i += 1) {
          try {
            this.values[i].node.status.network = 'ipv4';
          } catch (ex) {
            // do nothing
          }
          if (parseInt(this.values[i].flux.version.split('.')[0], 10) >= 3 && parseInt(this.values[i].flux.version.split('.')[1], 10) >= 14) {
            this.filter1.push(this.values[i]);
          } else {
            this.filter3.push(this.values[i]);
          }
          if (parseInt(this.values[i].appsHashesTotal, 10) >= 2400) {
            this.filter2.push(this.values[i]);
          } else {
            this.filter4.push(this.values[i]);
          }
        }
      }).then(() => {
        this.tableData = this.values;
        this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['node.status.ip'] });
        this.isLoading = false;
      });
  },
  methods: {
    paginationTotal(value) {
      this.pagination.total = value;
    },
    setFilterValues(defaultValues, othersValues) {
      this.filters.default = defaultValues;
      this.filters.others = othersValues;
    },
    setFilterSignValues(defaultSignValues, othersSignValues) {
      this.filterssign.default = defaultSignValues;
      this.filterssign.others = othersSignValues;
    },
  },
};
</script>
<style>
</style>
