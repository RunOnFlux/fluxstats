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
            v-if="key === 'node hashes - 0'"
            style="margin-right: 10px;"
            wide
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key === 'no ip address'"
            style="margin-right: 10px;"
            wide
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key.includes('version')"
            style="margin-right: 10px;"
            wide
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
          <l-button
            v-if="key.includes('node status')"
            style="margin-right: 10px;"
            wide
          >
            {{ key }}: {{ !value ? 0 : value.length }}
          </l-button>
        </div>
      </div>
      <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
        <h2 class="title">
          Node
        </h2>
        <div>
          <l-button
            @click="downloadCsvFile(dataFilters)"
          >
            <i class="nc-icon nc-cloud-download-93" />
          </l-button>
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
              <div
                col-md-3
                offset-md-6
              >
                <el-input
                  v-model="searchQuery"
                  type="search"
                  class="mb-3"
                  style="width: 200px"
                  placeholder="Search IP"
                  aria-controls="datatables"
                />
              </div>
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
                    <p><b>Collateral:</b> {{ props.row.node.status.collateral }} </p>
                    <p><b>Txn Hash:</b> {{ props.row.node.status.txhash }}</p>
                    <p><b>Added Height:</b> {{ props.row.node.status.added_height }}</p>
                    <p><b>Confirmed Height:</b> {{ props.row.node.status.confirmed_height }}</p>
                    <p><b>Last Confirmed Height:</b> {{ props.row.node.status.last_confirmed_height }}</p>
                    <p><b>Last Paid Height:</b> {{ props.row.node.status.last_paid_height }}</p>
                    <p><b>Payment Address:</b> {{ props.row.node.status.payment_address }}</p>
                    <p><b>Zel ID:</b> {{ props.row.flux.zelid }}</p>
                    <p><b>Active Since:</b> {{ props.row.node.status.activesince }}</p>
                    <p><b>Active Since Converted:</b> {{ new Date(parseInt(props.row.node.status.activesince * 1000, 10)).toLocaleString() }}</p>
                    <p><b>Last Paid:</b> {{ props.row.node.status.lastpaid }}</p>
                    <p><b>Last Paid Converted:</b> {{ new Date(parseInt(props.row.node.status.lastpaid * 1000, 10)).toLocaleString() }}</p>
                    <p><b>Amount:</b> {{ props.row.node.status.amount }}</p>
                    <p><b>Crux ID:</b> {{ props.row.flux.cruxid }}</p>
                    <p><b>DOS State:</b> {{ props.row.flux.dos.dosState }}</p>
                    <p><b>DOS Message:</b> {{ props.row.flux.dos.dosMessage }}</p>
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
      filters: {
        default: [],
        others: [],
      },
      searchQuery: '',
      propsToSearch: ['node.status.ip'],
      tableColumns: [
        {
          prop: 'node.status.ip',
          label: 'IP Address',
          minWidth: 200,
        },
        {
          prop: 'node.status.network',
          label: 'Network Protocol',
          minWidth: 100,
        },
        {
          prop: 'node.status.tier',
          label: 'Tier',
          minWidth: 100,
        },
        {
          prop: 'node.status.status',
          label: 'Status',
          minWidth: 100,
        },
        {
          prop: 'node.status.rank',
          label: 'Payment Rank',
          minWidth: 100,
        },
      ],
      tableData: [],
      originalData: null,
      values: [],
      daemon: [],
      fuseSearch: null,
      myProgress: 0,
      filter: new Map(),
      filterValue: [],
      ranks: new Map(),
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
    await this.getDaemonInfo();
    await this.processDaemonInfo();
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
      // Projection being used in this page are node,flux,appsHashesTotal
      const lsdata = MemoryStorage.get('fluxinfo');
      this.values = lsdata;
    },
    async getDaemonInfo() {
      const lsdata = MemoryStorage.get('daemon/viewdeterministiczelnodelist');
      this.daemon = lsdata;
    },
    async processDaemonInfo() {
      this.daemon.map((el) => {
        if (!this.ranks.has(el.ip)) {
          this.ranks.set(el.ip, el.rank);
        }
        return el;
      });
    },
    async processFluxInfo() {
      this.values.map((el) => {
        let temp;
        const values = el;
        const ipaddress = values.node.status.ip;
        const fluxversion = values.flux.version;
        const apphashtotal = values.appsHashesTotal;
        const nodestatus = values.node.status.status;
        values.node.status.network = 'ipv4';
        values.node.status.rank = !this.ranks.get(ipaddress) ? 0 : this.ranks.get(ipaddress);
        temp = this.filter.has(`node version - ${fluxversion}`) ? this.filter.get(`node version - ${fluxversion}`) : [];
        if (!this.filter.has(`node version - ${fluxversion}`)) {
          this.filterValue.push(`node version - ${fluxversion}`);
        }
        temp.push(values);
        this.filter.set(`node version - ${fluxversion}`, temp);
        temp = this.filter.has(`node hashes - ${apphashtotal}`) ? this.filter.get(`node hashes - ${apphashtotal}`) : [];
        if (!this.filter.has(`node hashes - ${apphashtotal}`)) {
          this.filterValue.push(`node hashes - ${apphashtotal}`);
        }
        temp.push(values);
        this.filter.set(`node hashes - ${apphashtotal}`, temp);
        temp = this.filter.has(`node status - ${nodestatus}`) ? this.filter.get(`node status - ${nodestatus}`) : [];
        if (!this.filter.has(`node status - ${nodestatus}`)) {
          this.filterValue.push(`node status - ${nodestatus}`);
        }
        temp.push(values);
        this.filter.set(`node status - ${nodestatus}`, temp);
        temp = this.filter.has('no ip address') ? this.filter.get('no ip address') : [];
        if (!this.filter.has('no ip address') && (!ipaddress || ipaddress === '')) {
          this.filterValue.push('no ip address');
        }
        if (!ipaddress || ipaddress === '') {
          temp.push(values);
          this.filter.set('no ip address', temp);
        }
        return values;
      });
      this.filters.others = this.filterValue.sort();
      this.tableData = this.values;
    },
    setSearch() {
      this.originalData = JSON.stringify(this.tableData);
      this.fuseSearch = new Fuse(this.tableData, { useExtendedSearch: true, keys: ['node.status.ip'] });
      this.myProgress = 100;
    },
    sortChange(sortProps) {
      this.processData(sortProps);
    },
    sorting(sortProps, data) {
      if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.node.status.ip > b.node.status.ip) {
            val = 1;
          } else if (a.node.status.ip < b.node.status.ip) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.node.status.ip < b.node.status.ip) {
            val = 1;
          } else if (a.node.status.ip > b.node.status.ip) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Network Protocol' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.node.status.network > b.node.status.network) {
            val = 1;
          } else if (a.node.status.network < b.node.status.network) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Network Protocol' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.node.status.network < b.node.status.network) {
            val = 1;
          } else if (a.node.status.network > b.node.status.network) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Tier' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.node.status.tier > b.node.status.tier) {
            val = 1;
          } else if (a.node.status.tier < b.node.status.tier) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Tier' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.node.status.tier < b.node.status.tier) {
            val = 1;
          } else if (a.node.status.tier > b.node.status.tier) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Status' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.node.status.status > b.node.status.status) {
            val = 1;
          } else if (a.node.status.status < b.node.status.status) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Status' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.node.status.status < b.node.status.status) {
            val = 1;
          } else if (a.node.status.status > b.node.status.status) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Payment Rank' && sortProps.column.order === 'ascending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.node.status.rank > b.node.status.rank) {
            val = 1;
          } else if (a.node.status.rank < b.node.status.rank) {
            val = -1;
          }
          return val;
        });
      } else if (sortProps.column.label === 'Payment Rank' && sortProps.column.order === 'descending') {
        data.sort((a, b) => {
          let val = 0;
          if (a.node.status.rank < b.node.status.rank) {
            val = 1;
          } else if (a.node.status.rank > b.node.status.rank) {
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
          ip: !item.node.status.ip ? '' : item.node.status.ip,
          networkProtocol: !item.node.status.network ? '' : item.node.status.network,
          tier: !item.node.status.tier ? '' : item.node.status.tier,
          status: !item.node.status.status ? '' : item.node.status.status,
          paymentRank: !item.node.status.rank ? '' : item.node.status.rank,
          collateral: !item.node.status.collateral ? '' : item.node.status.collateral,
          txnHash: !item.node.status.txhash ? '' : item.node.status.txhash,
          addedHeight: !item.node.status.added_height ? '' : item.node.status.added_height,
          confirmedHeight: !item.node.status.confirmed_height ? '' : item.node.status.confirmed_height,
          lastConfirmedHeight: !item.node.status.last_confirmed_height ? '' : item.node.status.last_confirmed_height,
          lastPaidHeight: !item.node.status.last_paid_height ? '' : item.node.status.last_paid_height,
          paymentAddress: !item.node.status.payment_address ? '' : item.node.status.payment_address,
          zelId: !item.flux.zelid ? '' : item.flux.zelid,
          activeSince: !item.node.status.activesince ? '' : item.node.status.activesince,
          activeSinceConverted: !item.node.status.activesince ? '' : new Date(parseInt(item.node.status.activesince * 1000, 10)).toLocaleString(),
          lastPaid: !item.node.status.lastpaid ? '' : item.node.status.lastpaid,
          lastPaidConverted: !item.node.status.lastpaid ? '' : new Date(parseInt(item.node.status.lastpaid * 1000, 10)).toLocaleString(),
          amount: !item.node.status.amount ? '' : item.node.status.amount,
          cruxId: !item.flux.cruxid ? '' : item.flux.cruxid,
          dosState: !item.flux.dos.dosState ? 0 : item.flux.dos.dosState,
          dosMessage: !item.flux.dos.dosMessage ? '' : item.flux.dos.dosMessage,
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
        filename: `Nodes_${month}${day}${year}`,
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: true,
        title: `Nodes - ${month}/${day}/${year}`,
        useTextFile: false,
        useBom: true,
        headers: [
          'IP Address',
          'Network Protocol',
          'Tier',
          'Status',
          'Payment Rank',
          'Collateral',
          'Txn Hash',
          'Added Height',
          'Confirmed Height',
          'Last Confirmed Height',
          'Last Paid Height',
          'Payment Address',
          'Zel ID',
          'Active Since',
          'Active Since Converted',
          'Last Paid',
          'Last Paid Converted',
          'Amount',
          'Crux ID',
          'DOS State',
          'DOS Message',
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
