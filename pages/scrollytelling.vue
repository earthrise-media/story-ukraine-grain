<template>
  <div class="scrollytelling-container" ref="scrollytellingContainer">
    <!-- <h3 class="w-100 fixed top-0 z-3">Step: {{ stepIndex }}</h3> -->

    <div class="step-container w-100 w-two-thirds-ns vh-100 fixed top-0 right-0 z-2" ref="stepContainer">
      <div id="step-graphics" ref="stepGraphics" class="fixed top-0 right-0 w-100 vh-100 z-0">
        <TransitionGroup name="fade" mode="out-in">
          <!-- <div v-show="stepIndex < 1" id="step-graphic-0" :key="0" class="step-graphic-container" step="0" :style="{
            backgroundImage: 'url(images/intro-satellite-animation.gif)',
          }"></div> -->

          <!-- We are going to replace the first graphic with a looping video from public/intro-video.mp4 -->
          <!-- <div v-show="stepIndex < 1" id="step-graphic-0" :key="0" class="step-graphic-container" step="0">
            <video autoplay loop muted playsinline class="w-100 h-100">
              <source src="intro-video.mp4" type="video/mp4">
            </video>
          </div> -->

          <!-- refactor to make sure the video covers the entire screen, even if it cuts the edges off a bit -->
          <!-- <div v-show="stepIndex < 1" id="step-graphic-0" :key="0" class="step-graphic-container bg-black tc" step="0">
            <video autoplay loop muted playsinline class="vh-100 items-center justify-center">
              <source src="~/assets/intro-video-hires.r5.mp4" type="video/mp4">
            </video>
          </div> -->

          <!-- 
            /* merge with above css */
