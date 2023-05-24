<template>
  <div>
    <div class="col-12 d-flex flex-wrap">
      <div
        v-for="(btn, idx) in filters.states"
        :key="idx"
      >
        <l-button
          v-if="btn.name.includes('application running')"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name.includes('flux watch')"
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
        Application
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
          minWidth: 150,
        },
        {
          prop: 'apps.fluxtower',
          label: 'Flux Watch Tower Installed',
          minWidth: 100,
        },
        {
          prop: 'apps.fluxusage',
          label: 'Flux Usage',
          minWidth: 100,
        },
        {
          prop: 'apps.resources.appsCpusLocked',
          label: 'CPU Locked',
          minWidth: 100,
        },
        {
          prop: 'apps.resources.appsRamLocked',
          label: 'RAM Locked',
          minWidth: 100,
        },
        {
          prop: 'apps.resources.appsHddLocked',
          label: 'HDD Locked',
          minWidth: 100,
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
        result = TransformationService.processFilters(this.filters, this.filter, 'nodeapp');
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
      // Projection being used in this page are ip,apps
      const lsdata = MemoryStorage.get('fluxinfo');
      this.values = lsdata;
    },
    async processFluxInfo() {
      this.values.map((value) => {
        let temp;
        const values = value;
        const filtered = values.apps.runningapps.filter((item) => item.Image !== 'containrrr/watchtower');
        values.apps.runningapps = filtered;
        values.apps.fluxtower = filtered.length !== undefined || filtered.length !== 0 ? 'TRUE' : 'FALSE';
        values.apps.count = filtered.length !== undefined || filtered.length !== 0 ? filtered.length : 0;
        const appscount = values.apps.count;
        const appsfluxtower = values.apps.fluxtower;
        temp = this.filter.has(`application running - ${appscount}`) ? this.filter.get(`application running - ${appscount}`) : [];
        if (!this.filter.has(`application running - ${appscount}`)) {
          this.filterValue.push(`application running - ${appscount}`);
        }
        temp.push(values);
        this.filter.set(`application running - ${appscount}`, temp);
        temp = this.filter.has(`flux watch tower installed - ${appsfluxtower}`) ? this.filter.get(`flux watch tower installed - ${appsfluxtower}`) : [];
        if (!this.filter.has(`flux watch tower installed - ${appsfluxtower}`)) {
          this.filterValue.push(`flux watch tower installed - ${appsfluxtower}`);
        }
        temp.push(values);
        this.filter.set(`flux watch tower installed - ${appsfluxtower}`, temp);
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
      this.fuseSearch = SearchService.generateSearch(Fuse, this.tableData, ['ip']);
    },
    sortChange(sortProps) {
      this.processData(sortProps, true);
    },
    sorting(sortProps, data) {
      const ret = SortService.sortNodeApp(data, sortProps, this.originalData);
      this.tableData = Object.keys(ret.tableDatas).length > 0 ? ret.tableDatas : this.tableData;
      return ret.datas;
    },
    processDataForCsv(data) {
      const values = [];
      data.forEach((item) => {
        values.push({
          ip: !item.ip ? '' : item.ip,
          appsCount: !item.apps.count ? 0 : item.apps.count,
          fluxTowerInstalled: !item.apps.fluxtower ? '' : item.apps.fluxtower,
          fluxUsage: !item.apps.fluxusage ? '' : item.apps.fluxusage,
          cpuLocked: !item.apps.resources.appsCpusLocked ? '' : item.apps.resources.appsCpusLocked,
          ramLocked: !item.apps.resources.appsRamLocked ? '' : item.apps.resources.appsRamLocked,
          hddLocked: !item.apps.resources.appsHddLocked ? '' : item.apps.resources.appsHddLocked,
          runningApps: !item.apps.runningapps || item.apps.runningapps.length <= 0 ? '' : JSON.stringify(item.apps.runningapps, null, 2),
        });
      });
      return values;
    },
    downloadCsvFile(data) {
      CsvService.Download(this.processDataForCsv(data), CsvService.NodeAppHeaders, 'Node_Application', ExportToCsv);
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
