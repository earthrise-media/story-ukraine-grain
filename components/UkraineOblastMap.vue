<template>
  <svg id="map" ref="mapSvg" class="" :viewBox="`0 0 ${width} ${height}`" style="opacity: 0.88">
    <path
      v-if="featureCollection"
      v-for="oblast in featureCollection.features"
      :d="path(oblast)"
      :key="oblast.properties.name_1"
      :fill="findOblastFillColor(oblast)"
      stroke="#CCC"
      stroke-width="0.2"
      :class="{
        'focused-shape': oblast.focused,
        'selected-shape': oblast.selected,
      }"
      @mouseover="handleOblastHover(oblast)"
      @mouseout="handleOblastHover(null)"
    />

    <g v-if="activeDataByOblast">
      <text
        v-if="featureCollection"
        v-for="oblast in featureCollection.features"
        :x="path.centroid(oblast)[0]"
        :y="path.centroid(oblast)[1]"
        :fill="findOblastTextContrastColor(oblast)"
        font-size="12"
        text-anchor="middle"
        :class="{
          'focused-shape': oblast.focused,
          'selected-shape': oblast.selected,
        }"
        @mouseover="handleOblastHover(oblast)"
        @mouseout="handleOblastHover(null)"
      >
        {{ oblast.properties.name_1 }}
      </text>
      <!-- <text
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
        @mouseover="handleOblastHover(oblast)"
        @mouseout="handleOblastHover(null)"
      >
        {{ labelNumberFormat(findOblastValue(oblast) * 100) }}
      </text> -->
    </g>
  </svg>
</template>
<script setup>
import * as d3 from "d3";
import * as topojson from "topojson";
import { normalizeOblastName } from "@/helpers.js";

const emits = ["setFocusedOblast"];

function handleOblastHover(oblast) {
  // console.log("map oblast hover", oblast);
  // get the normalized oblast name from the oblast object
  const oblastName = normalizeOblastName(oblast.properties.name_1);

  // emit the oblast name to the parent component
  emits("setFocusedOblast", oblastName);
}

// watch focusedOblastName and if it changes, update the focused oblast so it has a .focused value of true
watch(
  () => props.focusedOblastName,
  (focusedOblastName) => {
    // console.log('focused oblast name changed to', focusedOblastName);
    if (featureCollection.value) {
      const newFeatureCollection = {
        ...featureCollection.value,
        features: featureCollection.value.features.map((oblast) => {
          if (
            normalizeOblastName(oblast.properties.name_1) === focusedOblastName
          ) {
            return {
              ...oblast,
              focused: true,
            };
          } else {
            return {
              ...oblast,
              focused: false,
            };
          }
        }),
      };

      // sort the newFeatureCollection so focused oblasts are on top
      newFeatureCollection.features.sort((a, b) => {
        if (a.focused) {
          return 1;
        } else if (b.focused) {
          return -1;
        } else {
          return 0;
        }
      });

      featureCollection.value = newFeatureCollection;
    }
  }
);

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
  focusedOblastName: {
    type: String,
    required: false,
  },
});

// This is a template ref, so mapSvg.value is the actual SVG element
// because we set ref="mapSvg" on the SVG element
const mapSvg = ref(null);

const labelNumberFormat = d3.format(",.0f");

// Make a D3 color scale for the values
// const valueColorScale = ref(
//   d3.scaleLinear().domain([0, 500]).range(["white", "#FFC500"])
// );

// use d3 interpolateHslLong to interpolate between two colors
const valueColorScale = ref(
  d3
    .scaleLinear()
    // .domain([0, 250, 600])
    // .range(["white", "#FFC500", "#E49344"])
    // .range(["white", "#FFC500", "#418CC3"])
    //     #ffeda0
    // #feb24c
    // #f03b20
    // make a new range with these colors
    // .range(["#ffeda0", "#feb24c", "#f03b20"])
    //   #f7fcb9
    // #addd8e
    // #31a354
    // .range(["#f7fcb9", "#addd8e", "#31a354"])
    // #146E37 #45A658 #98D37F #E0F1A2 #FFFFE0
    // .range(["#146E37", "#45A658", "#98D37F", "#E0F1A2", "#FFFFE0"])
    // invert
    .range(["#FFFFE0", "#E0F1A2", "#98D37F", "#45A658", "#146E37"])
    .domain([50, 100, 200, 300, 800])
    // #FEA141 #FEA141
    // .range(["#FFFFE0", "#FFC500",  "#FEA141"])
    .interpolate(d3.interpolateHslLong)
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
  d3.json("./data/stanford-ukraine-geojson.json").then((geoData) => {
    geographicData.value = geoData;
  });
});

// Create a reactive ref to hold our feature collection
const featureCollection = ref(null);

// Create a reactive ref to hold our width and height
const width = ref(1267);
const height = ref(900);

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

function findOblastTextContrastColor (oblastShape) {
  const shapeValue = findOblastValue(oblastShape);
  if (shapeValue) {
    const fillColor = valueColorScale.value(+shapeValue);
    const color = d3.hsl(fillColor);
    const brightness = color.l;
    return brightness > 0.5 ? "#000" : "#FFF";
  } else {
    return "transparent";
  }
}
</script>
<style>
path {
  transition: all 1200ms cubic-bezier(0.45, 0, 0.55, 1);
}

path.focused-shape {
  stroke-width: 2.25 !important;
  stroke: black !important;
  /* fill: yellow !important; */
  /* transition: all 0.12s cubic-bezier(0.45, 0, 0.55, 1); */
  /* transition-delay: 50ms; */
}
</style>
