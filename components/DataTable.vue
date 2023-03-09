<template>
  <div>
    <table id="data-table" class="f7 collapse pa1 monospace">
      <thead>
        <tr class="tl">
          <th>Oblast</th>
          <th class="br1 ph1" style="background-color: #146e37; color: white">
            Harvested Area
          </th>
          <!-- <th>Yield</th> -->
          <!-- <th>Volume</th> -->
          <th class="tc">Forecast</th>
        </tr>
      </thead>
      <tbody v-if="active" class="w-100 bg-white">
        <!-- use a transition-group instead for move animation -->
        <!-- set animating to true when the transition starts -->
        <!-- set animating to false when the transition ends -->
        <TransitionGroup
          name="slide-fade"
          @enter="setAnimating(true)"
          @leave="setAnimating(false)"
        >
          <tr
            v-for="oblast in activeData"
            :key="oblast.oblastNameNormalized"
            @mouseover="handleOblastHover(oblast)"
            @mouseout="handleOblastHover(null)"
            :class="{
              'stripe-dark': true,
              black: isOblastFocused(oblast.oblastNameNormalized),
              'dark-gray': !isOblastFocused(oblast.oblastNameNormalized),
            }"
          >
            <td class="w-30 ph1 ttc lh-copy">
              {{ oblast.oblastNameNormalized }}
              <span class="o-50 f7 dn dib-l">
                {{ oblast.oblastNameUkrainian }}</span
              >
            </td>
            <td class="w-10">{{ numberFormat(oblast.harvestedArea * 100) }}</td>
            <!-- <td class=" w-10">{{ oblast.grainYield }}</td> -->
            <!-- <td class=" w-10 ba b--blue">{{ oblast.volume }}</td> -->
            <td class="tl">
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
                <span class="w3 tc br1 f6">
                  {{ getOblastPercentage(oblast.oblastNameNormalized) }}%
                </span>
              </div>
            </td>
          </tr>
        </TransitionGroup>
      </tbody>

      <tfoot>
        <tr class="bg-gray white f4-l b">
          <td>Total Harvested:</td>
          <td class="">{{ numberFormat(active.totalHarvestedArea * 100) }}kg</td>
          <!-- <td>{{ numberFormat(totalYield) }}</td> -->
          <!-- <td>{{ numberFormat(totalVolume) }}</td> -->
        </tr>
      </tfoot>
    </table>
  </div>
</template>
<script setup>
import { format } from "d3";
import { normalizeOblastName } from "~~/helpers";
// import { debounce } from "lodash";

const animating = ref(false); // will help us not overwrite focus when animating the transition

const active = useActiveData();

// we expect a scenario object to be passed in via props
// what is the difference between scenario and oblastSliderPercentages?

// scenario is a broader thing that describes the scenario
// oblastSliderPercentages is a more specific thing that describes the oblasts
const props = defineProps({
  oblastScales: {
    type: Object,
    required: true,
    default: {},
  },
  focusedOblastName: {
    type: String,
  },
  activeData: {
    type: Array,
    required: true,
  },
});

function setAnimating(value) {
  console.log("set animating", value);
  animating.value = value;
}

const emit = defineEmits(["sliderChange", "setFocusedOblast"]);

// function handleOblastHover(oblast) {
//   // don't bubble hovers when animating
//   if (animating.value) return console.error("not hovering, we are animating");
//   // console.log('data table hover', oblast)
//   // get the normalized oblast name from the oblast object
//   if (!oblast) return;
//   const oblastName = oblast.oblastNameNormalized;

//   // emit the oblast name to the parent component
//   emit("setFocusedOblast", oblastName);
// }

// refactor to add debounce of 100ms
// const handleOblastHover = debounce((oblast) => {
//   // don't bubble hovers when animating
//   if (animating.value) return console.error("not hovering, we are animating");
//   // console.log('data table hover', oblast)
//   // get the normalized oblast name from the oblast object
//   if (!oblast) return;
//   const oblastName = oblast.oblastNameNormalized;

//   // emit the oblast name to the parent component
//   emit("setFocusedOblast", oblastName);
// }, 100);

// write our own custom debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// apply debounce to handleOblastHover
const handleOblastHover = debounce((oblast) => {
  // don't bubble hovers when animating
  if (animating.value) return console.error("not hovering, we are animating");
  // console.log('data table hover', oblast)
  // get the normalized oblast name from the oblast object
  if (!oblast) return;
  const oblastName = oblast.oblastNameNormalized;

  // emit the oblast name to the parent component
  emit("setFocusedOblast", oblastName);
}, 120);

function isOblastFocused(oblastName) {
  return oblastName === props.focusedOblastName;
}

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
  transition: transform 1.2s cubic-bezier(0.45, 0, 0.55, 1);
  pointer-events: none;
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
