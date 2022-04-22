<template>
  <div class="card chart-card">
    <div
      v-if="$slots.header"
      class="card-header"
    >
      <slot name="header" />
    </div>
    <div class="card-body">
      <div
        :id="chartId"
        class="ct-chart"
      />
    </div>
    <div
      v-if="$slots.footer"
      class="card-footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
<script>

export default {
  name: 'ChartCard',
  props: {
    chartType: {
      type: String,
      default: 'Line', // Line | Pie | Bar
    },
    chartOptions: {
      type: Object,
      default: () => ({}),
    },
    chartData: {
      type: Object,
      default: () => ({
        labels: [],
        series: [],
      }),
    },
    responsiveOptions: {
      type: [Object, Array],
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      chartId: 'no-id',
      $Chartist: null,
      chart: null,
    };
  },
  async mounted() {
    this.updateChartId();
    const Chartist = await import('chartist');
    this.$Chartist = Chartist.default ? Chartist.default : Chartist;
    this.initChart();
  },
  methods: {
    /** *
     * Initializes the chart by merging the chart options sent via props and the default chart options
     */
    initChart() {
      const chartIdQuery = `#${this.chartId}`;
      this.chart = this.$Chartist[this.chartType](chartIdQuery, this.chartData, this.chartOptions, this.responsiveOptions);
      this.$emit('initialized', this.chart);
      if (this.chartType === 'Line') {
        this.animateLineChart();
      }
      if (this.chartType === 'Bar') {
        this.animateBarChart();
      }
    },
    /** *
     * Assigns a random id to the chart
     */
    updateChartId() {
      const currentTime = new Date().getTime().toString();
      const randomInt = this.getRandomInt(0, currentTime);
      this.chartId = `div_${randomInt}`;
    },
    getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    animateLineChart() {
      let seq = 0;
      const durations = 500;
      const delays = 80;
      this.chart.on('draw', (data) => {
        if (data.type === 'line' || data.type === 'area') {
          data.element.animate({
            d: {
              begin: 600,
              dur: 700,
              from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
              to: data.path.clone().stringify(),
              easing: this.$Chartist.Svg.Easing.easeOutQuint,
            },
          });
        } else if (data.type === 'point') {
          seq += 1;
          data.element.animate({
            opacity: {
              begin: seq * delays,
              dur: durations,
              from: 0,
              to: 1,
              easing: 'ease',
            },
          });
        }
      });
      seq = 0;
    },
    animateBarChart() {
      let seq = 0;
      const durations = 500;
      const delays = 80;
      this.chart.on('draw', (data) => {
        if (data.type === 'bar') {
          seq += 1;
          data.element.animate({
            opacity: {
              begin: seq * delays,
              dur: durations,
              from: 0,
              to: 1,
              easing: 'ease',
            },
          });
        }
      });
    },
  },
};
</script>
<style>
</style>
