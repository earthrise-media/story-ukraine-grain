<template>
  <div class="scrollytelling-container" ref="scrollytellingContainer">
    <div class="step-container w-two-thirds fixed top-0 right-0" ref="stepContainer">
      <h3 class="w-100">Step: {{ stepIndex }}</h3>
      <!-- <pre class="bw4 ba b--red h5">active? {{active}}</pre> -->
      <UkraineOblastMap v-if="active" class="" ref="oblastMap" :config="oblastMapConfig"
        :activeDataByOblast="active.activeDataByOblast" :activeGrainType="activeGrainType" :width="graphicWidth"
        :valueKey="oblastMapConfig.valueKey" :style="{
          // opacity: mapOpacity,
          //opacity: oblastMapConfig.visibility ? mapOpacity : 0,
        }" />

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

    <div class="text-container relative">
      <h2 class="f-headline lh-title mt0 mb3 pa4">
        <p>Ukraine's grain farming in the midst of the conflict with Russia</p>
      </h2>

      <p :class="paragraphClasses">
        <span class="bg-white">
          Ukraine's agricultural exports in 2022 totaled <br />
          <a href="https://www.fas.usda.gov/sites/default/files/2022-04/Ukraine-Factsheet-April2022.pdf"
            class="link black tc w-20 dib"><span class="">{{ numberFormat(animatedExportNumber) }}</span></a>
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
          Since the start of the war in 2014, it's estimated that TK Ukrainian soldiers have been killed, and TK
          civilians have been displaced.
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="bg-white">
          The war has taken a significant toll on the country's infrastructure, particularly in the eastern areas most
          affected
          by the conflict, where farming infrastructure has been destroyed.
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="bg-white">
          The exact impact
          of the war on grain production isn't possible to quantify, as the
          ability to collect data has been severely limited by the conflict.
        </span>
      </p>

      <!-- introduce oblast map -->
      <p :class="paragraphClasses">
        <span class="bg-white">
          Ukraine's agricultural data is organized by Oblasts, which are like states. Here is a map of Ukraine's
          Oblasts.
        </span>
      </p>

      <!-- introduce oblast map with choropleth -->
      <p :class="paragraphClasses">
        <span class="bg-white">
          We can use this map to visualize the impact of the war on grain production in Ukraine.
        </span>
      </p>

      <p :class="paragraphClasses">
        <span class="bg-white">
          This map shows total grain production in Ukraine by Oblast before the war started. The more red, the more
          grain production.
        </span>
      </p>


      <p :class="paragraphClasses">
        <span class="bg-white">
          Using our forecasting tool, we can explore different scenarios and how they might impact grain
          production in Ukraine in the future.
        </span>
      </p>

      <!-- introduce the default small and high impact scenarios, before we open it up to the user to have complete control -->
      <p :class="paragraphClasses">
        <span class="bg-white">
          To get started, take a look at the two scenarios below. The first is a small impact scenario, and the second
          is a high impact scenario.
        </span>
      </p>

      <p class="pa2 overflow-y-auto br1 mt2 bg-white-o-40">
        <DataTable :activeData="active.activeData" :oblastScales="scenario.oblastScales"
          :totalHarvestedArea="active.totalHarvestedArea" :totalYield="active.totalYield"
          :totalVolume="active.totalVolume" class="w-100 bt b--light-gray mt2 fl" @sliderChange="handleSliderChange" />
      </p>


      <!-- small impact -->
      <p :class="paragraphClasses">
        <span class="bg-white">
          The small impact scenario predicts that grain production will only be effected by about 15% from normal levels
          in 2022. This results in a deficit of <strong>TK million tons</strong> of grain, or TK% of Ukraine's total
          grain production.
        </span>
      </p>

      <!-- high impact -->
      <p :class="paragraphClasses">
        <span class="bg-white">
          The high impact scenario predicts that grain production will be effected by as much as 50% from normal levels
          in 2022. This results in a deficit of <strong>TK million tons</strong> of grain, or <strong>TK%</strong> of
          Ukraine's total grain production.
        </span>
      </p>

      <!-- introduce the slider and allow the user to make their own predictions -->
      <p :class="paragraphClasses">
        <span class="bg-white">
          Now it's your turn to make your own predictions. Use the slider below to simulate different scenarios and see
          how they might impact grain production in Ukraine in the future.
        </span>
      </p>

      <h2 class="f-subheadline pa2 pa5-ns">
        Who is affected downstream?
      </h2>

      <p :class="paragraphClasses">
        <span class="bg-white">
          Where does Ukraine's grain usually end up? In a normal trade year, the bulk of
          Ukraine's exports go to African and Southeast Asian countries.
        </span>
      </p>

      <!-- introduce small/large impact scenarios that will be shown on Sankey chart -->
      <p :class="paragraphClasses">
        <span class="bg-white">
          Let's take a look at how the small and high impact scenarios we explored earlier might impact the
          countries that import Ukraine's grain.
        </span>
      </p>

      <!-- small impact -->
      <p :class="paragraphClasses">
        <span class="bg-white">
          The small impact scenario predicts that grain production will only be effected by about 15% from normal levels
          in 2022. This results in a deficit of <strong>TK million tons</strong> of grain, or TK% of Ukraine's total
          grain production.
        </span>
      </p>

      <!-- high impact -->
      <p :class="paragraphClasses">
        <span class="bg-white">
          The high impact scenario predicts that grain production will be effected by as much as 50% from normal levels
          in 2022. This results in a deficit of <strong>TK million tons</strong> of grain, or <strong>TK%</strong> of
          Ukraine's total grain production.
        </span>
      </p>

      <!-- introduce the slider and allow the user to make their own predictions -->
      <p :class="paragraphClasses">
        <span class="bg-white">
          Now it's your turn to make your own predictions. Use the slider below to simulate different scenarios and see
          how they might impact grain production in Ukraine in the future.
        </span>
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
const paragraphClasses = "pa4 measure f2 lh-copy w-50  ml2 ml5-ns";

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
// const graphicWidth = 900;

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
    .onStepExit((response) => { });

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

.bg-white-o-20 {
  background-color: rgba(255, 255, 255, 0.2);
}

.bg-white-o-40 {
  background-color: rgba(255, 255, 255, 0.4);
}
</style>
