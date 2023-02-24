<template>
  <div class="cf w-100">
      <UkraineOblastMap        
        class="z-2 w-50 fl"
        ref="oblastMap"
        :activeDataByOblast="active.activeDataByOblast"
        :activeGrainType="activeGrainType"
        :width="graphicWidth"
        :valueKey="oblastMapConfig.valueKey"
      />
<DataTable    
          :activeData="active.activeData"
          :oblastScales="scenario.oblastScales"
          :totalHarvestedArea="active.totalHarvestedArea"
          :totalYield="active.totalYield"
          :totalVolume="active.totalVolume"
          class="overflow-y-auto w-50 fl"
          @sliderChange="handleSliderChange"
        />

        <div class="pa5 w-100 fl">
        <BarChart
        class=""
        ref="barChart"
        :initScenario="overallForecastPercent"
        :width="graphicWidth"
      />
    </div>
  </div>
</template>
<script setup>
const active = useActiveData();

const { scenario, setOblastScale, setScenario } = useCurrentScenario();

const { activeGrainType, setActiveGrainType } = useActiveGrainType();
// const DEFAULT_GRAIN_TYPE = "10 пшенЯР-Table 1";
const DEFAULT_GRAIN_TYPE = "12 кукур-Table 1";
setActiveGrainType(DEFAULT_GRAIN_TYPE);
// can also use: "12 кукур-Table 1"
const oblastMapConfig = ref({
  visibility: false, // true = show, false = hide
  valueKey: "harvestedArea",
});

const handleSliderChange = ({ oblastName, percentage }) => {
  const scale = +percentage / 100;
  setOblastScale({ oblastName, scale });
  const valueKey = oblastMapConfig.value.valueKey;
  const originalTotal = active.value[`${valueKey}OriginalTotal`]
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const newTotal = active.value[`total${cap(valueKey)}`]
  overallForecastPercent.value = newTotal / originalTotal
  console.log(overallForecastPercent.value)
};
</script>