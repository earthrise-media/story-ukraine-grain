<template>
  <svg id="map" ref="mapSvg" class="" :viewBox="`0 0 ${width} ${height}`">
    <path
      v-if="featureCollection"
      v-for="oblast in featureCollection.features"
      :d="path(oblast)"
      :fill="findOblastFillColor(oblast)"
      stroke="#CCC"
      stroke-width="0.2"
      :class="{
        'focused-shape': oblast.focused,
        'selected-shape': oblast.selected,
      }"
      @mouseover="oblast.focused = true"
      @mouseout="oblast.focused = false"
      @click="oblast.selected = !oblast.selected"
    />

    <g v-if="activeDataByOblast">
      <text
        v-if="featureCollection"
        v-for="oblast in featureCollection.features"
        :x="path.centroid(oblast)[0]"
        :y="path.centroid(oblast)[1]"
        fill="black"
        font-size="12"
        text-anchor="middle"
        :class="{
          'focused-shape': oblast.focused,
          'selected-shape': oblast.selected,
        }"
        @mouseover="oblast.focused = true"
        @mouseout="oblast.focused = false"
        @click="oblast.selected = !oblast.selected"
      >
        {{ oblast.properties.name_1 }}
      </text>
      <text
        v-if="featureCollection"
        v-for="oblast in featureCollection.features"
        :x="path.centroid(oblast)[0]"
        :y="path.centroid(oblast)[1] + 14"
        fill="black"
        font-size="12"
        text-anchor="middle"
        :class="{
          'focused-shape': oblast.focused,
          'selected-shape': oblast.selected,
        }"
        @mouseover="oblast.focused = true"
        @mouseout="oblast.focused = false"
        @click="oblast.selected = !oblast.selected"
      >
        {{ findOblastValue(oblast) }}
        <!-- {{activeGrainType}} -->
      </text>
    </g>
  </svg>
</template>
<script setup>
import * as d3 from "d3";
import * as topojson from "topojson";
import { normalizeOblastName } from "@/helpers.js";

// set up our props
const props = defineProps({
  activeDataByOblast: {
    type: Object,
    required: true,
  },
  activeGrainType: {
    type: String,
    required: false,
  },
  width: {
    type: Number,
    required: true,
  },
  valueKey: {
    type: String,
    required: true,
  },
});

// This is a template ref, so mapSvg.value is the actual SVG element
// because we set ref="mapSvg" on the SVG element
const mapSvg = ref(null);

// Make a D3 color scale for the values
const valueColorScale = ref(
  d3.scaleLinear().domain([0, 500]).range(["white", "#FFC500"])
);
// Merges geometries by shared ID.
// Inspired by https://github.com/neocarto/geotoolbox/blob/cee58b6c45e3faa59ef680d8e3162c430077e80c/src/gis/aggregate.js
const aggregate = (topology, objects, idProperty) => {
  const reduce = (geometries) => topojson.merge(topology, geometries);
  const rolledUp = d3.flatRollup(
    objects.geometries,
    reduce,
    (d) => d.properties[idProperty]
  );
  return {
    type: "FeatureCollection",
    features: rolledUp.map(([id, geometry]) => ({
      type: "Feature",
      properties: { [idProperty]: id },
      geometry,
    })),
  };
};

// Create a D3 projection
const projection = ref(d3.geoMercator());

// Create a D3 path generator
const path = computed(() => d3.geoPath().projection(projection.value));

// create a reactive ref to hold our raw geographic data
const geographicData = ref(null);

// when the page is mounted fill it with the geographic data json
onMounted(async () => {
  d3.json("/data/stanford-ukraine-geojson.json").then((geoData) => {
    geographicData.value = geoData;
  });
});

// Create a reactive ref to hold our feature collection
const featureCollection = ref(null);

// Create a reactive ref to hold our width and height
const width = ref(900);
const height = ref(600);

// watch geographic data and when it changes, set featureCollection to the aggregation of the data
// and then fit the projection to the featureCollection
watch(geographicData, (newData) => {
  if (newData) {
    // Merge geometries so we end up with Oblast-level shapes.
    featureCollection.value = aggregate(
      geographicData.value,
      geographicData.value.objects["stanford-pp624tm0074-geojson"],
      "name_1"
    );

    projection.value.fitSize(
      [width.value, height.value],
      featureCollection.value
    );
  }
});

function findOblastValue(oblast) {
  const oblastName = normalizeOblastName(oblast.properties.name_1);
  const oblastData = props.activeDataByOblast[oblastName];
  return oblastData ? oblastData[props.valueKey] : 0;
}

// refactor to use findOblastValue
function findOblastFillColor(oblastShape) {
  const shapeValue = findOblastValue(oblastShape);
  if (shapeValue) return valueColorScale.value(+shapeValue);
  else return "#FFF";
}
</script>
<style>
path.focused-shape {
  stroke-width: 4 !important;
  stroke: black !important;
  fill: yellow !important;
}
</style>
