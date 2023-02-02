<template>
  <div class="sans-serif cf">
    <!-- Eventually this should all be moved to a component, but for now we don't need to have a ton of files for prototypes -->

    <svg id="map" ref="mapSvg" class="w-two-thirds fl"></svg>
    <!-- make a table with a breakdown of the data by oblast for the active grain type -->

    <div class="w-third fl vh-50 overflow-y-auto ba b--red">
      <h2>{{ activeGrainType }}</h2>

      <!-- next and previous buttons to navigate through grain types -->
      <button @click="activeGrainType = grainTypes[grainTypes.indexOf(activeGrainType) - 1]">Previous</button>

      <button @click="activeGrainType = grainTypes[grainTypes.indexOf(activeGrainType) + 1]">Next</button>

      <!-- a list of grain types, when clicked, make that grain type active -->
      <ul class="list ma0 pa0">
        <li v-for="grainType in grainTypes" :key="grainType" class="w-100 dib v-top ph2 pv1 f7">
          <div @click="activeGrainType = grainType"
            :class="{ active: activeGrainType === grainType, ba: true, 'bg-white': true, 'br2': true, 'pa2': true }">
            {{ grainType.split('року1')[1] }}
            <!-- if the name contains "Dynamics", it probably won't work, so we put a warning emoji -->
            <span v-if="grainType.includes('Dynamics')">&#9888;</span>
          </div>
        </li>
      </ul>


    </div>

    <div id="data-table" class="w-two-thirds ba b--gray bw2 fl">
      <!-- <pre v-if="dataByGrainType">
        {{dataByGrainType.get(activeGrainType)}}
      </pre> -->

      <!-- use a transition group to animate the table -->
      
      <h2>{{selectedOblasts}}</h2>
      <pre>
        {{oblastForecastScale}}
      </pre>

      <!-- if there are selected oblasts, show the forecast controls --> 
      <div>
        <h3>Forecast Select Options</h3>
        <!-- use a select and events to update value, do not use v-model -->
        <select @change="updateForecastScale($event.target.value)">
          <option v-for="option in forecastSelectOptions" :key="option.scaleValue" :value="option.scaleValue">
            {{option.text}}
          </option>          
        </select>
        
        <!-- button to trigger the forecast in selected oblasts -->
        <button @click="triggerForecast">Forecast</button>

        <!-- button to clear oblasts -->
        <button @click="clearSelectedOblasts">Clear</button>
      </div>


      <thead>
        <tr>
          <th>Oblast</th>
          <th>Harvested Area</th>
          <th>Yield</th>
          <th>Volume</th>
        </tr>
      </thead>
      <TransitionGroup name="table" tag="tbody" v-if="forecastedDataByGrainType">
        <tr v-for="oblast in sortedDataByGrainType" :key="oblast.oblastNameUkrainian"
        @click="addSelectedOblast(oblast.oblastNameEnglish)"
        >
          <td>🇺🇦 {{ oblast.oblastNameUkrainian }} 🇺🇸 {{ oblast.oblastNameEnglish }}</td>
          <!-- <td>{{ oblast.harvestedArea }}</td>
          <td>{{ oblast.grainYield }}</td>
          <td>{{ oblast.volume }}</td> -->

          <!-- show the original + forecasted numbers if there is a forecast -->
          <td v-if="oblastForecastScale[oblast.oblastNameEnglish]">
            <span class="strike">{{ oblast.harvestedArea }}</span>
            <span class="bg-green">{{ oblast.harvestedArea * oblastForecastScale[oblast.oblastNameEnglish] }}</span>
          </td>

          <td v-else>{{ oblast.harvestedArea }}</td>

          <td v-if="oblastForecastScale[oblast.oblastNameEnglish]">
            <span class="strike">{{ oblast.grainYield }}</span>
            <span class="bg-green">{{ oblast.grainYield * oblastForecastScale[oblast.oblastNameEnglish] }}</span>
          </td>

          <td v-else>{{ oblast.grainYield }}</td>

          <td v-if="oblastForecastScale[oblast.oblastNameEnglish]">
            <span class="strike">{{ oblast.volume }}</span>
            <span class="bg-green">{{ oblast.volume * oblastForecastScale[oblast.oblastNameEnglish] }}</span>
          </td>
          

        </tr>
      </TransitionGroup>
    </div>

    <div id="forecasts">
      <h2>Forecasts</h2>
      <ul>
        <li v-for="forecast in forecasts" :key="forecast.id">
          <h3>{{forecast.oblastName}}</h3>
          <p>{{forecast.harvestedArea}}</p>
          <p>{{forecast.grainYield}}</p>
          <p>{{forecast.volume}}</p>
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup>
// import d3, topojson, and turf
import * as d3 from 'd3'
import * as topojson from 'topojson'
import * as turf from '@turf/turf'
import slugify from 'slugify'

