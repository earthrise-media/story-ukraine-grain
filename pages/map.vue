<template>
  <div class="sans-serif cf">
    <!-- Eventually this should all be moved to a component, but for now we don't need to have a ton of files for prototypes -->

    <!-- <svg id="map" ref="mapSvg" class="w-two-thirds fl"></svg> -->
    <!-- make a table with a breakdown of the data by oblast for the active grain type -->

    <UkraineOblastMap
        v-show="true"
        class="w-two-thirds fl"
        ref="oblastMap"
        :scenario="scenario"
        :oblastData="oblastData"
        :grainType="'wheat'"
        :width="600"
        :valueKey="valueKey"
        :style="{
          opacity: 1
          // opacity: mapOpacity,
          // opacity: oblastMapConfig.visibility ? mapOpacity : 0,
        }"
      />

    <div class="w-third fl vh-50 overflow-y-auto ba b--red">
      <h2>{{ activeGrainType }}</h2>

      <!-- next and previous buttons to navigate through grain types -->
      <button
        @click="
          activeGrainType = grainTypes[grainTypes.indexOf(activeGrainType) - 1]
        "
      >
        Previous
      </button>

      <button
        @click="
          activeGrainType = grainTypes[grainTypes.indexOf(activeGrainType) + 1]
        "
      >
        Next
      </button>

      <!-- a list of grain types, when clicked, make that grain type active -->
      <ul class="list ma0 pa0">
        <li
          v-for="grainType in grainTypes"
          :key="grainType"
          class="w-100 dib v-top ph2 pv1 f7"
        >
          <div
            @click="activeGrainType = grainType"
            :class="{
              active: activeGrainType === grainType,
              ba: true,
              'bg-white': true,
              br2: true,
              pa2: true,
            }"
          >
            {{ grainType.split("року1")[1] }}
            <!-- if the name contains "Dynamics", it probably won't work, so we put a warning emoji -->
            <span v-if="grainType.includes('Dynamics')">&#9888;</span>
          </div>
        </li>
      </ul>
    </div>

    <div id="data-table-container" class="">
      <!-- <pre v-if="dataByGrainType">
        {{dataByGrainType.get(activeGrainType)}}
      </pre> -->

      <!-- use a transition group to animate the table -->

      <h2>{{ selectedOblasts }}</h2>
      <pre>
        {{ oblastForecastScale }}
      </pre>

      <DataTable
        :data-by-grain-type="originalDataByGrainType"
        :sorted-data-by-grain-type="sortedDataByGrainType"
        :total-harvested-area="0"
        :total-yield="0"
        :total-volume="0"
        class="w-100 bt b--light-gray mt2 fl"
        @sliderChange="updateScaleByOblast"
      />
    </div>
  </div>
</template>
<script setup>
// import d3, topojson, and turf
import * as d3 from "d3";
import * as topojson from "topojson";
import * as turf from "@turf/turf";
import slugify from "slugify";

// Set our refs- these are all automatically reactive
// The only thing we need to do is get the value of the ref with .value
const oblastData = ref([]);
const importExportData = ref([]);

const activeGrainType = ref(null);
const grainTypes = ref([]);
const parsedDataByName = ref(null);
const dataByGrainType = ref(null);
const selectedScaleValue = ref(1);
const oblastForecastScale = ref({});
const scaleByOblast = ref({});

// the normalized names of the selected oblasts, can be one or many
const selectedOblasts = ref([]);

function updateForecastScale(scaleValue) {
  selectedScaleValue.value = scaleValue;
  selectedOblasts.value.forEach((oblast) => {
    oblastForecastScale.value[normalizeOblastName(oblast)] = scaleValue;
  });
}

function updateScaleByOblast(scaleMap) {
  scaleByOblast.value = scaleMap;
}

function addSelectedOblast(oblastName) {
  if (selectedOblasts.value.includes(oblastName)) {
    selectedOblasts.value = selectedOblasts.value.filter(
      (oblast) => oblast !== oblastName
    );
  } else {
    selectedOblasts.value = [...selectedOblasts.value, oblastName];
  }
}

function clearSelectedOblasts() {
  selectedOblasts.value = [];
}


function formatAndScaleValue(value, oblastNameUkrainian) {
  // default to 100% if missing from scaleByOblast map
  const scale = scaleByOblast.value[oblastNameUkrainian];
  const sliderScale = (scale >= 0 ? scale : 100) / 100;
  return formatValue(value * sliderScale);
}
function formatValue(value) {
  return (+value).toFixed(1);
}

