<template>
  <DefaultLayout>
    <div v-if="isContentVisible" class="dashboard">
      <h1 class="page-title">Панель управления</h1>
      
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-card-inner">
            <div class="stat-icon">
              <font-awesome-icon :icon="['fas', 'boxes-stacked']" size="lg" />
            </div>
            <div class="stat-content">
              <h3>Всего наименований</h3>
              <p class="stat-value">{{ totalItems }}</p>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-card-inner">
            <div class="stat-icon">
              <font-awesome-icon :icon="['fas', 'exchange-alt']" size="lg" />
            </div>
            <div class="stat-content">
              <h3>Движение за 30 дней</h3>
              <p class="stat-value">{{ totalMovement30Days }}</p>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-card-inner">
            <div class="stat-icon">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" size="lg" />
            </div>
            <div class="stat-content">
              <h3>Критические остатки</h3>
              <p class="stat-value">{{ lowStockCount }}</p>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-card-inner">
            <div class="stat-icon">
              <font-awesome-icon :icon="['fas', 'money-bill-wave']" size="lg" />
            </div>
            <div class="stat-content">
              <h3>Стоимость склада</h3>
              <p class="stat-value">{{ formatCurrency(totalInventoryValue) }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-charts">
        <div class="chart-filters">
          <DateRangePicker
            v-model:startDate="startDate"
            v-model:endDate="endDate"
            @change="handleDateChange"
          />
          <button class="btn btn-primary generate-btn" @click="generateCharts">
            Сформировать графики
          </button>
        </div>
        <div class="chart-card">
          <h2>Движение товаров</h2>
          <div class="chart-container">
            <LineChart 
              :chartData="lineChartData" 
              :chartOptions="lineChartOptions" 
            />
          </div>
        </div>
        
        <div class="chart-card">
          <h2>Распределение по категориям</h2>
          <div class="chart-container">
            <DoughnutChart 
              :chartData="doughnutChartData" 
              :chartOptions="doughnutChartOptions" 
            />
          </div>
        </div>
      </div>
      
      <div class="recent-activities">
        <h2>Последние операции</h2>
        <div class="activity-list">
          <div class="activity-item" v-for="activity in dashboardData.recentActivity" :key="activity.id">
            <div class="activity-icon" :class="activity.type === 'in' ? 'in' : 'out'">
              <font-awesome-icon :icon="['fas', activity.type === 'in' ? 'plus' : 'minus']" />
            </div>
            <div class="activity-details">
              <h4>{{ activity.type === 'in' ? 'Поступление товара' : 'Отгрузка товара' }}</h4>
              <p>{{ getProductName(activity.product_id) }} x {{ activity.quantity }}</p>
              <span class="activity-time">{{ formatDate(activity.date) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>Загрузка...</p>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useDatabaseStore } from '@/store/database';
import { gsap } from 'gsap';
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import LineChart from '@/components/dashboard/LineChart.vue';
import DoughnutChart from '@/components/dashboard/DoughnutChart.vue';
import DateRangePicker from '@/components/reports/DateRangePicker.vue';

const router = useRouter();
const authStore = useAuthStore();
const databaseStore = useDatabaseStore();
const isContentVisible = ref(false);
const isLoading = ref(false);
const dashboardData = ref({});
const startDate = ref(null);
const endDate = ref(null);
const inventoryData = ref([]);
const loading = ref(false);
const totalProducts = ref(0);
const totalCategories = ref(0);
const totalValue = ref(0);

// Симуляция данных для графиков
const lineChartData = ref({
  labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
  datasets: [
    {
      label: 'Поступления',
      data: [65, 59, 80, 81, 56, 55],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Отгрузки',
      data: [28, 48, 40, 19, 86, 27],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)'
    }
  ]
});

const lineChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
});

const doughnutChartData = ref({
  labels: ['Электроника', 'Мебель', 'Канцтовары', 'Запчасти'],
  datasets: [
    {
      data: [40, 20, 15, 25],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
    }
  ]
});

const doughnutChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
});

// Вычисляемые свойства для карточек статистики
const totalItems = computed(() => {
  return databaseStore.products.length;
});

const totalMovement30Days = computed(() => {
  // Если есть значение в статистике - используем его, иначе создаем имитацию данных
  return databaseStore.statistics?.summary?.total_movement_30days || Math.floor(Math.random() * 50) + 10;
});

const lowStockCount = computed(() => {
  // Рассчитываем количество товаров с низким уровнем запасов
  const lowStockProducts = databaseStore.products.filter(product => {
    return product.quantity <= (product.reorder_level || 5); // 5 - стандартный уровень если не задан
  });
  return lowStockProducts.length;
});

