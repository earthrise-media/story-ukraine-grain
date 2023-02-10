<template>
  <svg ref="svg" :width="width" :height="width / 2" class="ba bw3 b--purple">
    <!-- use d3 scales and vue refs to create a responsive bar chart -->
    <g
      v-for="(d, i) in oblastData"
      :key="i"
      :transform="`translate(0, ${yScale(d.oblast)})`"
    >
      <rect
        :width="xScale(d[dataKey])"
        :height="yScale.bandwidth()"
        :fill="colorScale(d[dataKey])"
      />
      <text
        :x="xScale(d[dataKey]) + 5"
        :y="yScale.bandwidth() / 2"
        :dy="0.32 + 'em'"
        :fill="colorScale(d[dataKey]) > 0.5 ? 'white' : 'black'"
      >
        {{ d[dataKey] }}
      </text>
    </g>

    <!-- add an x axis and ticks with v-for -->
    <g
      :transform="`translate(0, ${props.width / 2})`"
      class="axis axis--x"
      ref="xAxis"
    >
      <line :x2="props.width" />
      <g
        v-for="(tick, i) in xScale.ticks()"
        :key="i"
        :transform="`translate(${xScale(tick)}, 0)`"
      >
        <line :y2="6" />
        <text :y="9" :dy="0.71 + 'em'">{{ tick }}</text>
      </g>
    </g>

    <!-- add a y axis and ticks with v-for -->
    <g class="axis axis--y" ref="yAxis">
      <line :x2="props.width" />
      <g
        v-for="(tick, i) in yScale.domain()"
        :key="i"
        :transform="`translate(0, ${yScale(tick)})`"
      >
        <line :x2="-6" />
        <text :x="-9" :dy="0.32 + 'em'" :text-anchor="'end'">{{ tick }}</text>
      </g>

      <!-- add a title -->
      <text
        :x="props.width / 2"
        :y="props.width / 2 + 30"
        :dy="0.32 + 'em'"
        :text-anchor="'middle'"
      >
        {{ config.title }}
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

const dataKey = "harvestedArea";

// find the extent of the data from the dataKey
const extent = d3.extent(props.oblastData, (d) => d[dataKey]);

// create a scale for the x axis
const xScale = d3.scaleLinear().domain(extent).range([0, props.width]);

// create a scale for the y axis
const yScale = d3
  .scaleBand()
  .domain(props.oblastData.map((d) => d.oblast))
  .range([0, props.width / 2])
  .padding(0.1);

// create a color scale
const colorScale = d3
  .scaleSequential()
  .domain(extent)
  .interpolator(d3.interpolateBlues);
</script>
