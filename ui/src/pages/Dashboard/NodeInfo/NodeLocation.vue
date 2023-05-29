<template>
  <div>
    <div class="col-12 d-flex flex-wrap">
      <div
        v-for="(btn, idx) in filters.states"
        :key="idx"
      >
        <l-button
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name.includes('tier')"
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
        Geolocation
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
      propsToSearch: ['geolocation.ip'],
      tableColumns: [
        {
          prop: 'geolocation.ip',
          label: 'IP Address',
          minWidth: 200,
        },
        {
          prop: 'geolocation.country',
          label: 'Country',
          minWidth: 200,
        },
        {
          prop: 'geolocation.countryCode',
          label: 'Country Code',
          minWidth: 150,
        },
        {
          prop: 'geolocation.region',
          label: 'Region',
          minWidth: 200,
        },
        {
          prop: 'geolocation.regionName',
          label: 'Region Name',
          minWidth: 150,
        },
        {
          prop: 'geolocation.lat',
          label: 'Latitude',
          minWidth: 100,
        },
        {
          prop: 'geolocation.lon',
          label: 'Longitude',
          minWidth: 120,
        },
        {
          prop: 'node.status.tier',
          label: 'Tier',
          minWidth: 120,
        },
      ],
      tableData: [],
      filterValue: [],
      filterValueStates: [],
      filter: new Map(),
      originalData: null,
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
        result = TransformationService.processFilters(this.filters, this.filter, 'nodelocation');
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
      // Projection being used in this page are ip,geolocation
      const lsdata = MemoryStorage.get('fluxinfo');
      this.values = lsdata;
    },
    async processFluxInfo() {
      this.values.map((value) => {
        const values = value;
        const statustier = values.node.status.tier;
        const geolocationcountrycode = values.geolocation.countryCode;
        const geolocationcountry = values.geolocation.country;
        const geolocationregion = values.geolocation.region;
        const geolocationregionname = values.geolocation.regionName === '' || values.geolocation.region === '' || !values.geolocation.regionName || !values.geolocation.region ? 'no region' : `region name - ${values.geolocation.regionName}`;
        let temp = this.filter.has(geolocationcountry) ? this.filter.get(geolocationcountry) : [];
        if (!this.filter.has(geolocationcountry)) {
          this.filterValue.push(geolocationcountry);
          this.filterValueStates.push(geolocationcountry);
        }
        temp.push(values);
        this.filter.set(geolocationcountry, temp);
        temp = this.filter.has(`tier - ${statustier}`) ? this.filter.get(`tier - ${statustier}`) : [];
        if (!this.filter.has(`tier - ${statustier}`)) {
          this.filterValue.push(`tier - ${statustier}`);
        }
        temp.push(values);
        this.filter.set(`tier - ${statustier}`, temp);
        temp = this.filter.has(`country code - ${geolocationcountrycode}`) ? this.filter.get(`country code - ${geolocationcountrycode}`) : [];
        if (!this.filter.has(`country code - ${geolocationcountrycode}`)) {
          this.filterValue.push(`country code - ${geolocationcountrycode}`);
        }
        temp.push(values);
        this.filter.set(`country code - ${geolocationcountrycode}`, temp);
        temp = this.filter.has(`region - ${geolocationregion}`) ? this.filter.get(`region - ${geolocationregion}`) : [];
        if (!this.filter.has(`region - ${geolocationregion}`)) {
          this.filterValue.push(`region - ${geolocationregion}`);
        }
        temp.push(values);
        this.filter.set(`region - ${geolocationregion}`, temp);
        temp = this.filter.has(`${geolocationcountry} - ${statustier}`) ? this.filter.get(`${geolocationcountry} - ${statustier}`) : [];
        if (!this.filter.has(`${geolocationcountry} - ${statustier}`)) {
          this.filterValue.push(`${geolocationcountry} - ${statustier}`);
          this.filterValueStates.push(`${geolocationcountry} - ${statustier}`);
        }
        temp.push(values);
        this.filter.set(`${geolocationcountry} - ${statustier}`, temp);
        temp = this.filter.has(geolocationregionname) ? this.filter.get(geolocationregionname) : [];
        if (!this.filter.has(geolocationregionname)) {
          this.filterValue.push(geolocationregionname);
        }
        temp.push(values);
        this.filter.set(geolocationregionname, temp);
        temp = this.filter.has(`${geolocationregionname} - ${statustier}`) ? this.filter.get(`${geolocationregionname} - ${statustier}`) : [];
        if (!this.filter.has(`${geolocationregionname} - ${statustier}`)) {
          this.filterValue.push(`${geolocationregionname} - ${statustier}`);
        }
        temp.push(values);
        this.filter.set(`${geolocationregionname} - ${statustier}`, temp);
        return values;
      });
      this.filters.others = this.filterValue.sort();
      this.tableData = this.values;
      this.filterValueStates.forEach((value) => {
        if (!value.includes('-')) {
          this.filters.states.push({
            name: value,
            state: false,
          });
        }
      });
    },
    setSearch() {
      this.originalData = JSON.stringify(this.tableData);
      this.fuseSearch = SearchService.generateSearch(Fuse, this.tableData, ['geolocation.ip']);
    },
    sortChange(sortProps) {
      this.processData(sortProps, true);
    },
    sorting(sortProps, data) {
      const ret = SortService.sortNodeLocation(data, sortProps, this.originalData);
      this.tableData = Object.keys(ret.tableDatas).length > 0 ? ret.tableDatas : this.tableData;
      return ret.datas;
    },
    processDataForCsv(data) {
      const values = [];
      data.forEach((item) => {
        values.push({
          ip: !item.geolocation.ip ? '' : item.geolocation.ip,
          country: !item.geolocation.country ? '' : item.geolocation.country,
          countryCode: !item.geolocation.countryCode ? '' : item.geolocation.countryCode,
          region: !item.geolocation.region ? '' : item.geolocation.region,
          regionName: !item.geolocation.regionName ? '' : item.geolocation.regionName,
          latitude: !item.geolocation.lat ? '' : item.geolocation.lat,
          longtitude: !item.geolocation.lon ? '' : item.geolocation.lon,
          tier: !item.node.status.tier ? '' : item.node.status.tier,
        });
      });
      return values;
    },
    downloadCsvFile(data) {
      CsvService.Download(this.processDataForCsv(data), CsvService.NodeLocationHeaders, 'Node_Geolocation', ExportToCsv);
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