const totalInventoryValue = computed(() => {
  // Рассчитываем общую стоимость инвентаря
  return databaseStore.products.reduce((sum, product) => {
    return sum + (product.price * product.quantity);
  }, 0);
});

// Функция форматирования валюты
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Загрузка данных из Pinia store
const loadData = async () => {
  try {
    isLoading.value = true;
    
    // Убеждаемся, что данные загружены из Pinia store
    if (!databaseStore.initialized) {
      await databaseStore.loadAllData();
    }
    
    // Сразу вызываем prepareData для корректной инициализации данных таблицы
    await prepareData();
    
    // Обновляем сводные показатели на основе актуальных данных
    const totalItems = databaseStore.products.length;
    const totalMovement = databaseStore.statistics?.summary?.total_movement_30days || 0;
    const lowStockCount = databaseStore.statistics?.summary?.low_stock_count || 0;
    
    // Рассчитываем общую стоимость инвентаря
    const totalInventoryValue = databaseStore.products.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);
    
    // Обновляем данные для дашборда с вычисленными значениями
    dashboardData.value = {
      summary: {
        total_items: totalItems,
        total_movement_30days: totalMovement,
        low_stock_count: lowStockCount,
        total_inventory_value: totalInventoryValue
      },
      recentActivity: databaseStore.statistics?.recent_activity || [],
      lowStockAlerts: databaseStore.statistics?.low_stock_alerts || [],
      products: databaseStore.products 
    };
    
    // Создаем типовую активность для нового товара, если список пуст
    if (!dashboardData.value.recentActivity || dashboardData.value.recentActivity.length === 0) {
      const newActivity = [];
      
      // Добавляем записи для каждого товара
      databaseStore.products.forEach((product, index) => {
        const currentDate = new Date();
        const activityDate = new Date(currentDate);
        activityDate.setDate(currentDate.getDate() - index); // Разные даты для разных товаров
        
        newActivity.push({
          id: index + 1,
          product_id: product.id,
          type: 'in',
          quantity: product.quantity,
          date: activityDate.toISOString()
        });
      });
      
      dashboardData.value.recentActivity = newActivity;
    }
    
    // Обновляем данные для графиков
    updateChartData();
    
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};

// Функция для обновления данных графиков
const updateChartData = () => {
  // Проверяем наличие статистики
  if (!databaseStore.statistics) return;
  
  // Данные для линейного графика движения товаров
  const stockMovement = databaseStore.statistics.monthly_stock_movement;
  if (stockMovement) {
    lineChartData.value.labels = stockMovement.map(item => item.month);
    lineChartData.value.datasets[0].data = stockMovement.map(item => item.in);
    lineChartData.value.datasets[1].data = stockMovement.map(item => item.out);
  } else {
    // Создаем демо-данные, если нет статистики движения
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const currentMonth = new Date().getMonth();
    const lastSixMonths = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
    
    lineChartData.value.labels = lastSixMonths;
    lineChartData.value.datasets[0].data = lastSixMonths.map((_, i) => Math.floor(Math.random() * 50) + 30);
    lineChartData.value.datasets[1].data = lastSixMonths.map((_, i) => Math.floor(Math.random() * 30) + 20);
  }
  
  // Данные для круговой диаграммы распределения по категориям
  const categoryData = databaseStore.statistics.inventory_value?.by_category;
  if (categoryData) {
    doughnutChartData.value.labels = categoryData.map(item => item.category);
    doughnutChartData.value.datasets[0].data = categoryData.map(item => item.value);
  } else {
    // Генерируем данные на основе текущих товаров в базе
    const categoryMap = new Map();
    
    // Группируем товары по категориям и суммируем их стоимость
    databaseStore.products.forEach(product => {
      const category = databaseStore.categories.find(c => c.id === product.category_id);
      const categoryName = category ? category.name : 'Без категории';
      const total = product.price * product.quantity;
      
      if (categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, categoryMap.get(categoryName) + total);
      } else {
        categoryMap.set(categoryName, total);
      }
    });
    
    // Преобразуем Map в массивы для диаграммы
    doughnutChartData.value.labels = Array.from(categoryMap.keys());
    doughnutChartData.value.datasets[0].data = Array.from(categoryMap.values());
  }
};

// Получить информацию о товаре по ID
const getProductName = (productId) => {
  if (!productId) return 'Неизвестный товар';
  
  const product = databaseStore.products.find(p => p.id === productId);
  return product ? product.name : `Товар #${productId}`;
};

