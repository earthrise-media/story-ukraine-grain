<template>
  <svg id="map" ref="mapSvg" class="w-100 vh-100"></svg>
</template>
<script setup>
import * as d3 from "d3";
import * as topojson from "topojson";
// import * as turf from "@turf/turf";
import slugify from "slugify";
import { formatAndScaleValue, formatValue } from "@/helpers.js";

// set up our props
const props = defineProps({
  scenario: {
    type: Object,
    required: true,
  },
  oblastData: {
    type: Array,
    required: true,
  },
  grainType: {
    type: String,
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
const geographicData = ref(null); // We will fill this with our GeoJSON data

// We will fill these later with d3 groupings of our data
const oblastsByEnglish= ref(new Map());

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




/*
--------------------------------------------------------------
Map rendering
--------------------------------------------------------------
*/

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
    .attr("fill", "#white")
    .attr("stroke", "#CCC")
    .attr("stroke-width", "0.2")
    .on("mouseover", (evt, d) => {
      // console.log("🔖", d);
      d3.select(evt.target).classed("focused-shape", true);
    })
    .on("mouseout", (evt, d) => {
      d3.select(evt.target).classed("focused-shape", false);
    });
}

// a function to receive an oblast shape and fetch the proper data to determine and return fill color
function findOblastFillColor(d) {
  const shapeName1 = normalizeOblastName(d.properties.name_1);
  const oblastData = oblastsByEnglish.value.get(shapeName1);
  const shapeValue = oblastData ? oblastData[props.valueKey] : 0;
  // console.log("oblast", oblastData, shapeValue)
  if (shapeValue) return valueColorScale.value(+shapeValue);
  else return "#FFF";
}

function updateMap() {
  // first we make sure our color scale is updated
  const extent = d3.extent(oblastsByEnglish.value, (d) => +d[1][props.valueKey + "Original"]);
  // Set the domain of the color scale to the extent
  valueColorScale.value.domain(extent);

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

onMounted(async () => {
  d3.json("/data/stanford-ukraine-geojson.json").then((geoData) => {
    geographicData.value = geoData
    // oblastData data is our raw Oblast-level grain data
    // grainType is our currently active grain type
    // scenario is the currently active scenario
    initMap(geographicData.value);
    processOblastData(props.oblastData, props.grainType, props.scenario)
    updateMap()
  })
})

/*
--------------------------------------------------------------
Data processing
--------------------------------------------------------------
*/
// This function applies our formats and scales to oblast data
function createScaledOblastData(oblast, scenario) {
  return {
    ...oblast,
    harvestedAreaOriginal: formatValue(oblast.harvestedArea),
    grainYieldOriginal: formatValue(oblast.grainYield),
    volumeOriginal: formatValue(oblast.volume),
    harvestedArea: formatAndScaleValue(
      oblast.harvestedArea,
      oblast.oblastNameUkrainian,
      scenario
    ),
    grainYield: formatAndScaleValue(
      oblast.grainYield,
      oblast.oblastNameUkrainian,
      scenario
    ),
    volume: formatAndScaleValue(
      oblast.volume, 
      oblast.oblastNameUkrainian, 
      scenario),
  };
}



watch(() => props.scenario, processScenario)
// EJ: Me and the robot wrote this function to process & update on scenario change
function processScenario(newScenario) {
  console.log("processing scenario", newScenario)
  // newScenario looks like??

  if (newScenario) {
    processOblastData(newScenario.oblastData, props.grainType, newScenario)
    updateMap();
  }  
}

// a similar watcher that watches the grain type and re-processes the data
watch(() => props.grainType, (newGrainType) => {
  processOblastData(props.oblastData, newGrainType, props.scenario)
  updateMap();
})

// a similar watcher that watches the oblast data and re-processes the data
watch(() => props.oblastData, (newOblastData) => {
  processOblastData(newOblastData, props.grainType, props.scenario)
  updateMap();
})

// EJ: Don't think this needs to be async anymore because it does not call the geojson
function processOblastData(oblastData, grainType, scenario) {
    // console.log("watch oblastData", oblastData, grainType, scenario)
    
    if(!scenario) scenario = {};
    if(!oblastData) {
      console.log("no oblast data?")
      return;
    }
    
    // group the new data by grain type
    let groupedByGrainType = d3.group(oblastData, (d) => d.metadata[0][0]);

    // TODO: have mapping from nice grain type names to the ones in the data
    // then we can accept a nice grain type as a parameter
    let grainTypes = Array.from(groupedByGrainType.keys());
    // if(!grainType) grainType = grainTypes[1]
    grainType = grainTypes[1]

    // remove grain types where the key includes the word "dynamics"
    // because those are bad data
    groupedByGrainType.forEach((value, key) => {
      if (key.toLowerCase().includes("dynamics")) {
        groupedByGrainType.delete(key);
      }
    });

    // get the list of oblasts for the current graintype
    const activeData = groupedByGrainType.get(grainType);
    if(!activeData) return;

    // group the data by oblast's normalized english name
    // and also process it with the forecast data
    oblastsByEnglish.value = d3.rollup(activeData, 
      // there will be only one object per name, process it and return it
      v => createScaledOblastData(v[0], v[0].oblastNameUkrainian, scenario), 
      // group by the normalized english name
      d => normalizeOblastName(d.oblastNameEnglish)
    );

   
    // get the oblast shapefile data
    // d3.json("/data/stanford-ukraine-geojson.json").then((geographicData) => {
    // });
  }

// Normalize our oblast name using slugify
function normalizeOblastName(key) {
  if (!key) return key;
  return slugify(key, {
    strict: true,
    lower: true,
  });
}


</script>
<style>
#map {
  /* width: 100%; */
  /* height: 50vh; */
  /* width: 50vw; */
}

path.focused-shape {
  stroke-width: 4 !important;
  stroke: black !important;
  fill: yellow !important;
}
</style>
