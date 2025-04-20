<template>
  <ChartComponent type="doughnut" :data="chartData" :options="chartOptions" />
</template>

<script setup>
import ChartComponent from './ChartComponent.vue';

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  chartOptions: {
    type: Object,
    default: () => ({})
  }
});
</script> 