<template>
  <svg id="map" ref="mapSvg" class="w-100 vh-100">
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

    <g v-if="oblastData">
      <text
      v-if="featureCollection"
      v-for="oblast in featureCollection.features"
      :x="path.centroid(oblast)[0]"
      :y="path.centroid(oblast)[1]"
      fill="red"
      font-size="12"
      :class="{
        'focused-shape': oblast.focused,
        'selected-shape': oblast.selected,
      }"
      @mouseover="oblast.focused = true"
      @mouseout="oblast.focused = false"
      @click="oblast.selected = !oblast.selected"
      >
        {{oblast.properties.name_1}}
      </text>      
    </g>
  </svg>
</template>
<script setup>
import * as d3 from "d3";
import * as topojson from "topojson";
import { normalizeOblastName, formatAndScaleValue } from "@/helpers.js";

// set up our props
const props = defineProps({
  oblastScales: {
    type: Object,
    required: true,
  },
  oblastData: {
    type: Array,
    required: true,
  },
  grainType: {
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

// watch for when oblastScales changes and console.log it
watch(
  () => props.oblastScales,
  (oblastScales) => {
    console.log("🌎 oblastScales", oblastScales);
  }
);

// This is a template ref, so mapSvg.value is the actual SVG element
// because we set ref="mapSvg" on the SVG element
const mapSvg = ref(null);

// Make a D3 color scale for the values
const valueColorScale = ref(
  d3.scaleLinear().domain([0, 1000]).range(["white", "red"])
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

const dataOblastNames = computed(() => {
  if (props.oblastData) {
    return props.oblastData.reduce((acc, oblast) => {
      acc[oblast.oblastNameNormalized] = oblast;
      return acc;
    }, {});
  }
});

const scaledDataOblastNames = computed(() => {
  if (props.oblastData) {
    // make a map so that we can look up the oblast data by oblast name
    const oblastDataMap = new Map();
    // now we can loop through the data and add it to the map
    const oblastDataKeys = props.oblastData.map((oblast) => {
      const oblastName = oblast.oblastNameNormalized;
      oblastDataMap.set(oblastName, oblast);
      return oblastName;
    });
    // make a set so that we can check if the oblast name is in the data
    const oblastDataKeysSet = new Set(oblastDataKeys);
    
    // now reduce the feature collection to an object with the oblast name as the key
    return featureCollection.value.features.reduce((acc, oblast) => {
      // normalize the oblast name
      const oblastName = normalizeOblastName(oblast.properties.name_1);
      // check if the oblast name is in the data
      if (oblastDataKeysSet.has(oblastName)) {
        // if it is in the data, get the oblast data from the map
        const oblastData = oblastDataMap.get(oblastName);
        acc[oblastName] = {
          ...oblastData, // add the oblast data
          [props.valueKey]: formatAndScaleValue(
            oblastData[props.valueKey],
            oblastName,
            props.oblastScales
          ), // add the scaled value
        };
      }
      return acc;
    }, {});
  }
});

// a function to receive an oblast shape and fetch the proper data to determine and return fill color
function findOblastFillColor(oblastShape) {
  if(!dataOblastNames.value) return 'purple'
  const shapeName1 = normalizeOblastName(oblastShape.properties.name_1);
  const oblastNameKeys = Object.keys(dataOblastNames.value);
  const oblastNameSet = new Set(oblastNameKeys);

  if (oblastNameKeys.length > 0 && !oblastNameSet.has(shapeName1)) {
    // console.log('MISMATCH', shapeName1, oblastNameKeys);
  }

  const oblastData = scaledDataOblastNames.value[shapeName1];
  // return oblastData ? 'green' : 'red' // use this to debug which oblasts are receiving data

  const shapeValue = oblastData ? oblastData[props.valueKey] : 0;
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
