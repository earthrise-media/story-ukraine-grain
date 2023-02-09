<template></template>
<script setup>
const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
  scenario: {
    type: Object,
    required: false,
  },
  oblastData: {
    type: Array,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
});
</script>
