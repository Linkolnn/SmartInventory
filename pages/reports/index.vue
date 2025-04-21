<template>
  <DefaultLayout>
    <div v-if="isContentVisible" class="reports">
      <h1 class="page-title">Отчеты и аналитика</h1>
      
      <div class="report-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'inventory' }" 
          @click="activeTab = 'inventory'"
        >
          Остатки на складе
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'movement' }" 
          @click="activeTab = 'movement'"
        >
          Движение товаров
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'turnover' }" 
          @click="activeTab = 'turnover'"
        >
          Оборачиваемость
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'financial' }" 
          @click="activeTab = 'financial'"
        >
          Финансовые показатели
        </button>
      </div>
      
      <div class="report-filters">
        <div class="filter-group">
          <label class="form-label">Период</label>
          <div class="date-range">
            <DateRangePicker
              v-model:startDate="startDate"
              v-model:endDate="endDate"
              @change="loadData"
            />
          </div>
        </div>
        
        <div class="filter-group">
          <label class="form-label">Категория</label>
          <select class="form-input" v-model="category">
            <option value="">Все категории</option>
            <option value="electronics">Электроника</option>
            <option value="furniture">Мебель</option>
            <option value="office">Канцтовары</option>
            <option value="parts">Запчасти</option>
          </select>
          <button class="btn btn-primary" @click="generateReport">Сформировать отчет</button>
        </div>
        
      </div>
      
      <div v-if="isDataLoaded" class="report-content">
        <!-- Отображаем содержимое в зависимости от активной вкладки -->
        <div v-if="activeTab === 'inventory'" class="inventory-report">
          <div class="chart-container">
            <h2>Распределение товаров по категориям</h2>
            <DoughnutChart 
              :chartData="inventoryChartData" 
              :chartOptions="defaultChartOptions" 
            />
          </div>
          
          <div class="report-table-container">
            <h2>Остатки на складе</h2>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th>Категория</th>
                  <th>Количество</th>
                  <th>Сумма</th>
                  <th>% от общей стоимости</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in inventoryData" :key="index">
                  <td>{{ item.name }}</td>
                  <td>{{ item.category }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.total.toLocaleString() }} ₽</td>
                  <td>{{ item.percentage }}%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3"><strong>Итого</strong></td>
                  <td><strong>{{ totalInventoryCost.toLocaleString() }} ₽</strong></td>
                  <td><strong>100%</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div v-else-if="activeTab === 'movement'" class="movement-report">
          <div class="chart-container">
            <h2>Динамика движения товаров</h2>
            <LineChart 
              :chartData="movementChartData" 
              :chartOptions="defaultChartOptions" 
            />
          </div>
          
          <div class="report-table-container">
            <h2>Движение товаров за период</h2>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th>Начальный остаток</th>
                  <th>Приход</th>
                  <th>Расход</th>
                  <th>Конечный остаток</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in movementData" :key="index">
                  <td>{{ item.name }}</td>
                  <td>{{ item.initialQuantity }}</td>
                  <td>{{ item.incoming }}</td>
                  <td>{{ item.outgoing }}</td>
                  <td>{{ item.finalQuantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div v-else-if="activeTab === 'turnover'" class="turnover-report">
          <div class="chart-container">
            <h2>Оборачиваемость товаров</h2>
            <BarChart 
              :chartData="turnoverChartData" 
              :chartOptions="defaultChartOptions" 
            />
          </div>
          
          <div class="report-table-container">
            <h2>Показатели оборачиваемости</h2>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th>Средний остаток</th>
                  <th>Объем продаж</th>
                  <th>Коэффициент оборачиваемости</th>
                  <th>Время оборота (дни)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in turnoverData" :key="index">
                  <td>{{ item.name }}</td>
                  <td>{{ item.averageStock }}</td>
                  <td>{{ item.salesVolume.toLocaleString() }} ₽</td>
                  <td>{{ typeof item.turnoverRate === 'number' ? item.turnoverRate.toFixed(2) : item.turnoverRate }}</td>
                  <td>{{ item.turnoverDays }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div v-else-if="activeTab === 'financial'" class="financial-report">
          <div class="financial-summary">
            <div class="summary-card">
              <h3>Общая стоимость запасов</h3>
              <div class="summary-value">{{ totalInventoryCost.toLocaleString() }} ₽</div>
            </div>
            
            <div class="summary-card">
              <h3>Оборот за период</h3>
              <div class="summary-value">{{ totalTurnover.toLocaleString() }} ₽</div>
            </div>
            
            <div class="summary-card">
              <h3>Прибыль за период</h3>
              <div class="summary-value">{{ totalProfit.toLocaleString() }} ₽</div>
            </div>
          </div>
          
          <div class="chart-container">
            <h2>Финансовые показатели по месяцам</h2>
            <LineChart 
              :chartData="financialChartData" 
              :chartOptions="defaultChartOptions" 
            />
          </div>
        </div>
      </div>
      <div v-else-if="isContentVisible && !isDataLoaded" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>
      
      <div class="report-actions">
        <button class="btn btn-secondary" @click="exportToExcel">Экспорт в Excel</button>
        <button class="btn btn-secondary" @click="printReport">Печать отчета</button>
      </div>
    </div>
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>Загрузка...</p>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useDatabaseStore } from '@/store/database';
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import DateRangePicker from '@/components/reports/DateRangePicker.vue';
import LineChart from '@/components/dashboard/LineChart.vue';
import BarChart from '@/components/dashboard/BarChart.vue';
import DoughnutChart from '@/components/dashboard/DoughnutChart.vue';

const router = useRouter();
const authStore = useAuthStore();
const databaseStore = useDatabaseStore();
const isContentVisible = ref(false);
const isDataLoaded = ref(false);
const isLoading = ref(false);

// Состояния для фильтрации и табов
const activeTab = ref('inventory');
const startDate = ref(null);
const endDate = ref(null);
const category = ref('');

// Данные для графиков
const inventoryChartData = ref({
  labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: [
        '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6366f1'
      ]
    }
  ]
});

