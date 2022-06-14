<template>
  <div>
    <div>
      <loading
        :active.sync="isLoading"
        :can-cancel="true"
      />
    </div>

    <div
      v-if="!isFetching"
      class="row"
    >
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
    </div>

    <div
      v-if="!isFetching"
      class="row"
    >
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
              Last 5 Round Time
            </p>
          </template>
          <template slot="footer">
            <div class="legend">
              <i class="fa fa-circle text-info" /> Cumulus
              <i class="fa fa-circle text-danger" /> Nimbus
              <i class="fa fa-circle text-warning" /> Stratus
            </div>
            <hr>
            <div class="stats" />
          </template>
        </chart-card>
      </div>
    </div>

    <div
      v-if="!isFetching"
      class="row"
    >
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
    </div>
  </div>
</template>
<script>
import {
  ChartCard, StatsCard, Card, Table as LTable,
} from 'src/components/index';
import axios from 'axios';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import { MemoryStorage } from 'ttl-localstorage';

export default {
  components: {
    ChartCard,
    StatsCard,
    Loading,
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
          high: 10000,
          showArea: false,
          height: '245px',
          axisX: {
            showGrid: false,
          },
          lineSmooth: true,
          showLine: true,
          showPoint: true,
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
      totalNumberOfNodes: 0,
      totalNumberOfCumulus: 0,
      totalNumberOfNimbus: 0,
      totalNumberOfStratus: 0,
      totalTBSSD: 0,
      totalVCores: 0,
      totalTBRAM: 0,
      isLoading: true,
      statsLength: 0,
      isFetching: true,
      values: [],
      paymentAddress: new Map(),
      organization: new Map(),
      totalNodes: new Map(),
      totalCumulus: new Map(),
      totalStratus: new Map(),
      totalNimbus: new Map(),
      averageSpeed: {
        cumulus: {
          uploadSpeed: 0,
          downloadSpeed: 0,
        },
        nimbus: {
          uploadSpeed: 0,
          downloadSpeed: 0,
        },
        stratus: {
          uploadSpeed: 0,
          downloadSpeed: 0,
        },
      },
      map: new Map(),
      mapCumulus: new Map(),
      mapNimbus: new Map(),
      mapStratus: new Map(),
      mapOrganizations: new Map(),
      mapOrganizationsCumulus: new Map(),
      mapOrganizationsNimbus: new Map(),
      mapOrganizationsStratus: new Map(),
      zelids: [],
      statsValues: [],
    };
  },
  async created() {
    this.setLoading(true);
    await this.getFluxInfo();
    await this.processFluxInfo();
    await this.getFluxStats();
    await this.processFluxStats();
    this.setLoading(false);
    this.setFetching(false);
  },
  methods: {
    async getFluxInfo() {
      const lsdata = MemoryStorage.get('fluxinfo?projection=ip,tier,geolocation,benchmark,node,flux');
      if (!lsdata) {
        const response = await axios.get('https://stats.runonflux.io/fluxinfo?projection=ip,tier,geolocation,benchmark,node,flux');
        MemoryStorage.put('fluxinfo?projection=ip,tier,geolocation,benchmark,node,flux', response.data.data, 600);
        this.values = response.data.data;
        this.totalNumberOfNodes = Object.keys(response.data.data).length;
        this.tableData = response.data.data;
      } else {
        this.values = lsdata;
        this.totalNumberOfNodes = Object.keys(lsdata).length;
        this.tableData = lsdata;
      }
    },
    async processFluxInfo() {
      this.tableData.map((data) => {
        this.totalNumberOfCumulus = data.tier === 'CUMULUS' ? this.totalNumberOfCumulus + 1 : this.totalNumberOfCumulus;
        this.totalNumberOfNimbus = data.tier === 'NIMBUS' ? this.totalNumberOfNimbus + 1 : this.totalNumberOfNimbus;
        this.totalNumberOfStratus = data.tier === 'STRATUS' ? this.totalNumberOfStratus + 1 : this.totalNumberOfStratus;
        this.totalVCores += data.benchmark.bench.cores;
        this.totalTBSSD += data.benchmark.bench.ssd;
        this.totalTBRAM += data.benchmark.bench.ram;
        if (!this.map.has(data.geolocation.country)) {
          this.mapCumulus.set(data.geolocation.country, 0);
          this.mapNimbus.set(data.geolocation.country, 0);
          this.mapStratus.set(data.geolocation.country, 0);
        }
        if (!this.mapOrganizations.has(data.geolocation.org)) {
          this.mapOrganizationsCumulus.set(data.geolocation.org, 0);
          this.mapOrganizationsNimbus.set(data.geolocation.org, 0);
          this.mapOrganizationsStratus.set(data.geolocation.org, 0);
        }
        this.mapOrganizations.set(data.geolocation.org, this.mapOrganizations.has(data.geolocation.org) ? this.mapOrganizations.get(data.geolocation.org) + 1 : 1);
        this.mapOrganizationsCumulus.set(data.geolocation.org, data.tier === 'CUMULUS' ? this.mapOrganizationsCumulus.get(data.geolocation.org) + 1 : this.mapOrganizationsCumulus.get(data.geolocation.org));
        this.mapOrganizationsNimbus.set(data.geolocation.org, data.tier === 'NIMBUS' ? this.mapOrganizationsNimbus.get(data.geolocation.org) + 1 : this.mapOrganizationsNimbus.get(data.geolocation.org));
        this.mapOrganizationsStratus.set(data.geolocation.org, data.tier === 'STRATUS' ? this.mapOrganizationsStratus.get(data.geolocation.org) + 1 : this.mapOrganizationsStratus.get(data.geolocation.org));
        this.map.set(data.geolocation.country, this.map.has(data.geolocation.country) ? this.map.get(data.geolocation.country) + 1 : 1);
        this.mapCumulus.set(data.geolocation.country, data.tier === 'CUMULUS' ? this.mapCumulus.get(data.geolocation.country) + 1 : this.mapCumulus.get(data.geolocation.country));
        this.mapNimbus.set(data.geolocation.country, data.tier === 'NIMBUS' ? this.mapNimbus.get(data.geolocation.country) + 1 : this.mapNimbus.get(data.geolocation.country));
        this.mapStratus.set(data.geolocation.country, data.tier === 'STRATUS' ? this.mapStratus.get(data.geolocation.country) + 1 : this.mapStratus.get(data.geolocation.country));
        const uploadSpeed = Number.isNaN(data.benchmark.bench.upload_speed) || data.benchmark.bench.upload_speed === undefined ? 0 : parseFloat(data.benchmark.bench.upload_speed).toFixed(2);
        const downloadSpeed = Number.isNaN(data.benchmark.bench.download_speed) || data.benchmark.bench.download_speed === undefined ? 0 : parseFloat(data.benchmark.bench.download_speed).toFixed(2);
        this.averageSpeed.cumulus.uploadSpeed = data.tier === 'CUMULUS' ? (parseFloat(this.averageSpeed.cumulus.uploadSpeed) + parseFloat(uploadSpeed)).toFixed(2) : this.averageSpeed.cumulus.uploadSpeed;
        this.averageSpeed.nimbus.uploadSpeed = data.tier === 'NIMBUS' ? (parseFloat(this.averageSpeed.nimbus.uploadSpeed) + parseFloat(uploadSpeed)).toFixed(2) : this.averageSpeed.nimbus.uploadSpeed;
        this.averageSpeed.stratus.uploadSpeed = data.tier === 'STRATUS' ? (parseFloat(this.averageSpeed.stratus.uploadSpeed) + parseFloat(uploadSpeed)).toFixed(2) : this.averageSpeed.stratus.uploadSpeed;
        this.averageSpeed.cumulus.downloadSpeed = data.tier === 'CUMULUS' ? (parseFloat(this.averageSpeed.cumulus.downloadSpeed) + parseFloat(downloadSpeed)).toFixed(2) : this.averageSpeed.cumulus.downloadSpeed;
        this.averageSpeed.nimbus.downloadSpeed = data.tier === 'NIMBUS' ? (parseFloat(this.averageSpeed.nimbus.downloadSpeed) + parseFloat(downloadSpeed)).toFixed(2) : this.averageSpeed.nimbus.downloadSpeed;
        this.averageSpeed.stratus.downloadSpeed = data.tier === 'STRATUS' ? (parseFloat(this.averageSpeed.stratus.downloadSpeed) + parseFloat(downloadSpeed)).toFixed(2) : this.averageSpeed.stratus.downloadSpeed;
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
          if (idx < 9) {
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
          if (idx < 9) {
            idx += 1;
          } else {
            break;
          }
        }
      }
      for (let i = 0; i < 5; i += 1) {
        this.tableData2.data.push({ title: `${i + 1}. Zel ID: ${ent[i].zelId} - Total: ${this.totalNodes.get(ent[i].zelId)} Cumulus: ${this.totalCumulus.get(ent[i].zelId)} Nimbus: ${this.totalNimbus.get(ent[i].zelId)} Stratus: ${this.totalStratus.get(ent[i].zelId)}` });
      }
      this.barChart2.data.labels = ['Cumulus Nodes', 'Nimbus Nodes', 'Stratus Nodes'];
      this.barChart2.data.series = [
        [
          parseFloat(this.averageSpeed.cumulus.uploadSpeed / this.totalNumberOfCumulus).toFixed(2),
          parseFloat(this.averageSpeed.nimbus.uploadSpeed / this.totalNumberOfNimbus).toFixed(2),
          parseFloat(this.averageSpeed.stratus.uploadSpeed / this.totalNumberOfStratus).toFixed(2),
        ],
        [
          parseFloat(this.averageSpeed.cumulus.downloadSpeed / this.totalNumberOfCumulus).toFixed(2),
          parseFloat(this.averageSpeed.nimbus.downloadSpeed / this.totalNumberOfNimbus).toFixed(2),
          parseFloat(this.averageSpeed.stratus.downloadSpeed / this.totalNumberOfStratus).toFixed(2),
        ],
      ];
    },
    async getFluxStats() {
      const lsdata = MemoryStorage.get('fluxhistorystats');
      if (!lsdata) {
        const response = await axios.get('https://stats.runonflux.io/fluxhistorystats');
        MemoryStorage.put('fluxhistorystats', response.data.data, 600);
        this.statsValues = response.data.data;
      } else {
        this.statsValues = lsdata;
      }
    },
    async processFluxStats() {
      for (const [key, value] of Object.entries(this.statsValues)) {
        this.tableData1.push({
          roundTime: key,
          cumulus: value.cumulus,
          nimbus: value.nimbus,
          stratus: value.stratus,
        });
      }
      this.statsLength = Object.keys(this.statsValues).length;
      const items = [];
      for (let i = 0; i < 5; i += 1) {
        items.push(new Date(parseInt(this.tableData1[this.statsLength - (i + 1)].roundTime, 10)));
      }
      const temp1 = [];
      const temp2 = [];
      const temp3 = [];
      for (let i = 0; i < 6; i += 1) {
        temp1.push(this.tableData1[this.statsLength - (i + 1)].cumulus);
        temp2.push(this.tableData1[this.statsLength - (i + 1)].nimbus);
        temp3.push(this.tableData1[this.statsLength - (i + 1)].stratus);
      }
      this.lineChart.data.series = [temp1, temp2, temp3];
      for (let i = 0; i < 5; i += 1) {
        this.lineChart.data.labels.push(`${items[i].toLocaleDateString()} ${items[i].toLocaleTimeString()}`);
      }
    },
    setLoading(value) {
      this.isLoading = value;
    },
    setFetching(value) {
      this.isFetching = value;
    },
  },
};
</script>
<style>
</style>
