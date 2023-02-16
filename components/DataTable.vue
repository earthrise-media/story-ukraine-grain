<template>
  <table id="data-table" class="pa4 f6 w-100">
    <thead>
      <tr class="tl">
        <th>Oblast</th>
        <th>Harvested Area</th>
        <th>Yield</th>
        <th>Volume</th>
      </tr>
    </thead>
    <tbody v-if="sortedDataByGrainType">
      <tr
        v-for="oblast in sortedDataByGrainType"
        :key="oblast.oblastNameNormalized"
      >
      <!-- <pre class="h3 overflow-y-auto ba b--red">{{oblast}}</pre> -->
        <td class="w-20">{{ oblast.oblastNameNormalized }}</td>
        <td class="w-20">{{ oblast.harvestedArea }}</td>
        <td class="w-20">{{ oblast.grainYield }}</td>
        <td class="w-20">{{ oblast.volume }}</td>
        <td class="tl w-20">
          <div class="slider-cell">
            <input
              type="range"
              min="0"
              max="150"
              class="slider"
              @change="
                setOblastScale($event.target.value, oblast.oblastNameNormalized)
              "
              :value="getOblastPercentage(oblast.oblastNameNormalized)"
              :id="`range-${oblast.oblastNameNormalized}`"
            />
            {{ getOblastPercentage(oblast.oblastNameNormalized) }}%
          </div>
        </td>
      </tr>
    </tbody>

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
import { format } from "d3";
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
  activeGrainType: {
    type: String,
    required: true,
  },
});

const sortedDataByGrainType = ref({});
const numberFormat = format(",.0f");

const emit = defineEmits(["sliderChange"]);

// keep track of user-set slider values
const userSetSliderPercentages = ref({});

// // Take the scenario you pass in via props and add the user-set slider values
const oblastSliderPercentages = computed(() =>
  Object.assign(props.activeScenarioScalar, userSetSliderPercentages.value)
);

const emitSliderValues = () =>
  emit("sliderChange", oblastSliderPercentages.value);

  // set the percentage for a given oblast based on a slider event
function setOblastScale(percentage, oblastName) {
  // convert to a scalar before storing in the map of user-set values
  userSetSliderPercentages.value[oblastName] = +percentage / 100;
  // merge scenario and user set sliders
  emitSliderValues();
}

// sums up the values for a given column
function computeTotal(columnKey) {
  // console.log('💾 sortedDataByGrainType', sortedDataByGrainType.value)
  if(!sortedDataByGrainType.value) return 0;
  return numberFormat(
    sortedDataByGrainType.value.reduce(
      (acc, { [columnKey]: value }) => acc + +value,
      0
    )
  );
}

const totalHarvestedArea = ref(0);
const totalYield = ref(0);
const totalVolume = ref(0);

watch(props.activeScenarioScalar, async () => {
  // request the data for the current scenario
  sortedDataByGrainType.value = await useSortedData({
    oblastScales: oblastSliderPercentages.value,
    grainType: props.activeGrainType
  });

  // compute the totals based on the new data
  totalHarvestedArea.value = computeTotal("harvestedArea");
  totalYield.value = computeTotal("grainYield");
  totalVolume.value = computeTotal("volume");
}, { immediate: true });

// a function to return the percentage for a given oblast
// get the percentage for a given oblast
function getOblastPercentage(oblastName) {
  const sliderScalar = oblastSliderPercentages.value[oblastName];
  const scalar = sliderScalar >= 0 ? sliderScalar : 1;
  return (scalar * 100).toFixed();
}

</script>
