<template>
  <div class="scrollytelling-container" ref="scrollytellingContainer">
    <div
      class="step-container w-two-thirds fixed top-0 right-0 z-2"
      ref="stepContainer"
    >
      <h3 class="w-100">Step: {{ stepIndex }}</h3>


      <div
        id="step-graphics"
        ref="stepGraphics"
        class="fixed top-0 right-0 w-100 vh-100 z-0"
      >

      <div
          v-if="stepIndex < 2"
          id="step-graphic-0"
          class="step-graphic-container"
          step="0"
          :style="{
            opacity: 0.75,
            backgroundImage: 'url(images/intro-satellite-animation.gif)'
          }"
        >
        </div>

        <div
          v-if="stepIndex >= 2 && stepIndex < 5"
          id="step-graphic-0"
          class="step-graphic-container"
          step="0"
          :style="{
            opacity: 0.75,
            backgroundRepeat: 'no-repeat',
            backgroundImage: 'url(images/nasa_landsat_ukraine_plnt_2022_lrg.jpg)'
          }"
        >
        </div>

        <div
          v-if="stepIndex >= 12 && stepIndex < 13"
          id="step-graphic-12"
          class="step-graphic-container"
          step="0"
          :style="{
            opacity: 0.75,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundImage: 'url(images/ukraine-placement-map.png)'
          }"
        >
        </div>



        <!-- <div
          id="step-graphic-3"
          class="step-graphic-container"
          step="3"
          :style="{
            opacity: 0,
          }"
        >
          <img src="https://source.unsplash.com/random" />
        </div> -->
      </div>

      <!-- <pre class="bw4 ba b--red h5">active? {{active}}</pre> -->
      <UkraineOblastMap
        v-if="active && (stepIndex >= 5 && stepIndex < 12)"
        class="z-2"
        ref="oblastMap"
        :config="oblastMapConfig"
        :activeDataByOblast="active.activeDataByOblast"
        :activeGrainType="activeGrainType"
        :width="graphicWidth"
        :valueKey="oblastMapConfig.valueKey"
        :style="{
          // opacity: mapOpacity,
          opacity: oblastMapConfig.visibility ? mapOpacity : 0,
        }"
      />

      <BarChart
        v-if="barChartConfig.visibility"
        ref="barChart"
        :config="barChartConfig"
        :scenario="scenario"
        :oblastData="oblastData"
        :width="graphicWidth"
      />

      <SankeyChart
        v-if="/*sankeyConfig.visibility*/ true"
        ref="sankeyChart"
        class="fixed top-0 right-0"
        :config="sankeyConfig"
        :importExportData="importExportData"
        :width="graphicWidth"
        :stepIndex="stepIndex"
      />
    </div>

    <div class="text-container relative">
      <h2 class="f-headline lh-title mt0 mb3 pa4">
        <p class="">
          <span class="bg-yellow">
          Ukraine's grain farming in the midst of the conflict with Russia
        </span>
        </p>
      </h2>

      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          In 2022 Ukraine's agricultural exports totaled <br />
          <!-- <a
            href="https://www.fas.usda.gov/sites/default/files/2022-04/Ukraine-Factsheet-April2022.pdf"
            class="link black tc w-20 dib"
            ><span class="">{{ numberFormat(animatedExportNumber) }}</span></a
          > -->
          $28
          billion, making up 41% of the country's total exports.
        </span>
      </p>

      <!-- <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          Ukraine is the world's top global producer of Sunflower, #2 global
          producer of Sunflower Oil and Sunflower Meal, and the #7 producer of
          Wheat.
        </span>
      </p> -->

      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          In the midst of the conflict with Russia, how is Ukraine's grain
          farming being impacted? Let's take a look.
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          The war has taken a significant toll on the country's infrastructure,
          particularly in the eastern areas most affected by the conflict, where
          farming infrastructure has been destroyed.
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          The exact impact of the war on grain production isn't possible to
          quantify, as the ability to collect data has been severely limited by
          the conflict.
        </span>
      </p>

      <!-- introduce oblast map -->
      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          Ukraine's agricultural data is organized by Oblasts, which are like
          states. Here is a map of Ukraine's Oblasts.
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          This map shows Ukraine's total grain production in 2021 by Oblast before the
          war started. The more yellow, the more grain production was produced there. 
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          Using our forecasting tool, we can explore different scenarios and how
          they might impact grain production in Ukraine in the future.
        </span>
      </p>

      <!-- small impact -->
      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          The small impact scenario predicts that grain production will only be
          effected by about <a href="https://hub.conflictobservatory.org/portal/apps/sites/#/home/pages/grain-1" class="black link underline b">15%</a> from normal levels in 2022. This results in a
          deficit of <strong>TK million tons</strong> of grain, or TK% of
          Ukraine's total grain production.
        </span>
      </p>

      <!-- high impact -->
      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          The high impact scenario predicts that grain production will be
          effected by as much as 50% from normal levels in 2022. This results in
          a deficit of <strong>TK million tons</strong> of grain, or
          <strong>TK%</strong> of Ukraine's total grain production.
        </span>
      </p>

      <!-- introduce the slider and allow the user to make their own predictions -->
      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          Now it's your turn to make your own predictions. Use the slider below
          to simulate different scenarios and see how they might impact grain
          production in Ukraine in the future.
        </span>
      </p>

      <p class="pa2 overflow-y-auto br1 mt2 pa1 bg-white-o-40">

        <!-- make a button to set all oblasts to 15% -->
        <button
          class="f6 link dim br1 ph3 pv2 mb2 dib white bg-dark-blue"
          @click="setAllOblastOutput(0.15)"
        >
          Set all Oblasts to 15%
        </button>

        <DataTable
          :activeData="active.activeData"
          :oblastScales="scenario.oblastScales"
          :totalHarvestedArea="active.totalHarvestedArea"
          :totalYield="active.totalYield"
          :totalVolume="active.totalVolume"
          class="w-100 bt b--light-gray mt2 fl"
          @sliderChange="handleSliderChange"
        />
      </p>

      <h2 class="f-subheadline pa2 pa5-ns">Who is affected downstream?</h2>

      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          Where does Ukraine's grain usually end up? In a normal trade year, the
          bulk of Ukraine's exports go to African and Southeast Asian countries.
        </span>
      </p>

      <!-- introduce small/large impact scenarios that will be shown on Sankey chart -->
      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          Let's take a look at how the small and high impact scenarios we
          explored earlier might impact the countries that import Ukraine's
          grain.
        </span>
      </p>

      <!-- small impact -->
      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          The small impact scenario predicts that grain production will only be
          effected by about 15% from normal levels in 2022. This results in a
          deficit of <strong>TK million tons</strong> of grain, or TK% of
          Ukraine's total grain production.
        </span>
      </p>

      <!-- high impact -->
      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          The high impact scenario predicts that grain production will be
          effected by as much as 50% from normal levels in 2022. This results in
          a deficit of <strong>TK million tons</strong> of grain, or
          <strong>TK%</strong> of Ukraine's total grain production.
        </span>
      </p>

      <!-- introduce the slider and allow the user to make their own predictions -->
      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          Now it's your turn to make your own predictions. Use the slider below
          to simulate different scenarios and see how they might impact grain
          production in Ukraine in the future.
        </span>
      </p>
    </div>
  </div>
