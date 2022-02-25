<template>
  <div class="row">
    <div class="col-md-12">
      <h2 class="title">History Stats</h2>
    </div>
    <p class="category">
    </p>
    <div>
        <loading :active.sync="isLoading" 
        :can-cancel="true"></loading>
    </div>
    <div class="col-12">
      <card>
        <div>
          <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
            <el-select
              class="select-default mb-3"
              style="width: 200px"
              v-model="pagination.perPage"
              placeholder="Per page">
              <el-option
                class="select-default"
                v-for="item in pagination.perPageOptions"
                :key="item"
                :label="item"
                :value="item">
              </el-option>
            </el-select>
            <el-input type="search"
                      class="mb-3"
                      style="width: 200px"
                      placeholder="Search records"
                      v-model="searchQuery"
                      aria-controls="datatables"/>
          </div>
          <div class="col-sm-12">
            <el-table stripe
                      style="width: 100%;"
                      :data="queriedData"
                      border>
              <el-table-column v-for="column in tableColumns"
                               :key="column.label"
                               :min-width="column.minWidth"
                               :prop="column.prop"
                               :label="column.label">
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div slot="footer" class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
          <div class="">
            <p class="card-category">Showing {{from + 1}} to {{to}} of {{total}} entries</p>
          </div>
          <l-pagination class="pagination-no-border"
                        v-model="pagination.currentPage"
                        :per-page="pagination.perPage"
                        :total="pagination.total">
          </l-pagination>
        </div>
      </card>
    </div>
  </div>
</template>
<script>
  import { Table, TableColumn, Select, Option } from 'element-ui'
  import {Pagination as LPagination} from 'src/components/index'
  import users from './users'
  import Fuse from 'fuse.js'
  import axios from 'axios'
  import Loading from 'vue-loading-overlay';
  import 'vue-loading-overlay/dist/vue-loading.css';

  export default {
    components: {
      LPagination,
      [Select.name]: Select,
      [Option.name]: Option,
      [Table.name]: Table,
      [TableColumn.name]: TableColumn,
      Loading
    },
    data () {
      return {
        pagination: {
          perPage: 5,
          currentPage: 1,
          perPageOptions: [5, 10, 25, 50],
          total: 0
        },
        searchQuery: '',
        propsToSearch: ['id'],
        tableColumns: [
          {
            prop: 'roundTime',
            label: 'Round Time',
            minWidth: 200
          },
          {
            prop: 'cumulus',
            label: 'Cumulus',
            minWidth: 250
          },
          {
            prop: 'nimbus',
            label: 'Nimbus',
            minWidth: 100
          },
          {
            prop: 'stratus',
            label: 'Stratus',
            minWidth: 120
          }
        ],
        tableData: [],
        fuseSearch: null,
        isLoading: false
      }
    },
    computed: {
      pagedData () {
        return this.tableData.slice(this.from, this.to)
      },
      /***
       * Searches through table data and returns a paginated array.
       * Note that this should not be used for table with a lot of data as it might be slow!
       * Do the search and the pagination on the server and display the data retrieved from server instead.
       * @returns {computed.pagedData}
       */
      queriedData () {
        let result = this.tableData
        if (this.searchQuery !== '') {
          result = this.fuseSearch.search(this.searchQuery)
          this.paginationTotal(result.length) 
        }
        return result.slice(this.from, this.to)
      },
      to () {
        let highBound = this.from + this.pagination.perPage
        if (this.total < highBound) {
          highBound = this.total
        }
        return highBound
      },
      from () {
        return this.pagination.perPage * (this.pagination.currentPage - 1)
      },
      total () {
        this.paginationTotal(this.tableData.length) 
        return this.tableData.length
      }
    },
     methods: {
      paginationTotal (value) {
        this.pagination.total = value
      }
    },
    mounted () {
      this.isLoading = true
      axios
        .get('https://stats.runonflux.io/fluxhistorystats')
        .then(response => {
          this.isLoading = false
          for (const [key, value] of Object.entries(response.data.data)) {
            this.tableData.push({
              roundTime: key,
              cumulus: value.cumulus,
              nimbus: value.nimbus,
              stratus: value.stratus
            })
          }
          this.fuseSearch = new Fuse(this.tableData, {keys: ['roundTime']})
        });
    }
  }
</script>
<style>
</style>
