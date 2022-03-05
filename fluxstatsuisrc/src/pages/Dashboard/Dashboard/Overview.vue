<template>
  <div>
      <div class="row">
        <div>
          <loading :active.sync="isLoading" 
          :can-cancel="true"></loading>
        </div>
        <div class="col-xl-3 col-md-6">
          <stats-card :title="totalNumberOfNodes.toString()" subTitle="Total Nodes">
            <div slot="header" class="icon-success">
              <i class="nc-icon nc-chart text-success"></i>
            </div>
            <template slot="footer">
              Cumulus + Nimbus + Stratus
            </template>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card :title="totalNumberOfCumulus.toString()" subTitle="Cumulus">
            <div slot="header" class="icon-info">
              <i class="nc-icon nc-chart text-info"></i>
            </div>
            <template slot="footer">
              10,000 Flux
            </template>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card :title="totalNumberOfNimbus.toString()" subTitle="Nimbus">
            <div slot="header" class="icon-danger">
              <i class="nc-icon nc-chart text-danger"></i>
            </div>
            <template slot="footer">
              25,000 Flux
            </template>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card :title="totalNumberOfStratus.toString()" subTitle="Stratus">
            <div slot="header" class="icon-warning">
              <i class="nc-icon nc-chart text-warning"></i>
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
              <p class="card-category">Last 5 Round Time</p>
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
            labels: [],
            series: [
              [],
              [],
              []
            ]
          },
          options: {
            low: 0,
            high: 1500,
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
        tableData1: [],
        totalNumberOfNodes: 0,
        totalNumberOfCumulus: 0,
        totalNumberOfNimbus: 0,
        totalNumberOfStratus: 0,
        pieChartPercentageCumulus: 0,
        pieChartPercentageNimbus: 0,
        pieChartPercentageStratus: 0,
        isLoading: true,
        statsLength: 0
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
          this.pieChart.data.labels = [`${this.pieChartPercentageCumulus} %`, `${this.pieChartPercentageNimbus} %`, `${this.pieChartPercentageStratus} %`]
          this.pieChart.data.series = [this.pieChartPercentageCumulus, this.pieChartPercentageNimbus, this.pieChartPercentageStratus]

          axios
          .get('https://stats.runonflux.io/fluxhistorystats')
          .then(response => {
            for (const [key, value] of Object.entries(response.data.data)) {
              this.tableData1.push({
                roundTime: key,
                cumulus: value.cumulus,
                nimbus: value.nimbus,
                stratus: value.stratus
              })
            }
            this.statsLength = Object.keys(response.data.data).length
            let item1 = new Date(parseInt(this.tableData1[this.statsLength - 1].roundTime))
            let item2 = new Date(parseInt(this.tableData1[this.statsLength - 2].roundTime))
            let item3 = new Date(parseInt(this.tableData1[this.statsLength - 3].roundTime))
            let item4 = new Date(parseInt(this.tableData1[this.statsLength - 4].roundTime))
            let item5 = new Date(parseInt(this.tableData1[this.statsLength - 5].roundTime))
            
            this.lineChart.data.labels = [
              `${item1.toLocaleDateString()} ${item1.toLocaleTimeString()}`,
              `${item2.toLocaleDateString()} ${item2.toLocaleTimeString()}`,
              `${item3.toLocaleDateString()} ${item3.toLocaleTimeString()}`,
              `${item4.toLocaleDateString()} ${item4.toLocaleTimeString()}`,
              `${item5.toLocaleDateString()} ${item5.toLocaleTimeString()}`
            ],
            this.lineChart.data.series = [
              [this.tableData1[this.statsLength - 1].cumulus, this.tableData1[this.statsLength - 2].cumulus, this.tableData1[this.statsLength - 3].cumulus, 
              this.tableData1[this.statsLength - 4].cumulus, this.tableData1[this.statsLength - 5].cumulus, this.tableData1[this.statsLength - 6].cumulus],
              [this.tableData1[this.statsLength - 1].nimbus, this.tableData1[this.statsLength - 2].nimbus, this.tableData1[this.statsLength - 3].nimbus, 
              this.tableData1[this.statsLength - 4].nimbus, this.tableData1[this.statsLength - 5].nimbus, this.tableData1[this.statsLength - 6].nimbus],
              [this.tableData1[this.statsLength - 1].stratus, this.tableData1[this.statsLength - 2].stratus, this.tableData1[this.statsLength - 3].stratus, 
              this.tableData1[this.statsLength - 4].stratus, this.tableData1[this.statsLength - 5].stratus, this.tableData1[this.statsLength - 6].stratus]
            ]

            this.isLoading = false
          });
        });
    }
  }
</script>
<style>

</style>