.parent-element-to-video {
    position: relative; /* or absolute or fixed */
}
video {
    position: absolute;
    left: 50%; /* % of surrounding element */
    top: 50%;
    transform: translate(-50%, -50%); /* % of current element */
}

 we need to refactor to do something like this with inline styles -->
          <div v-show="stepIndex < 1" id="step-graphic-0" :key="0" class="step-graphic-container"
            style="position: relative; overflow: hidden;">
            <video autoplay loop muted playsinline class="vh-100 items-center justify-center"
              style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">
              <source src="~/assets/intro-video-hires.r5.mp4" type="video/mp4">
            </video>
          </div>



          <div v-show="stepIndex >= 1 && stepIndex < 4" :key="1" class="step-graphic-container" step="0" :style="{
            backgroundRepeat: 'no-repeat',
            backgroundImage:
              'url(images/nasa_landsat_ukraine_plnt_2022_lrg.jpg)',
          }"></div>

          <div v-show="active && stepIndex >= 4 && stepIndex < 11" :key="2" class=" f2 h5 fixed top-0 right-0">
            <UkraineOblastMap :class="['z-2 vh-90 fixed right-0', stepIndex < 10 ? 'w-100' : 'w-50-ns']" ref="oblastMap"
              id="oblast-map" :activeDataByOblast="active.activeDataByOblast" :activeGrainType="activeGrainType"
              :width="graphicWidth" :valueKey="'harvestedArea'" :focusedOblastName="focusedOblastName"
              @setFocusedOblast="setFocusedOblast($event)" />
          </div>

          <SankeyChart v-if="importExportData.length > 1" v-show="stepIndex === 11 || stepIndex === 12" ref="sankeyChart"
            :key="3" :importExportData="importExportData" class="fixed vh-100 w-100 top-0 right-0" :width="graphicWidth"
            :height="graphicHeight" :stepIndex="stepIndex" />
        </TransitionGroup>
      </div>


    </div>

    <div class="text-container relative z1">
      <div class="pt5-ns">
        <h2 class="f1 f-headline-l lh-title mt2 mb3 pa4">
          <div class="tc">
            <span class="animated-intro-header">
              Ukraine's grain farming amidst the conflict with Russia
            </span>
          </div>
        </h2>
      </div>

      <div :class="paragraphClasses">
        <span class="bg-white">
          Ukraine is one of the world's top ten wheat producing countries. In 2022 Ukraine's agricultural exports alone
          totaled $28 billion.
        </span>
      </div>



      <div :class="paragraphClasses">
        <span class="bg-white">
          How is Ukraine's grain
          farming being impacted by the conflict?
          <a href="https://earthobservatory.nasa.gov/images/150025/measuring-wars-effect-on-a-global-breadbasket">NASA's
            Earth Observatory</a>
          produced a map looking at the location of Ukraine's crops cross referenced against the areas impacted by the
          war.
        </span>
      </div>

      <div :class="paragraphClasses">
        <span class="bg-white">
          The conflict has taken a significant toll on the country's infrastructure, particularly in the eastern areas
          most affected by the conflict, where agricultural infrastructure has been destroyed.
        </span>
      </div>

      <div :class="paragraphClasses">
        <span class="bg-white">
          The exact impact of the war on grain production hasn't been quantified, as the ability to collect data has been
          severely limited, but how might the conflict be impacting Ukraine's grain production and who is going to be
          impacted downstream?
        </span>
      </div>

      <!-- introduce oblast map -->
      <div :class="paragraphClasses">
        <span class="bg-white">
          Ukraine's agricultural data is organized by oblast. Oblasts are similar to states in the US.
        </span>
      </div>

      <div :class="paragraphClasses">
        <span class="bg-white">This map shows Ukraine's total grain production by oblast before the war started in 2021.
          The more green, the more grain that was produced there.
        </span>
      </div>

      <div :class="paragraphClasses">
        <span class="bg-white">
          Using our forecasting tool, we can explore different scenarios and how
          they might impact grain production in Ukraine in the future. We use 2021 as our baseline year, 100% of normal
          production.
        </span>
      </div>

      <!-- small impact -->
      <div :class="paragraphClasses">
        <span class="bg-white">In one scenario,
          <a href="https://hub.conflictobservatory.org/portal/apps/sites/#/home/pages/grain-1"
            class="black link underline b">experts predict a ~15% reduction</a>
          from normal levels.
        </span>
      </div>

      <div :class="paragraphClasses">
        <span class="bg-white black">
          If the impact of the war continues to rise and farmers are unable to plant new crops, what if only
          <strong>half</strong> of the expected crop is harvested?
          <!-- This results in
          a deficit of <strong>TK kilograms</strong> of grain. -->
        </span>
      </div>

      <div :class="paragraphClasses">
        <span class="bg-white">
          No one has quantified the true impact, but we have made it easy to see the outcomes of various scenarios. Use
          the sliders and buttons below to simulate different scenarios and see how they might impact future Ukrainian
          grain production.
        </span>
      </div>

      <div :class="['step pa4 overflow-y-auto br1', stepIndex === 10 ? 'w-50' : 'w-100']"
        style="pointer-events: default !important;">
        <DataTable v-show="scenario" :activeData="active.activeData" :oblastScales="scenario.oblastScales"
          :focusedOblastName="focusedOblastName" :totalHarvestedArea="active.totalHarvestedArea"
          :totalYield="active.totalYield" :totalVolume="active.totalVolume" @sliderChange="handleSliderChange"
          @setFocusedOblast="setFocusedOblast($event)" />

        <div class="buttons f5 flex flex-wrap">
          <!-- make a button to set all oblasts to 15% -->
          <button v-for="percent in [15, 25, 50]" class="dim dib ma1" @click="setAllOblastOutput(percent)">
            Set all Oblasts to {{ percent }}%
          </button>

          <!-- a button to set only eastern oblasts to 15%, all others remain the same -->
          <button class="dim dib ma1" @click="setEasternOblastOutput(15)">
            Set Eastern Oblasts to 15%
          </button>



          <!-- make a button to reset everything to 100% -->
          <button class="b dim db ma1" @click="setAllOblastOutput(100)">
            Reset all Oblasts to 100%
          </button>
        </div>
      </div>

      <div :class="paragraphClasses">
        <h2 class="f-subheadline pa2 pa5-ns">Who is affected downstream?</h2>

        <span class="bg-white">
          Where does Ukraine's grain usually end up? In a normal trade year, the
          bulk of Ukraine's exports go to China, Africa, and Southeast Asian countries.
        </span>
      </div>

      <!-- <div :class="paragraphClasses">
        <span class="bg-white">
          Where does Ukraine's grain usually end up? In a normal trade year, the
          bulk of Ukraine's exports go to African and Southeast Asian countries.
        </span>
      </div> -->

      <!-- introduce small/large impact scenarios that will be shown on Sankey chart -->
      <div :class="paragraphClasses">
        <span class="bg-white">
          Let's take a look at how the small and high impact scenarios we
          explored earlier might impact the countries that import Ukraine's
          grain.
        </span>
      </div>

      <div :class="paragraphClasses">
        <span class="bg-white">
          We analyzed COMTRADE data to determine which countries import Ukrainian grain. You can find the detailed
          methodology and source data in <a href="https://observablehq.com/@codingwithfire/ukraine-grain-importers"
            class="black link underline b">our methodology notebook</a>.
        </span>
      </div>

      <!-- small impact -->
      <div :class="paragraphClasses">
        <span class="bg-white">
          The small impact scenario predicts that grain production will only be affected by ~15% from normal levels in
          2022. Let's see which countries depend most on Ukraine for their grain imports.
          <!-- This results in a
          deficit of <strong>TK million tons</strong> of grain, or TK% of
          Ukraine's total grain production. -->
        </span>
        <BarChart class="f6" ref="barChart" :showSentence="true" :showSlider="false" :initScenario="0.85"
          :width="graphicWidth * 0.8" />
      </div>

      <!-- high impact -->
      <div :class="paragraphClasses">
        <span class="bg-white">
          The high impact scenario predicts that grain production will be affected by as much as 50% from normal levels in
          2022.
          <!-- This results in
          a deficit of <strong>TK million tons</strong> of grain, or
          <strong>TK%</strong> of Ukraine's total grain production. -->
        </span>
        <BarChart class="f6" ref="barChart" :showSlider="false" :showSentence="true" :initScenario="0.50"
          :width="graphicWidth * 0.8" />
      </div>

      <!-- introduce the slider and allow the user to make their own predictions -->
      <div :class="paragraphClasses">
        <span class="bg-white f3 lh-copy measure  dib">
          Now it's your turn to make your own predictions. Use the slider below
          to simulate different scenarios and see how they might impact grain
          production in Ukraine in the future.
        </span>

        <BarChart class="f6" ref="barChart" :showSlider="true" :showSentence="true" :initScenario="overallForecastPercent"
          @scenarioChange="handleScenarioChange" :countryFilter="false" :countryFilterPct="0.02"
          :width="graphicWidth * 0.8" />
      </div>


      <div class="final-tool-view vh-100 w-100 f5 pa2 bg-white">

        <UkraineOblastMap :class="['z-2 vh-50 w-100']" ref="oblastMap" id="oblast-map"
          :activeDataByOblast="active.activeDataByOblast" :activeGrainType="activeGrainType" :width="graphicWidth"
          :valueKey="'harvestedArea'" :focusedOblastName="focusedOblastName"
          @setFocusedOblast="setFocusedOblast($event)" />

        <BarChart class="w-100 w-50-ns fl ph2" ref="barChart" :showSlider="true" :showSentence="false"
          :initScenario="overallForecastPercent" @scenarioChange="handleScenarioChange" :countryFilter="false"
          :countryFilterPct="0.02" :width="graphicWidth * 0.45" />


        <DataTable v-show="scenario" class="w-100 w-50-ns fl" :activeData="active.activeData" :oblastScales="scenario.oblastScales"
          :focusedOblastName="focusedOblastName" :totalHarvestedArea="active.totalHarvestedArea"
          :totalYield="active.totalYield" :totalVolume="active.totalVolume" @sliderChange="handleSliderChange"
          @setFocusedOblast="setFocusedOblast($event)" />




      </div>
    </div>

    <!-- use flex to stack the h2s vertically -->
    <!-- slide transition -->
    <Transition name="slide" mode="out-in">
      <div class="fixed top-0 right-0 z-3 w-100 flex flex-column"
        v-show="(stepIndex > 5 && stepIndex < 11) || stepIndex > 13">
        <h2 class="pa2 f1 tr db  w-100">
          <span class="db pv4">Harvest:<br />
            {{ numberFormat(animatedYieldNumber * 100) }}kg</span>

          <span class="db pv4">Output:<br />
            {{ pctFormat(animatedOutputNumber) }}</span>
        </h2>

        <h2 class="pa2 f1 tr db ba b--blue w-100">

          <!-- {{ animatedOutputNumber }} -->
        </h2>
      </div>
    </Transition>


  </div>
