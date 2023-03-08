<template>
  <svg class="w-100" :height="props.height" :width="props.width">
    <!-- draw a sankey diagram using sankeyPaths and sankeyNodes -->
    <g class="sankey-paths" v-if="sankeyPaths">
      <path
        v-for="path in sankeyPaths"
        :d="path.d"
        :fill="path.fill"
        :stroke="path.stroke"
        :stroke-width="path.strokeWidth"
        style="opacity: 0"
      />
    </g>

    <g class="sankey-nodes" v-if="sankeyNodes">
      <g
        v-for="node in sankeyNodes"
        style="opacity: 0"
        :transform="`translate(${node.x0}, ${node.y0})`"
      >
        <rect
          :width="node.x1 - node.x0"
          :height="node.y1 - node.y0"
          :fill="node.fill"
          stroke="white"
          stroke-width="0.1"
        />
        <!-- put the node name in the vertical middle of the node -->
        <text
          :x="node.x1 - node.x0 - nodeWidth"
          :y="node.y1 / 2 - node.y0 / 2"
          :dy="0.32 + 'em'"
          text-anchor="end"
          :fill="/*node.fill*/ 'black'"
          :font-size="Math.max(Math.sqrt(node.value) * 0.0009, 7)"
          transform="translate(-10, 0)"
          :data-json="node"
        >
          {{ node.name }}
        </text>
      </g>

      <!-- add a label for ukraine on the left side of the screen, rotated 90 degrees -->
      <text
        x="0"
        y="0"
        dy="0.32em"
        text-anchor="start"
        fill="white"
        font-size="14"
        transform="translate(15, 15) rotate(90)"
      >
        Ukraine
      </text>
    </g>
  </svg>
</template>
<script setup>
// import d3 and d3-sankey
import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";
import anime from "animejs/lib/anime.es.js";

const props = defineProps({
  importExportData: {
    type: Array,
    required: true,
  },
  height: {
    type: Number,
    required: true,
    default: 900,
  },
  width: {
    type: Number,
    required: true,
    default: 900,
  },
  stepIndex: {
    type: Number,
    required: true,
  },
});

// watch the stepIndex prop and if it changes to 2, animate in the sankey
watch(
  () => props.stepIndex,
  (stepIndex) => {
    if (stepIndex === 11) {
      animateSankey();
    }
  }
);

const staggerDelay = 55;
const animateInDuration = 720;

// a function to animate in sankeyPaths and sankeyNodes one by one with anime.js
const animateSankey = () => {
  // animate in sankeyPaths
  anime({
    targets: ".sankey-paths path",
    opacity: [0, 1],
    duration: animateInDuration * 0.75,
    easing: "easeInOutQuad",
  });

  anime({
    targets: ".sankey-paths path",
    strokeDashoffset: [anime.setDashoffset, 0],
    easing: "easeInOutQuad",
    duration: animateInDuration,
    delay: (el, i) => animateInDuration * 0.5 + i * staggerDelay,
    loop: false,
  });

  // animate in sankeyNodes
  anime({
    targets: ".sankey-nodes g",
    opacity: [0, 1],
    easing: "easeInOutQuad",
    duration: animateInDuration,
    delay: (el, i) => i * staggerDelay,
    loop: false,
  });
};

// make height a computed 0.6 of props.width
// const height = computed(() => props.width * 0.6);
// const height = 1100;
/*
each row of importExportData looks like this:
{
    "countryName": "Bulgaria",
    "countryNumber": "100",
    "worldTradeValue": "126065539",
    "ukrTradeValue": "1785108",
    "percent": "0.014160158391898043"
}

this represents a year of grain traide from Ukraine to Bulgaria

we need to create a source/target version of this data

the source will always be ukraine
the target will always be the countryName
the value will always be the ukrTradeValue
*/

// now we will make a computed sankeyPaths and sankeyNodes that will run importExportData through the sankey and return sankeyPaths with values we can draw in SVG

const nodeWidth = 50;

