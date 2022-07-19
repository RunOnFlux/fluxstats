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
      </div>
      <div class="row">
        <div class="col-md-4">
          <chart-card
            :chart-data="pieChart.data"
            chart-type="Pie"
          >
            <template slot="header">
              <h4 class="card-title">
                Nodes Statistics
              </h4>
            </template>
            <template slot="footer">
              <div class="legend">
                <i class="fa fa-circle text-info" /> Cumulus
                <i class="fa fa-circle text-danger" /> Nimbus
                <i class="fa fa-circle text-warning" /> Stratus
              </div>
              <hr>
            </template>
          </chart-card>
        </div>
        <div class="col-md-8">
          <chart-card
            :chart-data="lineChart.data"
            :chart-options="lineChart.options"
            :responsive-options="lineChart.responsiveOptions"
          >
            <template slot="header">
              <h4 class="card-title">
                Nodes History
              </h4>
              <p class="card-category">
                Tier Node Count History
              </p>
            </template>
            <template slot="footer">
              <div class="legend">
                <i class="fa fa-circle text-info" /> Cumulus
                <i class="fa fa-circle text-danger" /> Nimbus
                <i class="fa fa-circle text-warning" /> Stratus
                <i class="fa fa-circle text-success" /> Total
              </div>
              <hr>
              <div class="stats" />
            </template>
          </chart-card>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <chart-card
            :chart-data="barChart1.data"
            :chart-options="barChart1.options"
            :chart-responsive-options="barChart1.responsiveOptions"
            chart-type="Bar"
          >
            <template slot="header">
              <h4 class="card-title">
                Top 10 Node Location
              </h4>
              <p class="card-category">
                Countries With Highest Node Count
              </p>
            </template>
            <template slot="footer">
              <div class="legend">
                <i class="fa fa-circle text-info" /> Cumulus
                <i class="fa fa-circle text-danger" /> Nimbus
                <i class="fa fa-circle text-warning" /> Stratus
                <i class="fa fa-circle text-success" /> Total Nodes
              </div>
              <hr>
              <div class="stats" />
            </template>
          </chart-card>
        </div>
        <div class="col-md-6">
          <chart-card
            :chart-data="barChart2.data"
            :chart-options="barChart2.options"
            :chart-responsive-options="barChart2.responsiveOptions"
            chart-type="Bar"
          >
            <template slot="header">
              <h4 class="card-title">
                Network Speed Per Tier
              </h4>
              <p class="card-category">
                Average Upload And Download Speed Per Tier
              </p>
            </template>
            <template slot="footer">
              <div class="legend">
                <i class="fa fa-circle text-info" /> Upload Speed
                <i class="fa fa-circle text-danger" /> Download Speed
              </div>
              <hr>
              <div class="stats" />
            </template>
          </chart-card>
        </div>
        <div class="col-md-6">
          <chart-card
            :chart-data="barChart3.data"
            :chart-options="barChart3.options"
            :chart-responsive-options="barChart3.responsiveOptions"
            chart-type="Bar"
          >
            <template slot="header">
              <h4 class="card-title">
                Top 5 Organizations
              </h4>
              <p class="card-category">
                Organizations With Highest Node Count
              </p>
            </template>
            <template slot="footer">
              <div class="legend">
                <i class="fa fa-circle text-info" /> Cumulus
                <i class="fa fa-circle text-danger" /> Nimbus
                <i class="fa fa-circle text-warning" /> Stratus
                <i class="fa fa-circle text-success" /> Total Nodes
              </div>
              <hr>
              <div class="stats" />
            </template>
          </chart-card>
        </div>
        <div class="col-md-6">
          <card
            class="card-tasks"
            title="Top 5 Node Operator"
            sub-title="Zel ID's With Highest Node Count"
          >
            <l-table :data="tableData2.data">
              <template slot-scope="{row}">
                <td>{{ row.title }}</td>
                <td class="td-actions d-flex justify-content-end" />
              </template>
            </l-table>
            <div
              slot="footer"
              class="stats"
            />
          </card>
        </div>
        <div class="col-md-6">
          <card
            class="card-tasks"
            title="Active Since Information"
            sub-title="Total Nodes Based On Starting Month And Year"
          >
            <l-table :data="tableData3.data">
              <template slot-scope="{row}">
                <td>{{ row.title }}</td>
                <td class="td-actions d-flex justify-content-end" />
              </template>
            </l-table>
            <div
              slot="footer"
              class="stats"
            />
          </card>
        </div>
        <div class="col-md-6">
          <card
            class="card-tasks"
            title="Top 5 Highest Node Count Round Time"
            sub-title="Round Time With Highest Node Count"
          >
            <l-table :data="tableData4.data">
              <template slot-scope="{row}">
                <td>{{ row.title }}</td>
                <td class="td-actions d-flex justify-content-end" />
              </template>
            </l-table>
            <div
              slot="footer"
              class="stats"
            />
          </card>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  ChartCard, StatsCard, Card, Table as LTable,
} from 'src/components/index';
import axios from 'axios';
import { VueEllipseProgress } from 'vue-ellipse-progress';
import { MemoryStorage } from 'ttl-localstorage';
import {
  httpRequestFluxInfo, httpRequestDaemonInfo, httpRequestFluxHistoryStats,
} from '../Request/HttpRequest';

