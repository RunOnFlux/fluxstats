<template>
  <div>
    <div class="col-12 d-flex flex-wrap">
      <div
        v-for="(btn, idx) in filters.states"
        :key="idx"
      >
        <l-button
          v-if="btn.name.includes('category')"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name.includes('visible')"
          style="margin-right: 10px;"
          size="sm"
          :class="{active: btn.state}"
          @click="processFilters(btn.name)"
        >
          {{ btn.name }}: {{ !filter.get(btn.name) ? 0 : filter.get(btn.name).length }}
        </l-button>
        <l-button
          v-if="btn.name.includes('enabled')"
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
        Marketplace
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
              placeholder="Search Name"
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
                  <p><b>Multiplier:</b> {{ props.row.multiplier }} </p>
                  <p><b>Version:</b> {{ props.row.version }}</p>
                  <p><b>Instances:</b> {{ props.row.instances }}</p>
                  <p><b>CPU:</b> {{ props.row.compose[0].cpu }}</p>
                  <p><b>RAM:</b> {{ props.row.compose[0].ram }}</p>
                  <p><b>HDD:</b> {{ props.row.compose[0].hdd }}</p>
                  <p><b>Ports:</b> {{ props.row.compose[0].ports }}</p>
                  <p><b>Port Specs:</b> {{ props.row.compose[0].portSpecs }}</p>
                  <p><b>Container Ports:</b> {{ props.row.compose[0].containerPorts }}</p>
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
  httpRequestMarketPlace,
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
      propsToSearch: ['name'],
      tableColumns: [
        {
          prop: 'name',
          label: 'Name',
          minWidth: 200,
        },
        {
          prop: 'description',
          label: 'Description',
          minWidth: 200,
        },
        {
          prop: 'category',
          label: 'Category',
          minWidth: 250,
        },
        {
          prop: 'price',
          label: 'Price',
          minWidth: 100,
        },
        {
          prop: 'visible',
          label: 'Visible',
          minWidth: 100,
        },
        {
          prop: 'enabled',
          label: 'Enabled',
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
      await httpRequestMarketPlace(axios, MemoryStorage);
      await this.getMarketplace();
      await this.processMarketplace();
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
        result = TransformationService.processFilters(this.filters, this.filter, 'marketplace');
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
    async getMarketplace() {
      const lsdata = MemoryStorage.get('marketplace');
      this.values = lsdata;
    },
    async processMarketplace() {
      this.values.map((el) => {
        let temp;
        const values = el;
        const descriptionValue = values.description.length > 30 ? `${values.description.slice(0, 30)}...` : values.description;
        const priceValue = values.price;
        const multiplierValue = values.multiplier;
        const categoryValue = values.category;
        const versionValue = values.version;
        const nameValue = values.name;
        const instancesValue = values.instances;
        const cpuValue = values.compose[0].cpu;
        const ramValue = values.compose[0].ram;
        const hddValue = values.compose[0].hdd;
        const visibleValue = values.visible;
        const enabledValue = values.enabled;
        values.visible = visibleValue ? 'true' : 'false';
        values.enabled = enabledValue ? 'true' : 'false';
        temp = this.filter.has(`description - ${descriptionValue}`) ? this.filter.get(`description - ${descriptionValue}`) : [];
        if (!this.filter.has(`description - ${descriptionValue}`)) {
          this.filterValue.push(`description - ${descriptionValue}`);
        }
        temp.push(values);
        this.filter.set(`description - ${descriptionValue}`, temp);
        temp = this.filter.has(`price - ${priceValue}`) ? this.filter.get(`price - ${priceValue}`) : [];
        if (!this.filter.has(`price - ${priceValue}`)) {
          this.filterValue.push(`price - ${priceValue}`);
        }
        temp.push(values);
        this.filter.set(`price - ${priceValue}`, temp);
        temp = this.filter.has(`multiplier - ${multiplierValue}`) ? this.filter.get(`multiplier - ${multiplierValue}`) : [];
        if (!this.filter.has(`multiplier - ${multiplierValue}`)) {
          this.filterValue.push(`multiplier - ${multiplierValue}`);
        }
        temp.push(values);
        this.filter.set(`multiplier - ${multiplierValue}`, temp);
        temp = this.filter.has(`category - ${categoryValue}`) ? this.filter.get(`category - ${categoryValue}`) : [];
        if (!this.filter.has(`category - ${categoryValue}`)) {
          this.filterValue.push(`category - ${categoryValue}`);
        }
        temp.push(values);
        this.filter.set(`category - ${categoryValue}`, temp);
        temp = this.filter.has(`version - ${versionValue}`) ? this.filter.get(`version - ${versionValue}`) : [];
        if (!this.filter.has(`version - ${versionValue}`)) {
          this.filterValue.push(`version - ${versionValue}`);
        }
        temp.push(values);
        this.filter.set(`version - ${versionValue}`, temp);
        temp = this.filter.has(`name - ${nameValue}`) ? this.filter.get(`name - ${nameValue}`) : [];
        if (!this.filter.has(`name - ${nameValue}`)) {
          this.filterValue.push(`name - ${nameValue}`);
        }
        temp.push(values);
        this.filter.set(`name - ${nameValue}`, temp);
        temp = this.filter.has(`instances - ${instancesValue}`) ? this.filter.get(`instances - ${instancesValue}`) : [];
        if (!this.filter.has(`instances - ${instancesValue}`)) {
          this.filterValue.push(`instances - ${instancesValue}`);
        }
        temp.push(values);
        this.filter.set(`instances - ${instancesValue}`, temp);
        temp = this.filter.has(`cpu - ${cpuValue}`) ? this.filter.get(`cpu - ${cpuValue}`) : [];
        if (!this.filter.has(`cpu - ${cpuValue}`)) {
          this.filterValue.push(`cpu - ${cpuValue}`);
        }
        temp.push(values);
        this.filter.set(`cpu - ${cpuValue}`, temp);
        temp = this.filter.has(`ram - ${ramValue}`) ? this.filter.get(`ram - ${ramValue}`) : [];
        if (!this.filter.has(`ram - ${ramValue}`)) {
          this.filterValue.push(`ram - ${ramValue}`);
        }
        temp.push(values);
        this.filter.set(`ram - ${ramValue}`, temp);
        temp = this.filter.has(`hdd - ${hddValue}`) ? this.filter.get(`hdd - ${hddValue}`) : [];
        if (!this.filter.has(`hdd - ${hddValue}`)) {
          this.filterValue.push(`hdd - ${hddValue}`);
        }
        temp.push(values);
        this.filter.set(`hdd - ${hddValue}`, temp);
        temp = this.filter.has(`visible - ${visibleValue}`) ? this.filter.get(`visible - ${visibleValue}`) : [];
        if (!this.filter.has(`visible - ${visibleValue}`)) {
          this.filterValue.push(`visible - ${visibleValue}`);
        }
        temp.push(values);
        this.filter.set(`visible - ${visibleValue}`, temp);
        temp = this.filter.has(`enabled - ${enabledValue}`) ? this.filter.get(`enabled - ${enabledValue}`) : [];
        if (!this.filter.has(`enabled - ${enabledValue}`)) {
          this.filterValue.push(`enabled - ${enabledValue}`);
        }
        temp.push(values);
        this.filter.set(`enabled - ${enabledValue}`, temp);
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
      this.fuseSearch = SearchService.generateSearch(Fuse, this.tableData, ['name']);
    },
    sortChange(sortProps) {
      this.processData(sortProps, true);
    },
    sorting(sortProps, data) {
      const ret = SortService.sortMarketplace(data, sortProps, this.originalData);
      this.tableData = Object.keys(ret.tableDatas).length > 0 ? ret.tableDatas : this.tableData;
      return ret.datas;
    },
    processDataForCsv(data) {
      const values = [];
      data.forEach((item) => {
        values.push({
          name: !item.name ? '' : item.name,
          description: !item.description ? '' : item.description,
          price: !item.price ? '' : item.price,
          multiplier: !item.multiplier ? '' : item.multiplier,
          category: !item.category ? '' : item.category,
          version: !item.version ? '' : item.version,
          instances: !item.instances ? '' : item.instances,
          cpu: !item.compose[0].cpu ? '' : item.compose[0].cpu,
          ram: !item.compose[0].ram ? '' : item.compose[0].ram,
          hdd: !item.compose[0].hdd ? '' : item.compose[0].hdd,
          visible: !item.visible ? '' : item.visible,
          enabled: !item.enabled ? '' : item.enabled,
          containerPorts: !item.compose[0].containerPorts ? '' : item.compose[0].containerPorts.toString(),
          portSpecs: !item.compose[0].portSpecs ? '' : item.compose[0].portSpecs.toString(),
          ports: !item.compose[0].ports ? '' : item.compose[0].ports.toString(),
        });
      });
      return values;
    },
    downloadCsvFile(data) {
      CsvService.Download(this.processDataForCsv(data), CsvService.MarketplaceHeaders, 'Marketplace', ExportToCsv);
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
