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
              placeholder="Search Zel ID"
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
                  <p><b>Total Cumulus:</b> {{ props.row.totalCumulus }} </p>
                  <p><b>Total Nimbus:</b> {{ props.row.totalNimbus }}</p>
                  <p><b>Total Stratus:</b> {{ props.row.totalStratus }}</p>
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
      originalData: null,
      values: [],
      fuseSearch: null,
      isLoading: false,
      paymentAddress: new Map(),
      organization: new Map(),
      totalNodes: new Map(),
      totalCumulus: new Map(),
      totalStratus: new Map(),
      totalNimbus: new Map(),
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
    await this.processFluxInfo();
    this.setSearch();
    this.setLoading(false);
  },
  methods: {
    paginationTotal(value) {
      this.pagination.total = value;
    },
    async getFluxInfo() {
      const lsdata = MemoryStorage.get('fluxinfo?projection=node,flux,geolocation,tier');
      if (!lsdata) {
        const response = await axios.get('https://stats.runonflux.io/fluxinfo?projection=node,flux,geolocation,tier');
        MemoryStorage.put('fluxinfo?projection=node,flux,geolocation,tier', response.data.data, 600);
        this.values = response.data.data;
      } else {
        this.values = lsdata;
      }
    },
    async processFluxInfo() {
      this.values.map((value) => {
        let temp1 = this.totalNodes.get(value.flux.zelid) === undefined ? 0 : this.totalNodes.get(value.flux.zelid);
        const temp2 = this.totalCumulus.get(value.flux.zelid) === undefined ? 0 : this.totalCumulus.get(value.flux.zelid);
        const temp3 = this.totalNimbus.get(value.flux.zelid) === undefined ? 0 : this.totalNimbus.get(value.flux.zelid);
        const temp4 = this.totalStratus.get(value.flux.zelid) === undefined ? 0 : this.totalStratus.get(value.flux.zelid);
        this.totalNodes.set(value.flux.zelid, temp1 += 1);
        this.totalCumulus.set(value.flux.zelid, value.tier === 'CUMULUS' ? temp2 + 1 : temp2);
        this.totalNimbus.set(value.flux.zelid, value.tier === 'NIMBUS' ? temp3 + 1 : temp3);
        this.totalStratus.set(value.flux.zelid, value.tier === 'STRATUS' ? temp4 + 1 : temp4);
        try {
          this.paymentAddress.set(value.flux.zelid, value.node.status.payment_address);
        } catch (ex) {
          this.paymentAddress.set(value.flux.zelid, '');
        }
        try {
          this.organization.set(value.flux.zelid, value.geolocation.org);
        } catch (ex) {
          this.organization.set(value.flux.zelid, '');
        }
        return value;
      });
      for (const entry of this.paymentAddress.entries()) {
        this.zelids.push(
          {
            zelId: `${entry[0]}`,
            paymentId: `${entry[1]}`,
            totalNodes: `${this.totalNodes.get(entry[0])}`,
            totalCumulus: `${this.totalCumulus.get(entry[0])}`,
            totalNimbus: `${this.totalNimbus.get(entry[0])}`,
            totalStratus: `${this.totalStratus.get(entry[0])}`,
            org: `${this.organization.get(entry[0])}`,
          },
        );
      }
      this.tableData = this.zelids;
    },
    setSearch() {
      this.originalData = JSON.stringify(this.tableData);
      this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['zelId'] });
    },
    setLoading(value) {
      this.isLoading = value;
    },
    sortChange(sortProps) {
      if (sortProps.column.label === 'Zel ID' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.zelId > b.zelId) {
            val = 1;
          } else if (a.zelId < b.zelId) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Zel ID' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.zelId < b.zelId) {
            val = 1;
          } else if (a.zelId > b.zelId) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Payment ID' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.paymentId > b.paymentId) {
            val = 1;
          } else if (a.paymentId < b.paymentId) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Payment ID' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.paymentId < b.paymentId) {
            val = 1;
          } else if (a.paymentId > b.paymentId) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Organization' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.org > b.org) {
            val = 1;
          } else if (a.org < b.org) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Organization' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.org < b.org) {
            val = 1;
          } else if (a.org > b.org) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Total Nodes' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (parseInt(a.totalNodes, 10) > parseInt(b.totalNodes, 10)) {
            val = 1;
          } else if (parseInt(a.totalNodes, 10) < parseInt(b.totalNodes, 10)) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Total Nodes' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (parseInt(a.totalNodes, 10) < parseInt(b.totalNodes, 10)) {
            val = 1;
          } else if (parseInt(a.totalNodes, 10) > parseInt(b.totalNodes, 10)) {
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
