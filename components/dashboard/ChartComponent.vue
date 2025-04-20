<template>
  <div class="chart-wrapper">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['line', 'bar', 'doughnut', 'pie', 'radar'].includes(value)
  },
  data: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  }
});

const chartCanvas = ref(null);
let chartInstance = null;

// Создаем график при монтировании компонента
onMounted(() => {
  if (chartCanvas.value) {
    createChart();
  }
});

// Следим за изменениями данных и обновляем график
watch(() => props.data, (newData) => {
  if (chartInstance) {
    chartInstance.data = newData;
    chartInstance.update();
  }
}, { deep: true });

// Следим за изменениями типа графика и пересоздаем его при необходимости
watch(() => props.type, () => {
  if (chartInstance) {
    chartInstance.destroy();
    createChart();
  }
});

// Функция создания графика
const createChart = () => {
  const ctx = chartCanvas.value.getContext('2d');
  
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    }
  };
  
  chartInstance = new Chart(ctx, {
    type: props.type,
    data: props.data,
    options: { ...defaultOptions, ...props.options }
  });
};
</script>

<style lang="scss" scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 300px;
  position: relative;
}
</style> 