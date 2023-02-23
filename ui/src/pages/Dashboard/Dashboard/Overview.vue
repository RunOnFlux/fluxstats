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
    <div v-if="myProgress >= 100">
      <div class="row">
        <div class="col-xl-3 col-md-6">
          <stats-card
            :title="totalNumberOfNodes.toString()"
            sub-title="Total Nodes"
          >
            <div
              slot="header"
              class="icon-success"
            >
              <i class="nc-icon nc-chart text-success" />
            </div>
            <template slot="footer">
              Cumulus + Nimbus + Stratus
            </template>
          </stats-card>
        </div>
        <div class="col-xl-3 col-md-6">
          <stats-card
            :title="totalNumberOfCumulus.toString()"
            sub-title="Cumulus"
          >
            <div
              slot="header"
              class="icon-info"
            >
              <i class="nc-icon nc-chart text-info" />
            </div>
            <template slot="footer">
              1,000 Flux
            </template>
          </stats-card>
        </div>
        <div class="col-xl-3 col-md-6">
          <stats-card
            :title="totalNumberOfNimbus.toString()"
            sub-title="Nimbus"
          >
            <div
              slot="header"
              class="icon-danger"
            >
              <i class="nc-icon nc-chart text-danger" />
            </div>
            <template slot="footer">
              12,500 Flux
            </template>
          </stats-card>
        </div>
        <div class="col-xl-3 col-md-6">
          <stats-card
            :title="totalNumberOfStratus.toString()"
            sub-title="Stratus"
          >
            <div
              slot="header"
              class="icon-warning"
            >
              <i class="nc-icon nc-chart text-warning" />
            </div>
            <template slot="footer">
              40,000 Flux
            </template>
          </stats-card>
        </div>
        <div class="col-xl-3 col-md-6">
          <stats-card
            :title="totalTBSSD.toString()"
            sub-title="TB SSD"
          >
            <div
              slot="header"
              class="icon-success"
            >
              <i class="nc-icon nc-chart-bar-32 text-success" />
            </div>
            <template slot="footer">
              Total Number of Available Storage
            </template>
          </stats-card>
        </div>
        <div class="col-xl-3 col-md-6">
          <stats-card
            :title="totalVCores.toString()"
            sub-title="VCORES"
          >
            <div
              slot="header"
              class="icon-info"
            >
              <i class="nc-icon nc-chart-bar-32 text-info" />
            </div>
            <template slot="footer">
              Total Number of Available Cores
            </template>
          </stats-card>
        </div>
        <div class="col-xl-3 col-md-6">
          <stats-card
            :title="totalTBRAM.toString()"
            sub-title="TB RAM"
          >
            <div
              slot="header"
              class="icon-danger"
            >
              <i class="nc-icon nc-chart-bar-32 text-danger" />
            </div>
            <template slot="footer">
              Total Number of Available RAM
            </template>
          </stats-card>
        </div>
        <div class="col-xl-3 col-md-6">
          <stats-card
            :title="latestFluxVersion.toString()"
            sub-title="Flux Version"
          >
            <div
              slot="header"
              class="icon-danger"
            >
              <i class="nc-icon nc-chart-bar-32 text-warning" />
            </div>
            <template slot="footer">
              Latest Flux Version Being Used
            </template>
          </stats-card>
        </div>
        <div class="col-xl-3 col-md-6">
          <stats-card
            :title="totalCumulusFractus.toString()"
            sub-title="Total Cumulus Fractus"
          >
            <div
              slot="header"
              class="icon-success"
            >
              <i class="nc-icon nc-chart-bar-32 text-success" />
            </div>
            <template slot="footer">
              Total Cumulus Node With Thunder Enabled
            </template>
          </stats-card>
        </div>
        <div class="col-xl-3 col-md-6">
          <stats-card
            :title="totalCumulusFractusSSD.toString()"
            sub-title="Cumulus Fractus TB SSD"
          >
            <div
              slot="header"
              class="icon-info"
            >
              <i class="nc-icon nc-chart-bar-32 text-info" />
            </div>
            <template slot="footer">
              Total Cumulus Fractus Available Storage
            </template>
          </stats-card>
        </div>
      </div>
      <div class="row">
        <div class="col-md-7 card"
             style="margin-left: 15px;margin-right: 30px;"
        >
          <GChart
            :settings="{ packages: ['geochart'] }"
            type="GeoChart"
            :data="worldMap.data.chartData"
            :options="worldMap.data.chartOptions"
          />
        </div>
        <div class="col-md-4 card"
             style="margin-right: 30px;"
        >
          <apexchart
            type="pie"
            height="600"
            :options="pieChart.data.chartOptions"
            :series="pieChart.data.series"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-md-7 card"
             style="margin-left: 15px;margin-right: 30px;"
        >
          <apexchart
            type="area"
            height="500"
            :options="lineChart.data.chartOptions"
            :series="lineChart.data.series"
          />
        </div>
        <div class="col-md-4 card"
             style="margin-right: 30px;"
        >
          <apexchart
            type="pie"
            height="600"
            :options="pieChart1.data.chartOptions"
            :series="pieChart1.data.series"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 card"
             style="margin-left: 15px;margin-right: 30px;"
        >
          <apexchart
            type="bar"
            height="500"
            :options="barChart1.data.chartOptions"
            :series="barChart1.data.series"
          />
        </div>
        <div class="col-md-5 card">
          <apexchart
            type="bar"
            height="500"
            :options="barChart2.data.chartOptions"
            :series="barChart2.data.series"
          />
        </div>
        <div class="col-md-6 card"
             style="margin-left: 15px;margin-right: 30px;"
        >
          <apexchart
            type="bar"
            height="500"
            :options="barChart3.data.chartOptions"
            :series="barChart3.data.series"
          />
        </div>
        <div class="col-md-5 card">
          <apexchart
            type="bar"
            height="500"
            :options="barChart4.data.chartOptions"
            :series="barChart4.data.series"
          />
        </div>
        <div class="col-md-6 card"
             style="margin-left: 15px;margin-right: 30px;"
        >
          <apexchart
            type="bar"
            height="500"
            :options="barChart5.data.chartOptions"
            :series="barChart5.data.series"
          />
        </div>
        <div class="col-md-5 card">
          <apexchart
            type="bar"
            height="500"
            :options="barChart6.data.chartOptions"
            :series="barChart6.data.series"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import VueApexCharts from 'vue-apexcharts';
