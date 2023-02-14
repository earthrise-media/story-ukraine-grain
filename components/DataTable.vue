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
      <tr
        v-for="oblast in sortedDataByGrainType"
        :key="oblast.oblastNameUkrainian"
      >
        <td>{{ oblast.oblastNameEnglish }}</td>
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
              @change="
                setOblastScale($event.target.value, oblast.oblastNameUkrainian)
              "
              :value="getOblastPercentage(oblast.oblastNameUkrainian)"
              :id="`range-${oblast.oblastNameUkrainian}`"
            />
          </div>
        </td>
        <td class="tl">
          {{ getOblastPercentage(oblast.oblastNameUkrainian) }}%
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
import * as d3 from "d3";
const props = defineProps([
  "dataByGrainType",
  "sortedDataByGrainType",
  "totalHarvestedArea",
  "totalYield",
  "totalVolume",
]);
const emit = defineEmits(["sliderChange"]);

const numberFormat = d3.format(",.0f");

const oblastSliderPercentages = ref({});

function getOblastPercentage(oblastName) {
  const scalar = oblastSliderPercentages.value[oblastName];
  // since 0 is falsey we can't easily default to 1 :(
  if (scalar === 0) {
    return 0;
  }
  // default scalar is 1
  return ((scalar || 1) * 100).toFixed();
}

function setOblastScale(percentage, oblastName) {
  // convert to a scalar before emit
  oblastSliderPercentages.value[oblastName] = (+percentage) / 100;
  emit("sliderChange", oblastSliderPercentages.value);
}
</script>