</template>
<script setup>
import * as d3 from "d3";
import scrollama from "scrollama";
import { normalizeOblastName } from "@/helpers";
// import anime.js
import anime from "animejs/lib/anime.es.js";
import { useWindowSize, useElementSize } from "@vueuse/core";

const { width, height: graphicHeight } = useWindowSize();

// const stepContainer = ref(null); // the html element for the container
const scrollytellingContainer = ref(null); // the html element for the container

// const graphicWidth = computed(() => {
//   // if the stepContainer ref exists, use its width
//   // otherwise default to 500
//   return stepContainer.value ? stepContainer.value.offsetWidth : 1200;
// });

const { width: graphicWidth } =
  useElementSize(scrollytellingContainer);

// we will fill these later with our data
// const importExportData = ref([]);

const stepIndex = ref(0); // keep track of the index
const stepProgress = ref(0); // keep track of the progress within a step
// const pageProgress = ref(0) // keep track of the total page progress

const importExportData = ref([]);

onMounted(() => {
  fetch("data/comtrade_imports/00_all_data_ukraine.csv")
    .then((response) => response.text())
    .then((data) => {
      importExportData.value = d3.csvParse(data);
    });
})

const valueKey = ref("harvestedArea"); // the key we will use to get the value from the data

// create a d3 number format to always show 1 decimal place
const numberFormat = d3.format(",.0f");
const pctFormat = d3.format(",.1%");

