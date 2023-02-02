<template>
  <div>
    <!-- Eventually this should all be moved to a component, but for now we don't need to have a ton of files for prototypes -->

    <svg id="map" ref="mapSvg"></svg>
  </div>
</template>
<script setup>
// import d3, topojson, and turf
import * as d3 from 'd3'
import * as topojson from 'topojson'
import * as turf from '@turf/turf'

const mapSvg = ref(null)

onMounted(() => {
  // load geojson data from public/data/stanford-ukraine-geojson.json with d3
  d3.json('/data/stanford-ukraine-geojson.json').then((data) => {
    // Our geojson is contained in data.objects.stanford-pp624tm0074-geojson
    // We need to convert it to a feature collection
    const featureCollection = topojson.feature(data, data.objects['stanford-pp624tm0074-geojson'])
    
    // get the width and height of the SVG
    const width = mapSvg.value.clientWidth
    const height = mapSvg.value.clientHeight

    // create a projection
    const projection = d3.geoMercator()
      .fitSize([width, height], featureCollection)

    // create a path generator
    const path = d3.geoPath()
      .projection(projection)

    // create a geojson layer
    const geojsonLayer = d3.select(mapSvg.value)
      .selectAll('path')
      .data(featureCollection.features)
      .join('path')
      .attr('d', path)
      .attr('fill', 'steelblue')
      .attr('stroke', 'white')
  })
})


</script>
<style>
#map {
  width: 100%;
  height: 80vh;
}
</style>