</template>
<script setup>
import * as d3 from "d3";
import scrollama from "scrollama";
import { normalizeOblastName } from '@/helpers'
// import anime.js
import anime from "animejs/lib/anime.es.js";

const stepContainer = ref(null); // the html element for the container

// we will fill these later with our data
const importExportData = ref([]);

const animatedExportNumber = ref(0); // this will animate up to 27.8

const stepIndex = ref(0); // keep track of the index
const stepProgress = ref(0); // keep track of the progress within a step
// const pageProgress = ref(0) // keep track of the total page progress

// create a d3 number format to always show 1 decimal place
const numberFormat = d3.format(",.1f");

// the tachyons classes we will use for the paragraphs
const paragraphClasses = "pa4 f2 lh-copy measure w-80 center ml2 ml5-ns";

const active = useActiveData();

const { activeGrainType, setActiveGrainType } = useActiveGrainType();
// const DEFAULT_GRAIN_TYPE = "10 пшенЯР-Table 1";
const DEFAULT_GRAIN_TYPE = "12 кукур-Table 1";
setActiveGrainType(DEFAULT_GRAIN_TYPE);
// can also use: "12 кукур-Table 1"

const { scenario, setOblastScale, setScenario } = useCurrentScenario();
const handleSliderChange = ({ oblastName, percentage }) => {
  const scale = +percentage / 100;
  setOblastScale({ oblastName, scale });
};
// use setScenario to apply these
// const scenarioButtons = [
//   { name: "Small Impact", scale: 0.5, oblastScales: {} },
//   { name: "Medium Impact", scale: 0.75, oblastScales: {} },
//   { name: "Large Impact", scale: 0.9, oblastScales: {} },
// ];
// setScenario(scenarioButtons[1]) // this helps us see whether the scenario buttons are going through

function setAllOblastOutput(percentage) {
  console.log({percentage})
  // first we need to get a list of the available oblast names
  if(!active) return;
  console.log(active.value.activeData)
  if(!active.value.activeData) return;
  const oblastNames = active.value.activeData.map((d) => normalizeOblastName(d.oblastNameUkrainian));

  console.log(oblastNames)

  // then we can loop through them and set the scale for each
  oblastNames.forEach((oblastName) => {
    const scale = +percentage / 100;
    setOblastScale({ oblastName, scale });
  });
}

const oblastMapConfig = ref({
  visibility: false, // true = show, false = hide
  valueKey: "harvestedArea",
});

const sankeyConfig = ref({
  visibility: false, // true = show, false = hide
});

const barChartConfig = ref({
  visibility: false, // true = show, false = hide
  xProperty: "oblastNameUkrainian",
  yProperty: "harvestedArea",
});

