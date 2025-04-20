<template>
  <div class="date-range-picker">
    <div class="date-inputs">
      <div class="date-field">
        <label for="startDate" class="date-label">Начальная дата</label>
        <input 
          type="date" 
          id="startDate" 
          v-model="localStartDate"
          class="date-input"
          @change="updateDateRange"
        />
      </div>
      <div class="date-field">
        <label for="endDate" class="date-label">Конечная дата</label>
        <input 
          type="date" 
          id="endDate" 
          v-model="localEndDate"
          class="date-input"
          @change="updateDateRange"
        />
      </div>
      <div class="clear-button-container">
        <button @click="clearDates" class="clear-button">
          Очистить
        </button>
      </div>
    </div>
    <div class="period-buttons">
      <button 
        v-for="(period, index) in predefinedPeriods" 
        :key="index"
        @click="selectPeriod(period.value)"
        class="period-btn"
        :class="{'active': isActivePeriod(period.value)}"
      >
        {{ period.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';

const props = defineProps({
  startDate: {
    type: String,
    default: null
  },
  endDate: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:startDate', 'update:endDate', 'change']);

const localStartDate = ref(props.startDate);
const localEndDate = ref(props.endDate);

// Предопределенные периоды
const predefinedPeriods = [
  { label: 'Сегодня', value: 'today' },
  { label: 'Вчера', value: 'yesterday' },
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' },
  { label: 'Квартал', value: 'quarter' },
  { label: 'Год', value: 'year' }
];

const currentPeriod = ref(null);

// Форматирование даты в формат yyyy-mm-dd
const formatDate = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

// Проверка активного периода
const isActivePeriod = (periodValue) => {
  return currentPeriod.value === periodValue;
};

// Выбор предопределенного периода
const selectPeriod = (periodValue) => {
  currentPeriod.value = periodValue;
  
  const today = new Date();
  let start = new Date();
  let end = new Date();
  
  switch (periodValue) {
    case 'today':
      // Не меняем start и end - они уже равны сегодняшней дате
      break;
    case 'yesterday':
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
      break;
    case 'week':
      start.setDate(today.getDate() - 7);
      break;
    case 'month':
      start.setMonth(today.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(today.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(today.getFullYear() - 1);
      break;
  }
  
  localStartDate.value = formatDate(start);
  localEndDate.value = formatDate(end);
  
  updateDateRange();
};

// Обновление диапазона дат
const updateDateRange = () => {
  if (localStartDate.value && localEndDate.value) {
    // Проверяем, что начальная дата не позже конечной
    const startDateObj = new Date(localStartDate.value);
    const endDateObj = new Date(localEndDate.value);
    
    if (startDateObj > endDateObj) {
      // Если начальная дата позже конечной, сбрасываем конечную дату на начальную
      localEndDate.value = localStartDate.value;
    }
  }
  
  emit('update:startDate', localStartDate.value);
  emit('update:endDate', localEndDate.value);
  emit('change');
};

// Очистка дат
const clearDates = () => {
  localStartDate.value = null;
  localEndDate.value = null;
  currentPeriod.value = null;
  updateDateRange();
};

// Следить за изменениями props
watch(() => props.startDate, (newVal) => {
  localStartDate.value = newVal;
});

watch(() => props.endDate, (newVal) => {
  localEndDate.value = newVal;
});

// При монтировании компонента устанавливаем период "Месяц" по умолчанию, если даты не заданы
onMounted(() => {
  if (!localStartDate.value && !localEndDate.value) {
    selectPeriod('month');
  }
});
</script>

<style scoped>
.date-range-picker {
  width: 100%;
}

.date-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.date-field {
  flex: 1;
  min-width: 140px;
}

.date-label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.date-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.date-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.clear-button-container {
  display: flex;
  align-items: flex-end;
  margin-bottom: 4px;
}

.clear-button {
  color: #3b82f6;
  font-size: 0.875rem;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
}

.clear-button:hover {
  color: #2563eb;
}

.period-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.period-btn {
  font-size: 0.75rem;
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.period-btn:hover {
  background-color: #f3f4f6;
}

.period-btn.active {
  background-color: #eff6ff;
  border-color: #93c5fd;
  color: #2563eb;
}

/* Responsive styles */
@media (max-width: 640px) {
  .date-inputs {
    flex-direction: column;
    gap: 12px;
  }
  
  .date-field {
    width: 100%;
  }
  
  .clear-button-container {
    width: 100%;
    justify-content: flex-end;
    margin-top: 4px;
  }
  
  .period-buttons {
    overflow-x: auto;
    padding-bottom: 8px;
    margin-bottom: -8px;
  }
  
  .period-btn {
    white-space: nowrap;
  }
}
</style> 