// First we set up our sankey
// const sankey = d3Sankey
//   .sankey()
//   .nodeId((d) => d.name)
//   // .nodeAlign(d3Sankey.sankeyJustify)
//   // justify to top
//   .nodeAlign(d3Sankey.sankeyLeft)
//   .nodeWidth(nodeWidth)
//   // use .linkSort to sort by value
//   .linkSort((a, b) => b.value - a.value)
//   .nodePadding(2)
//   .extent([
//     [1, 1],
//     [props.width - 1, props.height - 6],
//   ]);

// refactor to make links align to the top of nodes
const sankey = d3Sankey
  .sankey()
  .nodeId((d) => d.name)
  .nodeAlign(d3Sankey.sankeyRight)
  .nodeWidth(nodeWidth)
  .linkSort((a, b) => b.value - a.value)
  .nodePadding(props.width * 0.01)
  .extent([
    [1, 1],
    [props.width - 1, props.height - 6],
  ]);

// then we feed the sankey our nodes and links and get back a sankey diagram
const sankeyDiagram = computed(() => {
  // sort the data by ukrTradeValue
  // and filter to the top 10
  const filteredData = props.importExportData
    .sort((a, b) => b.ukrTradeValue - a.ukrTradeValue)
    .slice(0, 30);

  return sankey({
    nodes: [
      { name: "Ukraine" },
      ...filteredData.map((d) => ({ name: d.countryName })),
    ],
    links: filteredData.map((d) => ({
      source: "Ukraine",
      target: d.countryName,
      value: +d.ukrTradeValue,
    })),
  });
});

// create a categorical scale for countries
// const colorScale = d3.scaleOrdinal(d3.schemeSet2);
// use a way cooler built in d3 scheme
// const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
// use d3 turbo instead
// const colorScale = d3.scaleOrdinal(d3.schemeTurbo);

// make a custom ordinal color scale
const colorScale = d3.scaleOrdinal([
  // 10 different dark grays
  // "#1f1f1f",
  // "#2d2d2d",
  // "#3b3b3b",
  // "#494949",
  // "#575757",
  // "#656565",
  // "#737373",
  // "#818181",
  // "#8f8f8f",
  // "#9d9d9d",  
  // 10 different light grays
  "#ababab",
  "#b9b9b9",
  "#c7c7c7",
  "#d5d5d5",
  "#e3e3e3",
  "#f1f1f1",

]);


// then we can use the sankey diagram to make sankeyPaths and sankeyNodes
// const sankeyPaths = computed(() => sankeyDiagram.value.links.map(link => ({
//   d: d3Sankey.sankeyLinkHorizontal()(link),
//   fill: 'none',
//   // stroke: '#000',
//   stroke: colorScale(link.target.name),
// })));

function calculateStrokeWidth(value) {
  // use value to calculate strokeWidth
  //return Math.max(Math.sqrt(value) * 0.001, 0.5);
  // instead we will use a custom d3 linear scale
  const scale = d3.scaleLinear()
    .domain([0, 1000000000])
    .range([0.5, nodeWidth]);
  return scale(value);

  // make the strokeWidth match the node size of the sankey
}

// sankey paths but sorted by value
const sankeyPaths = computed(() =>
  sankeyDiagram.value.links
    .sort((a, b) => b.value - a.value)
    .map((link) => ({
      d: d3Sankey.sankeyLinkHorizontal()(link),
      fill: "none",
      // stroke: '#000',
      // use value to calculate strokeWidth
      // strokeWidth: Math.max(Math.sqrt(link.value) * 0.001, 0.5),
      strokeWidth: calculateStrokeWidth(link.value),
      stroke: colorScale(link.target.name),
    }))
);

// sankey nodes but sorted by value
const sankeyNodes = computed(() =>
  sankeyDiagram.value.nodes
    .sort((a, b) => b.value - a.value)
    .map((node) => ({
      ...node,
      // fill: node.name === 'Ukraine' ? '#000' : '#fff',
      fill: colorScale(node.name),
      stroke: "#000",
      textFill: node.name === "Ukraine" ? "#fff" : "#000",
    }))
);
</script>
