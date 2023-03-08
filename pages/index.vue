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
          v-if="stepIndex >= 2 && stepIndex < 4"
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
          v-if="stepIndex >= 4 && stepIndex < 5"
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

      <div v-if="active && (stepIndex >= 5 && stepIndex < 12)">
      <h2 class="fixed top-0 left-0 w-100 tc">Total yield:
          {{numberFormat(active.totalYield)}} <a href="https://en.wiktionary.org/wiki/centner" class="link black">centner</a> ({{numberFormat(active.totalYield * 100)}} kilograms)

          <!-- calculate the difference between the active totalYield and 1843 -->
            <span
              v-if="+active.totalYield > 1843"
              class="green"
            >
              +{{ numberFormat(active.totalYield - 1843) }}
            </span>

            <span
              v-else-if="active.totalYield < 1843"
              class="red"
            >
              -{{ numberFormat(1843 - active.totalYield) }}
            </span>
        </h2>

        <h2 class="w-100 fixed top-2 left-0 tc">
          Projected UKR output:
          {{pctFormat(overallForecastPercent)}}
        </h2>
      <UkraineOblastMap        
        class="z-2 w-100 vh-100"
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
    </div>

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
          farming being impacted? <a href="https://earthobservatory.nasa.gov/images/150025/measuring-wars-effect-on-a-global-breadbasket">NASA's Earth Observatory</a> produced this map looking at the location of Ukraine's crops and the areas impacted by the war.
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
        <span class="pa1 bg-white">The small impact scenario predicts that grain production will only be
          effected by about <a href="https://hub.conflictobservatory.org/portal/apps/sites/#/home/pages/grain-1" class="black link underline b">15%</a> from normal levels in 2022. 
          
          <!-- This results in a
          deficit of <strong>TK million tons</strong> of grain, or TK% of
          Ukraine's total grain production. -->
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
          Now it's your turn to make your own predictions. Use the sliders and buttons below
          to simulate different scenarios and see how they might impact grain
          production in Ukraine in the future.
        </span>
      </p>

      <p class="pa2 overflow-y-auto br1 mt2 pa1">

        <!-- make a button to set all oblasts to 15% -->
        <button
          class="f6 link dim br1 ph3 pv2 mb2 dib white bg-dark-blue"
          @click="setAllOblastOutput(0.15)"
        >
          Set all Oblasts to 15%
        </button>

        <DataTable
          v-if="scenario"
          :activeData="active.activeData"
          :oblastScales="scenario.oblastScales"
          :totalHarvestedArea="active.totalHarvestedArea"
          :totalYield="active.totalYield"
          :totalVolume="active.totalVolume"
          class="w-50"
          @sliderChange="handleSliderChange"
        />
      </p>

      <p>
        <h2 class="f-subheadline pa2 pa5-ns">Who is affected downstream?</h2>
      </p>

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

      <p :class="paragraphClasses">
        <span class="pa1 bg-white">
          This slider controls the amount of grain that is exported from Ukraine. As less is exported, the countries downstream are affected differently depending on how much they depend on Ukraine's grain.
          <BarChart
        v-if="stepIndex >= 13 && stepIndex < 16"
        ref="barChart"
        :initScenario="overallForecastPercent"
        :width="graphicWidth"
      />
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
const prototypes = ["map", "scatterplot", "scrollytelling"];
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
