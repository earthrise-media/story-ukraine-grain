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
  </svg>
</template>
<script setup>
import * as d3 from "d3";
import * as topojson from "topojson";
// import * as turf from "@turf/turf";
import slugify from "slugify";
import { formatAndScaleValue, formatValue } from "@/helpers.js";

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

// We will fill these later with d3 groupings of our data
const oblastsByEnglish = ref(new Map());

// This is a template ref, so mapSvg.value is the actual SVG element
// because we set ref="mapSvg" on the SVG element
const mapSvg = ref(null);

// This is a reactive ref with a default value
// For now set to oblast name since sliders will change sorting rank of values
const sortKey = ref("oblastNameUkrainian");
// const valueKey = props.config.valueKey; //ref("harvestedArea");

// Make a D3 color scale for the values
const valueColorScale = ref(
  d3.scaleLinear().domain([0, 1000]).range(["white", "red"])
);

const parsedDataByName = ref({});

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

onMounted(async () => {
  d3.json("/data/stanford-ukraine-geojson.json").then((geoData) => {
    console.log("geographic data received", geoData);
    geographicData.value = geoData;
    console.log('parsing data by name', typeof parsedDataByName)
    


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

// const geoOblastNames = ref(null);
// generate a map of oblast names to oblast data for every feature (oblast) in the featureCollection
const geoOblastNames = computed(() => {
  if (featureCollection.value) {
    return featureCollection.value.features.map((feature) => {
      console.log({feature})
      return normalizeOblastName(feature.properties.name_1);
    });
  }
});

const dataOblastNames = computed(() => {
  if (props.oblastData) {
    return props.oblastData.reduce((acc, oblast) => {
      acc[normalizeOblastName(oblast.oblastNameEnglish)] = oblast;
      return acc;
    }, {});
  }
});

// a function to receive an oblast shape and fetch the proper data to determine and return fill color
function findOblastFillColor(d) {
  // normalize the oblast shape name to match the oblast data name
  const shapeName1 = normalizeOblastName(d.properties.name_1);
  // console.log('looking for shapeName1: ', shapeName1)
  
  // retrieve the oblast data object from the oblastsByEnglish map
  // based on the normalized shape name
  if(!dataOblastNames.value) return 'purple'
  const oblastData = dataOblastNames.value[shapeName1];
  // return oblastData ? 'green' : 'red'

  // have we gotten any oblastData?
  // console.log('oblastData: ', oblastData)

  // except oblastData is always null, which means that oblastsByEnglish does not have data with the correct matching oblast name
  
  const shapeValue = oblastData ? oblastData[props.valueKey] : 0;
  console.log('shapeValue: ', shapeValue)
  if (shapeValue) return valueColorScale.value(+shapeValue);
  else return "#FFF";
  
}

useSortedData({ oblastScales: props.oblastScales }).then((data) => {
  // console.log('🇺🇸', data)
  const oblastByEnglishRollup = d3.rollup(
    data,
    // there will be only one object per name, process it and return it
    (v, key) => {
      // createScaledOblastData takes oblastRaw as the first param,
      // and oblastScales as the second param
      // console.log('v', v[0])

      // this should be the oblast with the scalar applied
      return createScaledOblastData(v[0], props.oblastScales);
    },
    // group by the normalized english name
    (d) => {
      if (!d) return;
      // console.log(normalizeOblastName(d.oblastNameUkrainian));
      return normalizeOblastName(d.oblastNameUkrainian);
    }
  );

  
  // console.log("oblast by english rollup", oblastByEnglishRollup, 'from', data);
  oblastsByEnglish.value = oblastByEnglishRollup;
});

/*
--------------------------------------------------------------
Data processing
--------------------------------------------------------------
*/
// This function applies our formats and scales to oblast data

// This function expects a single oblast object
function createScaledOblastData(oblastRaw, oblastScales) {
  const oblast = oblastRaw;
  // console.log('oblastRaw', oblastRaw)
  if (!oblast) return null;
  if (!oblastScales) return null;
  const oblastNameUkr = normalizeOblastName(oblast.oblastNameUkrainian);
  if (!oblastNameUkr) return null;

  return {
    ...oblast,
    harvestedAreaOriginal: formatValue(oblast.harvestedArea),
    grainYieldOriginal: formatValue(oblast.grainYield),
    volumeOriginal: formatValue(oblast.volume),
    harvestedArea: formatAndScaleValue(
      oblast.harvestedArea,
      oblastNameUkr,
      oblastScales
    ),
    grainYield: formatAndScaleValue(
      oblast.grainYield,
      oblastNameUkr,
      oblastScales
    ),
    volume: formatAndScaleValue(oblast.volume, oblastNameUkr, oblastScales),
  };
}

// watch(() => props.oblastScales, processScales)
// function processScales(newScales) {
//   if (newScales) {
//     processOblastData(props.oblastData, props.grainType, newScales)
//     updateMap();
//   }
// }

// // a similar watcher that watches the grain type and re-processes the data
// watch(() => props.grainType, () => {
//   processOblastData(props.oblastData, props.grainType, props.oblastScales)
//   updateMap();
// })

// // a similar watcher that watches the oblast data and re-processes the data
// watch(() => props.oblastData, (newOblastData) => {
//   processOblastData(newOblastData, props.grainType, props.oblastScales)
//   updateMap();
// })

// anytime oblastScales changes we want to re-process our data
// watch(() => props.oblastScales, (newScales) => {
//   console.log('do we have the prop?', props.oblastScales)
//   processOblastData(props.oblastData, props.grainType, props.oblastScales)
//   updateMap();
// }, { immediate: true })

// wait for oblastByEnglish to be populated
watch(
  () => oblastsByEnglish.value,
  (newOblastByEnglish) => {
    // console.log('oblast by english', newOblastByEnglish)
    processOblastData();
    // updateMap();
  },
  { immediate: true }
);

// get the list of oblasts for the current graintype
// const activeData = groupedByGrainType.get(grainType);
function processOblastData(oblastData, activeGrainType, oblastScales) {
  if (!oblastScales) oblastScales = {};
  if (!oblastData) {
    console.log("no oblast data?");
    return;
  }

  // console.log("processing oblast data", oblastData)
  // oblastData is the raw rows from our source data

  // group the new data by grain type
  let groupedByGrainType = d3.group(oblastData, (d) => d.metadata[0][0]);
  // console.log("grouped by grain type", groupedByGrainType)

  // TODO: have mapping from nice grain type names to the ones in the data
  // then we can accept a nice grain type as a parameter
  let grainTypes = Array.from(groupedByGrainType.keys());
  // console.log("grain types", grainTypes)
  // if(!grainType) grainType = grainTypes[1]
  const grainType = activeGrainType || grainTypes[1];
  console.log("grain type", grainType);

  // 'Збір урожаю пшениці ярої на 01 грудня 2021 року1 Harvesting of spring wheat as of 01 December 20211'

  // remove grain types where the key includes the word "dynamics"
  // because those are bad data
  groupedByGrainType.forEach((value, key) => {
    if (key.toLowerCase().includes("dynamics")) {
      groupedByGrainType.delete(key);
    }
  });
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