const movementChartData = ref({
  labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  datasets: [
    {
      label: 'Поступления',
      data: [],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Отгрузки',
      data: [],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)'
    }
  ]
});

const turnoverChartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Коэффициент оборачиваемости',
      data: [],
      backgroundColor: '#3b82f6'
    }
  ]
});

const financialChartData = ref({
  labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  datasets: [
    {
      label: 'Продажи',
      data: [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Прибыль',
      data: [],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)'
    }
  ]
});

// Настройки для графиков
const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false
};

// Демо-данные для отчетов
const inventoryData = ref([]);
const movementData = ref([]);
const turnoverData = ref([]);

// Вычисляемые значения
const totalInventoryCost = ref(0);
const totalTurnover = ref(0);
const totalProfit = ref(0);

// Добавляем вспомогательную функцию для проверки попадания даты в указанный диапазон
const isDateInRange = (dateString, startDate, endDate) => {
  if (!startDate || !endDate) return true;
  
  const date = new Date(dateString);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return date >= start && date <= end;
};

// Функция для получения ID категории по её имени
const getCategoryIdByName = (categoryName) => {
  if (!categoryName || categoryName === 'Все категории') return null;
  
  const category = databaseStore.categories.find(c => c.name === categoryName);
  return category ? category.id : null;
};

// Загрузка данных из store
const loadData = async () => {
  try {
    isLoading.value = true;
    
    // Убеждаемся, что данные загружены
    if (!databaseStore.initialized) {
      await databaseStore.loadAllData();
    }
    
    if (databaseStore.initialized) {
      prepareChartData();
      isDataLoaded.value = true;
    }
    
    isLoading.value = false;
  } catch (error) {
    isDataLoaded.value = false;
    isLoading.value = false;
  }
};

// Подготовка данных для графиков
const prepareChartData = () => {
  if (!databaseStore.statistics) return;
  
  // Данные для инвентаризации
  const categoryData = databaseStore.statistics.inventory_value?.by_category;
  if (categoryData) {
    inventoryChartData.value.labels = categoryData.map(item => item.category);
    inventoryChartData.value.datasets[0].data = categoryData.map(item => item.value);
  }
  
  // Рассчитываем общую стоимость инвентаря
  // Сначала пробуем получить значение из statistics, если оно есть
  totalInventoryCost.value = databaseStore.statistics.summary?.total_inventory_value || 0;
  
  // Если значение равно 0 или undefined, пересчитываем вручную на основе текущих товаров
  if (!totalInventoryCost.value) {
    totalInventoryCost.value = databaseStore.products.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);
  }
  
  // Создаем данные для таблицы остатков
  if (totalInventoryCost.value > 0) {
    inventoryData.value = databaseStore.products.map(product => {
      const category = databaseStore.categories.find(c => c.id === product.category_id);
      const total = product.price * product.quantity;
      const percentage = totalInventoryCost.value > 0 
        ? ((total / totalInventoryCost.value) * 100).toFixed(2) 
        : "0.00";
      
      return {
        name: product.name,
        category: category ? category.name : 'Без категории',
        quantity: product.quantity,
        total: total,
        percentage: percentage
      };
    });
  } else {
    // Если общая стоимость всё равно 0, устанавливаем проценты в 0
    inventoryData.value = databaseStore.products.map(product => {
      const category = databaseStore.categories.find(c => c.id === product.category_id);
      const total = product.price * product.quantity;
      
      return {
        name: product.name,
        category: category ? category.name : 'Без категории',
        quantity: product.quantity,
        total: total,
        percentage: "0.00"
      };
    });
  }
  
  // Данные для движения товаров
  const stockMovement = databaseStore.statistics.monthly_stock_movement;
  if (stockMovement) {
    movementChartData.value.datasets[0].data = stockMovement.map(item => item.in);
    movementChartData.value.datasets[1].data = stockMovement.map(item => item.out);
  }
  
  // Данные по движению для таблицы
  if (databaseStore.statistics.product_movement) {
    movementData.value = databaseStore.statistics.product_movement.map(product => {
      // Проверяем, что все значения определены, или используем 0
      const initialQuantity = isNaN(product.initial_quantity) ? 0 : (product.initial_quantity || 0);
      const incoming = isNaN(product.incoming) ? 0 : (product.incoming || 0);
      const outgoing = isNaN(product.outgoing) ? 0 : (product.outgoing || 0);
      const finalQuantity = isNaN(product.final_quantity) ? 0 : (product.final_quantity || 0);
      
      return {
        name: product.name || 'Неизвестный товар',
        initialQuantity: initialQuantity,
        incoming: incoming,
        outgoing: outgoing,
        finalQuantity: finalQuantity
      };
    });
  }
  
  // Данные для оборачиваемости
  const turnoverMetrics = databaseStore.statistics.turnover_metrics;
  if (turnoverMetrics) {
    turnoverChartData.value.labels = turnoverMetrics.map(item => item.name);
    turnoverChartData.value.datasets[0].data = turnoverMetrics.map(item => item.turnover_rate);
    
    // Данные по оборачиваемости для таблицы
    turnoverData.value = turnoverMetrics.map(product => ({
      name: product.name,
      averageStock: Math.round(product.average_stock),
      salesVolume: product.sales_volume,
      turnoverRate: product.turnover_rate,
      turnoverDays: product.turnover_days
    }));
  }
  
  // Финансовые данные
  const monthlySales = databaseStore.statistics.monthly_sales;
  if (monthlySales) {
    financialChartData.value.datasets[0].data = monthlySales.map(item => item.value);
    financialChartData.value.datasets[1].data = monthlySales.map(item => item.value * 0.3); // Прибыль как 30% от продаж
    
    // Вычисляем общие финансовые показатели
    totalTurnover.value = financialChartData.value.datasets[0].data.reduce((sum, value) => sum + value, 0);
    totalProfit.value = financialChartData.value.datasets[1].data.reduce((sum, value) => sum + value, 0);
  }
};

