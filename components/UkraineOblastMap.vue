<template>
  <svg id="map" ref="mapSvg" class=""></svg>
</template>
<script setup>
import * as d3 from "d3";
import * as topojson from "topojson";
// import * as turf from "@turf/turf";
import slugify from "slugify";
import { formatAndScaleValue, formatValue } from "@/helpers.js";

// set up our props
const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
  scenario: {
    type: Object,
    required: true,
  },
  oblastData: {
    type: Array,
    required: true,
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

// Set our refs- these are all automatically reactive
// The only thing we need to do is get the value of the ref with .value
const activeGrainType = ref(null);
const grainTypes = ref([]);

// We will fill these later with d3 groupings of our data
const parsedDataByName = ref(null);
const dataByGrainType = ref(null);

// This is a template ref, so mapSvg.value is the actual SVG element
// because we set ref="mapSvg" on the SVG element
const mapSvg = ref(null);

// This is a reactive ref with a default value
// For now set to oblast name since sliders will change sorting rank of values
const sortKey = ref("oblastNameUkrainian");
// const valueKey = props.config.valueKey; //ref("harvestedArea");

// Make a D3 color scale for the values
const valueColorScale = ref(null);

valueColorScale.value = d3
  .scaleLinear()
  .domain([0, 1000])
  .range(["white", "red"]);

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

// This function applies our formats and scales to oblast data
function createScaledOblastData(oblast) {
  return {
    ...oblast,
    harvestedAreaOriginal: formatValue(oblast.harvestedArea),
    grainYieldOriginal: formatValue(oblast.grainYield),
    volumeOriginal: formatValue(oblast.volume),
    harvestedArea: formatAndScaleValue(
      oblast.harvestedArea,
      oblast.oblastNameUkrainian
    ),
    grainYield: formatAndScaleValue(
      oblast.grainYield,
      oblast.oblastNameUkrainian
    ),
    volume: formatAndScaleValue(oblast.volume, oblast.oblastNameUkrainian),
  };
}

// make a computed that gives the original data by active grain type
// const originalDataByGrainType = computed(() => {
//   if (dataByGrainType.value) {
//     return dataByGrainType.value.get(activeGrainType.value);
//   }
// });

// A computed that applies the forecasts to the data and returns a forecasted version
const forecastedDataByGrainType = computed(() => {
  if (dataByGrainType.value) {
    const forecastedData = new Map();
    for (const [grainType, oblasts] of dataByGrainType.value) {
      forecastedData.set(
        grainType,
        oblasts.map((oblast) => {
          return createScaledOblastData(oblast);
        })
      );
    }
    return forecastedData;
  }
});

// Make a computed that takes forecastedDataByGrainType and sorts it by our selected sortKey
const sortedDataByGrainType = computed(() => {
  if (forecastedDataByGrainType.value && activeGrainType.value) {
    return forecastedDataByGrainType.value
      .get(activeGrainType.value)
      .sort((a, b) => b[sortKey.value] - a[sortKey.value]);
  }
});

// Normalize our oblast name using slugify
function normalizeOblastName(key) {
  if (!key) return key;
  return slugify(key, {
    strict: true,
    lower: true,
  });
}

// Reduce oblast data by normalized name
function reduceOblastDataByName(oblasts) {
  return oblasts.reduce((acc, oblast) => {
    acc[normalizeOblastName(oblast.oblastNameEnglish)] = oblast;
    return acc;
  }, {});
}

// update the map when the display data changes
watch(sortedDataByGrainType, redrawMap);

// When the activeGrainType changes, we need to update the map
watch(activeGrainType, () => {
  // get the data for the new grain type
  const newData = sortedDataByGrainType.value;

  // create an object where the keys are the oblast names and the values are the data
  parsedDataByName.value = reduceOblastDataByName(newData);

  // Get the min and max of the data using d3.extent
  const extent = d3.extent(newData, (d) => d[props.valueKey + "Original"]);
  // Set the domain of the color scale to the extent
  valueColorScale.value.domain(extent);

  redrawMap();
});

// A function to draw the map SVG
function initMap(geographicData) {
  // Merge geometries so we end up with Oblast-level shapes.
  const featureCollection = aggregate(
    geographicData,
    geographicData.objects["stanford-pp624tm0074-geojson"],
    "name_1"
  );

  // get the width and height of the SVG
  const width = mapSvg.value.clientWidth;
  const height = mapSvg.value.clientHeight;

  // create a projection
  const projection = d3
    .geoMercator()
    .fitSize([width, height], featureCollection);

  // create a path generator
  const path = d3.geoPath().projection(projection);

  // clear SVG
  // d3.select(mapSvg.value).selectAll('*').remove()

  // create a geojson layer
  const geojsonLayer = d3
    .select(mapSvg.value)
    .selectAll("path")
    .data(featureCollection.features)
    .join("path")
    .attr("d", path)
    .attr("fill", (d, i) => {
      findOblastFillColor(d);
    })
    .attr("stroke", "#CCC")
    .attr("stroke-width", "0.2")
    .on('mouseover', (evt, d) => {
      console.log('🔖', d)
      d3.select(evt.target).classed('focused-shape', true)
    })
    .on('mouseout', (evt, d) => {
      d3.select(evt.target).classed('focused-shape', false)
    })
  
}

// a function to receive an oblast shape and fetch the proper data to determine and return fill color
function findOblastFillColor(d) {
  const shapeName1 = normalizeOblastName(d.properties.name_1);
  const oblastData = parsedDataByName.value[shapeName1];
  const shapeValue = oblastData ? oblastData[props.valueKey] : 0;
  if (shapeValue) return valueColorScale.value(+shapeValue);
  else return "#FFF";
}

function updateMap() {
  // get the map svg
  const map = d3.select(mapSvg.value);

  // select all of the paths
  const paths = map.selectAll("path");

  // update the paths
  paths
    .transition()
    .duration(1000)
    .attr("fill", (d, i) => {
      return findOblastFillColor(d);
    });
}

// onMounted(async () => {
// instead of running on mounted, run every time oblastData changes
watch(
  () => props.oblastData,
  async (oblastData) => {
    if (!oblastData) return;
    // group the new data by grain type
    dataByGrainType.value = d3.group(props.oblastData, (d) => d.metadata[0][0]);

    // remove groupings where the key includes the word "dynamics"
    dataByGrainType.value.forEach((value, key) => {
      if (key.includes("dynamics")) {
        dataByGrainType.value.delete(key);
      }
    });

    // Set the active grain type to the first grain type
    activeGrainType.value = Array.from(dataByGrainType.value.keys())[0];

    // Get a list of the grain types from the keys of the group
    // const grainTypes = Array.from(dataByGrainType.keys())
    grainTypes.value = Array.from(dataByGrainType.value.keys());

    // get the oblast shapefile data
    d3.json("/data/stanford-ukraine-geojson.json").then((geographicData) => {
      parsedDataByName.value = reduceOblastDataByName(props.oblastData);
      initMap(geographicData);
    });
  }
);
function redrawMap() {
  // redraw the map
  d3.json("/data/stanford-ukraine-geojson.json").then((geographicData) => {
    updateMap(geographicData);
  });
}
</script>
<style>
#map {
  /* width: 100%; */
  /* height: 50vh; */
  width: 50vw;
}

path.focused-shape {
  stroke-width: 4 !important;
  stroke: black !important;
  fill: yellow !important;
}
</style>