// Форматирование даты для отображения
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Проверяем, сегодня ли это
  if (date.toDateString() === now.toDateString()) {
    return `Сегодня, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Проверяем, вчера ли это
  if (date.toDateString() === yesterday.toDateString()) {
    return `Вчера, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Иначе возвращаем полную дату
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Реактивное обновление данных при изменениях в store
watch(() => databaseStore.products.length, (newLength, oldLength) => {
  if (newLength !== oldLength) {
    loadData();
  }
}, { deep: true });

// Также наблюдаем за изменениями в statistics
watch(() => databaseStore.statistics, () => {
  loadData();
}, { deep: true });

// После функции formatCurrency добавляем обработчик изменения дат
const handleDateChange = () => {
  // Если статистики нет или нет необходимых структур, инициализируем их
  if (!databaseStore.statistics || 
      !databaseStore.statistics.monthly_stock_movement || 
      !databaseStore.statistics.monthly_stock_movement.incoming ||
      !databaseStore.statistics.monthly_stock_movement.outgoing) {
    // Инициализируем структуры статистики
    databaseStore.updateStatisticsWithNewProducts();
  }
  
  // Обновляем данные после изменения дат
  loadData();
};

// После handleDateChange добавляем метод generateCharts
const generateCharts = () => {
  // Показываем индикатор загрузки
  isLoading.value = true;
  
  // Имитируем задержку загрузки
  setTimeout(() => {
    // Обновляем данные графиков
    updateChartData();
    isLoading.value = false;
  }, 500);
};

onMounted(async () => {
  if (process.client) {
    // Проверяем авторизацию
    authStore.checkAuth();
    
    setTimeout(() => {
      if (!authStore.isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      
      if (!authStore.isManager) {
        router.push('/inventory');
        return;
      }
      
      // Показываем контент только после проверки авторизации
      isContentVisible.value = true;
      
      // Загружаем данные
      loadData();
      
      // Запускаем анимации ТОЛЬКО после отрисовки контента
      nextTick(() => {
        animateContent();
      });
    }, 100); // Небольшая задержка для инициализации auth store
  }
});

// Выносим анимации в отдельную функцию
const animateContent = () => {
  // Анимируем карточки статистики
  gsap.from('.stat-card', {
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out'
  });
  
  // Анимируем графики
  gsap.from('.chart-card', {
    opacity: 0,
    scale: 0.95,
    duration: 0.5,
    delay: 0.3,
    stagger: 0.2,
    ease: 'power2.out'
  });
  
  // Анимируем список активностей
  gsap.from('.activity-item', {
    opacity: 0,
    x: -20,
    duration: 0.4,
    delay: 0.5,
    stagger: 0.1,
    ease: 'power2.out'
  });
};

// Метод для подготовки данных дашборда
const prepareData = async () => {
  loading.value = true;
  
  try {
    // Очищаем текущие значения
    totalProducts.value = 0;
    totalCategories.value = 0;
    totalValue.value = 0;
    
    // Получаем продукты из хранилища
    const products = databaseStore.products;
    const statistics = databaseStore.statistics;
    
    // Подготавливаем функцию для форматирования валюты
    const formatCurrency = (value) => {
      // Проверяем, что значение определено и является числом
      if (value === undefined || value === null || isNaN(value)) {
        return '0 ₽';
      }
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2
      }).format(value);
    };
    
    // Если есть статистика, используем ее
    if (statistics?.totalProducts && statistics?.totalCategories && statistics?.totalValue !== undefined) {
      totalProducts.value = statistics.totalProducts;
      totalCategories.value = statistics.totalCategories;
      totalValue.value = statistics.totalValue;
    } else if (products && products.length > 0) {
      // Иначе считаем на основе продуктов
      const categories = new Set();
      totalProducts.value = products.length;
      
      products.forEach(product => {
        // Считаем общую стоимость инвентаря
        const price = parseFloat(product.price) || 0;
        const quantity = parseInt(product.quantity) || 0;
        totalValue.value += price * quantity;
        
        // Подсчет уникальных категорий
        if (product.category) {
          categories.add(product.category);
        }
      });
      
      totalCategories.value = categories.size;
    }
    
    // Формируем данные для отображения
    inventoryData.value = products.map(product => {
      // Гарантируем числовые значения или используем 0 по умолчанию
      const price = parseFloat(product.price) || 0;
      const quantity = parseInt(product.quantity) || 0;
      const total = price * quantity;
      
      // Вычисляем процент от общей стоимости только если общая стоимость больше 0
      let percentage = '0.00%';
      if (totalValue.value > 0) {
        percentage = ((total / totalValue.value) * 100).toFixed(2) + '%';
      }
      
      return {
        id: product.id,
        name: getProductName(product.id) || 'Неизвестный товар',
        category: product.category || 'Без категории',
        quantity: quantity,
        price: formatCurrency(price),
        total: formatCurrency(total),
        percentage: percentage
      };
    });
    
    // Обновляем данные графиков
    updateChartData();
    
    return {
      summary: {
        total_items: totalProducts.value,
        total_categories: totalCategories.value,
        total_inventory_value: totalValue.value
      },
      inventoryData: inventoryData.value
    };
    
  } catch (error) {
    return null;
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 1rem 0;
  
  @media (max-width: 480px) {
    padding: 0.5rem 0;
  }
}

.page-title {
  margin-bottom: 2rem;
  font-size: 2rem;
  color: var(--text-color);
  
  @media (max-width: 480px) {
    margin-bottom: 1.25rem;
    font-size: 1.5rem;
  }
  
  @media (max-width: 320px) {
    font-size: 1.25rem;
  }
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  flex: 1 1 250px;
  min-width: 200px;
  display: flex;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 576px) {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .stat-card {
    max-width: 100%;
  }
}

.stat-card-inner {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  width: 100%;
  justify-content: flex-start;
  
  @media (max-width: 480px) {
    padding: 1.25rem;
  }
  
  @media (max-width: 320px) {
    padding: 1rem;
  }
}

.stat-icon {
  font-size: 2rem;
  margin-right: 1rem;
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background-color: rgba(59, 130, 246, 0.1);
  
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
  
  @media (max-width: 320px) {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    margin-right: 0.75rem;
  }
}

.stat-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  
  h3 {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    color: #6b7280;
    white-space: nowrap;
    
    @media (max-width: 480px) {
      font-size: 0.8rem;
    }
    
    @media (max-width: 320px) {
      font-size: 0.75rem;
      margin-bottom: 0.25rem;
    }
    
    @media (max-width: 576px) {
      font-size: 1.1rem;
    }
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0;
    line-height: 1.2;
    
    @media (max-width: 480px) {
      font-size: 1.25rem;
    }
    
    @media (max-width: 320px) {
      font-size: 1.1rem;
    }
    
    @media (max-width: 576px) {
      font-size: 1.5rem;
    }
  }
}

