<template>
  <svg ref="svg" :width="width" :height="width / 2" class="ba bw3 b--purple">
    <!-- use d3 scales and vue refs to create a responsive horizontal bar chart -->
    <!-- add a group for each bar -->
    <g
      v-for="(oblast, i) in oblastData"
      :key="i"
      :transform="`translate(0, ${xScale(i)})`"
      class="bar-group"
    >
      <!-- add a rect for the bar -->
      <rect
        :width="yScale(oblast[config.dataKey])"
        :height="yScale.bandwidth()"
        fill="black"
        class="bar"
      />
      <!-- add a text for the label -->
      <text
        :x="yScale(oblast[config.dataKey]) + 5"
        :y="yScale.bandwidth() / 2"
        :dy="0.32 + 'em'"
        class="bar-label"
      >
        {{ oblast.oblast }}
      </text>
      <!-- add a text for the value -->
      <text
        :x="yScale(oblast[config.dataKey]) + 5"
        :y="yScale.bandwidth() / 2"
        :dy="1.32 + 'em'"
        class="bar-value"
      >
        {{ oblast[config.dataKey] }}
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

// compute data from oblastData
const data = computed(() => {
  props.oblastData.map((d) => ({
    label: d.oblast,
    value: d[props.config.dataKey],
  }));
});

const dataKey = "harvestedArea";

// find the extent of the data from the dataKey
const extent = d3.extent(props.oblastData, (d) => d[dataKey]);

// create a categorical scale for the x axis, so each bar is evenly spaces
const xScale = d3
  .scaleBand()
  .range([0, props.width / 2])
  .padding(0.1);

// create a scale for the y axis
const yScale = d3
  .scaleBand()
  .range([0, props.width / 2])
  .padding(0.1);

// set the domain of the y scale when the data changes props.oblastData changes
watch(
  () => props.oblastData,
  () => {
    yScale.domain(props.oblastData.map((d) => d.oblast));
    // set the xScale domain to the oblast names
  }
);

// create a color scale
const colorScale = d3
  .scaleSequential()
  .domain(extent)
  .interpolator(d3.interpolateBlues);
</script>
