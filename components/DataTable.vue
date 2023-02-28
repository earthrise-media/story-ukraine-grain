<template>
  <table id="data-table" class="pa4 f6">
    <thead>
      <tr class="tl">
        <th>Oblast</th>
        <th class="br1 ph1" style="background-color: #ffc500">
          Harvested Area
        </th>
        <th>Yield</th>
        <th>Volume</th>
        <th class="tc">Forecast</th>
      </tr>
    </thead>
    <!-- <tbody v-if="activeData" class="w-100"> -->
    <!-- use a transition-group instead for move animation -->
    <TransitionGroup name="slide-fade" tag="tbody" class="w-100">
      <tr v-for="oblast in activeData" :key="oblast.oblastNameNormalized">
        <td class="bg-white w-30">{{ oblast.oblastNameNormalized }}</td>
        <td class="bg-white w-10">{{ oblast.harvestedArea }}</td>
        <td class="bg-white w-10">{{ oblast.grainYield }}</td>
        <td class="bg-white w-10">{{ oblast.volume }}</td>
        <td class="tl w-40">
          <div class="slider-cell">
            <input
              type="range"
              min="0"
              max="125"
              class="slider w-two-thirds"
              @change="
                emitSliderEvent(
                  oblast.oblastNameNormalized,
                  $event.target.value
                )
              "
              :value="getOblastPercentage(oblast.oblastNameNormalized)"
              :id="`range-${oblast.oblastNameNormalized}`"
            />
            <span class="bg-white w3 tc br1">
              {{ getOblastPercentage(oblast.oblastNameNormalized) }}%
            </span>
          </div>
        </td>
      </tr>
      <!-- </tbody> -->
    </TransitionGroup>

    <tfoot>
      <tr class="bg-gray white f3 b">
        <td>Total</td>
        <td>{{ numberFormat(totalHarvestedArea) }}</td>
        <td>{{ numberFormat(totalYield) }}</td>
        <td>{{ numberFormat(totalVolume) }}</td>
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
  // map of normalized oblast name to scalar value
  activeData: {
    type: Object,
    required: true,
    default: [],
  },
  oblastScales: {
    type: Object,
    required: true,
    default: {},
  },
  totalHarvestedArea: {
    type: Number,
    required: true,
  },
  totalYield: {
    type: Number,
    required: true,
  },
  totalVolume: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["sliderChange"]);

const emitSliderEvent = (oblastName, percentage) =>
  emit("sliderChange", { oblastName, percentage });

// a function to return the percentage for a given oblast
// get the percentage for a given oblast
function getOblastPercentage(oblastName) {
  const sliderScalar = props.oblastScales[oblastName];
  const scalar = sliderScalar >= 0 ? sliderScalar : 1;
  return (scalar * 100).toFixed();
}

const numberFormat = format(",.0f");
</script>
<style>
/* make move and fade transition animations for 'slide-fade' */
.slide-fade-move {
  transition: transform 2s;
}

/* make the table responsive */
#data-table {
  display: block;
  overflow-x: auto;
  white-space: nowrap;
}

/* make the slider cell responsive */
.slider-cell {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
