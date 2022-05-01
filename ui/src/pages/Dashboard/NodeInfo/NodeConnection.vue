<template>
  <div class="row">
    <div class="col-md-12">
      <h2 class="title">
        Connection
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
                  <p><b>In:</b></p>
                  <ul>
                    <li
                      v-for="(item,index) in props.row.connectionsIn"
                      :key="index"
                    >
                      {{ item }}
                    </li>
                  </ul>
                  <p><b>Out:</b></p>
                  <ul>
                    <li
                      v-for="(item,index) in props.row.connectionsOut"
                      :key="index"
                    >
                      {{ item }}
                    </li>
                  </ul>
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
          prop: 'in',
          label: 'Total Incoming',
          minWidth: 200,
        },
        {
          prop: 'out',
          label: 'Total Outgoing',
          minWidth: 200,
        },
      ],
      tableData: [],
      values: [],
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
  mounted() {
    this.isLoading = true;
    axios
      .get('https://stats.runonflux.io/fluxinfo?projection=ip,connectionsOut,connectionsIn')
      .then((response) => {
        this.values = response.data.data;
        for (let i = 0; i < this.values.length; i += 1) {
          try {
            this.values[i].out = this.values[i].connectionsOut.length;
            this.values[i].in = this.values[i].connectionsIn.length;
          } catch (ex) {
            this.values[i].out = 0;
            this.values[i].in = 0;
          }
        }
      }).then(() => {
        this.tableData = this.values;
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
