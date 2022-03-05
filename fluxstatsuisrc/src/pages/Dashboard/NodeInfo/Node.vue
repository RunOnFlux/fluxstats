<template>
  <div class="row">
    <div class="col-md-12">
      <h2 class="title">Node</h2>
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
                      placeholder="Search IP"
                      v-model="searchQuery"
                      aria-controls="datatables"/>
          </div>
          <div class="col-sm-12">
            <el-table stripe
                      style="width: 100%;"
                      :data="queriedData"
                      border>
              <el-table-column type="expand">
                <template slot-scope="props">
                  <p><b>Collateral:</b> {{ props.row.node.status.collateral }} </p>
                  <p><b>Txn Hash:</b> {{ props.row.node.status.txhash }}</p>
                  <p><b>Added Height:</b> {{ props.row.node.status.added_height }}</p>
                  <p><b>Confirmed Height:</b> {{ props.row.node.status.confirmed_height }}</p>
                  <p><b>Last Confirmed Height:</b> {{ props.row.node.status.last_confirmed_height }}</p>
                  <p><b>Last Paid Height:</b> {{ props.row.node.status.last_paid_height }}</p>
                  <p><b>Payment Address:</b> {{ props.row.node.status.payment_address }}</p>
                  <p><b>Active Since:</b> {{ props.row.node.status.activesince }}</p>
                  <p><b>Last Paid:</b> {{ props.row.node.status.lastpaid }}</p>
                  <p><b>Amount:</b> {{ props.row.node.status.amount }}</p>
                </template>
              </el-table-column>
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
        propsToSearch: ['node.status.ip'],
        tableColumns: [
          {
            prop: 'node.status.ip',
            label: 'IP Address',
            minWidth: 70
          },
          {
            prop: 'node.status.network',
            label: 'Network Protocol',
            minWidth: 40
          },
          {
            prop: 'node.status.tier',
            label: 'Tier',
            minWidth: 90
          },
          {
            prop: 'node.status.status',
            label: 'Status',
            minWidth: 50
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
        let result;

        if (this.searchQuery !== '') {
          var temp = []
          result = this.fuseSearch.search(`=${this.searchQuery}`)
          for (let i=0; i < Object.keys(result).length; i++) {
            temp.push(result[i].item)
          }
          result = temp
          this.paginationTotal(result.length) 
        } else {
          this.paginationTotal(this.tableData.length)
          result = this.tableData
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
        .get('https://stats.runonflux.io/fluxinfo?projection=node')
        .then(response => {
          this.isLoading = false
          this.tableData = response.data.data
          this.fuseSearch = new Fuse(this.tableData, {useExtendedSearch: true, keys: ['node.status.ip']})
        });
    }
  }
</script>
<style>
</style>