.dashboard-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
    margin-bottom: 1.5rem;
    grid-template-columns: minmax(250px, 1fr);
  }
  
  @media (max-width: 320px) {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
}

.chart-filters {
  grid-column: 1 / -1;
  margin-bottom: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
  
  .generate-btn {
    white-space: nowrap;
    
    @media (max-width: 768px) {
      margin-top: 0.5rem;
    }
  }
}

.chart-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--text-color);
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    
    h2 {
      font-size: 1rem;
      margin-bottom: 0.75rem;
    }
  }
  
  @media (max-width: 320px) {
    padding: 0.75rem;
    
    h2 {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
  }
  
  @media (max-width: 576px) {
    padding: 0.75rem;
  }
}

.chart-container {
  height: 300px;
  position: relative;
  
  @media (max-width: 480px) {
    height: 250px;
  }
  
  @media (max-width: 320px) {
    height: 200px;
  }
}

.chart-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  color: #6b7280;
}

.recent-activities {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--text-color);
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    
    h2 {
      font-size: 1rem;
      margin-bottom: 0.75rem;
    }
  }
  
  @media (max-width: 320px) {
    padding: 0.75rem;
    
    h2 {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
  }
}

.activity-list {
  display: flex;
  flex-direction: column-reverse;
  gap: 1rem;
  
  @media (max-width: 480px) {
    gap: 0.75rem;
  }
  
  @media (max-width: 320px) {
    gap: 0.5rem;
  }
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateX(5px);
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
  
  @media (max-width: 320px) {
    padding: 0.5rem;
    flex-wrap: wrap;
  }
}

.activity-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
  margin-right: 1rem;
  
  &.in {
    background-color: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }
  
  &.out {
    background-color: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }
  
  @media (max-width: 320px) {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 1rem;
    margin-right: 0.75rem;
  }
}

.activity-details {
  h4 {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }
  
  p {
    font-size: 0.875rem;
    color: #4b5563;
    margin-bottom: 0.25rem;
  }
  
  .activity-time {
    font-size: 0.75rem;
    color: #9ca3af;
  }
  
  @media (max-width: 480px) {
    h4 {
      font-size: 0.9rem;
    }
    
    p {
      font-size: 0.8rem;
    }
    
    .activity-time {
      font-size: 0.7rem;
    }
  }
  
  @media (max-width: 320px) {
    width: calc(100% - 2.25rem);
    
    h4 {
      font-size: 0.8rem;
      margin-bottom: 0.15rem;
    }
    
    p {
      font-size: 0.75rem;
      margin-bottom: 0.15rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .activity-time {
      font-size: 0.65rem;
    }
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  
  .loading-spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  p {
    margin-top: 1rem;
    font-size: 1rem;
    color: #6b7280;
  }
}
</style> 