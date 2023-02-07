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
          <td class="tr">
            <div class="slider-cell">
              <input
                type="range"
                min="0"
                max="100"
                class="slider"
                @change="setOblastScale($event.target.value, oblast.oblastNameUkrainian)"
                :value="oblastSliderPercentages[oblast.oblastNameUkrainian] || 100"
                :id="`range-${oblast.oblastNameUkrainian}`"
              >
            </div>
          </td>
          <td class="tl">
            {{ oblastSliderPercentages[oblast.oblastNameUkrainian] || 100 }}%
          </td>

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
const emit = defineEmits(['sliderChange']);

const numberFormat = d3.format(",.0f");

const oblastSliderPercentages = ref({})

function setOblastScale(percentage, oblastName) {
  oblastSliderPercentages.value[oblastName] = percentage;
  emit('sliderChange', oblastSliderPercentages.value)
}

</script>