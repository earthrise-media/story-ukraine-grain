<template>
  <table id="data-table">
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
      <TransitionGroup name="table" tag="tbody" v-if="sortedDataByGrainType">
        <tr v-for="oblast in sortedDataByGrainType" :key="oblast.oblastNameUkrainian">
          <td>{{ oblast.oblastNameUkrainian }}</td>
          <td>{{ oblast.harvestedArea }}</td>
          <td>{{ oblast.grainYield }}</td>
          <td>{{ oblast.volume }}</td>
        </tr>
      </TransitionGroup>

      <!-- add a total row -->
      <tfoot>
        <tr class="bg-gray white">
          <td>Total</td>
          <td>{{ numberFormat(totalHarvestedArea) }}</td>
          <td>{{ numberFormat(totalYield) }}</td>
          <td>{{ numberFormat(totalVolume) }}</td>
        </tr>
      </tfoot>

    </table>
</template>
<script setup>
import * as d3 from 'd3'
defineProps(['sortedDataByGrainType', 'totalHarvestedArea', 'totalYield', 'totalVolume'])

const numberFormat = d3.format(",.0f");
</script>