// create a computed to smoothly fade in the map opacity from 0 to 1 between step 3 and 4 and hide the map before step 3
// const mapOpacity = computed(() => {
//   if (stepIndex.value < 3) {
//     return 0;
//   } else if (stepIndex.value === 3) {
//     return stepProgress.value;
//   } else if (stepIndex.value === 4) {
//     return 1;
//   } else if (stepIndex.value > 4) {
//     return 1;
//   } else {
//     return 0;
//   }
// });

const graphicWidth = computed(() => {
  // if the stepContainer ref exists, use its width
  // otherwise default to 500
  return stepContainer.value ? stepContainer.value.offsetWidth : 900;
});
// const graphicWidth = 900;

function resetVisualVisibility() {
  oblastMapConfig.value.visibility = false;
  sankeyConfig.value.visibility = false;
  barChartConfig.value.visibility = false;
}


// watch for changes to stepIndex when a user scrolls
watch(
  stepIndex,
  (newIndex) => {
    // look for a relevant step graphic in step graphics, and if it exists, make it visible
    // const stepGraphics = document ? document.querySelectorAll(".step__graphic") : []
    // use refs to get the step graphics
    // stepGraphics.forEach((graphic) => {
    //   if (graphic.dataset.step === newIndex.toString()) {
    //     graphic.classList.remove("hidden");
    //   } else {
    //     graphic.classList.add("hidden");
    //   }
    // });



    // if the step is 3, make step-graphic-3 visible with anime
    // if (newIndex === 3) {
    //   anime({
    //     targets: ".step-graphic-3",
    //     opacity: [0, 1],
    //     duration: 1000,
    //     easing: "easeInOutQuad",
    //   });
    // }

    // if(newIndex < 4) {
    //   d3.select('#step-graphic-0').classed('hidden', false)
    // } else {
    //   d3.select('#step-graphic-0').classed('hidden', true)
    // }

    if (newIndex === 0) {
      oblastMapConfig.value.visibility = false;
      sankeyConfig.value.visibility = true;
      oblastMapConfig.value.visibility = false;
    } else if (newIndex === 1) {
      // sankeyConfig.value.visibility = true;
      // oblastMapConfig.value.visibility = false;
      // use anime.js to animate the animatedExportNumber to 27.8
      anime({
        targets: animatedExportNumber,
        value: 27.8,
        round: 2,
        easing: "linear",
        duration: 4200,
      });
    } else if (newIndex === 4) {
      // sankeyConfig.value.visibility = false;
      // oblastMapConfig.value.visibility = true;
      
    }



    // the map is visible on all steps after 7
    if (newIndex >= 5) {
      oblastMapConfig.value.visibility = true;
    } else {
      oblastMapConfig.value.visibility = false;
    }

    // the sankey is visible all steps after 17
    if (newIndex >= 17) {
      sankeyConfig.value.visibility = true;
    } else {
      sankeyConfig.value.visibility = false;
    }
  },
  { immediate: true }
);

onMounted(() => {
  // set up scrollama
  const scroller = scrollama();

  // set the visibility of al the visual forms to false
  oblastMapConfig.value.visibility = false;
      sankeyConfig.value.visibility = false;
      oblastMapConfig.value.visibility = false;

  // set every step style to opacity 0
  // d3.selectAll(".text-container p").style("opacity", 0);

  // setup the instance, pass callback functions
  scroller
    .setup({
      step: ".text-container p",
      offset: 0.55,
      progress: true,
      // debug: true,
    })
    .onStepEnter((response) => {
      // response = { element, direction, index }
      stepIndex.value = response.index;

      // use anime to animate the element when we enter a new step
      // anime({
      //   targets: response.element,
      //   opacity: [0, 1],
      //   easing: "easeInOutQuad",
      //   duration: 1000,
      // });
    })
    .onStepProgress((response) => {
      stepProgress.value = response.progress;
    })
    .onStepExit((response) => {
      // use anime to animate the element out
      // anime({
      //   targets: response.element,
      //   opacity: [1, 0],
      //   easing: "easeInOutQuad",
      //   duration: 1000,
      // });
    });

  // load our import/export data from public/data/comtrade_imports/00_all_data_ukraine.csv as parse with d3.csvParse
  fetch("/data/comtrade_imports/00_all_data_ukraine.csv")
    .then((response) => response.text())
    .then((data) => {
      importExportData.value = d3.csvParse(data);
    });
});
</script>
<style scoped>

.step-graphic-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  pointer-events: none;
  background-position: center center;
  /* background-repeat: no-repeat; */
  background-size: contain;
}

.hidden {
  display: none;
}

.text-container p {
  /* margin-top: 33vh; */
  margin-bottom: 50vh;
  min-height: 40vh;
}

h2 {
  margin-top: 25vh;
  margin-bottom: 55vh;
}

.step-container {
  z-index: 1;
  height: 100vh;
}

.text-container {
  z-index: 10;
  /* pointer-events: none; */
}

.text-container p {

}

.bg-white-o-20 {
  background-color: rgba(255, 255, 255, 0.2);
}

.bg-white-o-40 {
  background-color: rgba(255, 255, 255, 0.4);
}
</style>