// the tachyons classes we will use for the paragraphs
const paragraphClasses = "step pa1 pa4-l f3 f2-ns lh-copy measure w-100 w-80-l center ml2 ml5-ns z1";

const active = useActiveData();





const { activeGrainType, setActiveGrainType } = useActiveGrainType();
// const DEFAULT_GRAIN_TYPE = "10 пшенЯР-Table 1";
// const DEFAULT_GRAIN_TYPE = "12 кукур-Table 1";
const DEFAULT_GRAIN_TYPE = "4 зерн-Table 1"
setActiveGrainType(DEFAULT_GRAIN_TYPE);
// can also use: "12 кукур-Table 1"



const overallForecastPercent = ref(1);


const animatedExportNumber = ref(0); // this will animate up to 27.8

const animatedOutputNumber = ref(0)
const animatedYieldNumber = ref(0)

function handleScenarioChange(newScenario) {
  setAllOblastOutput(newScenario * 100);
}


onMounted(() => {
  // when active.totalYield changes, animate the animatedYieldNumber to the new value with anime
  watch(active, (newActive) => {
    const newValue = newActive.totalYield
    anime({
      targets: animatedYieldNumber,
      value: [animatedYieldNumber.value, newValue],
      round: 100,
      easing: "linear",
      duration: 900,
    });
  }, { immediate: true });

  // watch overallForecastPercent and update animatedOutputNumberr
  watch(overallForecastPercent, (newValue) => {
    // console.log('overallForecastPercent changed to', newValue)
    anime({
      targets: animatedOutputNumber,
      value: [animatedOutputNumber.value, newValue],
      round: 100,
      easing: "linear",
      duration: 900,
    });
  }, { immediate: true });
})

const focusedOblastName = ref(null)

function setFocusedOblast(oblastName) {
  // console.log('focusing on', oblastName)
  // if oblastName is null, remove the focus
  focusedOblastName.value = oblastName
}

const { scenario, setOblastScale, setScenario } = useCurrentScenario();

const handleSliderChange = ({ oblastName, percentage }) => {
  const scale = +percentage / 100;
  setOblastScale({ oblastName, scale });
  // const valueKey = oblastMapConfig.value.valueKey;
  const originalTotal = active.value[`${valueKey.value}OriginalTotal`];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const newTotal = active.value[`total${cap(valueKey.value)}`];
  overallForecastPercent.value = newTotal / originalTotal;
  // console.log(overallForecastPercent.value);
};

// set all oblasts to a certain percentage
// reusing the handleSliderChange function
const setAllOblastOutput = (percentage) => {
  // TODO: For this to work, we need an actual list of normalized oblast names
  // We can get this from the data, but we need to make sure it's normalized
  // active.activeDataByOblast is a map of oblast name to data
  // so we can get the keys of that map
  const normalizedOblastNames = Object.keys(
    active.value.activeDataByOblast
  ).map(normalizeOblastName);
  normalizedOblastNames.forEach((oblastName) => {
    handleSliderChange({ oblastName, percentage });
  });
};

const easternOblastNamesNormalized = [
  'luhansk',
  'kherson',
  'donetsk',
  'zaporizhzhya'
]