import { StatsCard } from 'src/components/index';
import axios from 'axios';
import { VueEllipseProgress } from 'vue-ellipse-progress';
import { MemoryStorage } from 'ttl-localstorage';
import { GChart } from 'vue-google-charts/legacy';
import {
  httpRequestFluxInfo,
  httpRequestDaemonInfo,
  httpRequestFluxHistoryStats,
} from '../Request/HttpRequest';

export default {
  components: {
    StatsCard,
    VueEllipseProgress,
    GChart,
    apexchart: VueApexCharts,
  },
  data() {
    return {
      worldMap: {
        data: {
          chartData: [
            ['Country', 'Nodes'],
          ],
          chartOptions: {
            colorAxis: { colors: ['#EBF5FB', '#1B4F72'] },
            backgroundColor: '#EAECEE',
            keepAspectRatio: false,
            legend: { textStyle: { color: '#959392', fontSize: 12 } },
            tooltip: { textStyle: { color: '#959392' }, showColorCode: true },
          },
        },
      },
      pieChart: {
        data: {
          series: [],
          chartOptions: {
            chart: {
              width: '500',
              type: 'pie',
            },
            labels: ['Cumulus', 'Nimbus', 'Stratus'],
            title: {
              text: 'Node Statistics',
              margin: 50,
              style: {
                fontSize: '22px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            subtitle: {
              text: 'Tier Percentages Based From Total Nodes',
              margin: 70,
              style: {
                fontSize: '12px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200,
                  },
                  legend: {
                    position: 'bottom',
                  },
                },
              },
            ],
          },
        },
      },
      pieChart1: {
        data: {
          series: [],
          chartOptions: {
            chart: {
              width: '500',
              type: 'pie',
            },
            labels: ['Cumulus', 'Cumulus Fractus'],
            title: {
              text: 'Cumulus Node Statistics',
              margin: 50,
              style: {
                fontSize: '22px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            subtitle: {
              text: 'Percentages Based From Total Cumulus Nodes',
              margin: 70,
              style: {
                fontSize: '12px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200,
                  },
                  legend: {
                    position: 'bottom',
                  },
                },
              },
            ],
          },
        },
      },
      lineChart: {
        data: {
          series: [
            {
              name: 'Cumulus',
              data: [],
            },
            {
              name: 'Nimbus',
              data: [],
            },
            {
              name: 'Stratus',
              data: [],
            },
            {
              name: 'Total',
              data: [],
            },
          ],
          chartOptions: {
            chart: {
              type: 'area',
              stacked: false,
              width: 900,
              zoom: {
                type: 'x',
                enabled: true,
                autoScaleYaxis: true,
              },
              toolbar: {
                autoSelected: 'zoom',
              },
            },
            dataLabels: {
              enabled: false,
            },
            markers: {
              size: 0,
            },
            title: {
              text: 'Node History',
              margin: 50,
              style: {
                fontSize: '22px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            subtitle: {
              text: 'Tier Node Count History',
              margin: 70,
              style: {
                fontSize: '12px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            fill: {
              type: 'gradient',
              gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.5,
                opacityTo: 0,
                stops: [0, 90, 100],
              },
            },
            yaxis: {
              title: {
                text: 'Node Count',
              },
            },
            xaxis: {
              type: 'datetime',
            },
            tooltip: {
              shared: false,
            },
            responsive: [
              {
                options: {
                  chart: {
                    width: 600,
                  },
                },
              },
            ],
          },
        },
      },
      barChart1: {
        data: {
          series: [{
            name: 'Cumulus',
            data: [],
          }, {
            name: 'Nimbus',
            data: [],
          }, {
            name: 'Stratus',
            data: [],
          }],
          chartOptions: {
            chart: {
              type: 'bar',
              width: 300,
              stacked: true,
              toolbar: {
                show: true,
              },
              zoom: {
                enabled: true,
              },
            },
            title: {
              text: 'Top 10 Node Location',
              margin: 50,
              style: {
                fontSize: '22px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            subtitle: {
              text: 'Countries With Highest Node Count',
              margin: 70,
              style: {
                fontSize: '12px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            responsive: [
              {
                options: {
                  chart: {
                    width: 150,
                  },
                },
              },
            ],
            plotOptions: {
              bar: {
                horizontal: false,
                borderRadius: 10,
              },
            },
            xaxis: {
              categories: [],
            },
            yaxis: {
              title: {
                text: 'Node Count',
              },
            },
            legend: {
              position: 'right',
              offsetY: 40,
            },
            fill: {
              opacity: 1,
            },
          },
        },
      },
      barChart2: {
        data: {
          series: [{
            name: 'Upload Speed',
            data: [],
          }, {
            name: 'Download Speed',
            data: [],
          }],
          chartOptions: {
            chart: {
              type: 'bar',
              height: 350,
            },
            plotOptions: {
              bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded',
              },
            },
            dataLabels: {
              enabled: false,
            },
            stroke: {
              show: true,
              width: 2,
              colors: ['transparent'],
            },
            xaxis: {
              categories: ['Cumulus', 'Nimbus', 'Stratus'],
            },
            yaxis: {
              title: {
                text: 'Internet Speed (Mbps)',
              },
            },
            fill: {
              opacity: 1,
            },
            title: {
              text: 'Network Speed Per Tier',
              margin: 50,
              style: {
                fontSize: '22px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            subtitle: {
              text: 'Average Upload And Download Speed Per Tier',
              margin: 70,
              style: {
                fontSize: '12px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
          },
        },
      },
      barChart3: {
        data: {
          series: [{
            name: 'Cumulus',
            data: [],
          }, {
            name: 'Nimbus',
            data: [],
          }, {
            name: 'Stratus',
            data: [],
          }],
          chartOptions: {
            chart: {
              type: 'bar',
              width: 300,
              stacked: true,
              toolbar: {
                show: true,
              },
              zoom: {
                enabled: true,
              },
            },
            title: {
              text: 'Top 5 Organizations',
              margin: 50,
              style: {
                fontSize: '22px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            subtitle: {
              text: 'Organizations With Highest Node Count',
              margin: 70,
              style: {
                fontSize: '12px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            responsive: [
              {
                options: {
                  chart: {
                    width: 150,
                  },
                },
              },
            ],
            plotOptions: {
              bar: {
                horizontal: false,
                borderRadius: 10,
              },
            },
            xaxis: {
              categories: [],
            },
            legend: {
              position: 'right',
              offsetY: 40,
            },
            yaxis: {
              title: {
                text: 'Node Count',
              },
            },
            fill: {
              opacity: 1,
            },
          },
        },
      },
      barChart4: {
        data: {
          series: [{
            name: 'Cumulus',
            data: [],
          }, {
            name: 'Nimbus',
            data: [],
          }, {
            name: 'Stratus',
            data: [],
          }],
          chartOptions: {
            chart: {
              type: 'bar',
              width: 300,
              stacked: true,
              toolbar: {
                show: true,
              },
              zoom: {
                enabled: true,
              },
            },
            title: {
              text: 'Top 5 Node Operator',
              margin: 50,
              style: {
                fontSize: '22px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            subtitle: {
              text: 'Zel IDs With Highest Node Count',
              margin: 70,
              style: {
                fontSize: '12px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            responsive: [
              {
                options: {
                  chart: {
                    width: 150,
                  },
                },
              },
            ],
            plotOptions: {
              bar: {
                horizontal: false,
                borderRadius: 10,
              },
            },
            xaxis: {
              categories: [],
              labels: {
                show: false,
              },
            },
            yaxis: {
              title: {
                text: 'Node Count',
              },
            },
            legend: {
              position: 'right',
              offsetY: 40,
            },
            fill: {
              opacity: 1,
            },
          },
        },
      },
      barChart5: {
        data: {
          series: [{
            name: 'Cumulus',
            data: [],
          }, {
            name: 'Nimbus',
            data: [],
          }, {
            name: 'Stratus',
            data: [],
          }],
          chartOptions: {
            chart: {
              type: 'bar',
              height: 350,
              stacked: true,
            },
            plotOptions: {
              bar: {
                horizontal: true,
              },
            },
            stroke: {
              width: 1,
              colors: ['#fff'],
            },
            xaxis: {
              categories: [],
              title: {
                text: 'Node Count',
              },
            },
            title: {
              text: 'Active Since Information',
              margin: 50,
              style: {
                fontSize: '22px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            subtitle: {
              text: 'Total Nodes Based On Starting Month And Year',
              margin: 70,
              style: {
                fontSize: '12px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            fill: {
              opacity: 1,
            },
            legend: {
              position: 'right',
              offsetY: 40,
            },
          },
        },
      },
      barChart6: {
        data: {
          series: [{
            name: 'Cumulus',
            data: [],
          }, {
            name: 'Nimbus',
            data: [],
          }, {
            name: 'Stratus',
            data: [],
          }, {
            name: 'Total',
            data: [],
          }],
          chartOptions: {
            chart: {
              type: 'bar',
              height: 430,
            },
            plotOptions: {
              bar: {
                horizontal: true,
                dataLabels: {
                  position: 'top',
                },
              },
            },
            dataLabels: {
              enabled: true,
              offsetX: -6,
              style: {
                fontSize: '12px',
                colors: ['#fff'],
              },
            },
            stroke: {
              show: true,
              width: 1,
              colors: ['#fff'],
            },
            tooltip: {
              shared: true,
              intersect: false,
            },
            xaxis: {
              categories: [],
              title: {
                text: 'Node Count',
              },
            },
            title: {
              text: 'Top 5 Highest Node Count Round Time',
              margin: 50,
              style: {
                fontSize: '22px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            subtitle: {
              text: 'Total Nodes Based On Round Time',
              margin: 70,
              style: {
                fontSize: '12px',
                fontWeight: '9px',
                fontFamily: 'Arial',
                color: '#959392',
              },
            },
            legend: {
              position: 'right',
              offsetY: 40,
            },
          },
        },
      },
      tableData: [],
      totalNumberOfNodes: 0,
      totalNumberOfCumulus: 0,
      totalNumberOfNimbus: 0,
      totalNumberOfStratus: 0,
      totalTBSSD: 0,
      totalVCores: 0,
      totalTBRAM: 0,
      latestFluxVersion: '0.0.0',
      totalCumulusFractus: 0,
      totalCumulusFractusSSD: 0,
      myProgress: 0,
      statsLength: 0,
      values: [],
      paymentAddress: new Map(),
      organization: new Map(),
      totalNodes: new Map(),
      totalCumulus: new Map(),
      totalStratus: new Map(),
      totalNimbus: new Map(),
      averageUploadSpeedCumulus: 0,
      averageDownloadSpeedCumulus: 0,
      averageUploadSpeedNimbus: 0,
      averageDownloadSpeedNimbus: 0,
      averageUploadSpeedStratus: 0,
      averageDownloadSpeedStratus: 0,
      map: new Map(),
      mapCumulus: new Map(),
      mapNimbus: new Map(),
      mapStratus: new Map(),
      mapOrganizations: new Map(),
      mapOrganizationsCumulus: new Map(),
      mapOrganizationsNimbus: new Map(),
      mapOrganizationsStratus: new Map(),
      activeSince: new Map(),
      activeSinceCumulus: new Map(),
      activeSinceNimbus: new Map(),
      activeSinceStratus: new Map(),
      roundTime: new Map(),
      roundTimeCumulus: new Map(),
      roundTimeNimbus: new Map(),
      roundTimeStratus: new Map(),
      zelids: [],
      statsValues: [],
    };
  },
  async created() {
    try {
      this.initialize();
      this.myProgress = await httpRequestFluxInfo(axios, MemoryStorage);
      this.myProgress = await httpRequestDaemonInfo(axios, MemoryStorage);
      this.myProgress = await httpRequestFluxHistoryStats(axios, MemoryStorage);
      await this.getFluxInfo();
      await this.processFluxInfo();
      await this.getFluxStats();
      await this.processFluxStats();
      this.stopProcessing();
    } catch (e) {
      this.$router.push('/flux/maintenance/error').catch(() => {});
    }
  },
  methods: {
    async initialize() {
      this.myProgress = 20;
    },
    async stopProcessing() {
      this.myProgress = 100;
    },
    async getFluxInfo() {
      // Projection being used in this page are ip,tier,geolocation,benchmark,node,flux
      const lsdata = MemoryStorage.get('fluxinfo');
      this.values = lsdata;
      this.totalNumberOfNodes = Object.keys(lsdata).length;
      this.tableData = lsdata;
    },
    async processFluxInfo() {
      this.tableData.map((data) => {
        const versioncriteria1 = data.flux.version.split('.')[0] >= this.latestFluxVersion.split('.')[0];
        const versioncriteria2 = data.flux.version.split('.')[1] >= this.latestFluxVersion.split('.')[0];
        const versioncriteria3 = data.flux.version.split('.')[2] >= this.latestFluxVersion.split('.')[0];
        this.latestFluxVersion = versioncriteria1 && versioncriteria2 && versioncriteria3 ? data.flux.version : this.latestFluxVersion;
        this.totalCumulusFractus = data.benchmark.bench.thunder ? this.totalCumulusFractus + 1 : this.totalCumulusFractus;
        this.totalCumulusFractusSSD += data.benchmark.bench.thunder ? data.benchmark.bench.ssd : 0;
        this.totalNumberOfCumulus = data.tier === 'CUMULUS' ? this.totalNumberOfCumulus + 1 : this.totalNumberOfCumulus;
        this.totalNumberOfNimbus = data.tier === 'NIMBUS' ? this.totalNumberOfNimbus + 1 : this.totalNumberOfNimbus;
        this.totalNumberOfStratus = data.tier === 'STRATUS' ? this.totalNumberOfStratus + 1 : this.totalNumberOfStratus;
        this.totalVCores += data.benchmark.bench.cores;
        this.totalTBSSD += data.benchmark.bench.ssd;
        this.totalTBRAM += data.benchmark.bench.ram;
        if (!this.mapOrganizations.has(data.geolocation.org)) {
          this.mapOrganizations.set(data.geolocation.org, 0);
          this.mapOrganizationsCumulus.set(data.geolocation.org, 0);
          this.mapOrganizationsNimbus.set(data.geolocation.org, 0);
          this.mapOrganizationsStratus.set(data.geolocation.org, 0);
        }
        this.mapOrganizations.set(data.geolocation.org, this.mapOrganizations.has(data.geolocation.org) ? this.mapOrganizations.get(data.geolocation.org) + 1 : this.mapOrganizations.get(data.geolocation.org));
        this.mapOrganizationsCumulus.set(data.geolocation.org, data.tier === 'CUMULUS' ? this.mapOrganizationsCumulus.get(data.geolocation.org) + 1 : this.mapOrganizationsCumulus.get(data.geolocation.org));
        this.mapOrganizationsNimbus.set(data.geolocation.org, data.tier === 'NIMBUS' ? this.mapOrganizationsNimbus.get(data.geolocation.org) + 1 : this.mapOrganizationsNimbus.get(data.geolocation.org));
        this.mapOrganizationsStratus.set(data.geolocation.org, data.tier === 'STRATUS' ? this.mapOrganizationsStratus.get(data.geolocation.org) + 1 : this.mapOrganizationsStratus.get(data.geolocation.org));
        if (!this.map.has(data.geolocation.country)) {
          this.map.set(data.geolocation.country, 0);
          this.mapCumulus.set(data.geolocation.country, 0);
          this.mapNimbus.set(data.geolocation.country, 0);
          this.mapStratus.set(data.geolocation.country, 0);
        }
        this.map.set(data.geolocation.country, this.map.has(data.geolocation.country) ? this.map.get(data.geolocation.country) + 1 : this.map.get(data.geolocation.country));
        this.mapCumulus.set(data.geolocation.country, data.tier === 'CUMULUS' ? this.mapCumulus.get(data.geolocation.country) + 1 : this.mapCumulus.get(data.geolocation.country));
        this.mapNimbus.set(data.geolocation.country, data.tier === 'NIMBUS' ? this.mapNimbus.get(data.geolocation.country) + 1 : this.mapNimbus.get(data.geolocation.country));
        this.mapStratus.set(data.geolocation.country, data.tier === 'STRATUS' ? this.mapStratus.get(data.geolocation.country) + 1 : this.mapStratus.get(data.geolocation.country));
        const uploadSpeed = Number.isNaN(data.benchmark.bench.upload_speed) || data.benchmark.bench.upload_speed === undefined ? 0 : parseFloat(data.benchmark.bench.upload_speed).toFixed(2);
        const downloadSpeed = Number.isNaN(data.benchmark.bench.download_speed) || data.benchmark.bench.download_speed === undefined ? 0 : parseFloat(data.benchmark.bench.download_speed).toFixed(2);
        this.averageUploadSpeedCumulus = data.tier === 'CUMULUS' ? (parseFloat(this.averageUploadSpeedCumulus) + parseFloat(uploadSpeed)).toFixed(2) : this.averageUploadSpeedCumulus;
        this.averageUploadSpeedNimbus = data.tier === 'NIMBUS' ? (parseFloat(this.averageUploadSpeedNimbus) + parseFloat(uploadSpeed)).toFixed(2) : this.averageUploadSpeedNimbus;
        this.averageUploadSpeedStratus = data.tier === 'STRATUS' ? (parseFloat(this.averageUploadSpeedStratus) + parseFloat(uploadSpeed)).toFixed(2) : this.averageUploadSpeedStratus;
        this.averageDownloadSpeedCumulus = data.tier === 'CUMULUS' ? (parseFloat(this.averageDownloadSpeedCumulus) + parseFloat(downloadSpeed)).toFixed(2) : this.averageDownloadSpeedCumulus;
        this.averageDownloadSpeedNimbus = data.tier === 'NIMBUS' ? (parseFloat(this.averageDownloadSpeedNimbus) + parseFloat(downloadSpeed)).toFixed(2) : this.averageDownloadSpeedNimbus;
        this.averageDownloadSpeedStratus = data.tier === 'STRATUS' ? (parseFloat(this.averageDownloadSpeedStratus) + parseFloat(downloadSpeed)).toFixed(2) : this.averageDownloadSpeedStratus;
        const as = new Date(parseInt(data.activeSince * 1000, 10)).toLocaleString();
        const date = as.split(', ')[0];
        const month = date.split('/')[0];
        const year = date.split('/')[2];
        const datevalue = `${month}/${year}`;
        if (!this.activeSince.has(datevalue)) {
          this.activeSince.set(datevalue, 0);
          this.activeSinceCumulus.set(datevalue, 0);
          this.activeSinceNimbus.set(datevalue, 0);
          this.activeSinceStratus.set(datevalue, 0);
        }
        this.activeSince.set(datevalue, this.activeSince.has(datevalue) ? this.activeSince.get(datevalue) + 1 : this.activeSince.get(datevalue));
        this.activeSinceCumulus.set(datevalue, data.tier === 'CUMULUS' ? this.activeSinceCumulus.get(datevalue) + 1 : this.activeSinceCumulus.get(datevalue));
        this.activeSinceNimbus.set(datevalue, data.tier === 'NIMBUS' ? this.activeSinceNimbus.get(datevalue) + 1 : this.activeSinceNimbus.get(datevalue));
        this.activeSinceStratus.set(datevalue, data.tier === 'STRATUS' ? this.activeSinceStratus.get(datevalue) + 1 : this.activeSinceStratus.get(datevalue));
        return data;
      });
      this.pieChart1.data.series = [this.totalNumberOfCumulus, this.totalCumulusFractus];
      for (const entry of new Map([...this.map.entries()]).entries()) {
        this.worldMap.data.chartData.push([entry[0], entry[1]]);
      }
      this.totalTBSSD = Number(this.totalTBSSD / 1000).toFixed(2);
      this.totalCumulusFractusSSD = Number(this.totalCumulusFractusSSD / 1000).toFixed(2);
      this.totalTBRAM = Number(this.totalTBRAM / 1000).toFixed(2);
      this.pieChart.data.series = [this.totalNumberOfCumulus, this.totalNumberOfNimbus, this.totalNumberOfStratus];
      let idx = 0;
      let ent = [];
      for (const entry of new Map([...this.map.entries()].sort((a, b) => b[1] - a[1])).entries()) {
        const key = entry[0];
        const value = entry[1];
        ent.push({
          name: key,
          total: value,
        });
        if (idx < 9) {
          idx += 1;
        } else {
          break;
        }
      }
      for (let i = 0; i < 10; i += 1) {
        this.barChart1.data.chartOptions.xaxis.categories.push(ent[i].name);
        this.barChart1.data.series[0].data.push(this.mapCumulus.get(ent[i].name));
        this.barChart1.data.series[1].data.push(this.mapNimbus.get(ent[i].name));
        this.barChart1.data.series[2].data.push(this.mapStratus.get(ent[i].name));
      }
      idx = 0;
      ent = [];
      for (const entry of new Map([...this.mapOrganizations.entries()].sort((a, b) => b[1] - a[1])).entries()) {
        const key = entry[0];
        if (key !== '') {
          ent.push({
            name: key,
            cumulus: this.mapOrganizationsCumulus.get(key),
            nimbus: this.mapOrganizationsNimbus.get(key),
            stratus: this.mapOrganizationsStratus.get(key),
          });
          if (idx < 5) {
            idx += 1;
          } else {
            break;
          }
        }
      }
      for (let i = 0; i < 5; i += 1) {
        this.barChart3.data.chartOptions.xaxis.categories.push(ent[i].name);
        this.barChart3.data.series[0].data.push(ent[i].cumulus);
        this.barChart3.data.series[1].data.push(ent[i].nimbus);
        this.barChart3.data.series[2].data.push(ent[i].stratus);
      }
      this.values.map((data) => {
        if (this.paymentAddress.get(data.flux.zelid) !== undefined) {
          this.totalNodes.set(data.flux.zelid, this.totalNodes.get(data.flux.zelid) + 1);
          this.totalCumulus.set(data.flux.zelid, data.tier === 'CUMULUS' ? this.totalCumulus.get(data.flux.zelid) + 1 : this.totalCumulus.get(data.flux.zelid));
          this.totalNimbus.set(data.flux.zelid, data.tier === 'NIMBUS' ? this.totalNimbus.get(data.flux.zelid) + 1 : this.totalNimbus.get(data.flux.zelid));
          this.totalStratus.set(data.flux.zelid, data.tier === 'STRATUS' ? this.totalStratus.get(data.flux.zelid) + 1 : this.totalStratus.get(data.flux.zelid));
        } else {
          this.totalNodes.set(data.flux.zelid, 1);
          this.totalCumulus.set(data.flux.zelid, data.tier === 'CUMULUS' ? 1 : 0);
          this.totalNimbus.set(data.flux.zelid, data.tier === 'NIMBUS' ? 1 : 0);
          this.totalStratus.set(data.flux.zelid, data.tier === 'STRATUS' ? 1 : 0);
          try {
            this.paymentAddress.set(data.flux.zelid, data.node.status.payment_address);
          } catch (ex) {
            this.paymentAddress.set(data.flux.zelid, '');
          }
          try {
            this.organization.set(data.flux.zelid, data.geolocation.org);
          } catch (ex) {
            this.organization.set(data.flux.zelid, '');
          }
        }
        return data;
      });
      idx = 0;
      ent = [];
      for (const entry of new Map([...this.totalNodes.entries()].sort((a, b) => b[1] - a[1])).entries()) {
        const key = entry[0];
        const value = entry[1];
        if (key !== '') {
          ent.push({
            zelId: key,
            paymentId: value,
          });
          if (idx < 5) {
            idx += 1;
          } else {
            break;
          }
        }
      }
      for (let i = 0; i < 5; i += 1) {
        this.barChart4.data.chartOptions.xaxis.categories.push(ent[i].zelId);
        this.barChart4.data.series[0].data.push(this.totalCumulus.get(ent[i].zelId));
        this.barChart4.data.series[1].data.push(this.totalNimbus.get(ent[i].zelId));
        this.barChart4.data.series[2].data.push(this.totalStratus.get(ent[i].zelId));
      }
      idx = 0;
      ent = [];
      for (const entry of new Map([...this.activeSince.entries()].sort()).entries()) {
        const key = entry[0];
        const value = entry[1];
        if (key !== '') {
          ent.push({
            date: key,
            total: value,
          });
        }
      }
      for (let i = 0; i < Object.keys(ent).length; i += 1) {
        this.barChart5.data.chartOptions.xaxis.categories.push(ent[i].date);
        this.barChart5.data.series[0].data.push(this.activeSinceCumulus.get(ent[i].date));
        this.barChart5.data.series[1].data.push(this.activeSinceNimbus.get(ent[i].date));
        this.barChart5.data.series[2].data.push(this.activeSinceStratus.get(ent[i].date));
      }
      this.barChart2.data.series[0].data = [
        parseFloat(this.averageUploadSpeedCumulus / this.totalNumberOfCumulus).toFixed(2),
        parseFloat(this.averageUploadSpeedNimbus / this.totalNumberOfNimbus).toFixed(2),
        parseFloat(this.averageUploadSpeedStratus / this.totalNumberOfStratus).toFixed(2),
      ];
      this.barChart2.data.series[1].data = [
        parseFloat(this.averageDownloadSpeedCumulus / this.totalNumberOfCumulus).toFixed(2),
        parseFloat(this.averageDownloadSpeedNimbus / this.totalNumberOfNimbus).toFixed(2),
        parseFloat(this.averageDownloadSpeedStratus / this.totalNumberOfStratus).toFixed(2),
      ];
    },
    async getFluxStats() {
      const lsdata = MemoryStorage.get('fluxhistorystats');
      this.statsValues = lsdata;
    },
    async processFluxStats() {
      for (const [key, value] of Object.entries(this.statsValues)) {
        this.lineChart.data.series[0].data.push([parseInt(key, 10), value.cumulus]);
        this.lineChart.data.series[1].data.push([parseInt(key, 10), value.nimbus]);
        this.lineChart.data.series[2].data.push([parseInt(key, 10), value.stratus]);
        this.lineChart.data.series[3].data.push([parseInt(key, 10), value.cumulus + value.nimbus + value.stratus]);
        this.roundTimeCumulus.set(key, value.cumulus);
        this.roundTimeNimbus.set(key, value.nimbus);
        this.roundTimeStratus.set(key, value.stratus);
        this.roundTime.set(key, value.cumulus + value.nimbus + value.stratus);
      }
      let idx = 0;
      const ent = [];
      for (const entry of new Map([...this.roundTime.entries()].sort((a, b) => b[1] - a[1])).entries()) {
        const key = entry[0];
        const value = entry[1];
        if (key !== '') {
          ent.push({
            roundTime: key,
            total: value,
          });
          if (idx < 5) {
            idx += 1;
          } else {
            break;
          }
        }
      }
      for (let i = 0; i < 5; i += 1) {
        this.barChart6.data.chartOptions.xaxis.categories.push(ent[i].roundTime);
        this.barChart6.data.series[0].data.push(this.roundTimeCumulus.get(ent[i].roundTime));
        this.barChart6.data.series[1].data.push(this.roundTimeNimbus.get(ent[i].roundTime));
        this.barChart6.data.series[2].data.push(this.roundTimeStratus.get(ent[i].roundTime));
        this.barChart6.data.series[3].data.push(ent[i].total);
      }
    },
  },
};
</script>
<style>
</style>
