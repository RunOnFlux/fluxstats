<template>
  <div>
      <div class="row">
        <div>
          <loading :active.sync="isLoading" 
          :can-cancel="true"></loading>
        </div>
        <div class="col-xl-3 col-md-6">
          <stats-card :title="totalNumberOfNodes" subTitle="Total Nodes">
            <div slot="header" class="icon-warning">
              <i class="nc-icon nc-chart text-warning"></i>
            </div>
            <template slot="footer">
              Cumulus + Nimbus + Stratus
            </template>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card :title="totalNumberOfCumulus" subTitle="Cumulus">
            <div slot="header" class="icon-success">
              <i class="nc-icon nc-chart text-success"></i>
            </div>
            <template slot="footer">
              10,000 Flux
            </template>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card :title="totalNumberOfNimbus" subTitle="Nimbus">
            <div slot="header" class="icon-danger">
              <i class="nc-icon nc-chart text-danger"></i>
            </div>
            <template slot="footer">
              25,000 Flux
            </template>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card :title="totalNumberOfStratus" subTitle="Stratus">
            <div slot="header" class="icon-info">
              <i class="nc-icon nc-chart text-primary"></i>
            </div>
            <template slot="footer">
              100,000 Flux
            </template>
          </stats-card>
        </div>

      </div>
      <div class="row">

        <div class="col-md-4">
          <chart-card :chart-data="pieChart.data" chart-type="Pie">
            <template slot="header">
              <h4 class="card-title">Nodes Statistics</h4>
            </template>
            <template slot="footer">
              <div class="legend">
                <i class="fa fa-circle text-info"></i> Cumulus
                <i class="fa fa-circle text-danger"></i> Nimbus
                <i class="fa fa-circle text-warning"></i> Stratus
              </div>
              <hr>
            </template>
          </chart-card>
        </div>

        <div class="col-md-8">
          <chart-card :chart-data="lineChart.data"
                      :chart-options="lineChart.options"
                      :responsive-options="lineChart.responsiveOptions">
            <template slot="header">
              <h4 class="card-title">Nodes History</h4>
              <p class="card-category">24 Hours performance</p>
            </template>
            <template slot="footer">
              <div class="legend">
                <i class="fa fa-circle text-info"></i> Cumulus
                <i class="fa fa-circle text-danger"></i> Nimbus
                <i class="fa fa-circle text-warning"></i> Stratus
              </div>
              <hr>
              <div class="stats">
              </div>
            </template>
          </chart-card>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <chart-card
            :chart-data="barChart.data"
            :chart-options="barChart.options"
            :chart-responsive-options="barChart.responsiveOptions"
            chart-type="Bar">
            <template slot="header">
              <h4 class="card-title">2022 Nodes Average Count</h4>
              <p class="card-category">Average Count Of Nodes Per Tier</p>
            </template>
            <template slot="footer">
              <div class="legend">
                <i class="fa fa-circle text-info"></i> Cumulus
                <i class="fa fa-circle text-danger"></i> Nimbus
                <i class="fa fa-circle text-warning"></i> Stratus
              </div>
              <hr>
              <div class="stats">
              </div>
            </template>
          </chart-card>
        </div>

        <div class="col-md-6">
          <card class="card-tasks" title="Tasks" subTitle="Backend development">
            <l-table :data="tableData.data">
              <template slot-scope="{row}">
                <td>
                  <Checkbox v-model="row.checked"></Checkbox>
                </td>
                <td>{{row.title}}</td>
                <td class="td-actions d-flex justify-content-end">
                  <div class="btn btn-info btn-simple btn-link" v-tooltip.top-center="editTooltip">
                    <i class="fa fa-edit"></i>
                  </div>
                  <div class="btn btn-danger btn-simple btn-link" v-tooltip.top-center="deleteTooltip">
                    <i class="fa fa-times"></i>
                  </div>
                </td>
              </template>
            </l-table>
            <div class="stats" slot="footer">
            </div>
          </card>

        </div>
      </div>
  </div>
