<template>
  <DefaultLayout>
    <div v-if="isContentVisible" class="dashboard">
      <h1 class="page-title">Панель управления</h1>
      
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-card-inner">
            <div class="stat-icon">
              <span class="icon">📦</span>
            </div>
            <div class="stat-content">
              <h3>Всего наименований</h3>
              <p class="stat-value">142</p>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-card-inner">
            <div class="stat-icon">
              <span class="icon">🔄</span>
            </div>
            <div class="stat-content">
              <h3>Движение за 30 дней</h3>
              <p class="stat-value">348</p>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-card-inner">
            <div class="stat-icon">
              <span class="icon">⚠️</span>
            </div>
            <div class="stat-content">
              <h3>Критические остатки</h3>
              <p class="stat-value">12</p>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-card-inner">
            <div class="stat-icon">
              <span class="icon">💰</span>
            </div>
            <div class="stat-content">
              <h3>Стоимость склада</h3>
              <p class="stat-value">1,234,567 ₽</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-charts">
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
          <div class="activity-item">
            <div class="activity-icon in">+</div>
            <div class="activity-details">
              <h4>Поступление товара</h4>
              <p>Клавиатура KL-5000 x10</p>
              <span class="activity-time">Сегодня, 15:30</span>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon out">-</div>
            <div class="activity-details">
              <h4>Отгрузка товара</h4>
              <p>Монитор MP-2700 x3</p>
              <span class="activity-time">Сегодня, 14:15</span>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon in">+</div>
            <div class="activity-details">
              <h4>Поступление товара</h4>
              <p>Мышь ML-100 x20</p>
              <span class="activity-time">Вчера, 11:45</span>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon out">-</div>
            <div class="activity-details">
              <h4>Отгрузка товара</h4>
              <p>Наушники NH-500 x5</p>
              <span class="activity-time">Вчера, 10:20</span>
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
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { gsap } from 'gsap';
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import LineChart from '@/components/dashboard/LineChart.vue';
import DoughnutChart from '@/components/dashboard/DoughnutChart.vue';

const router = useRouter();
const authStore = useAuthStore();
const isContentVisible = ref(false);

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
    
    // Запускаем анимации ТОЛЬКО после отрисовки контента
    await nextTick();
    animateContent();
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
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 480px) {
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 320px) {
    gap: 0.75rem;
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
  max-width: calc(25% - 1.125rem);
  display: flex;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 480px) {
    min-width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .stat-card {
    max-width: 100%;
  }
}

@media (max-width: 992px) and (min-width: 769px) {
  .stat-card {
    max-width: calc(50% - 0.75rem);
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
  flex-direction: column;
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