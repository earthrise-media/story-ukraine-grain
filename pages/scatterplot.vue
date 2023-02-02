<template>
  <div class="sans-serif cf">
    <!-- Eventually this should all be moved to a component, but for now we don't need to have a ton of files for prototypes -->

    <svg id="scatterplot" ref="scatterplotSvg" class="w-two-thirds fl"></svg>
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

const scatterplotSvg = ref(null)

const scatterplotY = ref("harvestedArea")
const scatterplotX = ref("grainYield")

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
// function initMap(geographicData) {
//   // Our geojson is contained in data.objects.stanford-pp624tm0074-geojson
//   // We need to convert it to a feature collection
//   const featureCollection = topojson.feature(geographicData, geographicData.objects['stanford-pp624tm0074-geojson'])

//   // get the width and height of the SVG
//   const width = mapSvg.value.clientWidth
//   const height = mapSvg.value.clientHeight

//   // create a projection
//   const projection = d3.geoMercator()
//     .fitSize([width, height], featureCollection)

//   // create a path generator
//   const path = d3.geoPath()
//     .projection(projection)

//   // clear SVG
//   // d3.select(mapSvg.value).selectAll('*').remove()

//   // create a geojson layer
//   const geojsonLayer = d3.select(mapSvg.value)
//     .selectAll('path')
//     .data(featureCollection.features)
//     .join('path')
//     .attr('d', path)
//     .attr("fill", (d, i) => {
//       const shapeName1 = d.properties.name_1;

//       const oblastData = parsedDataByName.value[shapeName1];
//       const shapeValue = oblastData ? oblastData[valueKey.value] : 0;

//       if (shapeValue) return valueColorScale.value(+shapeValue);
//       else return '#FFF'
//     })
//     .attr('stroke', '#CCC')
//     .attr('stroke-width', '0.2')
// }

// function updateMap(geographicData) {
//   // use d3 select and update to update the map
//   // this lets us use transitions to fade in the new data
//   d3.select(mapSvg.value)
//     .selectAll('path')
//     .data(topojson.feature(geographicData, geographicData.objects['stanford-pp624tm0074-geojson']).features)
//     .join('path')
//     .transition()
//     .duration(1000)
//     .attr("fill", (d, i) => {
//       const shapeName1 = d.properties.name_1;

//       const oblastData = parsedDataByName.value[shapeName1];
//       const shapeValue = oblastData ? oblastData[valueKey.value] : 0;

//       if (shapeValue) return valueColorScale.value(+shapeValue);
//       else return '#FFF'
//     })

// }

function initScatterplot() {
  // get the width and height of the SVG
  const width = scatterplotSvg.value.clientWidth
  const height = scatterplotSvg.value.clientHeight

  // Get the extent of the scatterplot X and Y in the data
  const xExtent = d3.extent(dataByGrainType.value.get(activeGrainType.value), (d) => d[scatterplotX.value])

  const yExtent = d3.extent(dataByGrainType.value.get(activeGrainType.value), (d) => d[scatterplotY.value])
  

  // grab the scatterplot svg
  const svg = d3.select(scatterplotSvg.value)

  // configure margins
  const margin = { top: 20, right: 20, bottom: 30, left: 40 }

  // create the Y and X axes for the scatterplot
  const x = d3.scaleLinear()
    .domain(xExtent)
    .range([margin.left, width - margin.right])

  const y = d3.scaleLinear()
    .domain(yExtent)
    .range([height - margin.bottom, margin.top])

  // create the X and Y axis generators
  const xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80, "s"))
    .call(g => g.select(".domain").remove())

  const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())

  // create the X and Y axis labels
  const xAxisLabel = svg.append("text")
    .classed("x-axis-label", true)
    .attr("text-anchor", "end")
    .attr("x", width / 2)
    .attr("y", height - 6)
    .text(scatterplotX.value)

  const yAxisLabel = svg.append("text")
    .classed("y-axis-label", true)
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".75em")
    .text(scatterplotY.value)

  // create the X and Y axis groups
  const xAxisGroup = svg.append("g")
    .classed("x-axis", true)
    .call(xAxis)

  const yAxisGroup = svg.append("g")
    .classed("y-axis", true)
    .call(yAxis)

  // // create the scatterplot points
  // const points = svg.append("g")
  //   .classed("points", true)
  //   .attr("fill", "steelblue")
  //   .selectAll("circle")
  //   .data(dataByGrainType.value.get(activeGrainType.value))
  //   .join("circle")
  //   .attr("cx", d => x(d[scatterplotX.value]))
  //   .attr("cy", d => y(d[scatterplotY.value]))
  //   .attr("r", 3)

  // // Label the scatterplot points with the oblast name
  // const labels = svg.append("g")
  //   .classed("labels", true)
  //   .attr("fill", "black")
  //   .attr("font-family", "sans-serif")
  //   .attr("font-size", 10)
  //   .selectAll("text")
  //   .data(dataByGrainType.value.get(activeGrainType.value))
  //   .join("text")
  //   .attr("x", d => x(d[scatterplotX.value]))
  //   .attr("y", d => y(d[scatterplotY.value]))
  //   .attr("dy", "0.35em")
  //   .attr("dx", "0.35em")
  //   .text(d => d.oblastNameUkrainian)

  // Use a group with a transform to contain both the points and the labels
  const pointsAndLabels = svg.append("g")
    .classed("points-and-labels", true)
    .attr("fill", "steelblue")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .selectAll("g")
    .data(dataByGrainType.value.get(activeGrainType.value))
    .join("g")
    .attr("transform", d => `translate(${x(d[scatterplotX.value])},${y(d[scatterplotY.value])})`)

  // create the scatterplot points
  const points = pointsAndLabels.append("circle")
    .attr("r", 3)

  // Label the scatterplot points with the oblast name
  const labels = pointsAndLabels.append("text")
    .attr("dy", "0.35em")
    .attr("dx", "0.35em")
    .text(d => d.oblastNameUkrainian)
    
}

// Select and update the axes and points so that they transition
// select by the class name
function updateScatterplot() {
  const svg = d3.select(scatterplotSvg.value)
  
  // update the X and Y axis labels
  svg.select(".x-axis-label")
    .text(scatterplotX.value)

  svg.select(".y-axis-label")
    .text(scatterplotY.value)

  // update the X and Y axis generators
  const x = d3.scaleLinear()
    .domain(d3.extent(dataByGrainType.value.get(activeGrainType.value), (d) => d[scatterplotX.value]))
    .range([margin.left, width - margin.right])

  const y = d3.scaleLinear()
    .domain(d3.extent(dataByGrainType.value.get(activeGrainType.value), (d) => d[scatterplotY.value]))
    .range([height - margin.bottom, margin.top])

  
  // remove any pre-existing axes
  svg.select(".x-axis").remove()
  svg.select(".y-axis").remove()

  // create the X and Y axis groups
  const xAxisGroup = svg.append("g")
    .classed("x-axis", true)
    .call(xAxis)

  const yAxisGroup = svg.append("g")
    .classed("y-axis", true)
    .call(yAxis)

  // update and transition the scatterplot point groups that contain the points and the labels
  const pointsAndLabels = svg.select(".points-and-labels")
    .selectAll("g")
    .data(dataByGrainType.value.get(activeGrainType.value))
    .join("g")
    .attr("transform", d => `translate(${x(d[scatterplotX.value])},${y(d[scatterplotY.value])})`)
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

    initScatterplot()
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

  // update the scatterplot
  // updateScatterplot()


  
})


</script>
<style scoped>
#scatterplot {
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