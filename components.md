# Описание ключевых компонентов СмартСклад

## Описание компонента `app.vue`

Компонент `app.vue` является корневым компонентом приложения **СмартСклад**. Он отвечает за инициализацию хранилища данных, отслеживание изменений в данных и их сохранение в локальное хранилище браузера. Компонент использует систему макетов Nuxt для обеспечения единообразного отображения всех страниц приложения.

### Объяснение кода в `app.vue`

- `<NuxtLayout>` — система макетов Nuxt, которая обеспечивает последовательную структуру страниц приложения.
- `<NuxtPage />` — компонент, отвечающий за отображение содержимого текущей страницы в зависимости от маршрута.
- Использование хука `watch` для отслеживания изменений в хранилище данных (`products` и `statistics`) и автоматического сохранения в localStorage.
- Хук `onMounted` для загрузки данных из localStorage при запуске приложения, обеспечивая сохранность данных между сессиями.
- Импорт глобальных стилей из `main.scss`, который содержит основные стилевые настройки приложения.

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useDatabaseStore } from '@/store/database';

const databaseStore = useDatabaseStore();

// Следим за изменениями в хранилище и сохраняем данные в localStorage
watch(() => databaseStore.products, () => {
  if (databaseStore.initialized && process.client) {
    databaseStore.saveDataToLocalStorage();
  }
}, { deep: true });

watch(() => databaseStore.statistics, () => {
  if (databaseStore.initialized && process.client) {
    databaseStore.saveDataToLocalStorage();
  }
}, { deep: true });

onMounted(async () => {
  if (process.client) {
    // Загружаем базу данных при запуске приложения
    // Сначала пробуем загрузить из localStorage, затем из файла
    await databaseStore.loadAllData();
  }
});
</script>

<style lang="scss">
@import '@/assets/styles/main.scss';
</style>
```

## Описание компонента `TheHeader.vue`

Компонент `TheHeader.vue` представляет собой шапку приложения **СмартСклад** и является одним из ключевых элементов пользовательского интерфейса. Он обеспечивает навигацию по приложению, отображает информацию о текущем пользователе и адаптируется к различным размерам экрана, предоставляя мобильное меню для маленьких устройств.

### Объяснение кода в `TheHeader.vue`

- Логотип приложения с ссылкой на главную страницу.
- Адаптивное мобильное меню с "бургер" кнопкой для маленьких экранов.
- Условное отображение различных пунктов меню в зависимости от статуса аутентификации пользователя.
- Отображение имени пользователя и кнопок для доступа к профилю или выхода из системы.
- Использование компонента `ClientOnly` для предотвращения ошибок гидратации при серверном рендеринге.
- Различные навигационные ссылки с разграничением доступа в зависимости от роли пользователя.

```vue
<template>
  <header class="header">
    <div class="container header-container">
      <div class="logo">
        <NuxtLink to="/">
          <h1>СмартСклад</h1>
        </NuxtLink>
      </div>
      
      <!-- Мобильное меню (бургер) -->
      <div class="mobile-menu-toggle" @click="toggleMobileMenu" :class="{ 'active': showMobileMenu }">
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <nav class="main-nav" :class="{ 'mobile-active': showMobileMenu }">
        <!-- Мобильный блок пользователя в начале меню -->
        <div v-if="showMobileMenu" class="mobile-user-actions">
          <ClientOnly>
            <div v-if="authStore.isAuthenticated" class="mobile-user-profile">
              <span class="mobile-user-name">{{ authStore.user?.name || 'Пользователь' }}</span>
              <div class="mobile-user-buttons">
                 <NuxtLink to="/profile" class="mobile-profile-btn" @click="closeMobileMenu">
                  <button class="mobile-profile-btn">Профиль</button>
                </NuxtLink>
                <button class="mobile-logout-btn" @click="handleLogout">Выйти</button>
              </div>
            </div>
            <div v-else class="mobile-login-container">
              <NuxtLink to="/auth/login" class="mobile-login-btn" @click="closeMobileMenu">
                <button class="mobile-login-btn">Войти</button>
              </NuxtLink>
            </div>
          </ClientOnly>
        </div>
        
        <ul>
          <li><NuxtLink to="/" @click="closeMobileMenu">Главная</NuxtLink></li>
          <!-- Ссылки для неавторизованных пользователей -->
          <ClientOnly>
            <template v-if="!authStore.isAuthenticated">
              <li><NuxtLink to="/about" @click="closeMobileMenu">О сервисе</NuxtLink></li>
              <li><NuxtLink to="/contact" @click="closeMobileMenu">Контакты</NuxtLink></li>
              <li><NuxtLink to="/faq" @click="closeMobileMenu">FAQ</NuxtLink></li>
            </template>
            <!-- Ссылки для авторизованных пользователей -->
            <template v-else>
              <li><NuxtLink to="/inventory" @click="closeMobileMenu">Склад</NuxtLink></li>
              <li v-if="authStore.isManager"><NuxtLink to="/reports" @click="closeMobileMenu">Отчеты</NuxtLink></li>
              <li v-if="authStore.isManager"><NuxtLink to="/dashboard" @click="closeMobileMenu">Панель управления</NuxtLink></li>
            </template>
          </ClientOnly>
        </ul>
      </nav>
      
      <!-- Блок пользователя (десктоп) -->
      <div class="user-actions">
        <ClientOnly>
          <div v-if="authStore.isAuthenticated" class="user-profile">
            <div class="user-info" @click="toggleUserMenu">
              <span class="user-name">{{ authStore.user?.name || 'Пользователь' }}</span>
              <span class="user-role">{{ getUserRole }}</span>
              <span class="dropdown-icon" :class="{ 'open': showUserMenu }">▼</span>
            </div>
            <div v-if="showUserMenu" class="user-menu">
              <NuxtLink to="/profile" class="user-menu-item" @click="showUserMenu = false">
                Профиль
              </NuxtLink>
              <div class="user-menu-item" @click="handleLogout">Выйти</div>
            </div>
          </div>
          <div v-else class="login-container">
            <NuxtLink to="/auth/login" class="login-btn">
              <button class="login-btn">Войти</button>
            </NuxtLink>
          </div>
        </ClientOnly>
      </div>
    </div>
  </header>
