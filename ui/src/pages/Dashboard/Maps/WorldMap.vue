<template>
  <div
    id="worldMap"
    style="height: 300px;"
  />
</template>
<script>
import 'd3';
import * as d3 from 'd3';
import 'topojson';
import DataMap from 'datamaps';
import { throttle } from 'src/util/throttle';

export default {
  data() {
    return {
      color1: '#AAAAAA',
      color2: '#444444',
      highlightFillColor: '#66615B',
      highlightBorderColor: '#f1f1f1',
      mapData: {
        AUS: 760,
        BRA: 550,
        CAN: 120,
        DEU: 1300,
        FRA: 540,
        GBR: 690,
        GEO: 200,
        IND: 200,
        ROU: 600,
        RUS: 300,
        USA: 2920,
      },
    };
  },
  async mounted() {
    this.initVectorMap();
  },
  methods: {
    generateColors(length) {
      return d3.scaleLinear()
        .domain([0, length])
        .range([this.color1, this.color2]);
    },
    generateMapColors() {
      const mapDataValues = Object.values(this.mapData);
      const maxVal = Math.max(...mapDataValues);
      const colors = this.generateColors(maxVal);
      const mapData = {};
      const fills = {
        defaultFill: '#e4e4e4',
      };
      for (const key in this.mapData) {
        const val = this.mapData[key];
        fills[key] = colors(val);
        mapData[key] = {
          fillKey: key,
          value: val,
        };
      }
      return {
        mapData,
        fills,
      };
    },
    initVectorMap() {
      const { fills, mapData } = this.generateMapColors();
      const worldMap = new DataMap({
        scope: 'world',
        element: document.getElementById('worldMap'),
        fills,
        data: mapData,
        responsive: true,
        geographyConfig: {
          borderWidth: 0.5,
          borderOpacity: 0.8,
          highlightFillColor: this.highlightFillColor,
          highlightBorderColor: this.highlightBorderColor,
          highlightBorderWidth: 0.5,
          highlightBorderOpacity: 0.8,
        },
      });
      const resizeFunc = worldMap.resize.bind(worldMap);
      window.addEventListener('resize', () => {
        throttle(resizeFunc, 40);
      }, false);
    },
  },
};
</script>
<style>
</style>