export default {
  components: {
    ChartCard,
    StatsCard,
    VueEllipseProgress,
    LTable,
    Card,
  },
  data() {
    return {
      pieChart: {
        data: {
          labels: [],
          series: [],
        },
      },
      lineChart: {
        data: {
          labels: [],
          series: [],
        },
        options: {
          low: 0,
          high: 15000,
          showArea: false,
          height: '245px',
          axisX: {
            showGrid: false,
          },
          lineSmooth: false,
          showLine: true,
          showPoint: false,
          fullWidth: true,
          chartPadding: {
            right: 50,
          },
        },
        responsiveOptions: [
          ['screen and (max-width: 640px)', {
            axisX: {
              labelInterpolationFnc(value) {
                return value[0];
              },
            },
          }],
        ],
      },
      barChart1: {
        data: {
          labels: [],
          series: [],
        },
        options: {
          seriesBarDistance: 10,
          axisX: {
            showGrid: false,
          },
          height: '245px',
        },
        responsiveOptions: [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc(value) {
                return value[0];
              },
            },
          }],
        ],
      },
      barChart2: {
        data: {
          labels: [],
          series: [],
        },
        options: {
          seriesBarDistance: 10,
          axisX: {
            showGrid: false,
          },
          height: '245px',
        },
        responsiveOptions: [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc(value) {
                return value[0];
              },
            },
          }],
        ],
      },
      barChart3: {
        data: {
          labels: [],
          series: [],
        },
        options: {
          seriesBarDistance: 10,
          axisX: {
            showGrid: false,
          },
          height: '245px',
        },
        responsiveOptions: [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc(value) {
                return value[0];
              },
            },
          }],
        ],
      },
      tableData: [],
      tableData1: [],
      tableData2: {
        data: [
        ],
      },
      tableData3: {
        data: [
        ],
      },
      tableData4: {
        data: [
        ],
      },
      totalNumberOfNodes: 0,
      totalNumberOfCumulus: 0,
      totalNumberOfNimbus: 0,
      totalNumberOfStratus: 0,
      totalTBSSD: 0,
      totalVCores: 0,
      totalTBRAM: 0,
      latestFluxVersion: '0.0.0',
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
    this.initialize();
    this.myProgress = await httpRequestFluxInfo(axios, MemoryStorage);
    this.myProgress = await httpRequestDaemonInfo(axios, MemoryStorage);
    this.myProgress = await httpRequestFluxHistoryStats(axios, MemoryStorage);
    await this.getFluxInfo();
    await this.processFluxInfo();
    await this.getFluxStats();
    await this.processFluxStats();
    this.stopProcessing();
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
      this.totalTBSSD = Number(this.totalTBSSD / 1000).toFixed(2);
      this.totalTBRAM = Number(this.totalTBRAM / 1000).toFixed(2);
      const pieChartPercentageCumulus = ((this.totalNumberOfCumulus / this.totalNumberOfNodes) * 100).toFixed(2);
      const pieChartPercentageNimbus = ((this.totalNumberOfNimbus / this.totalNumberOfNodes) * 100).toFixed(2);
      const pieChartPercentageStratus = ((this.totalNumberOfStratus / this.totalNumberOfNodes) * 100).toFixed(2);
      this.pieChart.data.labels = [`${pieChartPercentageCumulus} %`, `${pieChartPercentageNimbus} %`, `${pieChartPercentageStratus} %`];
      this.pieChart.data.series = [pieChartPercentageCumulus, pieChartPercentageNimbus, pieChartPercentageStratus];
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
      let temp1 = [];
      let temp2 = [];
      let temp3 = [];
      let temp4 = [];
      for (let i = 0; i < 10; i += 1) {
        this.barChart1.data.labels.push(ent[i].name);
        temp1.push(this.mapCumulus.get(ent[i].name));
        temp2.push(this.mapNimbus.get(ent[i].name));
        temp3.push(this.mapStratus.get(ent[i].name));
        temp4.push(ent[i].total);
      }
      this.barChart1.data.series = [temp1, temp2, temp3, temp4];
      idx = 0;
      ent = [];
      for (const entry of new Map([...this.mapOrganizations.entries()].sort((a, b) => b[1] - a[1])).entries()) {
        const key = entry[0];
        const value = entry[1];
        if (key !== '') {
          ent.push({
            name: key,
            cumulus: this.mapOrganizationsCumulus.get(key),
            nimbus: this.mapOrganizationsNimbus.get(key),
            stratus: this.mapOrganizationsStratus.get(key),
            total: value,
          });
          if (idx < 5) {
            idx += 1;
          } else {
            break;
          }
        }
      }
      temp1 = [];
      temp2 = [];
      temp3 = [];
      temp4 = [];
      for (let i = 0; i < 5; i += 1) {
        this.barChart3.data.labels.push(ent[i].name);
        temp1.push(ent[i].cumulus);
        temp2.push(ent[i].nimbus);
        temp3.push(ent[i].stratus);
        temp4.push(ent[i].total);
      }
      this.barChart3.data.series = [temp1, temp2, temp3, temp4];
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
        this.tableData2.data.push({ title: `${i + 1}. Zel ID: ${ent[i].zelId} - Total: ${this.totalNodes.get(ent[i].zelId)} Cumulus: ${this.totalCumulus.get(ent[i].zelId)} Nimbus: ${this.totalNimbus.get(ent[i].zelId)} Stratus: ${this.totalStratus.get(ent[i].zelId)}` });
      }
      idx = 0;
      ent = [];
      for (const entry of new Map([...this.activeSince.entries()].sort((a, b) => b[1] - a[1])).entries()) {
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
        this.tableData3.data.push({ title: `${ent[i].date} - Total: ${ent[i].total} Cumulus: ${this.activeSinceCumulus.get(ent[i].date)} Nimbus: ${this.activeSinceNimbus.get(ent[i].date)} Stratus: ${this.activeSinceStratus.get(ent[i].date)}` });
      }
      this.barChart2.data.labels = ['Cumulus Nodes', 'Nimbus Nodes', 'Stratus Nodes'];
      this.barChart2.data.series = [
        [
          parseFloat(this.averageUploadSpeedCumulus / this.totalNumberOfCumulus).toFixed(2),
          parseFloat(this.averageUploadSpeedNimbus / this.totalNumberOfNimbus).toFixed(2),
          parseFloat(this.averageUploadSpeedStratus / this.totalNumberOfStratus).toFixed(2),
        ],
        [
          parseFloat(this.averageDownloadSpeedCumulus / this.totalNumberOfCumulus).toFixed(2),
          parseFloat(this.averageDownloadSpeedNimbus / this.totalNumberOfNimbus).toFixed(2),
          parseFloat(this.averageDownloadSpeedStratus / this.totalNumberOfStratus).toFixed(2),
        ],
      ];
    },
    async getFluxStats() {
      const lsdata = MemoryStorage.get('fluxhistorystats');
      this.statsValues = lsdata;
    },
    async processFluxStats() {
      for (const [key, value] of Object.entries(this.statsValues)) {
        this.tableData1.push({
          roundTime: key,
          cumulus: value.cumulus,
          nimbus: value.nimbus,
          stratus: value.stratus,
          total: value.cumulus + value.nimbus + value.stratus,
        });
        this.roundTimeCumulus.set(key, value.cumulus);
        this.roundTimeNimbus.set(key, value.nimbus);
        this.roundTimeStratus.set(key, value.stratus);
        this.roundTime.set(key, value.cumulus + value.nimbus + value.stratus);
      }
      const temp1 = [];
      const temp2 = [];
      const temp3 = [];
      const temp4 = [];
      for (let i = 0; i < this.tableData1.length; i += 1) {
        temp1.push(this.tableData1[i].cumulus);
        temp2.push(this.tableData1[i].nimbus);
        temp3.push(this.tableData1[i].stratus);
        temp4.push(this.tableData1[i].total);
      }
      this.lineChart.data.series = [temp1, temp2, temp3, temp4];
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
        this.tableData4.data.push({ title: `${i + 1}. Round Time: ${ent[i].roundTime} - Total: ${ent[i].total} Cumulus: ${this.roundTimeCumulus.get(ent[i].roundTime)} Nimbus: ${this.roundTimeNimbus.get(ent[i].roundTime)} Stratus: ${this.roundTimeStratus.get(ent[i].roundTime)}` });
      }
    },
  },
};
</script>
<style>
</style>
