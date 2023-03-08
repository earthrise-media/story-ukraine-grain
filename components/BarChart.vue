<template>
  <div>
    <div v-if="props.showSlider">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="scenario"
        @change="onScenarioChange($event.target.value)"
        class="slider w-100"
      />
      <strong class="w-100 tc db f3"
        >{{ formatNumber(scenario) }} of normal output</strong
      >
    </div>

    <p class="smart-sentences" v-if="selectedCountry && props.showSentence">
      {{ selectedCountry.countryName }} depends on Ukraine for
      {{ formatNumber(selectedCountry.percent) }} of its grain imports. If
      Ukraine's output is reduced to
      <strong style="background-color: #ffc500">{{
        formatNumber(scenario)
      }}</strong
      >, {{ selectedCountry.countryName }} will have
      <strong class="gray">{{
        formatNumber(1 - (1 - scenario) * selectedCountry.percent)
      }}</strong>
      of it's expected grain and
      <strong class="bg-moon-gray ph1 br1"
        >missing
        {{ formatNumber((1 - scenario) * selectedCountry.percent) }}</strong
      >
      of it's expected grain.
    </p>

    <svg
      ref="svg"
      :width="props.width"
      :height="height"
      class=""
      :viewBox="`-40 0 ${props.width + chartPadding} ${
        props.height + chartPadding
      }`"
    >
      <!-- use d3 scales and vue refs to create a responsive horizontal bar chart -->
      <!-- add a group for each bar -->
      <g
        v-if="importExportData.length > 0"
        v-for="(d, i) in importExportData"
        :key="d.countryName"
        :transform="`translate(0, ${yScale(d.countryName)})`"
        class="bar-group"
      >
        <!-- add a rect for the bar -->
        <rect
          :width="xScale(1 - (1 - scenario) * d.percent)"
          :height="yScale.bandwidth()"
          fill="none"
          stroke="lightgray"
          class="bar"
        />
        <!-- <rect
          :width="xScale(d.percent)"
          :height="yScale.bandwidth()"
          fill="none"
          stroke="gray"
          class="bar"
        /> -->
        <rect
          :width="xScale(scenario * d.percent)"
          :height="yScale.bandwidth()"
          fill="#FFC500"
          class="bar"
        />

        <text
          :x="0"
          :y="yScale.bandwidth() / 2"
          dx="5"
          :dy="0.32 + 'em'"
          class="bar-label"
        >
          {{ d.countryName }} missing
          {{ formatNumber((1 - scenario) * d.percent) }}
        </text>

        <text
          :x="xScale(1 - (1 - scenario) * d.percent)"
          :y="yScale.bandwidth() / 2"
          dx="20"
          :dy="0.32 + 'em'"
          class="bar-label"
        >
          {{ formatNumber(1 - (1 - scenario) * d.percent) }}
        </text>
      </g>

      <!-- draw an x axis that labels each percent -->
      <g :transform="`translate(0, 0)`" class="x-axis">
        <!-- fill with ticks based on a d3 range from 0.0 to 1.0 in 0.1 increments -->
        <g
          v-for="tick in d3.range(0.0, 1.1, 0.25)"
          :key="tick"
          :transform="`translate(${xScale(tick)}, 0)`"
        >
          <line
            x1="0"
            x2="0"
            y1="0"
            :y2="props.height"
            stroke="lightgray"
            stroke-dasharray="2,2"
          />
          <text
            x="0"
            :y="props.height + 20"
            :dy="0.32 + 'em'"
            text-anchor="middle"
            class="tick-label"
          >
            {{ Math.floor(tick * 100) }}%
          </text>
        </g>

        <!-- <line :y1="props.height" :y2="props.height" :x2="props.width" stroke="black" stroke-width="4" /> -->

        <!-- <text :x="props.width / 2" :y="props.height / 2 + 40" :dy="0.32 + 'em'" text-anchor="middle" class="tick-label">
          {{ formatNumber(scenario) }}
        </text> -->
      </g>
    </svg>
  </div>
</template>
<script setup>
import * as d3 from "d3";

const chartPadding = 170;

// const data = ???

const props = defineProps({
  //
  height: {
    type: Number,
    default: 600,
  },
  width: {
    type: Number,
    default: 1080,
  },
  initScenario: {
    type: Number,
    default: 0.85,
  },
  showSlider: {
    type: Boolean,
    default: true,
  },
  showSentence: {
    type: Boolean,
    default: false,
  },
  countryFilterPct: {
    type: Number,
    default: 0.1,
  },
});

const graphicHeight = 400;
const graphicWidth = 400;

const scenario = ref(0.85); // Ukraine's exports are REDUCED to this amount

// make an emit to bubble up the scenario value
const emit = defineEmits(["scenarioChange"]);

// const onActivated = () => {
//   scenario.value = props.initScenario;
// }

// watch the init scenario prop and update the scenario value
watch(
  () => props.initScenario,
  (value) => {
    scenario.value = value;
  },
  { immediate: true }
);

const onScenarioChange = (value) => {
  emit("scenarioChange", value);
  scenario.value = value;
};

// const countryFilterPct = ref(0.1) // Only show countries that import more than this

// const countryFilterPct = ref(0.08);
// make countryFilterPct a computed off props

const dataKey = ref("harvestedArea");

const importExportData = ref([]);

const formatNumber = d3.format(",.1%");

const selectedCountry = ref(null);

// find the extent of the data from the dataKey
// const extent = d3.extent(props.oblastData, (d) => d[dataKey]);

// create a categorical scale for the x axis, so each bar is evenly spaces
const xScale = d3.scaleLinear().domain([0, 1]).range([0, props.width]);
// .padding(0.1);

// create a scale for the y axis
const yScale = d3.scaleBand().range([0, props.height]).padding(0.1);

// make watchers that when the width / height changes, we update the range in our scales
watch(
  () => props.width,
  (value) => {
    xScale.range([0, value]);
  },
  { immediate: true }
);

watch(
  () => props.height,
  (value) => {
    yScale.range([0, value]);
  },
  { immediate: true }
);

// set the domain of the y scale when the data changes props.oblastData changes
onMounted(() => {
  fetch("/data/comtrade_imports/00_all_data_ukraine.csv")
    .then((response) => response.text())
    .then((data) => {
      let parsed = d3
        .csvParse(data, d3.autoType)
        .sort((a, b) => b.percent - a.percent);

      parsed = parsed.filter((d) => d.percent > props.countryFilterPct);

      yScale.domain(parsed.map((d) => d.countryName));

      selectedCountry.value = parsed[0];

      importExportData.value = parsed;
    });
});
</script>
<style>
rect,
text {
  transition: all 0.6s ease-in-out;
}
</style>
