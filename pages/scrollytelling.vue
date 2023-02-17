<template>
  <div class="scrollytelling-container" ref="scrollytellingContainer">
    <div class="step-container w-100 fixed top-0 right-0" ref="stepContainer">
      <!-- <div id="step-0-graphic" v-if="stepIndex === 0">
        <h2>World grain producer breakdown</h2>
      </div> -->
      <h3 class="w-100">Step: {{ stepIndex }}</h3>
      <!-- <pre class="bw4 ba b--red h5">active? {{active}}</pre> -->
      <UkraineOblastMap
        v-if="active"
        class="fixed top-0 right-0"
        ref="oblastMap"
        :config="oblastMapConfig"
        :activeDataByOblast="active.activeDataByOblast"
        :activeGrainType="activeGrainType"
        :width="graphicWidth"
        :valueKey="oblastMapConfig.valueKey"
        :style="{
          // opacity: mapOpacity,
          //opacity: oblastMapConfig.visibility ? mapOpacity : 0,
        }"
      />

      <!-- <BarChart
        v-if="barChartConfig.visibility"
        ref="barChart"
        :config="barChartConfig"
        :scenario="scenario"
        :oblastData="oblastData"
        :width="graphicWidth"
      /> -->

      <!-- <SankeyChart
        v-if="sankeyConfig.visibility"
        ref="sankeyChart"
        class="fixed top-0 right-0"
        :config="sankeyConfig"
        :importExportData="importExportData"
        :width="graphicWidth"
        :stepIndex="stepIndex"
      /> -->
    </div>

    <div class="text-container w-50 center relative">
      <h2 class="f2 f1-l lh-title mt0 mb3 pa4">
        <p>Ukraine's grain farming in the midst of the conflict with Russia</p>
      </h2>

      <p :class="paragraphClasses">
        <span class="bg-white">
          Ukraine's agricultural exports in 2022 totaled <br />
          <a
            href="https://www.fas.usda.gov/sites/default/files/2022-04/Ukraine-Factsheet-April2022.pdf"
            class="link black tc w-20 dib"
            ><span class="">{{ numberFormat(animatedExportNumber) }}</span></a
          >
          billion, making up 41% of the country's total exports.
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="bg-white">
          Ukraine is the world's top global producer of Sunflower, #2 global
          producer of Sunflower Oil and Sunflower Meal, and the #7 producer of
          Wheat.
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="bg-white">
          But in the midst of the conflict with Russia, how is Ukraine's grain
          farming being impacted? Let's take a look.
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="bg-white">
          Most of Ukraine's grain is grown in the Oblasts. Here is a breakdown
          of where different grains are grown in Ukraine, as a percentage of the
          country's total grain production: Wheat: TK% Barley: TK% Millet: TK%
          Rye: TK% Oats: TK%
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="bg-white">
          Where does Ukraine's grain end up? In a normal trade year, the bulk of
          Ukraine's exports go to African and Southeast Asian countries. About
          TK% of Ukraine's total exports go to Pakistan, followed by Sudan (TK%)
          and Egypt (TK%).
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="bg-white">
          But what is happening to Ukraine's grain farming now, in the midst of
          the conflict? Russian missile strikes have recently been reported in
          Ukraine, and some are landing in areas where grain is grown.
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="bg-white">
          Unfortunately, the current situation makes it difficult to know the
          exact impact on Ukraine's grain production, but our forecast and
          scenario tool can help us explore different possibilities.
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="bg-white">
          Let's look at three different scenarios: a small impact on grain
          production, a medium impact, and a large impact. In the small impact
          scenario, exports will remain virtually unchanged from their
          pre-conflict levels.
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="bg-white">
          However, if we switch to the large impact scenario, exports drop by a
          whopping TK%, with the majority of the losses being felt by TK, TK,
          and the TK.
        </span>        
      </p>

      <p>
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

      <p :class="paragraphClasses">
        The conflict with Russia is having a real and devastating effect on
        Ukraine's grain production, and it's important to understand the
        downstream impacts. Our tool allows users to explore the potential
        impacts of different scenarios on grain production, opening up more
        possibilities for analysis
      </p>
    </div>
  </div>
</template>
<script setup>
import * as d3 from "d3";
import scrollama from "scrollama";
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
const paragraphClasses = "pa4 measure f2 lh-copy";

// USE COMPOSABLES FOR GLOBAL STATE AND PASS TO COMPONENTS


// TODO: SOMETHING WEIRD HERE, NOT GETTING DATA
const active = useActiveData()