// Set our refs- these are all automatically reactive
// The only thing we need to do is get the value of the ref with .value
const activeGrainType = ref(null)
const grainTypes = ref([])
const parsedDataByName = ref(null)
const dataByGrainType = ref(null)
const selectedScaleValue = ref(1)
const oblastForecastScale = ref({})

// the normalized names of the selected oblasts, can be one or many
const selectedOblasts = ref([])

function updateForecastScale(scaleValue) {
  selectedScaleValue.value = scaleValue;
  selectedOblasts.value.forEach((oblast) => {
    oblastForecastScale.value[normalizeOblastName(oblast)] = scaleValue;
  })
  // console.log(oblastForecastScale.value);
}

function addSelectedOblast(oblastName) {
  if (selectedOblasts.value.includes(oblastName)) {
    selectedOblasts.value = selectedOblasts.value.filter(oblast => oblast !== oblastName)
  } else {
    selectedOblasts.value = [...selectedOblasts.value, oblastName]
  }
}

function clearSelectedOblasts() {
  selectedOblasts.value = []
}

// HELLO 
const forecastSelectOptions = [
  {
    text: '100%',
    scaleValue: 1,
  },
  {
    text: '90%',
    scaleValue: 0.9,
  },
  {
    text: '50%',
    scaleValue: 0.5,
  },
  {
    text: '25%',
    scaleValue: 0.25,
  },
  {
    text: '0%',
    scaleValue: 0,
  },
]


// Need a method to upsert an Oblast forceast to the forecasts

// Need a computed that applies the forecasts to the data and returns a forecasted version
const forecastedDataByGrainType = computed(() => {
  if (dataByGrainType.value) {
    const forecastedData = new Map()
    for (const [grainType, oblasts] of dataByGrainType.value) {
      forecastedData.set(grainType, oblasts.map(oblast => {
        const forecastScale = oblastForecastScale[oblast.oblastNameEnglish] || forecastSelectOptions[0].scaleValue
        return {
          ...oblast,
          harvestedArea: oblast.harvestedArea * forecastScale,
          grainYield: oblast.grainYield * forecastScale,
          volume: oblast.volume * forecastScale,
        }
      }))
    }
    return forecastedData
  }
})

// Add ability to apply a forecast to all oblasts at once

// Add ability to remove forecast from the forecasts



// This is a template ref, so mapSvg.value is the actual SVG element
// because we set ref="mapSvg" on the SVG element
const mapSvg = ref(null)

// This is a reactive ref with a default value
const valueKey = ref("harvestedArea")

// Make a D3 color scale for the values
const valueColorScale = ref(null)

// Make a computed that takes dataByGrainType and sorts it by our selected valueKey
const sortedDataByGrainType = computed(() => {
  if (forecastedDataByGrainType.value) {
    return forecastedDataByGrainType.value.get(activeGrainType.value).sort((a, b) => b[valueKey.value] - a[valueKey.value])
  }
})

valueColorScale.value = d3.scaleLinear().domain([0, 1000]).range(["white", "red"])


