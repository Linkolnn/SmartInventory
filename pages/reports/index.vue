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
            <input type="date" class="form-input" v-model="startDate" />
            <span>—</span>
            <input type="date" class="form-input" v-model="endDate" />
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
        </div>
        
        <button class="btn btn-primary" @click="generateReport">Сформировать отчет</button>
      </div>
      
      <div class="report-content">
        <!-- Отображаем содержимое в зависимости от активной вкладки -->
        <div v-if="activeTab === 'inventory'" class="inventory-report">
          <div class="chart-container">
            <h2>Распределение товаров по категориям</h2>
            <div class="chart-placeholder">
              Круговая диаграмма категорий
            </div>
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
            <div class="chart-placeholder">
              Линейный график движения товаров
            </div>
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
            <div class="chart-placeholder">
              Гистограмма оборачиваемости
            </div>
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
                  <td>{{ item.turnoverRate.toFixed(2) }}</td>
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
            <div class="chart-placeholder">
              График финансовых показателей
            </div>
          </div>
        </div>
      </div>
      
      <div class="report-actions">
        <button class="btn btn-secondary">Экспорт в Excel</button>
        <button class="btn btn-secondary">Печать отчета</button>
      </div>
    </div>
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>Загрузка...</p>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import DefaultLayout from '@/components/layout/DefaultLayout.vue';

const router = useRouter();
const authStore = useAuthStore();
const isContentVisible = ref(false);

const activeTab = ref('inventory');
const startDate = ref('');
const endDate = ref('');
const category = ref('');

// Демо-данные для отчетов
const inventoryData = ref([
  { name: 'Клавиатура KL-5000', category: 'Электроника', quantity: 15, total: 18000, percentage: 25 },
  { name: 'Монитор MP-2700', category: 'Электроника', quantity: 8, total: 120000, percentage: 35 },
  { name: 'Стол офисный', category: 'Мебель', quantity: 3, total: 24000, percentage: 15 },
  { name: 'Кресло офисное', category: 'Мебель', quantity: 5, total: 30000, percentage: 20 },
  { name: 'Бумага A4', category: 'Канцтовары', quantity: 50, total: 15000, percentage: 5 }
]);

const movementData = ref([
  { name: 'Клавиатура KL-5000', initialQuantity: 10, incoming: 15, outgoing: 10, finalQuantity: 15 },
  { name: 'Монитор MP-2700', initialQuantity: 5, incoming: 10, outgoing: 7, finalQuantity: 8 },
  { name: 'Стол офисный', initialQuantity: 2, incoming: 5, outgoing: 4, finalQuantity: 3 },
  { name: 'Кресло офисное', initialQuantity: 3, incoming: 7, outgoing: 5, finalQuantity: 5 },
  { name: 'Бумага A4', initialQuantity: 30, incoming: 50, outgoing: 30, finalQuantity: 50 }
]);

const turnoverData = ref([
  { name: 'Клавиатура KL-5000', averageStock: 12, salesVolume: 120000, turnoverRate: 10, turnoverDays: 36 },
  { name: 'Монитор MP-2700', averageStock: 6, salesVolume: 450000, turnoverRate: 5, turnoverDays: 72 },
  { name: 'Стол офисный', averageStock: 2, salesVolume: 80000, turnoverRate: 2.5, turnoverDays: 144 },
  { name: 'Кресло офисное', averageStock: 4, salesVolume: 120000, turnoverRate: 4, turnoverDays: 90 },
  { name: 'Бумага A4', averageStock: 40, salesVolume: 60000, turnoverRate: 15, turnoverDays: 24 }
]);

// Вычисляемые значения
const totalInventoryCost = ref(207000);
const totalTurnover = ref(830000);
const totalProfit = ref(270000);

// Метод генерации отчета (в реальном проекте будет запрос к API)
const generateReport = () => {
  console.log('Generating report with params:', {
    tab: activeTab.value,
    startDate: startDate.value,
    endDate: endDate.value,
    category: category.value
  });
  
  // Здесь был бы запрос к API для получения данных
  // Для демо просто обновим случайно некоторые значения
  
  if (activeTab.value === 'inventory') {
    inventoryData.value = inventoryData.value.map(item => ({
      ...item,
      quantity: Math.floor(item.quantity * (0.9 + Math.random() * 0.2)),
      total: Math.floor(item.total * (0.9 + Math.random() * 0.2))
    }));
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
    
    // Устанавливаем даты по умолчанию (текущий месяц)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    startDate.value = formatDate(firstDay);
    endDate.value = formatDate(lastDay);
  }
});

// Вспомогательная функция форматирования даты для input type="date"
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
</script>

<style lang="scss" scoped>
.reports {
  padding: 1rem 0;
}

.page-title {
  margin-bottom: 2rem;
  font-size: 2rem;
  color: var(--text-color);
}

.report-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
  overflow-x: auto;
  
  @media (max-width: 768px) {
    flex-wrap: nowrap;
    width: 100%;
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
}

.report-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    color: #6b7280;
  }
  
  input {
    flex: 1;
  }
}

.report-content {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.chart-container {
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--text-color);
  }
}

.chart-placeholder {
  height: 300px;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.report-table-container {
  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--text-color);
  }
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }
  
  th {
    background-color: #f9fafb;
    color: #4b5563;
    font-weight: 600;
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
}

.financial-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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
}

.report-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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