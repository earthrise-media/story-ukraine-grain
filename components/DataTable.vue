<template>
  <table id="data-table" class="ba b--red">
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
      <tr v-for="oblast in sortedDataByGrainType" :key="oblast.oblastNameUkrainian">
        <td class="w-20">{{ oblast.oblastNameUkrainian }}</td>
        <td class="w-20">{{ oblast.harvestedArea }}</td>
        <td class="w-20">{{ oblast.grainYield }}</td>
        <td class="w-20">{{ oblast.volume }}</td>
        <td class="tl w-20">
          <div class="slider-cell">
            <input type="range" min="0" max="100" class="slider" @change="
              setOblastScale($event.target.value, oblast.oblastNameUkrainian)
            " :value="getOblastPercentage(oblast.oblastNameUkrainian)" :id="`range-${oblast.oblastNameUkrainian}`" />
            {{ getOblastPercentage(oblast.oblastNameUkrainian) }}%
          </div>
        </td>
      </tr>
    </TransitionGroup>

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
import {format } from "d3";
// we expect a scenario object to be passed in via props
// what is the difference between scenario and oblastSliderPercentages?

// scenario is a broader thing that describes the scenario
// oblastSliderPercentages is a more specific thing that describes the oblasts
const props = defineProps({
  activeScenarioScalar: {
    type: Object,
    required: true,
    default: {},
    // when filled in, it looks like this:
    // {
    //   "7260": 0.5,
    //   "Kharkiv": 0.5,
    // }
  },
});

const emit = defineEmits(["sliderChange"]);


// when you load you have to emit default values
// TODO: See if we need to emit default values
// onMounted(() => emitSliderValues())

// keep track of user-set slider values
const userSetSliderPercentages = ref({});

// // Take the scenario you pass in via props and add the user-set slider values
const oblastSliderPercentages = computed(() =>
  Object.assign(props.activeScenarioScalar, userSetSliderPercentages.value)
)

const emitSliderValues = () => emit("sliderChange", oblastSliderPercentages.value)

// // When the user changes a slider, update the userSetSliderPercentages
// this causes an unhandled error 
const sortedDataByGrainType = await useSortedData({ scaleByOblast: oblastSliderPercentages.value })

console.log('🚀 ~ file: DataTable.vue ~ line 80 ~ sortedDataByGrainType', sortedDataByGrainType)

// // format numbers
const numberFormat = format(",.0f");


// sums up the values for a given column
function computeTotal(columnKey) {
  console.log('💾 sortedDataByGrainType', sortedDataByGrainType)
  return numberFormat(sortedDataByGrainType.reduce(
    (acc, { [columnKey]: value }) => acc + (+value), 0
  ))
}

// sums of the values for each column
const totalHarvestedArea = computed(() => computeTotal('harvestedArea'));
const totalYield = computed(() => computeTotal('grainYield'));
const totalVolume = computed(() => computeTotal('volume'));

// get the percentage for a given oblast
function getOblastPercentage(oblastName) {
  const sliderScalar = oblastSliderPercentages.value[oblastName];
  const scalar = sliderScalar >= 0 ? sliderScalar : 1;
  return (scalar * 100).toFixed();
}

// set the percentage for a given oblast
function setOblastScale(percentage, oblastName) {
  // convert to a scalar before storing in the map of user-set values
  userSetSliderPercentages.value[oblastName] = (+percentage) / 100;
  // merge scenario and user set sliders
  emitSliderValues();
}

</script>