// A function to draw the map SVG
function initMap(geographicData) {
  // Our geojson is contained in data.objects.stanford-pp624tm0074-geojson
  // We need to convert it to a feature collection
  const featureCollection = topojson.feature(geographicData, geographicData.objects['stanford-pp624tm0074-geojson'])

  // get the width and height of the SVG
  const width = mapSvg.value.clientWidth
  const height = mapSvg.value.clientHeight

  // create a projection
  const projection = d3.geoMercator()
    .fitSize([width, height], featureCollection)

  // create a path generator
  const path = d3.geoPath()
    .projection(projection)

  // clear SVG
  // d3.select(mapSvg.value).selectAll('*').remove()

  // create a geojson layer
  const geojsonLayer = d3.select(mapSvg.value)
    .selectAll('path')
    .data(featureCollection.features)
    .join('path')
    .attr('d', path)
    .attr("fill", (d, i) => {
      const shapeName1 = normalizeOblastName(d.properties.name_1);
      // console.log(shapeName1, parsedDataByName)
      const oblastData = parsedDataByName.value[shapeName1];
      const shapeValue = oblastData ? oblastData[valueKey.value] : 0;

      // console.log('🌻', shapeName1, oblastData, shapeValue)
      // console.log('💯', shapeValue)
      // console.log(oblastData[valueKey.value])
      if(!oblastData) {
        // console.log('no match', shapeName1)
      }

      if (shapeValue) return valueColorScale.value(+shapeValue);
      else return '#FFF'
    })
    .attr('stroke', '#CCC')
    .attr('stroke-width', '0.2')
}

function updateMap(geographicData) {
  // use d3 select and update to update the map
  // this lets us use transitions to fade in the new data
  d3.select(mapSvg.value)
    .selectAll('path')
    .data(topojson.feature(geographicData, geographicData.objects['stanford-pp624tm0074-geojson']).features)
    .join('path')
    .transition()
    .duration(1000)
    .attr("fill", (d, i) => {
      const shapeName1 = d.properties.name_1;

      const oblastData = parsedDataByName.value[shapeName1];
      const shapeValue = oblastData ? oblastData[valueKey.value] : 0;

      if (shapeValue) return valueColorScale.value(+shapeValue);
      else return '#CCC'
    })

}

// A germ of an idea: -- Curran
// const renames = { "Luhansk": "Lugansk"}
// const rename = str => str in renames ? renames[str] : str;

function normalizeOblastName(key) {
  if(!key) return key
  return slugify(key, {
    strict: true,
    lower: true
  })
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
  d3.json('/data/ovuzpsg_1221/cleaned/all_data.json').then((allData) => {
    // load geojson data from public/data/stanford-ukraine-geojson.json with d3
    // console.log({allData})

    // use d3.group to group the data by grain type
    // this means looking at data.metadata[0][0] which has the title, including the grain type    


    // const dataByGrainType = d3.group(allData, (d) => d.metadata[0][0])
    dataByGrainType.value = d3.group(allData, (d) => d.metadata[0][0])

    // remove groupings where the key includes the word "dynamics"
    dataByGrainType.value.forEach((value, key) => {
      if (key.includes('dynamics')) {
        dataByGrainType.value.delete(key)
      }
    })

    // Set the active grain type to the first grain type
    activeGrainType.value = Array.from(dataByGrainType.value.keys())[0]

    // Get a list of the grain types from the keys of the group
    // const grainTypes = Array.from(dataByGrainType.keys())
    grainTypes.value = Array.from(dataByGrainType.value.keys())

    // console.log({dataByGrainType})

    d3.json('/data/stanford-ukraine-geojson.json').then((geographicData) => {
      // create an object where the keys are the oblast names and the values are the data
      parsedDataByName.value = allData.reduce((acc, d) => {
        // console.log("key: ", d.oblastNameEnglish)
        acc[normalizeOblastName(d.oblastNameEnglish)] = d
        return acc
      }, {})

      initMap(geographicData)
    })
  })
})



// When the activeGrainType changes, we need to update the map
watch(activeGrainType, (newGrainType) => {
  // get the data for the new grain type
  const newData = dataByGrainType.value.get(newGrainType)

  // create an object where the keys are the oblast names and the values are the data
  parsedDataByName.value = newData.reduce((acc, d) => {
    acc[d.oblastNameEnglish] = d
    return acc
  }, {})

  // Get the min and max of the data using d3.extent
  const extent = d3.extent(newData, (d) => d[valueKey.value])

  // Set the domain of the color scale to the extent
  valueColorScale.value.domain(extent)

  // redraw the map
  d3.json('/data/stanford-ukraine-geojson.json').then((geographicData) => {
    // drawMap(geographicData)
    updateMap(geographicData)
  })
})


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