</template>
```

## Описание компонента `ProductCard.vue`

Компонент `ProductCard.vue` является ключевым элементом интерфейса для отображения информации о товаре в приложении **СмартСклад**. Он представляет собой карточку товара с визуальным представлением категории, основной информацией о товаре и кнопками для управления.

### Объяснение кода в `ProductCard.vue`

- Визуальное представление категории товара с использованием цветового кодирования и иконок.
- Отображение основной информации о товаре: название, код, категория, количество и цена.
- Визуальное выделение товаров с низким уровнем запасов для привлечения внимания пользователя.
- Кнопки для быстрых действий: редактирование, просмотр детальной информации и удаление товара.
- Использование вычисляемых свойств для определения цвета категории, иконки категории и статуса запасов.
- Эмиты событий для обработки действий пользователя в родительском компоненте.

```vue
<template>
  <div class="product-card" :class="{ 'low-stock': isLowStock }">
    <div class="product-image" :style="{ 'background-color': getColorByCategory }">
      <span class="product-icon">{{ getCategoryIcon }}</span>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="product-details">
        <div class="detail-row">
          <span class="detail-label">Код:</span>
          <span class="detail-value">{{ product.code }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Категория:</span>
          <span class="detail-value">{{ product.category }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">В наличии:</span>
          <span class="detail-value" :class="{ 'text-danger': isLowStock }">
            {{ product.quantity }} {{ product.unit }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Цена:</span>
          <span class="detail-value">{{ product.price.toLocaleString() }} ₽</span>
        </div>
      </div>
      <div class="product-actions">
        <button class="btn-icon" @click="$emit('edit', product)">
          <span class="icon">✏️</span>
        </button>
        <button class="btn-icon" @click="$emit('view', product)">
          <span class="icon">👁️</span>
        </button>
        <button class="btn-icon" @click="$emit('delete', product)">
          <span class="icon">🗑️</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

// Определяем, является ли товар с низким уровнем запасов
const isLowStock = computed(() => {
  return props.product.quantity <= props.product.minQuantity;
});

// Получаем цвет для категории товара
const getColorByCategory = computed(() => {
  const categoryColors = {
    'Электроника': '#4285F4',
    'Одежда': '#EA4335',
    'Продукты': '#34A853',
    'Мебель': '#FBBC05',
    'Канцтовары': '#9C27B0',
    'Инструменты': '#FF9800'
  };
  
  return categoryColors[props.product.category] || '#607D8B';
});

// Получаем иконку для категории товара
const getCategoryIcon = computed(() => {
  const categoryIcons = {
    'Электроника': '📱',
    'Одежда': '👕',
    'Продукты': '🍎',
    'Мебель': '🪑',
    'Канцтовары': '📝',
    'Инструменты': '🔧'
  };
  
  return categoryIcons[props.product.category] || '📦';
});

defineEmits(['edit', 'view', 'delete']);
</script>
```

## Описание компонента `ChartComponent.vue`

Компонент `ChartComponent.vue` является универсальным компонентом для визуализации данных в приложении **СмартСклад**. Он использует библиотеку Chart.js для создания различных типов графиков: линейных, столбчатых, круговых и других. Компонент обеспечивает интерактивное отображение аналитических данных и статистики.

### Объяснение кода в `ChartComponent.vue`

- Использование Canvas API для отрисовки графиков через библиотеку Chart.js.
- Поддержка различных типов графиков: линейные, столбчатые, круговые, радарные.
- Динамическое обновление графика при изменении данных без необходимости перерисовки всего компонента.
- Адаптивность к изменению размеров окна браузера с автоматической перерисовкой.
- Очистка ресурсов при размонтировании компонента для предотвращения утечек памяти.
- Валидация входных данных для обеспечения корректного отображения графика.

```vue
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

// Следим за изменениями опций и обновляем график
watch(() => props.options, (newOptions) => {
  if (chartInstance) {
    chartInstance.options = { ...chartInstance.options, ...newOptions };
    chartInstance.update();
  }
}, { deep: true });

// Функция создания графика
const createChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  chartInstance = new Chart(chartCanvas.value, {
    type: props.type,
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      ...props.options
    }
  });
};

// Обработчик изменения размера окна
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// Очищаем ресурсы при размонтировании компонента
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  if (process.client) {
    window.removeEventListener('resize', handleResize);
  }
});
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
```
