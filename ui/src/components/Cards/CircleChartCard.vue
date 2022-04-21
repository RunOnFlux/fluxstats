<template>
  <div
    class="card card-circle-chart"
    :data-background-color="color"
  >
    <div class="card-header text-center">
      <h5 class="card-title">
        {{ title }}
      </h5>
      <p class="description">
        {{ description }}
      </p>
    </div>
    <div class="card-content">
      <div
        ref="chart"
        class="chart-circle"
        :data-percent="percentage"
      >
        {{ percentage }}%
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CircleChartCard',
  props: {
    color: {
      type: String,
      default: 'blue',
    },
    percentage: {
      type: Number,
      default: 0,
    },
    title: String,
    description: String,
  },
  data() {
    return {
      chartId: 'no-id',
      chart: null,
    };
  },
  watch: {
    percentage(newVal) {
      if (this.chart) {
        this.chart.update(newVal);
      }
    },
  },
  async mounted() {
    this.updateChartId();
    const EasyPieChart = await import('easy-pie-chart');
    this.renderChart(EasyPieChart);
  },
  methods: {
    updateChartId() {
      const currentTime = new Date().getTime().toString();
      const randomInt = this.getRandomInt(0, currentTime);
      this.chartId = `div_${randomInt}`;
    },
    getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    renderChart(EasyPieChart) {
      /* eslint-disable no-new */
      this.chart = new EasyPieChart(this.$refs.chart, {
        lineWidth: 6,
        size: 160,
        scaleColor: false,
        trackColor: 'rgba(255,255,255,.25)',
        barColor: '#FFFFFF',
        animate: ({ duration: 2000, enabled: true }),
      });
    },
  },
};
</script>
<style>
</style>