// console.log('global data in scrollytelling:', active)
const { activeGrainType, setActiveGrainType } = useActiveGrainType();
// const DEFAULT_GRAIN_TYPE = "10 пшенЯР-Table 1";
const DEFAULT_GRAIN_TYPE = "12 кукур-Table 1";
setActiveGrainType(DEFAULT_GRAIN_TYPE)
// can also use: "12 кукур-Table 1"

const { scenario, setOblastScale, setScenario } = useCurrentScenario()
const handleSliderChange = ({ oblastName, percentage }) => {
  const scale = +percentage / 100;
  setOblastScale({ oblastName, scale })
}
setOblastScale({ oblastName: 'kharkiv', scale: 0.39 }) // test whether oblast scales are working


// on mounted, after 2 seconds, set oblastScale for kiev
// use to debug whether user-set scales are working or not
// onMounted(() => {
//   setTimeout(() => {
//     setOblastScale({ oblastName: 'kiev', scale: 0.44 })
//     console.log(scenario.value.oblastScales, 'oblastScales')
//   }, 500)
// })

// do we need to probably maybe watch scenario?


// use setScenario to apply these
const scenarioButtons = [
  { name: "Small Impact", scale: 0.5, oblastScales: {} },
  { name: "Medium Impact", scale: 0.75, oblastScales: {} },
  { name: "Large Impact", scale: 0.9, oblastScales: {} },
];
// setScenario(scenarioButtons[1]) // this helps us see whether the scenario buttons are going through 

// console.log('ALL DATA IN SCROLLYTELLING', {
//   // activeGrainType,
//   scenario,
//   oblastScales: scenario.value.oblastScales,
//   // active,
//   // activeData: active.activeData,
// })

const oblastMapConfig = ref({
  visibility: true, // true = show, false = hide
  valueKey: "harvestedArea",
});

const sankeyConfig = ref({
  visibility: true, // true = show, false = hide
});

// const barChartConfig = ref({
//   visibility: false, // true = show, false = hide
//   xProperty: "oblastNameUkrainian",
//   yProperty: "harvestedArea",
// });

// create a computed to smoothly fade in the map opacity from 0 to 1 between step 3 and 4 and hide the map before step 3
const mapOpacity = computed(() => {
  if (stepIndex.value < 3) {
    return 0;
  } else if (stepIndex.value === 3) {
    return stepProgress.value;
  } else if (stepIndex.value === 4) {
    return 1;
  } else if (stepIndex.value > 4) {
    return 1;
  } else {
    return 0;
  }
});

// const graphicWidth = computed(() => {
//   // if the stepContainer ref exists, use its width
//   // otherwise default to 500
//   return stepContainer.value ? stepContainer.value.offsetWidth : 900;
// });
const graphicWidth = 900;

// watch for changes to stepIndex when a user scrolls
watch(
  stepIndex,
  (newIndex) => {
    if (newIndex === 0) {
      // oblastMapConfig.value.visibility = true;
      sankeyConfig.value.visibility = true;
      oblastMapConfig.value.visibility = false;
    } else if (newIndex === 1) {
      sankeyConfig.value.visibility = true;
      oblastMapConfig.value.visibility = false;
      // use anime.js to animate the animatedExportNumber to 27.8
      anime({
        targets: animatedExportNumber,
        value: 27.8,
        round: 2,
        easing: "easeInOutQuad",
        duration: 2200,
      });
    } else if (newIndex === 4) {
      sankeyConfig.value.visibility = false;
      oblastMapConfig.value.visibility = true;
    }
  },
  { immediate: true }
);

onMounted(() => {
  // set up scrollama
  const scroller = scrollama();

  // setup the instance, pass callback functions
  scroller
    .setup({
      step: ".text-container p",
      offset: 0.7,
      progress: true,
      // debug: true,
    })
    .onStepEnter((response) => {
      // response = { element, direction, index }
      stepIndex.value = response.index;
    })
    .onStepProgress((response) => {
      stepProgress.value = response.progress;
    })
    .onStepExit((response) => {});

  // load our import/export data from public/data/comtrade_imports/00_all_data_ukraine.csv as parse with d3.csvParse
  fetch("/data/comtrade_imports/00_all_data_ukraine.csv")
    .then((response) => response.text())
    .then((data) => {
      importExportData.value = d3.csvParse(data);
    });
});
</script>
<style scoped>
.text-container p {
  /* margin-top: 33vh; */
  margin-bottom: 55vh;
  min-height: 44vh;
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
</style>
