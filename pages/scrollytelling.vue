<template>
  <div class="scrollytelling-container">
    <div class="text-container w-50">
      <p>
        Ukraine is an important player in the global grain market. Although it
        makes up only TK% of the world's total grain production, its exports
        account for over TK% of the world's total grain imports. But in the
        midst of the conflict with Russia, how is Ukraine's grain farming being
        impacted? Let's take a look.
      </p>

      <p>
        Most of Ukraine's grain is grown in the Oblasts. Here is a breakdown of
        where different grains are grown in Ukraine, as a percentage of the
        country's total grain production: Wheat: TK% Barley: TK% Millet: TK%
        Rye: TK% Oats: TK%
      </p>

      <p>
        Where does Ukraine's grain end up? In a normal trade year, the bulk of
        Ukraine's exports go to African and Southeast Asian countries. About TK%
        of Ukraine's total exports go to Pakistan, followed by Sudan (TK%) and
        Egypt (TK%).
      </p>

      <p>
        But what is happening to Ukraine's grain farming now, in the midst of
        the conflict? Russian missile strikes have recently been reported in
        Ukraine, and some are landing in areas where grain is grown.
        Unfortunately, the current situation makes it difficult to know the
        exact impact on Ukraine's grain production, but our forecast and
        scenario tool can help us explore different possibilities.
      </p>

      <p>
        Let's look at three different scenarios: a small impact on grain
        production, a medium impact, and a large impact. In the small impact
        scenario, exports will remain virtually unchanged from their
        pre-conflict levels. However, if we switch to the large impact scenario,
        exports drop by a whopping TK%, with the majority of the losses being
        felt by TK, TK, and the TK.
      </p>

      <p>
        The conflict with Russia is having a real and devastating effect on
        Ukraine's grain production, and it's important to understand the
        downstream impacts. Our tool allows users to explore the potential
        impacts of different scenarios on grain production, opening up more
        possibilities for analysis
      </p>
    </div>

    <div class="step-container w-50 fixed top-0 right-0">
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
        :config="oblastMapConfig"
      />

      <BarChart
        v-if="barChartConfig.visibility"
        :config="barChartConfig"
      />

      <SankeyChart v-if="sankeyConfig.visibility" :config="sankeyConfig" />
    </div>
  </div>
</template>
<script setup>
import scrollama from "scrollama";

const stepIndex = ref(0); // keep track of the index
const rectFill = ref("white");

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

// watch for changes to stepIndex when a user scrolls
watch(
  stepIndex,
  (newIndex) => {
    if (newIndex === 0) {
      // show the icicle map of UKR exports
      rectFill.value = "yellow";
      // scatterplotConfig.value.visibility = true
    } else if (newIndex === 1) {
      // show the icicle map of UKR and RUS exports
      rectFill.value = "salmon";
      // show oblast map
      oblastMapConfig.value.visibility = true;
    } else if (newIndex === 2) {
      // show the icicle map of UKR and RUS exports
      rectFill.value = "red";
    } else if (newIndex === 3) {
      // show the icicle map of UKR and RUS exports
      rectFill.value = "blue";
    } else if (newIndex === 4) {
      // show the icicle map of UKR and RUS exports
      rectFill.value = "green";
    } else if (newIndex === 5) {
      // show the icicle map of UKR and RUS exports
      rectFill.value = "purple";
    } else if (newIndex === 6) {
      // show the icicle map of UKR and RUS exports
      rectFill.value = "orange";
    } else if (newIndex === 7) {
      // show the icicle map of UKR and RUS exports
      rectFill.value = "pink";
    } else {
      // show the icicle map of UKR and RUS exports
      rectFill.value = "white";
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
});
</script>
<style>
.text-container p {
  /* margin-top: 33vh; */
  margin-bottom: 33vh;
  height: 33vh;
  width: 100%;
  background-color: #ccc;
}

.step-container {
}

.text-container {
}
</style>
