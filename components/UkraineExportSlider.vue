<template>
  <div>
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      :value="scenario"
      @change="onScenarioChange($event.target.value)"
      class="slider w-100"
      id="myRange"
    />
    <span>{{ formatNumber(scenario) }}</span>

    <p class="smart-sentences" v-if="selectedCountry">
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
  </div>
</template>
<script setup>
import { format } from "d3";
const { scenario, selectedCountry } = defineProps({
  scenario: {
    type: Number,
    required: true,
  },
  selectedCountry: {
    type: Object,
    required: false,
  },
});

const formatNumber = format(",.1%");

const emit = defineEmits(["onScenarioChange"]);

// bubble up onScenarioChange
const onScenarioChange = (value) => {
  emit("onScenarioChange", value);
};
</script>
