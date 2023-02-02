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

const valueKey = ref("harvestedArea")

const valueColorScale = d3.scaleLinear().domain([0, 1000]).range(["white", "red"])

onMounted(async () => {
  // load .csv data from public/data/ovuzpsg_1221/cleaned/all_data.json with d3 (use async so we wait for the data to load)

  /*
  parsed_data = d3
  .csvParseRows(file)
  // throw away the first two header rows
  .slice(2)
  // make a new array where we pull out each row and do something with it
  .map((row) => {
    const // // yank the first three entries from the row array and call their new array ‘race’.
      // race = row.splice(0,3),
      // assign the variables ‘age’ and ‘occupation’ to the last two entries.
      [
        ,
        oblastNameUkrainian,
        harvestedArea,
        volume,
        grainYield,
        harvestedAreaEnterprise,
        volumeEnterprise,
        grainYieldEnterprise,
        harvestedAreaHousehold,
        volumeHousehold,
        grainYieldHousehold,
        oblastNameEnglish
      ] = row;
    // make a new object to return for each row
    return {
      oblastNameUkrainian,
      harvestedArea: +harvestedArea,
      volume: +volume,
      grainYield: +grainYield,
      harvestedArea: +harvestedArea,
      volumeEnterprise: +volumeEnterprise,
      grainYieldEnterprise: +grainYieldEnterprise,
      harvestedAreaEnterprise: +harvestedAreaEnterprise,
      volumeHousehold: +volumeHousehold,
      grainYieldHousehold: +grainYieldHousehold,
      harvestedAreaHousehold: +harvestedAreaHousehold,
      oblastNameEnglish
    };
    // return row
  })
  .filter((d) => d.oblastNameUkrainian)
  */

  const parsed_data = []

  d3.json('/data/ovuzpsg_1221/cleaned/all_data.json').then((allData) => {
    // load geojson data from public/data/stanford-ukraine-geojson.json with d3
    d3.json('/data/stanford-ukraine-geojson.json').then((data) => {
      // create an object where the keys are the oblast names and the values are the data
      const parsedDataByName = allData.reduce((acc, d) => {
        acc[d.oblastNameEnglish] = d
        return acc
      }, {})

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
        .attr("fill", (d, i) => {
          const shapeName1 = d.properties.name_1;
          
          const oblastData = parsedDataByName[shapeName1];
          const shapeValue = oblastData ? oblastData[valueKey.value] : 0;

          if(shapeValue) return valueColorScale(+shapeValue);
          else return '#CCC'
        })
        .attr('stroke', 'white')
        .attr('stroke-width', '0.2')
      })
  })
})


</script>
<style>
#map {
  width: 100%;
  height: 80vh;
}
</style>