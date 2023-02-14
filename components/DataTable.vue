<template>
  <table id="data-table">
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
  "sortedDataByGrainType",
  "scenario"
]);
const emit = defineEmits(["sliderChange"]);

const emitSliderValues = () => emit("sliderChange", oblastSliderPercentages.value)

onMounted(() => emitSliderValues())

const numberFormat = d3.format(",.0f");

const userSetSliderPercentages = ref({});

const oblastSliderPercentages = computed(() =>
  Object.assign(props.scenario, userSetSliderPercentages.value)
)

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
  const sliderScalar = oblastSliderPercentages.value[oblastName];
  const scalar = sliderScalar >= 0 ? sliderScalar : 1;
  return (scalar * 100).toFixed();
}

function setOblastScale(percentage, oblastName) {
  // convert to a scalar before storing in the map of user-set values
  userSetSliderPercentages.value[oblastName] = (+percentage) / 100;
  // merge scenario and user set sliders
  emitSliderValues();
}

</script>