// Метод генерации отчета
const generateReport = () => {
  
  isDataLoaded.value = false;
  
  // Имитация загрузки данных с задержкой
  setTimeout(() => {
    // Фильтруем данные в зависимости от выбранной категории и периода
    const categoryId = getCategoryIdByName(category.value);
    
    if (activeTab.value === 'inventory') {
      if (categoryId) {
        // Фильтруем данные инвентаризации по категории
        inventoryData.value = databaseStore.products
          .filter(product => product.category_id === categoryId)
          .map(product => {
            const category = databaseStore.categories.find(c => c.id === product.category_id);
            const total = product.price * product.quantity;
            return {
              name: product.name,
              category: category ? category.name : 'Без категории',
              quantity: product.quantity,
              total: total,
              percentage: ((total / totalInventoryCost.value) * 100).toFixed(2)
            };
          });
          
        // Обновляем также данные для графика
        const filteredCategoryData = databaseStore.statistics.inventory_value.by_category
          .filter((_, index) => index === categoryId - 1);
          
        if (filteredCategoryData.length > 0) {
          inventoryChartData.value.labels = filteredCategoryData.map(item => item.category);
          inventoryChartData.value.datasets[0].data = filteredCategoryData.map(item => item.value);
        }
      } else {
        // Используем все данные
        prepareChartData();
      }
    } else if (activeTab.value === 'movement') {
      // Фильтрация данных по датам для движения товаров
      const startDateObj = startDate.value ? new Date(startDate.value) : null;
      const endDateObj = endDate.value ? new Date(endDate.value) : null;
      
      // Проверяем наличие данных о движении товаров
      if (!databaseStore.statistics.product_movement || databaseStore.statistics.product_movement.length === 0) {
        // Если данных нет, создаем тестовые данные
        databaseStore.updateStatisticsWithNewProducts();
      }
      
      // Фильтруем данные по категории и по дате, если указана
      let filteredMovementData = [...databaseStore.statistics.product_movement];
      
      if (categoryId) {
        // Фильтруем данные движения товаров по категории
        const filteredProducts = databaseStore.products
          .filter(product => product.category_id === categoryId);
        
        const productIds = filteredProducts.map(p => p.id);
        
        filteredMovementData = filteredMovementData.filter(product => 
          productIds.includes(product.product_id)
        );
      }
      
      // Здесь в реальном приложении мы бы фильтровали по датам
      // Для демонстрации просто используем все данные
      movementData.value = filteredMovementData.map(product => {
        // Проверяем, что все значения определены, или используем 0
        const initialQuantity = isNaN(product.initial_quantity) ? 0 : (product.initial_quantity || 0);
        const incoming = isNaN(product.incoming) ? 0 : (product.incoming || 0);
        const outgoing = isNaN(product.outgoing) ? 0 : (product.outgoing || 0);
        const finalQuantity = isNaN(product.final_quantity) ? 0 : (product.final_quantity || 0);
        
        return {
          name: product.name || 'Неизвестный товар',
          initialQuantity: initialQuantity,
          incoming: incoming,
          outgoing: outgoing,
          finalQuantity: finalQuantity
        };
      });
          
      // Обновляем данные графика по месяцам с учетом диапазона дат
      const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      let filteredMonths = months;
      
      // Проверяем, есть ли данные о движении по месяцам
      if (!databaseStore.statistics || 
          !databaseStore.statistics.monthly_stock_movement || 
          !databaseStore.statistics.monthly_stock_movement.incoming ||
          !databaseStore.statistics.monthly_stock_movement.outgoing) {
        // Если данных нет, инициализируем их
        if (!databaseStore.statistics) {
          // Если статистики вообще нет, создаем структуру и все подструктуры
          databaseStore.updateStatisticsWithNewProducts();
        } else {
          // Иначе обновляем только данные о движении
          if (!databaseStore.statistics.monthly_stock_movement) {
            databaseStore.statistics.monthly_stock_movement = {
              incoming: Array(12).fill(0).map(() => Math.floor(Math.random() * 50) + 10),
              outgoing: Array(12).fill(0).map(() => Math.floor(Math.random() * 30) + 5)
            };
          } else {
            // Проверяем и инициализируем входящие и исходящие данные
            if (!databaseStore.statistics.monthly_stock_movement.incoming) {
              databaseStore.statistics.monthly_stock_movement.incoming = Array(12).fill(0).map(() => Math.floor(Math.random() * 50) + 10);
            }
            if (!databaseStore.statistics.monthly_stock_movement.outgoing) {
              databaseStore.statistics.monthly_stock_movement.outgoing = Array(12).fill(0).map(() => Math.floor(Math.random() * 30) + 5);
            }
          }
        }
      }
      
      // После обновления данных берем их заново, обеспечиваем что данные всегда массив
      let filteredIncoming = [];
      let filteredOutgoing = [];
      
      // Проверяем, что данные по движению представлены массивом
      if (Array.isArray(databaseStore.statistics.monthly_stock_movement.incoming)) {
        filteredIncoming = [...databaseStore.statistics.monthly_stock_movement.incoming];
      } else {
        // Если не массив, создаем массив с 12 месяцами случайных данных
        filteredIncoming = Array(12).fill(0).map(() => Math.floor(Math.random() * 50) + 10);
      }
      
      if (Array.isArray(databaseStore.statistics.monthly_stock_movement.outgoing)) {
        filteredOutgoing = [...databaseStore.statistics.monthly_stock_movement.outgoing];
      } else {
        // Если не массив, создаем массив с 12 месяцами случайных данных
        filteredOutgoing = Array(12).fill(0).map(() => Math.floor(Math.random() * 30) + 5);
      }
      
      // Если указан диапазон дат, фильтруем данные в соответствии с выбранным периодом
      if (startDateObj && endDateObj) {
        // Получаем разницу в днях между датами
        const diffTime = Math.abs(endDateObj - startDateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // В зависимости от разницы в датах, подготавливаем соответствующие данные
        if (diffDays <= 1) {
          // Если выбран один день, показываем данные только за этот месяц
          const selectedMonth = startDateObj.getMonth();
          filteredMonths = [months[selectedMonth]];
          filteredIncoming = [filteredIncoming[selectedMonth]];
          filteredOutgoing = [filteredOutgoing[selectedMonth]];
        } 
        else if (diffDays <= 7) {
          // Для недельного периода
          const startMonth = startDateObj.getMonth();
          const endMonth = endDateObj.getMonth();
          
          if (startMonth === endMonth) {
            // Если неделя в пределах одного месяца
            filteredMonths = [months[startMonth]];
            filteredIncoming = [filteredIncoming[startMonth]];
            filteredOutgoing = [filteredOutgoing[startMonth]];
          } else {
            // Если неделя охватывает два месяца
            filteredMonths = months.slice(startMonth, endMonth + 1);
            
            // Создаем пропорциональные данные для этих месяцев
            const daysInFirstMonth = new Date(
              startDateObj.getFullYear(), 
              startMonth + 1, 
              0
            ).getDate() - startDateObj.getDate() + 1;
            
            const daysInSecondMonth = endDateObj.getDate();
            const totalDays = daysInFirstMonth + daysInSecondMonth;
            
            const firstMonthIncoming = filteredIncoming[startMonth] * (daysInFirstMonth / totalDays);
            const secondMonthIncoming = filteredIncoming[endMonth] * (daysInSecondMonth / totalDays);
            
            const firstMonthOutgoing = filteredOutgoing[startMonth] * (daysInFirstMonth / totalDays);
            const secondMonthOutgoing = filteredOutgoing[endMonth] * (daysInSecondMonth / totalDays);
            
            filteredIncoming = [firstMonthIncoming, secondMonthIncoming];
            filteredOutgoing = [firstMonthOutgoing, secondMonthOutgoing];
          }
        }
        else if (diffDays <= 31) {
          // Для периода до 31 дня (примерно месяц)
          const startMonth = startDateObj.getMonth();
          const endMonth = endDateObj.getMonth();
          
          if (startMonth === endMonth) {
            // Если один и тот же месяц
            filteredMonths = [months[startMonth]];
            filteredIncoming = [filteredIncoming[startMonth]];
            filteredOutgoing = [filteredOutgoing[startMonth]];
          } else {
            // Если разные месяцы
            filteredMonths = months.slice(startMonth, endMonth + 1);
            filteredIncoming = filteredIncoming.slice(startMonth, endMonth + 1);
            filteredOutgoing = filteredOutgoing.slice(startMonth, endMonth + 1);
          }
        }
        else if (diffDays <= 100) {
          // Для квартала (примерно 3 месяца)
          const startMonth = startDateObj.getMonth();
          const endMonth = endDateObj.getMonth();
          
          if (startMonth <= endMonth) {
            filteredMonths = months.slice(startMonth, endMonth + 1);
            filteredIncoming = filteredIncoming.slice(startMonth, endMonth + 1);
            filteredOutgoing = filteredOutgoing.slice(startMonth, endMonth + 1);
          } else {
            // Если период переходит через конец года
            const monthsFirstPart = months.slice(startMonth);
            const incomingFirstPart = filteredIncoming.slice(startMonth);
            const outgoingFirstPart = filteredOutgoing.slice(startMonth);
            
            const monthsSecondPart = months.slice(0, endMonth + 1);
            const incomingSecondPart = filteredIncoming.slice(0, endMonth + 1);
            const outgoingSecondPart = filteredOutgoing.slice(0, endMonth + 1);
            
            filteredMonths = [...monthsFirstPart, ...monthsSecondPart];
            filteredIncoming = [...incomingFirstPart, ...incomingSecondPart];
            filteredOutgoing = [...outgoingFirstPart, ...outgoingSecondPart];
          }
        }
        // Для годовых и более длительных периодов показываем все месяцы
        // Данные уже инициализированы полным набором
      }
      
      movementChartData.value = {
        labels: filteredMonths,
        datasets: [
          {
            label: 'Поступления',
            data: filteredIncoming,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)'
          },
          {
            label: 'Отгрузки',
            data: filteredOutgoing,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
          }
        ]
      };
    } else if (activeTab.value === 'turnover') {
      // Базовая фильтрация по категории (если выбрана)
      let turnoverMetrics = [...databaseStore.statistics.turnover_metrics];
      
      // Проверяем, есть ли товары, которых нет в метриках оборачиваемости
      const existingProductIds = turnoverMetrics.map(item => item.product_id);
      const missingProducts = databaseStore.products.filter(product => 
        !existingProductIds.includes(product.id)
      );
      
      // Добавляем метрики для новых товаров
      if (missingProducts.length > 0) {
        missingProducts.forEach(product => {
          // Получаем категорию товара
          const category = databaseStore.categories.find(c => c.id === product.category_id);
          
          // Создаем стандартные значения для нового товара
          const defaultSalesVolume = product.price * product.quantity * 0.7; // Примерный объем продаж (70% от стоимости)
          const defaultAverageStock = product.quantity * 0.8; // Примерный средний остаток (80% от текущего)
          const defaultTurnoverRate = (defaultSalesVolume / product.price) / defaultAverageStock;
          const defaultTurnoverDays = defaultTurnoverRate > 0 ? Math.round(30 / defaultTurnoverRate) : 0;
          
          turnoverMetrics.push({
            product_id: product.id,
            name: product.name,
            category: category ? category.name : 'Без категории',
            average_stock: defaultAverageStock,
            sales_volume: defaultSalesVolume,
            turnover_rate: defaultTurnoverRate,
            turnover_days: defaultTurnoverDays
          });
        });
      }
      
      if (categoryId) {
        // Фильтруем данные оборачиваемости по категории
        const filteredProducts = databaseStore.products
          .filter(product => product.category_id === categoryId);
        
        const productIds = filteredProducts.map(p => p.id);
        turnoverMetrics = turnoverMetrics.filter(product => 
          productIds.includes(product.product_id)
        );
      }
      
      // Если указан диапазон дат, применяем фильтрацию по периоду
      if (startDate.value && endDate.value) {
        const startDateObj = new Date(startDate.value);
        const endDateObj = new Date(endDate.value);
        
        // Получаем разницу в днях между датами
        const diffTime = Math.abs(endDateObj - startDateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Корректируем коэффициенты оборачиваемости в зависимости от периода
        if (diffDays <= 31) {
          // Для периодов до месяца корректируем пропорционально
          const scaleFactor = diffDays / 30; // Масштабирующий фактор (относительно месяца)
          
          turnoverMetrics = turnoverMetrics.map(product => {
            // Пропорционально уменьшаем коэффициент оборачиваемости и увеличиваем дни
            const adjustedRate = product.turnover_rate * scaleFactor;
            // Для дней используем обратную пропорцию
            const adjustedDays = product.turnover_days / scaleFactor;
            
            return {
              ...product,
              turnover_rate: adjustedRate,
              turnover_days: Math.round(adjustedDays)
            };
          });
        } else if (diffDays <= 90) {
          // Для квартала (примерно 90 дней) корректируем пропорционально
          const scaleFactor = diffDays / 30; // Масштабирующий фактор
          
          turnoverMetrics = turnoverMetrics.map(product => {
            return {
              ...product,
              turnover_rate: product.turnover_rate * scaleFactor,
              turnover_days: Math.round(product.turnover_days / scaleFactor)
            };
          });
        } else if (diffDays <= 365) {
          // Для годового периода корректируем пропорционально
          const scaleFactor = diffDays / 30; // Масштабирующий фактор
          
          turnoverMetrics = turnoverMetrics.map(product => {
            return {
              ...product,
              turnover_rate: product.turnover_rate * scaleFactor,
              turnover_days: Math.round(product.turnover_days / scaleFactor)
            };
          });
        }
        // Для более длительных периодов можно добавить дополнительную логику
      }
      
      // Обновляем данные для графика
      turnoverChartData.value.labels = turnoverMetrics.map(item => item.name);
      turnoverChartData.value.datasets[0].data = turnoverMetrics.map(item => item.turnover_rate);
      
      // Обновляем данные для таблицы
      turnoverData.value = turnoverMetrics.map(product => ({
        name: product.name,
        averageStock: Math.round(product.average_stock),
        salesVolume: product.sales_volume,
        turnoverRate: typeof product.turnover_rate === 'number' ? product.turnover_rate.toFixed(2) : product.turnover_rate,
        turnoverDays: product.turnover_days
      }));
    } else if (activeTab.value === 'financial') {
      // Финансовые данные фильтруем по дате (период)
      const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      const salesData = [...databaseStore.statistics.monthly_sales];
      let filteredSalesData = salesData.map(item => item.value);
      let filteredMonths = months;
      
      // Если указан диапазон дат, фильтруем данные в соответствии с выбранным периодом
      if (startDate.value && endDate.value) {
        const startDateObj = new Date(startDate.value);
        const endDateObj = new Date(endDate.value);
        
        // Получаем разницу в днях между датами
        const diffTime = Math.abs(endDateObj - startDateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // В зависимости от разницы в датах, подготавливаем соответствующие данные
        if (diffDays <= 1) {
          // Если выбран один день, показываем данные только за этот месяц
          const selectedMonth = startDateObj.getMonth();
          filteredMonths = [months[selectedMonth]];
          filteredSalesData = [filteredSalesData[selectedMonth]];
        } 
        else if (diffDays <= 7) {
          // Для недельного периода
          const startMonth = startDateObj.getMonth();
          const endMonth = endDateObj.getMonth();
          
          if (startMonth === endMonth) {
            // Если неделя в пределах одного месяца
            filteredMonths = [months[startMonth]];
            filteredSalesData = [filteredSalesData[startMonth]];
          } else {
            // Если неделя охватывает два месяца
            // Пропорционально делим данные между месяцами
            // В первом приближении, делим поровну
            filteredMonths = months.slice(startMonth, endMonth + 1);
            
            // Создаем пропорциональные данные для этих месяцев
            const daysInFirstMonth = new Date(
              startDateObj.getFullYear(), 
              startMonth + 1, 
              0
            ).getDate() - startDateObj.getDate() + 1;
            
            const daysInSecondMonth = endDateObj.getDate();
            const totalDays = daysInFirstMonth + daysInSecondMonth;
            
            const firstMonthData = filteredSalesData[startMonth] * (daysInFirstMonth / totalDays);
            const secondMonthData = filteredSalesData[endMonth] * (daysInSecondMonth / totalDays);
            
            filteredSalesData = [firstMonthData, secondMonthData];
          }
        }
        else if (diffDays <= 31) {
          // Для периода до 31 дня (примерно месяц)
          // Учитываем месяцы в выбранном диапазоне
          const startMonth = startDateObj.getMonth();
          const endMonth = endDateObj.getMonth();
          
          if (startMonth === endMonth) {
            // Если один и тот же месяц
            filteredMonths = [months[startMonth]];
            filteredSalesData = [filteredSalesData[startMonth]];
          } else {
            // Если разные месяцы
            filteredMonths = months.slice(startMonth, endMonth + 1);
            filteredSalesData = filteredSalesData.slice(startMonth, endMonth + 1);
          }
        }
        else if (diffDays <= 100) {
          // Для квартала (примерно 3 месяца)
          const startMonth = startDateObj.getMonth();
          const endMonth = endDateObj.getMonth();
          
          if (startMonth <= endMonth) {
            filteredMonths = months.slice(startMonth, endMonth + 1);
            filteredSalesData = filteredSalesData.slice(startMonth, endMonth + 1);
          } else {
            // Если период переходит через конец года
            const monthsFirstPart = months.slice(startMonth);
            const salesFirstPart = filteredSalesData.slice(startMonth);
            const monthsSecondPart = months.slice(0, endMonth + 1);
            const salesSecondPart = filteredSalesData.slice(0, endMonth + 1);
            
            filteredMonths = [...monthsFirstPart, ...monthsSecondPart];
            filteredSalesData = [...salesFirstPart, ...salesSecondPart];
          }
        }
        else {
          // Для годовых и более длительных периодов показываем все месяцы
          // Данные уже инициализированы полным набором
        }
      }
      
      financialChartData.value = {
        labels: filteredMonths,
        datasets: [
          {
            label: 'Выручка',
            data: filteredSalesData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          },
          {
            label: 'Прибыль',
            data: filteredSalesData.map(value => value * 0.3), // Прибыль как 30% от продаж
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)'
          }
        ]
      };
      
      // Вычисляем общие финансовые показатели по отфильтрованным данным
      totalTurnover.value = filteredSalesData.reduce((sum, value) => sum + value, 0);
      totalProfit.value = totalTurnover.value * 0.3;
      
      // Обновляем финансовую сводку
      totalInventoryCost.value = databaseStore.statistics.inventory_value.total_value;
    }
    
    isDataLoaded.value = true;
    isLoading.value = false;
  }, 800); // Увеличиваем задержку для более заметной индикации загрузки
};

// Реактивное обновление данных при изменениях в store
watch(() => databaseStore.products, () => {
  prepareChartData();
}, { deep: true });

// Также наблюдаем за изменениями в statistics
watch(() => databaseStore.statistics, () => {
  prepareChartData();
}, { deep: true });

// Функция для экспорта данных в Excel
const exportToExcel = () => {
  if (!isDataLoaded.value) return;
  
  // Получаем данные в зависимости от активной вкладки
  let data = [];
  let headers = [];
  let filename = 'отчет';
  
  if (activeTab.value === 'inventory') {
    headers = ['Наименование', 'Категория', 'Количество', 'Сумма', '% от общей стоимости'];
    data = inventoryData.value.map(item => [
      item.name,
      item.category,
      item.quantity,
      item.total,
      item.percentage + '%'
    ]);
    data.push(['Итого', '', '', totalInventoryCost.value, '100%']);
    filename = 'остатки-на-складе';
  } else if (activeTab.value === 'movement') {
    headers = ['Наименование', 'Начальный остаток', 'Приход', 'Расход', 'Конечный остаток'];
    data = movementData.value.map(item => [
      item.name,
      item.initialQuantity,
      item.incoming,
      item.outgoing,
      item.finalQuantity
    ]);
    filename = 'движение-товаров';
  } else if (activeTab.value === 'turnover') {
    headers = ['Наименование', 'Средний остаток', 'Объем продаж', 'Коэффициент оборачиваемости', 'Время оборота (дни)'];
    data = turnoverData.value.map(item => [
      item.name,
      item.averageStock,
      item.salesVolume,
      item.turnoverRate,
      item.turnoverDays
    ]);
    filename = 'оборачиваемость';
  } else if (activeTab.value === 'financial') {
    // Для финансовой вкладки формируем специальную сводку
    headers = ['Показатель', 'Значение'];
    data = [
      ['Общая стоимость запасов', totalInventoryCost.value + ' ₽'],
      ['Оборот за период', totalTurnover.value + ' ₽'],
      ['Прибыль за период', totalProfit.value + ' ₽']
    ];
    filename = 'финансовые-показатели';
  }
  
  // Добавляем период в имя файла
  if (startDate.value && endDate.value) {
    filename += `_${startDate.value}_${endDate.value}`;
  }
  
  // Создаем CSV строку
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Добавляем заголовок с информацией о периоде
  csvContent += `Отчет: ${getReportTitle()}\r\n`;
  if (startDate.value && endDate.value) {
    csvContent += `Период: ${formatDateForDisplay(startDate.value)} - ${formatDateForDisplay(endDate.value)}\r\n\r\n`;
  }
  
  // Добавляем заголовки
  csvContent += headers.join(";") + "\r\n";
  
  // Добавляем данные
  data.forEach(row => {
    const formattedRow = row.map(cell => {
      // Форматируем числовые значения
      if (typeof cell === 'number') {
        return cell.toLocaleString().replace('.', ',');
      }
      return cell;
    });
    csvContent += formattedRow.join(";") + "\r\n";
  });
  
  // Создаем ссылку для скачивания и имитируем клик
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Функция для печати отчета
const printReport = () => {
  if (!isDataLoaded.value) return;
  
  // Сохраняем текущий title
  const originalTitle = document.title;
  
  // Устанавливаем новый title для печати
  document.title = getReportTitle();
  
  // Создаем стили для печати
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    @media print {
      body * {
        visibility: hidden;
      }
      
      .report-content, .report-content * {
        visibility: visible;
      }
      
      .report-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      
      .chart-container {
        page-break-inside: avoid;
        margin-bottom: 20px;
      }
      
      .report-table-container {
        page-break-inside: avoid;
      }
      
      .financial-summary {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 30px;
      }
      
      h1 {
        text-align: center;
        margin: 20px 0;
        font-size: 24px;
      }
      
      h2 {
        margin: 15px 0;
        font-size: 18px;
      }
      
      .print-header {
        text-align: center;
        margin-bottom: 20px;
      }
      
      .print-date {
        text-align: center;
        margin-bottom: 30px;
        font-style: italic;
      }
      
      /* Убираем кнопки из печати */
      .report-actions, button, .mobile-menu-toggle {
        display: none !important;
      }
    }
  `;
  
  document.head.appendChild(style);
  
  // Создаем заголовок и дату для печати
  const header = document.createElement('div');
  header.className = 'print-header';
  header.innerHTML = `<h1>${getReportTitle()}</h1>`;
  
  const dateInfo = document.createElement('div');
  dateInfo.className = 'print-date';
  if (startDate.value && endDate.value) {
    dateInfo.innerHTML = `Период: ${formatDateForDisplay(startDate.value)} - ${formatDateForDisplay(endDate.value)}`;
  }
  
  // Находим контейнер для отчета и вставляем информацию только для печати
  const reportContent = document.querySelector('.report-content');
  reportContent.insertBefore(dateInfo, reportContent.firstChild);
  reportContent.insertBefore(header, reportContent.firstChild);
  
  // Вызываем печать
  window.print();
  
  // Восстанавливаем оригинальный заголовок и удаляем временные элементы
  document.title = originalTitle;
  reportContent.removeChild(header);
  reportContent.removeChild(dateInfo);
  document.head.removeChild(style);
};

// Вспомогательная функция для форматирования даты для отображения
const formatDateForDisplay = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU');
};

// Получение заголовка отчета в зависимости от активной вкладки
const getReportTitle = () => {
  switch (activeTab.value) {
    case 'inventory':
      return 'Отчет по остаткам на складе';
    case 'movement':
      return 'Отчет по движению товаров';
    case 'turnover':
      return 'Отчет по оборачиваемости товаров';
    case 'financial':
      return 'Финансовый отчет';
    default:
      return 'Отчет';
  }
};

onMounted(async () => {
  if (process.client) {
    // Проверяем авторизацию
    authStore.checkAuth();
    
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
    await loadData();
    
    // Автоматически генерируем отчет при загрузке страницы
    // Это предотвратит отображение NaN в таблице
    generateReport();
  }
});
</script>

<style lang="scss" scoped>
.reports {
  padding: 1rem 0;
  
  @media (max-width: 768px) {
    padding: 0.5rem 0;
  }
}

.page-title {
  margin-bottom: 2rem;
  font-size: 2rem;
  color: var(--text-color);
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }
}

.report-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
  overflow-x: auto;
  
  @media (max-width: 768px) {
    flex-wrap: nowrap;
    width: 100%;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    color: var(--primary-color);
  }
  
  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

.report-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    margin-bottom: 1rem;
    gap: 0.75rem;
  }
}

.filter-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 200px;
  
  @media (max-width: 480px) {
    min-width: 100%;
  }
}

.date-range {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .date-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    @media (max-width: 480px) {
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
      
      .dropdown {
        width: 100%;
        
        button {
          width: 100%;
          justify-content: space-between;
        }
        
        .dropdown-menu {
          width: 100%;
          min-width: unset;
        }
      }
    }
  }
  
  .generate-btn {
    @media (max-width: 480px) {
      width: 100%;
    }
  }
}

.report-content {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
}

.chart-container {
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--text-color);
    text-align: center;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    
    h2 {
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
    }
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
    
    h2 {
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
  }
}

.report-table-container {
  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--text-color);
    text-align: center;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
  }
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 1rem;
    text-align: center;
    border-bottom: 1px solid #e5e7eb;
    
    @media (max-width: 768px) {
      padding: 0.75rem 0.5rem;
      font-size: 0.9rem;
    }
    
    @media (max-width: 480px) {
      padding: 0.5rem 0.3rem;
      font-size: 0.8rem;
    }
    
    @media (max-width: 360px) {
      padding: 0.4rem 0.2rem;
      font-size: 0.7rem;
    }
  }
  
  th {
    background-color: #f9fafb;
    color: #4b5563;
    font-weight: 600;
    position: sticky;
    top: 0;
  }
  
  tbody tr:last-child td {
    border-bottom: none;
  }
  
  tbody tr:hover td {
    background-color: #f3f4f6;
  }
  
  tfoot {
    background-color: #f9fafb;
    
    td {
      border-top: 2px solid #e5e7eb;
    }
  }
  
  @media (max-width: 640px) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    
    th:not(:first-child), td:not(:first-child) {
      min-width: 80px;
    }
  }
  
  @media (max-width: 360px) {
    th:not(:first-child), td:not(:first-child) {
      min-width: 70px;
    }
  }
}

.financial-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.summary-card {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  
  h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    color: #6b7280;
  }
  
  .summary-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--primary-color);
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    
    h3 {
      font-size: 0.9rem;
    }
    
    .summary-value {
      font-size: 1.5rem;
    }
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    
    h3 {
      font-size: 0.85rem;
      margin-bottom: 0.3rem;
    }
    
    .summary-value {
      font-size: 1.25rem;
    }
  }
}

.report-actions {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    
    .btn {
      width: 100%;
    }
  }
  
  @media (max-width: 768px) and (min-width: 481px) {
    flex-wrap: wrap;
    
    .btn {
      flex: 1;
      min-width: 150px;
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
    border-left-color: var(--primary-color);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  p {
    margin-top: 1rem;
    color: var(--text-color);
  }
}
</style> 