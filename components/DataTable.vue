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
    <tbody v-if="activeData">
      <tr
        v-for="oblast in activeData"
        :key="oblast.oblastNameNormalized"
      >
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
                emitSliderEvent(oblast.oblastNameNormalized, $event.target.value)
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
  emit("sliderChange", { oblastName, percentage } );

// a function to return the percentage for a given oblast
// get the percentage for a given oblast
function getOblastPercentage(oblastName) {
  const sliderScalar = props.oblastScales[oblastName];
  const scalar = sliderScalar >= 0 ? sliderScalar : 1;
  return (scalar * 100).toFixed();
}

const numberFormat = format(",.0f");

</script>
