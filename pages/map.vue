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
        <li v-for="grainType in grainTypes" :key="grainType"
        class="w-100 dib v-top ph2 pv1 f7"
        >
          <div @click="activeGrainType = grainType" :class="{active: activeGrainType === grainType, ba: true, 'bg-white': true, 'br2': true, 'pa2': true}">
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

      
        <thead>
          <tr>
            <th>Oblast</th>
            <th>Harvested Area</th>
            <th>Yield</th>
            <th>Volume</th>
          </tr>
        </thead>
        <TransitionGroup name="table" tag="tbody" v-if="dataByGrainType">
          <tr v-for="oblast in sortedDataByGrainType" :key="oblast.oblastNameUkrainian">
            <td>{{ oblast.oblastNameUkrainian }}</td>
            <td>{{ oblast.harvestedArea }}</td>
            <td>{{ oblast.grainYield }}</td>
            <td>{{ oblast.volume }}</td>
          </tr>
      </TransitionGroup>
    </div>
  </div>
</template>
<script setup>
// import d3, topojson, and turf
import * as d3 from 'd3'
import * as topojson from 'topojson'
import * as turf from '@turf/turf'

// Set our refs- these are all automatically reactive
// The only thing we need to do is get the value of the ref with .value
const activeGrainType = ref(null)
const grainTypes = ref([])
const parsedDataByName = ref(null)
const dataByGrainType = ref(null)

// This is a template ref, so mapSvg.value is the actual SVG element
// because we set ref="mapSvg" on the SVG element
const mapSvg = ref(null)

// This is a reactive ref with a default value
const valueKey = ref("harvestedArea")

// Make a D3 color scale for the values
const valueColorScale = ref(null)

// Make a computed that takes dataByGrainType and sorts it by our selected valueKey
const sortedDataByGrainType = computed(() => {
  if (dataByGrainType.value) {
    return dataByGrainType.value.get(activeGrainType.value).sort((a, b) => b[valueKey.value] - a[valueKey.value])
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
      const shapeName1 = d.properties.name_1;

      const oblastData = parsedDataByName.value[shapeName1];
      const shapeValue = oblastData ? oblastData[valueKey.value] : 0;

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
      else return '#FFF'
    })

}


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
        acc[d.oblastNameEnglish] = d
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