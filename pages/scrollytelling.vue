<template>
  <div class="scrollytelling-container">
    <div class="text-container w-50">
      <h2 class="f2 f1-l lh-title mt0 mb3 pa4">
        Ukraine's grain farming in the midst of the conflict with Russia
      </h2>
      <p :class="paragraphClasses">
        Ukraine is an important player in the global grain market. Although it
        makes up only TK% of the world's total grain production, its exports
        account for over TK% of the world's total grain imports. But in the
        midst of the conflict with Russia, how is Ukraine's grain farming being
        impacted? Let's take a look.
      </p>

      <p :class="paragraphClasses">
        Most of Ukraine's grain is grown in the Oblasts. Here is a breakdown of
        where different grains are grown in Ukraine, as a percentage of the
        country's total grain production: Wheat: TK% Barley: TK% Millet: TK%
        Rye: TK% Oats: TK%
      </p>

      <p :class="paragraphClasses">
        Where does Ukraine's grain end up? In a normal trade year, the bulk of
        Ukraine's exports go to African and Southeast Asian countries. About TK%
        of Ukraine's total exports go to Pakistan, followed by Sudan (TK%) and
        Egypt (TK%).
      </p>

      <p :class="paragraphClasses">
        But what is happening to Ukraine's grain farming now, in the midst of
        the conflict? Russian missile strikes have recently been reported in
        Ukraine, and some are landing in areas where grain is grown.
        Unfortunately, the current situation makes it difficult to know the
        exact impact on Ukraine's grain production, but our forecast and
        scenario tool can help us explore different possibilities.
      </p>

      <p :class="paragraphClasses">
        Let's look at three different scenarios: a small impact on grain
        production, a medium impact, and a large impact. In the small impact
        scenario, exports will remain virtually unchanged from their
        pre-conflict levels. However, if we switch to the large impact scenario,
        exports drop by a whopping TK%, with the majority of the losses being
        felt by TK, TK, and the TK.
        <ScenarioControls
          @scenario-change="scenarioChange"
          :scenario="scenario"
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

    <div class="step-container w-50 fixed top-0 right-0 ba b--red" ref="stepContainer">
      <!-- <svg>
        <rect
          id="debug-scroll-test-rect"
          x="0"
          y="0"
          width="100"
          height="100"
          :fill="rectFill"
        />
      </svg> -->

      <div id="step-0-graphic" v-if="stepIndex === 0">
        <h2>World grain producer breakdown</h2>
      </div>

      <UkraineOblastMap
        v-if="oblastMapConfig.visibility"
        ref="oblastMap"
        :config="oblastMapConfig"
        :scenario="scenario"
        :oblastData="oblastData"
        :width="graphicWidth"
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
        v-if="sankeyConfig.visibility"
        ref="sankeyChart"
        :config="sankeyConfig"
        :importExportData="importExportData"
        :width="graphicWidth"
      />
    </div>
  </div>
</template>
<script setup>
import * as d3 from "d3";
import scrollama from "scrollama";

// we will fill these later with our data
const oblastData = ref([]);
const importExportData = ref([]);

const stepContainer = ref(null);

const stepIndex = ref(0); // keep track of the index
const rectFill = ref("white");

const paragraphClasses = "pa4 measure f2 lh-copy";

const scenario = ref({
  name: "Small Impact",
  scale: 0.5,
  oblastScales: {},
});

const scenarioOptions = [
  { name: "Small Impact", scale: 0.5, oblastScales: {} },
  { name: "Medium Impact", scale: 0.75, oblastScales: {} },
  { name: "Large Impact", scale: 0.9, oblastScales: {} },
];

// load import/export data from public/data/ovuzpsg_1221/cleaned/all_data.json

// Example of a config object for a scatterplot
// const scatterplotConfig = ref({
//   visibility: false, // true = show, false = hide
//   xProperty: "harvestedArea",
//   yProperty: "volume",
//   rProperty: "grainYield",
//   highlight: "oblastNameUkrainian",
// });

const oblastMapConfig = ref({
  width: 500,
  height: 500,
  visibility: false, // true = show, false = hide
  colorProperty: "harvestedArea",
});

const sankeyConfig = ref({
  width: 500,
  height: 500,
  visibility: false, // true = show, false = hide
});

const barChartConfig = ref({
  width: 500,
  height: 500,
  visibility: false, // true = show, false = hide
  xProperty: "oblastNameUkrainian",
  yProperty: "harvestedArea",
});

const graphicWidth = computed(() => {
  // if we are on the server, default to 500
  // but if we are in the browser, use the width of the element
  if (typeof window === "undefined") {
    return 500;
  } else {
    return stepContainer.value.offsetWidth;
  }
});

// watch for changes to stepIndex when a user scrolls
watch(
  stepIndex,
  (newIndex) => {
    if (newIndex === 0) {
      oblastMapConfig.value.visibility = false;
    } else if (newIndex === 1) {
      oblastMapConfig.value.visibility = true;
    } else if (newIndex === 2) {
      oblastMapConfig.value.visibility = true;
    } else if (newIndex === 3) {
      oblastMapConfig.value.visibility = true;
    } else if (newIndex === 4) {
      oblastMapConfig.value.visibility = false;
    } else if (newIndex === 5) {
      oblastMapConfig.value.visibility = false;
    } else if (newIndex === 6) {
      oblastMapConfig.value.visibility = false;
    } else if (newIndex === 7) {
      oblastMapConfig.value.visibility = false;
    } else {
      oblastMapConfig.value.visibility = false;
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
      offset: 0.25,
      // debug: true,
    })
    .onStepEnter((response) => {
      // response = { element, direction, index }
      console.log(response);
      stepIndex.value = response.index;
    })
    .onStepExit((response) => {
      // response = { element, direction, index }
      // console.log(response);
    });

  // load our oblast data from public/data/ovuzpsg_1221/cleaned/oblast_data.json
  fetch("/data/ovuzpsg_1221/cleaned/all_data.json")
    .then((response) => response.json())
    .then((data) => {
      oblastData.value = data;
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
.text-container p {
  /* margin-top: 33vh; */
  margin-bottom: 55vh;
  min-height: 33vh;
}

h2 {
  margin-top: 55vh;
  margin-bottom: 55vh;
}

.step-container {
}

.text-container {
}
</style>
