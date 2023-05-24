<template>
  <div>
    <div class="col-12 d-flex flex-wrap">
      <div
        v-for="(btn, idx) in filters.states"
        :key="idx"
      >
        <l-button
          v-if="btn.name.includes('>=')"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name === 'total incoming - 0'"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name === 'total incoming - undefined'"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name === 'total outgoing - 0'"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name === 'total outgoing - undefined'"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
      </div>
    </div>
    <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
      <h2 class="title">
        Connection
      </h2>
    </div>
    <p class="category" />
    <div class="col-12">
      <card>
        <div>
          <div
            class="pull-right"
            style="padding:20px;"
          >
            <l-button
              title="Download CSV"
              @click="downloadCsvFile(dataFilters)"
            >
              <i class="nc-icon nc-cloud-download-93" />
            </l-button>
          </div>
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
                style="width: 450px"
                multiple
                collapse-tags
                filterable
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
            <el-input
              v-model="searchQuery"
              type="search"
              class="mb-3"
              style="width: 200px"
              placeholder="Search IP"
              aria-controls="datatables"
            />
          </div>
          <div
            slot="header"
            class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
            style="padding:20px;"
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
          <div class="col-sm-12">
            <el-table
              stripe
              style="width: 100%;"
              :data="queriedData"
              border
              @sort-change="sortChange"
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
          style="padding:20px;"
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
        <vue-element-loading
          :active="isLoading"
          spinner="bar-fade-scale"
        />
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
import { MemoryStorage } from 'ttl-localstorage';
import { ExportToCsv } from 'export-to-csv';
import VueElementLoading from 'vue-element-loading';
import CsvService from '../Service/CsvService';
import SearchService from '../Service/SearchService';
import TransformationService from '../Service/TransformationService';
import SortService from '../Service/SortService';
import {
  httpRequestFluxInfo, httpRequestDaemonInfo, httpRequestFluxHistoryStats,
} from '../Request/HttpRequest';

export default {
  components: {
    LPagination,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    VueElementLoading,
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
        states: [],
      },
      searchQuery: '',
      propsToSearch: ['flux.ip'],
      tableColumns: [
        {
          prop: 'flux.ip',
          label: 'IP Address',
          minWidth: 200,
        },
        {
          prop: 'flux.numberOfConnectionsIn',
          label: 'Total Incoming',
          minWidth: 200,
        },
        {
          prop: 'connectionsOut',
          label: 'Total Outgoing',
          minWidth: 200,
        },
      ],
      tableData: [],
      filterValue: [],
      filter: new Map(),
      originalData: null,
      values: [],
      fuseSearch: null,
      dataFilters: [],
      isLoading: true,
    };
  },
  computed: {
    queriedData() {
      return this.processData(false, true);
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
      const result = this.dataFilters;
      this.paginationTotal(result.length);
      return result.length;
    },
  },
  async mounted() {
    try {
      await httpRequestFluxInfo(axios, MemoryStorage);
      await httpRequestDaemonInfo(axios, MemoryStorage);
      await httpRequestFluxHistoryStats(axios, MemoryStorage);
      await this.getFluxInfo();
      await this.processFluxInfo();
      this.setSearch();
      this.isLoading = false;
    } catch (e) {
      this.$router.push('/flux/maintenance/error').catch(() => {});
    }
  },
  methods: {
    paginationTotal(value) {
      this.pagination.total = value;
    },
    setDataFilters(data) {
      this.dataFilters = data;
    },
    processData(sortProps, isProcessingState) {
      let result;
      if (this.searchQuery !== '') {
        result = SearchService.search(this.fuseSearch, this.searchQuery);
      } else if (this.filters.default.length) {
        result = TransformationService.processFilters(this.filters, this.filter, 'nodeconnection');
      } else {
        result = this.tableData;
      }
      if (sortProps) {
        result = this.sorting(sortProps, result);
      }
      if (isProcessingState) {
        this.processState(this.filters.default);
      }
      this.setDataFilters(result);
      this.paginationTotal(result.length);
      return result.slice(this.from, this.to);
    },
    async getFluxInfo() {
      // Projection being used in this page is flux
      const lsdata = MemoryStorage.get('fluxinfo');
      this.values = lsdata;
    },
    async processFluxInfo() {
      this.values.map((el) => {
        let temp;
        let label;
        const values = el;
        const totalincoming = values.flux.numberOfConnectionsIn;
        const totaloutgoing = values.connectionsOut;
        temp = this.filter.has(`total incoming - ${totalincoming}`) ? this.filter.get(`total incoming - ${totalincoming}`) : [];
        if (!this.filter.has(`total incoming - ${totalincoming}`)) {
          this.filterValue.push(`total incoming - ${totalincoming}`);
        }
        temp.push(values);
        this.filter.set(`total incoming - ${totalincoming}`, temp);
        temp = this.filter.has(`total outgoing - ${totaloutgoing}`) ? this.filter.get(`total outgoing - ${totaloutgoing}`) : [];
        if (!this.filter.has(`total outgoing - ${totaloutgoing}`)) {
          this.filterValue.push(`total outgoing - ${totaloutgoing}`);
        }
        temp.push(values);
        this.filter.set(`total outgoing - ${totaloutgoing}`, temp);
        label = 'total incoming >= 1';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (totalincoming >= 1 && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (totalincoming >= 1) {
          temp.push(values);
          this.filter.set(label, temp);
        }
        label = 'total outgoing >= 1';
        temp = this.filter.has(label) ? this.filter.get(label) : [];
        if (totaloutgoing >= 1 && !this.filter.has(label)) {
          this.filterValue.push(label);
        }
        if (totaloutgoing >= 1) {
          temp.push(values);
          this.filter.set(label, temp);
        }
        return values;
      });
      this.filters.others = this.filterValue.sort();
      this.tableData = this.values;
      this.filterValue.forEach((value) => {
        this.filters.states.push({
          name: value,
          state: false,
        });
      });
    },
    setSearch() {
      this.originalData = JSON.stringify(this.tableData);
      this.fuseSearch = SearchService.generateSearch(Fuse, this.tableData, ['flux.ip']);
    },
    sortChange(sortProps) {
      this.processData(sortProps, true);
    },
    sorting(sortProps, data) {
      const ret = SortService.sortNodeConnection(data, sortProps, this.originalData);
      this.tableData = Object.keys(ret.tableDatas).length > 0 ? ret.tableDatas : this.tableData;
      return ret.datas;
    },
    processDataForCsv(data) {
      const values = [];
      data.forEach((item) => {
        values.push({
          ip: !item.flux.ip ? '' : item.flux.ip,
          connectionIn: !item.flux.numberOfConnectionsIn ? '' : item.flux.numberOfConnectionsIn,
          connectionOut: !item.connectionsOut ? '' : item.connectionsOut,
        });
      });
      return values;
    },
    downloadCsvFile(data) {
      CsvService.Download(this.processDataForCsv(data), CsvService.NodeConnectionHeaders, 'Node_Connection', ExportToCsv);
    },
    processFilters(key) {
      if (!this.filters.default.includes(key)) {
        this.filters.default.push(key);
      } else {
        this.filters.default = this.filters.default.filter((value) => value !== key);
      }
      const keys = [];
      keys.push(key);
      this.processState(keys);
      return this.processData(false, false);
    },
    processState(keys) {
      this.filters = TransformationService.processState(keys, this.filters);
    },
  },
};
</script>
<style>
</style>