</template>
<script>
  import {ChartCard, StatsCard, Card, Table as LTable, Checkbox} from 'src/components/index'
  import axios from 'axios'
  import Loading from 'vue-loading-overlay';
  import 'vue-loading-overlay/dist/vue-loading.css';

  export default {
    components: {
      Checkbox,
      Card,
      LTable,
      ChartCard,
      StatsCard,
      Loading
    },
    data () {
      return {
        pieChart: {
          data: {
            labels: [],
            series: []
          }
        },
        lineChart: {
          data: {
            labels: ['9:00AM', '12:00AM', '3:00PM', '6:00PM', '9:00PM', '12:00PM', '3:00AM', '6:00AM'],
            series: [
              [287, 385, 490, 492, 554, 586, 698, 695],
              [67, 152, 143, 240, 287, 335, 435, 437],
              [23, 113, 67, 108, 190, 239, 307, 308]
            ]
          },
          options: {
            low: 0,
            high: 800,
            showArea: false,
            height: '245px',
            axisX: {
              showGrid: false
            },
            lineSmooth: true,
            showLine: true,
            showPoint: true,
            fullWidth: true,
            chartPadding: {
              right: 50
            }
          },
          responsiveOptions: [
            ['screen and (max-width: 640px)', {
              axisX: {
                labelInterpolationFnc: function (value) {
                  return value[0]
                }
              }
            }]
          ]
        },
        barChart: {
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            series: [
              [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895],
              [412, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636, 695]
            ]
          },
          options: {
            seriesBarDistance: 10,
            axisX: {
              showGrid: false
            },
            height: '245px'
          },
          responsiveOptions: [
            ['screen and (max-width: 640px)', {
              seriesBarDistance: 5,
              axisX: {
                labelInterpolationFnc (value) {
                  return value[0]
                }
              }
            }]
          ]
        },
        tableData: [],
        totalNumberOfNodes: 0,
        totalNumberOfCumulus: 0,
        totalNumberOfNimbus: 0,
        totalNumberOfStratus: 0,
        isLoading: true,
        pieChartPercentageCumulus: 0,
        pieChartPercentageNimbus: 0,
        pieChartPercentageStratus: 0,
      }
    },
    mounted () {
      this.isLoading = true
      axios
        .get('https://stats.runonflux.io/fluxinfo?projection=ip,tier')
        .then(response => {
          this.totalNumberOfNodes = Object.keys(response.data.data).length
          this.totalNumberOfCumulus = 0
          this.totalNumberOfNimbus = 0
          this.totalNumberOfStratus = 0
          this.tableData = response.data.data
          this.tableData.forEach ((data) => {
            if (data.tier === 'CUMULUS') {
              this.totalNumberOfCumulus++
            } else if (data.tier === 'NIMBUS') {
              this.totalNumberOfNimbus++
            } else if (data.tier === 'STRATUS') {
              this.totalNumberOfStratus++
            }
          })
          this.pieChartPercentageCumulus = ((this.totalNumberOfCumulus/this.totalNumberOfNodes) * 100).toFixed(2)
          this.pieChartPercentageNimbus = ((this.totalNumberOfNimbus/this.totalNumberOfNodes) * 100).toFixed(2)
          this.pieChartPercentageStratus = ((this.totalNumberOfStratus/this.totalNumberOfNodes) * 100).toFixed(2)
          this.pieChart.data.labels = [`${this.pieChartPercentageCumulus} %`,`${this.pieChartPercentageNimbus} %`,`${this.pieChartPercentageStratus} %`]
          this.pieChart.data.series = [this.pieChartPercentageCumulus,this.pieChartPercentageNimbus,this.pieChartPercentageStratus]
          this.isLoading = false
        });
    }
  }
</script>
<style>

</style>
