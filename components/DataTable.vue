<template>
  <table id="data-table">
    <!-- <pre v-if="dataByGrainType">
        {{dataByGrainType.get(activeGrainType)}}
      </pre> -->

    <!-- use a transition group to animate the table -->
    <thead>
      <tr class="tl">
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
        <td class="w-20">{{ oblast.oblastNameUkrainian }}</td>
        <td class="w-20">{{ oblast.harvestedArea }}</td>
        <td class="w-20">{{ oblast.grainYield }}</td>
        <td class="w-20">{{ oblast.volume }}</td>
        <td class="tl w-20">
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
            {{ getOblastPercentage(oblast.oblastNameUkrainian) }}%
          </div>
        </td>
      </tr>
    </TransitionGroup>

    <!-- add a total row -->
    <tfoot>
      <tr class="bg-gray white">
        <td>Total</td>
        <td>{{ totalHarvestedArea }}</td>
        <td>{{ totalYield }}</td>
        <td>{{ totalVolume }}</td>
      </tr>
    </tfoot>
  </table>
</template>
<script setup>
import * as d3 from "d3";
const props = defineProps([
  "dataByGrainType",
  "sortedDataByGrainType",
]);
const emit = defineEmits(["sliderChange"]);

const numberFormat = d3.format(",.0f");

const oblastSliderPercentages = ref({});

// sums up the values for a given column
function computeTotal(columnKey) {
  if (!props.sortedDataByGrainType) return 0;
  return props.sortedDataByGrainType.reduce(
    (acc, { [columnKey]: value }) => acc + (+value), 0
  ).toFixed(1)
}

const totalHarvestedArea = computed(() => computeTotal('harvestedArea'));
const totalYield = computed(() => computeTotal('grainYield'));
const totalVolume = computed(() => computeTotal('volume'));

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
