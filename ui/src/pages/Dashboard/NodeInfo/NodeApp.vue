<template>
  <div class="row">
    <div class="col-md-12">
      <h2 class="title">
        Application
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
                  <p
                    v-for="(item,index) in props.row.apps.runningapps"
                    :key="index"
                  >
                    <b>Application {{ index + 1 }}:</b> <br>
                    <b>ID:</b> {{ item.Id }} <br>
                    <b>Names:</b> {{ item.Names }} <br>
                    <b>Image:</b> {{ item.Image }} <br>
                    <b>Image ID:</b> {{ item.ImageID }} <br>
                    <b>Command:</b> {{ item.Command }} <br>
                    <b>Ports:</b> {{ item.Ports }} <br>
                    <b>Labels:</b> {{ item.Labels }} <br>
                    <b>State:</b> {{ item.State }} <br>
                    <b>Status:</b> {{ item.Status }} <br>
                  </p>
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
          prop: 'apps.count',
          label: 'Total Application Running',
          minWidth: 250,
        },
        {
          prop: 'apps.fluxtower',
          label: 'Flux Watch Tower Installed',
          minWidth: 250,
        },
        {
          prop: 'apps.fluxusage',
          label: 'Flux Usage',
          minWidth: 250,
        },
        {
          prop: 'apps.resources.appsCpusLocked',
          label: 'CPU Locked',
          minWidth: 100,
        },
        {
          prop: 'apps.resources.appsRamLocked',
          label: 'RAM Locked',
          minWidth: 120,
        },
        {
          prop: 'apps.resources.appsHddLocked',
          label: 'HDD Locked',
          minWidth: 120,
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
      const response = await axios.get('https://stats.runonflux.io/fluxinfo?projection=ip,apps');
      this.values = response.data.data;
    },
    async processFluxInfo() {
      this.values.map((value) => {
        const returnValue = value;
        const filtered = returnValue.apps.runningapps.filter((item) => item.Image !== 'containrrr/watchtower');
        returnValue.apps.runningapps = filtered;
        if (filtered.length !== undefined || filtered.length !== 0) {
          returnValue.apps.fluxtower = 'TRUE';
          returnValue.apps.count = filtered.length;
        } else {
          returnValue.apps.fluxtower = 'FALSE';
          returnValue.apps.count = 0;
        }
        return returnValue;
      });
      this.tableData = this.values;
    },
    setSearch() {
      this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['ip'] });
    },
    setLoading(value) {
      this.isLoading = value;
    },
  },
};
</script>
<style>
</style>
