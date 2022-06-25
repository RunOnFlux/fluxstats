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
          Address Info
        </h2>
        <div>
          <l-button v-on:click="downloadCsvFile(tableData)"><i class="nc-icon nc-cloud-download-93"></i></l-button>
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
                placeholder="Search Zel ID"
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
      propsToSearch: ['zelId'],
      tableColumns: [
        {
          prop: 'zelId',
          label: 'Zel ID',
          minWidth: 150,
        },
        {
          prop: 'paymentId',
          label: 'Payment ID',
          minWidth: 150,
        },
        {
          prop: 'org',
          label: 'Organization',
          minWidth: 150,
        },
        {
          prop: 'totalNodes',
          label: 'Total Nodes',
          minWidth: 100,
        },
      ],
      tableData: [],
      originalData: null,
      values: [],
      fuseSearch: null,
      myProgress: 0,
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
    async initialize() {
      this.myProgress = 20;
    },
    async getFluxInfo() {
      // Projection being used in this page are node,flux,geolocation,tier
      const lsdata = MemoryStorage.get('fluxinfo');
      this.values = lsdata;
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
      this.myProgress = 100;
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
    processDataForCsv(data) {
      const values = [];
      data.forEach((item) => {
        values.push({
          zelId: !item.zelId ? '' : item.zelId,
          paymentId: !item.paymentId ? '' : item.paymentId,
          org: !item.org ? '' : item.org,
          totalNodes: !item.totalNodes ? '' : item.totalNodes,
          totalCumulus: !item.totalCumulus ? '' : item.totalCumulus,
          totalNimbus: !item.totalNimbus ? '' : item.totalNimbus,
          totalStratus: !item.totalStratus ? '' : item.totalStratus,
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
        filename: `Node_Address_Info_${month}${day}${year}`,
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: true,
        title: `Node Address Info - ${month}/${day}/${year}`,
        useTextFile: false,
        useBom: true,
        headers: [
          'Zel ID',
          'Payment ID',
          'Organization',
          'Total Nodes',
          'Total Cumulus',
          'Total Nimbus',
          'Total Stratus',
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
