<template>
  <div>
    <div
      v-if="myProgress < 100"
      class="row"
      style="position: absolute; left: 45%; top: 40%;"
    >
      <vue-ellipse-progress
        :half="false"
        :progress="myProgress"
        line-mode="in 10"
        color="Silver"
        :gap="10"
        fontSize="3rem"
      />
    </div>
    <div
      v-if="myProgress >= 100"
      class="row"
    >
      <div class="col-12 d-flex flex-wrap">
        <div
          v-for="[key, value] in filter"
          :key="key"
        >
          <l-button
            v-if="key.includes('active since')"
            style="margin-right: 10px;"
            size="sm"
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
        </div>
      </div>
      <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
        <h2 class="title">
          Up Time
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
        </card>
      </div>
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
import { VueEllipseProgress } from 'vue-ellipse-progress';
import { MemoryStorage } from 'ttl-localstorage';
import { ExportToCsv } from 'export-to-csv';
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
    VueEllipseProgress,
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
          minWidth: 150,
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
          minWidth: 200,
        },
      ],
      tableData: [],
      filterValue: [],
      filter: new Map(),
      originalData: null,
      values: [],
      fuseSearch: null,
      myProgress: 0,
      dataFilters: [],
    };
  },
  computed: {
    queriedData() {
      return this.processData();
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
    this.initialize();
    this.myProgress = await httpRequestFluxInfo(axios, MemoryStorage);
    this.myProgress = await httpRequestDaemonInfo(axios, MemoryStorage);
    this.myProgress = await httpRequestFluxHistoryStats(axios, MemoryStorage);
    await this.getFluxInfo();
    await this.processFluxInfo();
    this.setSearch();
  },
  methods: {
    paginationTotal(value) {
      this.pagination.total = value;
    },
    setDataFilters(data) {
      this.dataFilters = data;
    },
    async initialize() {
      this.myProgress = 20;
    },
    processData(sortProps) {
      let result;
      if (this.searchQuery !== '') {
        const temp = [];
        result = this.fuseSearch.search(`=${this.searchQuery}`);
        for (let i = 0; i < Object.keys(result).length; i += 1) {
          temp.push(result[i].item);
        }
        result = temp;
      } else if (this.filters.default.length) {
        const data = [];
        this.filters.default.forEach((item) => {
          const objs = this.filter.get(item);
          objs.forEach((obj) => {
            data.push(obj);
          });
        });
        result = data;
      } else {
        result = this.tableData;
      }
      if (sortProps) {
        result = this.sorting(sortProps, result);
      }
      this.setDataFilters(result);
      this.paginationTotal(result.length);
      return result.slice(this.from, this.to);
    },
    async getFluxInfo() {
      // Projection being used in this page are ip,activeSince,dataCollectedAt
      const lsdata = MemoryStorage.get('fluxinfo');
      this.values = lsdata;
    },
    async processFluxInfo() {
      this.values.map((value) => {
        this.tableData.push({
          ip: value.ip,
          activeSince: value.activeSince,
          activeSinceConverted: new Date(parseInt(value.activeSince * 1000, 10)).toLocaleString(),
          dataCollectedAt: value.dataCollectedAt,
          dataCollectedAtConverted: new Date(parseInt(value.dataCollectedAt, 10)).toLocaleString(),
        });
        return value;
      });
      this.tableData.map((el) => {
        const values = el;
        const date = values.activeSinceConverted.split(', ')[0];
        const month = date.split('/')[0];
        const year = date.split('/')[2];
        const activesince = `${month}/${year}`;
        const temp = this.filter.has(`active since - ${activesince}`) ? this.filter.get(`active since - ${activesince}`) : [];
        if (!this.filter.has(`active since - ${activesince}`)) {
          this.filterValue.push(`active since - ${activesince}`);
        }
        temp.push(values);
        this.filter.set(`active since - ${activesince}`, temp);
        return values;
      });
      this.filters.others = this.filterValue.sort();
    },
    setSearch() {
      this.originalData = JSON.stringify(this.tableData);
      this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['ip'] });
      this.myProgress = 100;
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
    processDataForCsv(data) {
      const values = [];
      data.forEach((item) => {
        values.push({
          ip: !item.ip ? '' : item.ip,
          activeSince: !item.activeSince ? '' : item.activeSince,
          activeSinceConverted: !item.activeSinceConverted ? '' : item.activeSinceConverted,
          dataCollectedAt: !item.dataCollectedAt ? '' : item.dataCollectedAt,
          dataCollectedAtConverted: !item.dataCollectedAtConverted ? '' : item.dataCollectedAtConverted,
        });
      });
      return values;
    },
    downloadCsvFile(data) {
      const date = new Date();
      const month = date.getMonth();
      const day = date.getDate();
      const year = date.getFullYear();
      const options = {
        filename: `Node_Up_Time_${month}${day}${year}`,
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: true,
        title: `Node Up Time - ${month}/${day}/${year}`,
        useTextFile: false,
        useBom: true,
        headers: [
          'IP Address',
          'Active Since',
          'Active Since Converted',
          'Data Collected At',
          'Data Collected At Converted',
        ],
      };
      const csvExporter = new ExportToCsv(options);
      csvExporter.generateCsv(this.processDataForCsv(data));
    },
  },
};
</script>
<style>
</style>
