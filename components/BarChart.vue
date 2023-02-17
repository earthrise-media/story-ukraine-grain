<template>
  <!-- {{props.oblastData}} -->
  <!-- {{data}} -->

  <svg ref="svg" :width="width" :height="width / 2" class="ba bw3 b--purple">
    <!-- use d3 scales and vue refs to create a responsive horizontal bar chart 
      the xScale will determine width of the bars and x position of the bars
      the yScale will determine the height of the bars and the y position of the bars
    -->
    <!-- add a group for each bar -->
    <g
      v-for="(oblast, i) in data"
      :key="oblast.label"
    >
      <!-- add a rect for the bar -->
      <rect
        :width="xScale.bandwidth()"
        :height="yScale(oblast.value)"
        :fill="colorScale(oblast.value)"
        :x="xScale(oblast.label)"
        :y="height - yScale(oblast.value)"
      />

      <!-- add a text element for the label -->
      <text
        :x="xScale(oblast.label) + xScale.bandwidth() / 2"
        :y="yScale(oblast.value) + 15"
        text-anchor="middle"
        fill="white"
      >
        {{oblast.label}}
      </text>
    </g>
  </svg>
</template>
<script setup>
import * as d3 from "d3";
const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
  scenario: {
    type: Object,
    required: false,
  },
  oblastData: {
    type: Array,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
});

// we are going to use d3 and SVG to create a simple responsive bar chart
// the chart will be created in the mounted hook
// and it will show data from oblastData
// the chart will be responsive to the width prop

// make height a computed from props.width
const height = computed(() => props.width / 2);

// compute data from oblastData
const data = computed(() => {
  return props.oblastData.map((d) => ({
    label: d.oblastNameNormalized,
    value: d[props.config.yProperty],
  }));
});

const dataKey = "harvestedArea";

// find the extent of the data from the dataKey
const extent = d3.extent(props.oblastData, (d) => d[dataKey]);

// create a categorical scale for the x axis, so each bar is evenly spaced on the x axis
const xScale = d3
  .scaleBand()
  .range([0, props.width])

const yScale = d3.scaleLinear().range([height, 0]);

// set the domain of the y scale when the data changes props.oblastData changes
watch(
  () => props.oblastData,
  () => {
    yScale.domain(data.map((d) => d.oblast));
    // set the xScale domain to the oblast names
    xScale.domain(props.oblastData.map((d) => d.oblast));
  }
);

// create a color scale
const colorScale = d3
  .scaleSequential()
  .domain(extent)
  .interpolator(d3.interpolateBlues);
</script>
