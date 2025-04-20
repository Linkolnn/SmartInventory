<template>
  <div class="chart-wrapper">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
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
    
    // Добавляем обработчик изменения размера для перерисовки графика
    if (process.client) {
      window.addEventListener('resize', handleResize);
    }
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

// Обработчик изменения размера окна
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// Функция создания графика
const createChart = () => {
  const ctx = chartCanvas.value.getContext('2d');
  
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          font: {
            size: window.innerWidth <= 320 ? 8 : 
                 window.innerWidth <= 480 ? 10 : 12
          }
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        titleFont: {
          size: window.innerWidth <= 320 ? 10 : 
               window.innerWidth <= 480 ? 12 : 14
        },
        bodyFont: {
          size: window.innerWidth <= 320 ? 9 : 
               window.innerWidth <= 480 ? 11 : 13
        },
        padding: window.innerWidth <= 320 ? 4 : 
                window.innerWidth <= 480 ? 6 : 8
      }
    },
    scales: props.type !== 'doughnut' && props.type !== 'pie' ? {
      x: {
        ticks: {
          font: {
            size: window.innerWidth <= 320 ? 8 : 
                 window.innerWidth <= 480 ? 10 : 12
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: window.innerWidth <= 320 ? 8 : 
                 window.innerWidth <= 480 ? 10 : 12
          }
        }
      }
    } : undefined
  };
  
  chartInstance = new Chart(ctx, {
    type: props.type,
    data: props.data,
    options: { ...defaultOptions, ...props.options }
  });
};

// Очищаем обработчики событий при удалении компонента
onUnmounted(() => {
  if (process.client && chartInstance) {
    window.removeEventListener('resize', handleResize);
    chartInstance.destroy();
  }
});
</script>

<style lang="scss" scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 300px;
  position: relative;
  
  @media (max-width: 480px) {
    min-height: 250px;
  }
  
  @media (max-width: 320px) {
    min-height: 200px;
  }
}
</style> 