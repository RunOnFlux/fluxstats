<template>
  <div class="row">
    <div class="col-md-12">
      <h2 class="title">
        Address Info
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
      propsToSearch: ['zelId'],
      tableColumns: [
        {
          prop: 'zelId',
          label: 'Zel ID',
          minWidth: 70,
        },
        {
          prop: 'paymentId',
          label: 'Payment ID',
          minWidth: 40,
        },
        {
          prop: 'org',
          label: 'Organization',
          minWidth: 40,
        },
        {
          prop: 'totalNodes',
          label: 'Total Nodes',
          minWidth: 90,
        },
      ],
      tableData: [],
      values: [],
      fuseSearch: null,
      isLoading: false,
      paymentAddress: null,
      organization: null,
      totalNodes: null,
      zelids: [],
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
    this.paymentAddress = new Map();
    this.totalNodes = new Map();
    this.organization = new Map();
    axios
      .get('https://stats.runonflux.io/fluxinfo?projection=node,flux,geolocation')
      .then((response) => {
        this.values = response.data.data;
        for (let i = 0; i < this.values.length; i += 1) {
          if (this.paymentAddress.get(this.values[i].flux.zelid) !== undefined) {
            let temp = this.totalNodes.get(this.values[i].flux.zelid);
            this.totalNodes.set(this.values[i].flux.zelid, temp += 1);
          } else {
            this.paymentAddress.set(this.values[i].flux.zelid, this.values[i].node.status.payment_address);
            this.organization.set(this.values[i].flux.zelid, this.values[i].geolocation.org);
            this.totalNodes.set(this.values[i].flux.zelid, 1);
          }
        }
      }).then(() => {
        for (const entry of this.paymentAddress.entries()) {
          this.zelids.push(
            {
              zelId: `${entry[0]}`,
              paymentId: `${entry[1]}`,
              totalNodes: `${this.totalNodes.get(entry[0])}`,
              org: `${this.organization.get(entry[0])}`,
            },
          );
        }
      }).then(() => {
        this.tableData = this.zelids;
        this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['zelId'] });
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
