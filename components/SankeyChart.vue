<template>
  <svg>
    <!-- sankey stuff -->
  </svg>
</template>
<script setup>
/*
      <SankeyChart
        v-if="sankeyConfig.visibility"
        ref="sankeyChart"
        :config="sankeyConfig"
        :importExportData="importExportData"
        :width="graphicWidth"
      />
      */

// set up props
const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
  importExportData: {
    type: Array,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
});
</script>