// Need a computed that applies the forecasts to the data and returns a forecasted version
const forecastedDataByGrainType = computed(() => {
  if (dataByGrainType.value) {
    const forecastedData = new Map();
    for (const [grainType, oblasts] of dataByGrainType.value) {
      forecastedData.set(
        grainType,
        oblasts.map((oblast) => {
          // const forecastScale = oblastForecastScale[oblast.oblastNameEnglish] || forecastSelectOptions[0].scaleValue
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
            volume: formatAndScaleValue(
              oblast.volume,
              oblast.oblastNameUkrainian
            ),
          };
        })
      );
    }
    return forecastedData;
  }
});

// Add ability to apply a forecast to all oblasts at once

// Add ability to remove forecast from the forecasts

// This is a template ref, so mapSvg.value is the actual SVG element
// because we set ref="mapSvg" on the SVG element
const mapSvg = ref(null);

// This is a reactive ref with a default value
// For now set to oblast name since sliders will change sorting rank of values
const sortKey = ref("oblastNameUkrainian");
const valueKey = ref("harvestedArea");

// Make a D3 color scale for the values
const valueColorScale = ref(null);

// make a computed that gives the original data by active grain type
const originalDataByGrainType = computed(() => {
  if (dataByGrainType.value) {
    return dataByGrainType.value.get(activeGrainType.value);
  }
});
// Make a computed that takes forecastedDataByGrainType and sorts it by our selected sortKey
const sortedDataByGrainType = computed(() => {
  if (forecastedDataByGrainType.value) {
    return forecastedDataByGrainType.value
      .get(activeGrainType.value)
      .sort((a, b) => b[sortKey.value] - a[sortKey.value]);
  }
});

// update the map when the display data changes
// watch(sortedDataByGrainType, redrawMap);

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


function normalizeOblastName(key) {
  if (!key) return key;
  return slugify(key, {
    strict: true,
    lower: true,
  });
}

// slugify('some string', {
//   replacement: '-',  // replace spaces with replacement character, defaults to `-`
//   remove: undefined, // remove characters that match regex, defaults to `undefined`
//   lower: false,      // convert to lower case, defaults to `false`
//   strict: false,     // strip special characters except replacement, defaults to `false`
//   locale: 'vi',       // language code of the locale to use
//   trim: true         // trim leading and trailing replacement chars, defaults to `true`
// })

onMounted(async () => {

  // load our oblast data from public/data/ovuzpsg_1221/cleaned/oblast_data.json
  fetch("/data/ovuzpsg_1221/cleaned/all_data.json")
    .then((response) => response.json())
    .then((data) => {
      oblastData.value = data;
    });

  // load our import/export data from public/data/comtrade_imports/00_all_data_ukraine.csv as parse with d3.csvParse
  fetch("/data/comtrade_imports/00_all_data_ukraine.csv")
    .then((response) => response.text())
    .then((data) => {
      importExportData.value = d3.csvParse(data);
    });

  d3.json("/data/ovuzpsg_1221/cleaned/all_data.json").then((allData) => {
    // load geojson data from public/data/stanford-ukraine-geojson.json with d3
    // console.log({allData})

    // use d3.group to group the data by grain type
    // this means looking at data.metadata[0][0] which has the title, including the grain type

    // const dataByGrainType = d3.group(allData, (d) => d.metadata[0][0])
    dataByGrainType.value = d3.group(allData, (d) => d.metadata[0][0]);

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

    // console.log({dataByGrainType})

    d3.json("/data/stanford-ukraine-geojson.json").then((geographicData) => {
      // create an object where the keys are the oblast names and the values are the data
      parsedDataByName.value = allData.reduce((acc, d) => {
        // console.log("key: ", d.oblastNameEnglish)
        acc[normalizeOblastName(d.oblastNameEnglish)] = d;
        return acc;
      }, {});

      // initMap(geographicData);
    });
  });
});

// When the activeGrainType changes, we need to update the map
watch(activeGrainType, (newGrainType) => {
  // get the data for the new grain type
  // const newData = dataByGrainType.value.get(newGrainType)
  const newData = sortedDataByGrainType.value;

  // create an object where the keys are the oblast names and the values are the data
  parsedDataByName.value = newData.reduce((acc, d) => {
    acc[d.oblastNameEnglish] = d;
    return acc;
  }, {});

  // Get the min and max of the data using d3.extent
  const extent = d3.extent(newData, (d) => d[valueKey.value + "Original"]);
  // Set the domain of the color scale to the extent
  valueColorScale.value.domain(extent);

  // redrawMap();
});


</script>
<style scoped>
#map {
  /* width: 100%; */
  height: 50vh;
}

.active {
  color: red;
  font-weight: bold;
}

/* set up styles to animate our transition-group table, our animation is also named "table", and fade opacity in and out on enter/exit and move the rows up and down on update */

.table-enter-active,
.table-leave-active {
  transition: all 2s ease;
}

.table-enter-from,
.table-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
