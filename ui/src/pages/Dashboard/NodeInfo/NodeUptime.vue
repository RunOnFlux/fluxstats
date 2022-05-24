<template>
  <div class="row">
    <div class="col-md-12">
      <h2 class="title">
        UpTime
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
              @sort-change="sortChange"
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
          prop: 'activeSince',
          label: 'Active Since',
          minWidth: 200,
        },
        {
          prop: 'activeSinceConverted',
          label: 'Active Since Converted',
          minWidth: 200,
        },
        {
          prop: 'dataCollectedAt',
          label: 'Data Collected At',
          minWidth: 150,
        },
        {
          prop: 'dataCollectedAtConverted',
          label: 'Data Collected At Converted',
          minWidth: 150,
        },
      ],
      tableData: [],
      originalData: null,
      responseData: [],
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
    await this.processFluxInfo();
    this.setSearch();
    this.setLoading(false);
  },
  methods: {
    paginationTotal(value) {
      this.pagination.total = value;
    },
    async getFluxInfo() {
      const lsdata = MemoryStorage.get('fluxinfo?projection=ip,activeSince,dataCollectedAt');
      if (!lsdata) {
        const response = await axios.get('https://stats.runonflux.io/fluxinfo?projection=ip,activeSince,dataCollectedAt');
        MemoryStorage.put('fluxinfo?projection=ip,activeSince,dataCollectedAt', response.data.data, 600);
        this.responseData = response.data.data;
      } else {
        this.responseData = lsdata;
      }
    },
    async processFluxInfo() {
      this.responseData.map((value) => {
        this.tableData.push({
          ip: value.ip,
          activeSince: value.activeSince,
          activeSinceConverted: `${new Date(parseInt(value.activeSince * 1000, 10)).toLocaleDateString()} ${new Date(parseInt(value.activeSince * 1000, 10)).toLocaleTimeString()}`,
          dataCollectedAt: value.dataCollectedAt,
          dataCollectedAtConverted: `${new Date(parseInt(value.dataCollectedAt, 10)).toLocaleDateString()} ${new Date(parseInt(value.dataCollectedAt, 10)).toLocaleTimeString()}`,
        });
        return value;
      });
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
          let val = 0;
          if (a.ip > b.ip) {
            val = 1;
          } else if (a.ip < b.ip) {
            val = -1;
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
      } else if (sortProps.column.label === 'Active Since' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.activeSince > b.activeSince) {
            val = 1;
          } else if (a.activeSince < b.activeSince) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Active Since' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.activeSince < b.activeSince) {
            val = 1;
          } else if (a.activeSince > b.activeSince) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Active Since Converted' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (new Date(a.activeSinceConverted).getTime() > new Date(b.activeSinceConverted).getTime()) {
            val = 1;
          } else if (new Date(a.activeSinceConverted).getTime() < new Date(b.activeSinceConverted).getTime()) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Active Since Converted' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (new Date(a.activeSinceConverted).getTime() < new Date(b.activeSinceConverted).getTime()) {
            val = 1;
          } else if (new Date(a.activeSinceConverted).getTime() > new Date(b.activeSinceConverted).getTime()) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Data Collected At' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.dataCollectedAt > b.dataCollectedAt) {
            val = 1;
          } else if (a.dataCollectedAt < b.dataCollectedAt) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Data Collected At' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.dataCollectedAt < b.dataCollectedAt) {
            val = 1;
          } else if (a.dataCollectedAt > b.dataCollectedAt) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Data Collected At Converted' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (new Date(a.dataCollectedAtConverted).getTime() > new Date(b.dataCollectedAtConverted).getTime()) {
            val = 1;
          } else if (new Date(a.dataCollectedAtConverted).getTime() < new Date(b.dataCollectedAtConverted).getTime()) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Data Collected At Converted' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (new Date(a.dataCollectedAtConverted).getTime() < new Date(b.dataCollectedAtConverted).getTime()) {
            val = 1;
          } else if (new Date(a.dataCollectedAtConverted).getTime() > new Date(b.dataCollectedAtConverted).getTime()) {
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
