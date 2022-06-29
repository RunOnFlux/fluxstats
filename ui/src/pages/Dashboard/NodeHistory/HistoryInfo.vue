<template>
  <div>
    <div class="row" style="position: absolute; left: 45%; top: 40%;" v-if="myProgress < 100">
      <vue-ellipse-progress
        :half="false"
        :progress="myProgress"
        line-mode="in 10"
        color="Silver"
        :gap="10"
        fontSize="3rem">
      </vue-ellipse-progress>
    </div>
    <div class="row" v-if="myProgress >= 100">
      <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
        <h2 class="title">
          Info
        </h2>
        <div>
          <l-button v-on:click="downloadCsvFile(dataFilters)"><i class="nc-icon nc-cloud-download-93"></i></l-button>
        </div>
      </div>
      <p class="category" />
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
                placeholder="Search Round Time"
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
                  sortable="@exclude('Round Time Converted')"
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
      searchQuery: '',
      propsToSearch: ['roundTime'],
      tableColumns: [
        {
          prop: 'roundTime',
          label: 'Round Time',
          minWidth: 200,
        },
        {
          prop: 'roundTimeConverted',
          label: 'Round Time Converted',
          minWidth: 200,
        },
        {
          prop: 'cumulus',
          label: 'Cumulus',
          minWidth: 250,
        },
        {
          prop: 'nimbus',
          label: 'Nimbus',
          minWidth: 100,
        },
        {
          prop: 'stratus',
          label: 'Stratus',
          minWidth: 120,
        },
        {
          prop: 'total',
          label: 'Total Nodes',
          minWidth: 120,
        },
      ],
      tableData: [],
      originalData: null,
      values: [],
      fuseSearch: null,
      myProgress: 0,
      dataFilters: [],
    };
  },
  computed: {
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
      this.setDataFilters(result);
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
    await this.getFluxStats();
    await this.processFluxStats();
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
    async getFluxStats() {
      const lsdata = MemoryStorage.get('fluxhistorystats');
      this.values = lsdata;
    },
    async processFluxStats() {
      for (const [key, value] of Object.entries(this.values)) {
        this.tableData.push({
          roundTime: key,
          roundTimeConverted: new Date(parseInt(key, 10)).toLocaleString(),
          cumulus: value.cumulus,
          nimbus: value.nimbus,
          stratus: value.stratus,
          total: value.cumulus + value.nimbus + value.stratus,
        });
      }
    },
    setSearch() {
      this.originalData = JSON.stringify(this.tableData);
      this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['roundTime'] });
      this.myProgress = 100;
    },
    sortChange(sortProps) {
      if (sortProps.column.label === 'Round Time' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.roundTime > b.roundTime) {
            val = 1;
          } else if (a.roundTime < b.roundTime) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Round Time' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.roundTime < b.roundTime) {
            val = 1;
          } else if (a.roundTime > b.roundTime) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Round Time Converted' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.roundTime > b.roundTime) {
            val = 1;
          } else if (a.roundTime < b.roundTime) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Round Time Converted' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.roundTime < b.roundTime) {
            val = 1;
          } else if (a.roundTime > b.roundTime) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Cumulus' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.cumulus > b.cumulus) {
            val = 1;
          } else if (a.cumulus < b.cumulus) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Cumulus' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.cumulus < b.cumulus) {
            val = 1;
          } else if (a.cumulus > b.cumulus) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Nimbus' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.nimbus > b.nimbus) {
            val = 1;
          } else if (a.nimbus < b.nimbus) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Nimbus' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.nimbus < b.nimbus) {
            val = 1;
          } else if (a.nimbus > b.nimbus) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Stratus' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.stratus > b.stratus) {
            val = 1;
          } else if (a.stratus < b.stratus) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Stratus' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.stratus < b.stratus) {
            val = 1;
          } else if (a.stratus > b.stratus) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Total Nodes' && sortProps.column.order === 'ascending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.total > b.total) {
            val = 1;
          } else if (a.total < b.total) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Total Nodes' && sortProps.column.order === 'descending') {
        this.tableData.sort((a, b) => {
          let val = 0;
          if (a.total < b.total) {
            val = 1;
          } else if (a.total > b.total) {
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
          roundTime: !item.roundTime ? '' : item.roundTime,
          roundTimeConverted: !item.roundTimeConverted ? '' : item.roundTimeConverted,
          total: !item.total ? '' : item.total,
          cumulus: !item.cumulus ? '' : item.cumulus,
          nimbus: !item.nimbus ? '' : item.nimbus,
          stratus: !item.stratus ? '' : item.stratus,
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
        filename: `History_Info_${month}${day}${year}`,
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: true,
        title: `History_Info - ${month}/${day}/${year}`,
        useTextFile: false,
        useBom: true,
        headers: [
          'Round Time',
          'Round Time Converted',
          'Total Nodes',
          'Cumulus',
          'Nimbus',
          'Stratus',
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
