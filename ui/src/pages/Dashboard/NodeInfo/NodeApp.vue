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
            v-if="key.includes('application running')"
            style="margin-right: 10px;"
            size="sm"
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key.includes('flux watch')"
            style="margin-right: 10px;"
            size="sm"
          >
            {{ key }}: {{ !value ? 0 : value.length }}
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
        const arr = [];
        const data = [];
        this.filters.default.forEach((item) => {
          const objs = this.filter.get(item);
          objs.forEach((obj) => {
            if (!arr.includes(obj.ip)) {
              arr.push(obj.ip);
              data.push(obj);
            }
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
        temp = this.filter.has(`application running - ${values.apps.count}`) ? this.filter.get(`application running - ${values.apps.count}`) : [];
        if (!this.filter.has(`application running - ${values.apps.count}`)) {
          this.filterValue.push(`application running - ${values.apps.count}`);
        }
        temp.push(values);
        this.filter.set(`application running - ${values.apps.count}`, temp);
        temp = this.filter.has(`flux watch tower installed - ${values.apps.fluxtower}`) ? this.filter.get(`flux watch tower installed - ${values.apps.fluxtower}`) : [];
        if (!this.filter.has(`flux watch tower installed - ${values.apps.fluxtower}`)) {
          this.filterValue.push(`flux watch tower installed - ${values.apps.fluxtower}`);
        }
        temp.push(values);
        this.filter.set(`flux watch tower installed - ${values.apps.fluxtower}`, temp);
        return values;
      });
      this.filters.others = this.filterValue.sort();
      this.tableData = this.values;
    },
    setSearch() {
      this.originalData = JSON.stringify(this.tableData);
      this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['ip'] });
      this.myProgress = 100;
    },
    sortChange(sortProps) {
      this.processData(sortProps);
    },
    sorting(sortProps, data) {
      if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.ip > b.ip) {
            val = 1;
          } else if (a.ip < b.ip) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.ip < b.ip) {
            val = 1;
          } else if (a.ip > b.ip) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Total Application Running' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.apps.count > b.apps.count) {
            val = 1;
          } else if (a.apps.count < b.apps.count) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Total Application Running' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.apps.count < b.apps.count) {
            val = 1;
          } else if (a.apps.count > b.apps.count) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Flux Watch Tower Installed' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.apps.fluxtower > b.apps.fluxtower) {
            val = 1;
          } else if (a.apps.fluxtower < b.apps.fluxtower) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Flux Watch Tower Installed' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.apps.fluxtower < b.apps.fluxtower) {
            val = 1;
          } else if (a.apps.fluxtower > b.apps.fluxtower) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Flux Usage' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.apps.fluxusage > b.apps.fluxusage) {
            val = 1;
          } else if (a.apps.fluxusage < b.apps.fluxusage) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Flux Usage' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.apps.fluxusage < b.apps.fluxusage) {
            val = 1;
          } else if (a.apps.fluxusage > b.apps.fluxusage) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'CPU Locked' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.apps.resources.appsCpusLocked > b.apps.resources.appsCpusLocked) {
            val = 1;
          } else if (a.apps.resources.appsCpusLocked < b.apps.resources.appsCpusLocked) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'CPU Locked' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.apps.resources.appsCpusLocked < b.apps.resources.appsCpusLocked) {
            val = 1;
          } else if (a.apps.resources.appsCpusLocked > b.apps.resources.appsCpusLocked) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'RAM Locked' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.apps.resources.appsRamLocked > b.apps.resources.appsRamLocked) {
            val = 1;
          } else if (a.apps.resources.appsRamLocked < b.apps.resources.appsRamLocked) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'RAM Locked' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.apps.resources.appsRamLocked < b.apps.resources.appsRamLocked) {
            val = 1;
          } else if (a.apps.resources.appsRamLocked > b.apps.resources.appsRamLocked) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'HDD Locked' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.apps.resources.appsHddLocked > b.apps.resources.appsHddLocked) {
            val = 1;
          } else if (a.apps.resources.appsHddLocked < b.apps.resources.appsHddLocked) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'HDD Locked' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.apps.resources.appsHddLocked < b.apps.resources.appsHddLocked) {
            val = 1;
          } else if (a.apps.resources.appsHddLocked > b.apps.resources.appsHddLocked) {
            val = -1;
          }
          return val;
        });
      } else {
        this.tableData = JSON.parse(this.originalData);
      }
      return data;
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
      const date = new Date();
      const month = date.getMonth();
      const day = date.getDate();
      const year = date.getFullYear();
      const options = {
        filename: `Node_Application_${month}${day}${year}`,
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: true,
        title: `Node Application - ${month}/${day}/${year}`,
        useTextFile: false,
        useBom: true,
        headers: [
          'IP Address',
          'Total Application Running',
          'Flux Tower Installed',
          'Flux Usage',
          'CPU Locked',
          'RAM Locked',
          'HDD Locked',
          'Running Apps',
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