function setEasternOblastOutput(amount) {
  // set the values of the oblasts
  // in easternOblastNamesNormalized
  // to the amount in the argument
  easternOblastNamesNormalized.forEach((oblastName) => {
    handleSliderChange({ oblastName, percentage: amount });
  });
}

// use setScenario to apply these
// const scenarioButtons = [
//   { name: "Small Impact", scale: 0.5, oblastScales: {} },
//   { name: "Medium Impact", scale: 0.75, oblastScales: {} },
//   { name: "Large Impact", scale: 0.9, oblastScales: {} },
// ];
// setScenario(scenarioButtons[1]) // this helps us see whether the scenario buttons are going through

// watch for changes to stepIndex when a user scrolls
watch(
  stepIndex,
  (newIndex) => {
    if (newIndex === 0) {
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
    } else if (newIndex <= 6) {
      setAllOblastOutput(100);
    } else if (newIndex === 7) {
      setAllOblastOutput(85);
    } else if (newIndex === 8) {
      setAllOblastOutput(50);
    }

    // else if step 14, set all oblasts to 85
    // else if step 15, set all oblasts to 50

    else if (newIndex === 14) {
      setAllOblastOutput(85);
    } else if (newIndex === 15) {
      setAllOblastOutput(50);
    }
  },
  { immediate: true }
);

onMounted(() => {
  // set up scrollama
  const scroller = scrollama();

  // set every step style to opacity 0
  // d3.selectAll(".text-container p").style("opacity", 0);

  // setup the instance, pass callback functions
  scroller
    .setup({
      step: ".text-container .step",
      offset: 0.6,
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

  // take .animated-intro-header and split it into words, then animate it in with anime js with a stagger
  const animatedIntroHeader = document.querySelector(
    ".animated-intro-header"
  );

  // split the text into words
  const words = animatedIntroHeader.innerHTML.split(" ");

  // create a new span for each word
  const newWords = words.map((word) => {
    const span = document.createElement("span");
    span.innerHTML = word;
    // add some tachyons classes to the span
    span.classList.add("dib", "ma0", "pl1", "pr3", "bg-yellow");
    return span;
  });

  // replace the text with the new spans
  animatedIntroHeader.innerHTML = "";

  newWords.forEach((word) => {
    animatedIntroHeader.appendChild(word);
  });

  // animate the new spans in
  anime({
    targets: ".animated-intro-header span",
    opacity: [0, 1],
    // starts out flipped vertically so it is basically invisible, then unfolds
    // translateY: ["-100%", 0],
    // rotateX: [90, 0],
    // rotateZ: [90, 0],
    // do some cool 3d transforms
    // translateZ: [20, 0],
    translateY: ['8vh', 0],
    // translateX: [40, 0],
    // skewY: [5, 0],
    // easing: "easeInOutQuad",
    // linear easing
    // easing: "linear",
    easing: "easeOutExpo",
    duration: 800,
    delay: anime.stagger(220),
  });

  // load our import/export data from public/data/comtrade_imports/00_all_data_ukraine.csv as parse with d3.csvParse
  // fetch("/data/comtrade_imports/00_all_data_ukraine.csv")
  //   .then((response) => response.text())
  //   .then((data) => {
  //     importExportData.value = d3.csvParse(data);
  //   });
});
</script>
<style scoped>
.step-graphic-container {
  min-height: 100vh;
  width: 100vw;
  overflow: hidden;
  /* pointer-events: none; */
  background-position: center center;
  /* background-repeat: no-repeat; */
  background-size: contain;
}

.hidden {
  display: none;
}

.text-container .step {
  /* margin-top: 33vh; */
  margin-bottom: 50vh;
  min-height: 40vh;
  max-width: 50vw;
  /* display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: left; */

  /* pointer-events: none; */

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

.text-container p {}

.bg-white-o-20 {
  background-color: rgba(255, 255, 255, 0.2);
}

.bg-white-o-40 {
  background-color: rgba(255, 255, 255, 0.4);
}

/* add styles for vue fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 920ms cubic-bezier(0.45, 0, 0.55, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.top-4 {
  top: 4rem;
}

.vh-90 {
  height: 90vh;
}



/* make a slide transition to slide in and out from the right side of the screen*/

.slide-enter-active,
.slide-leave-active {
  transition: transform 920ms cubic-bezier(0.45, 0, 0.55, 1);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

#oblast-map {
  transition: all 1.3s cubic-bezier(0.45, 0, 0.55, 1);
}
</style>
