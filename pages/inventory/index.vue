<template>
  <DefaultLayout>
    <div v-if="isContentVisible" class="inventory">
      <div class="inventory-header">
        <h1 class="page-title">Управление складом</h1>
        <div class="inventory-actions">
          <button class="btn btn-primary" @click="showAddItemModal = true">Добавить товар</button>
          <button class="btn btn-secondary">Экспорт</button>
          <button class="btn btn-secondary">Печать</button>
        </div>
      </div>
      
      <div class="inventory-filters">
        <div class="search-group">
          <input 
            type="text" 
            class="form-input" 
            placeholder="Поиск товаров..." 
            v-model="searchQuery"
          />
        </div>
        <div class="filters-group">
          <select class="form-input" v-model="categoryFilter">
            <option value="">Все категории</option>
            <option value="electronics">Электроника</option>
            <option value="furniture">Мебель</option>
            <option value="office">Канцтовары</option>
            <option value="parts">Запчасти</option>
          </select>
          
          <select class="form-input" v-model="sortBy">
            <option value="name">По названию</option>
            <option value="quantity">По количеству</option>
            <option value="price">По цене</option>
            <option value="date">По дате</option>
          </select>
        </div>
      </div>
      
      <div class="inventory-table-container">
        <table class="inventory-table">
          <thead>
            <tr>
              <th>Код</th>
              <th>Наименование</th>
              <th>Категория</th>
              <th>Количество</th>
              <th>Ед. изм.</th>
              <th>Цена</th>
              <th>Сумма</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id">
              <td>{{ item.code }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.category }}</td>
              <td :class="{ 'low-stock': item.quantity <= item.minQuantity }">
                {{ item.quantity }}
              </td>
              <td>{{ item.unit }}</td>
              <td>{{ item.price }} ₽</td>
              <td>{{ (item.quantity * item.price).toLocaleString() }} ₽</td>
              <td class="actions-cell">
                <button class="action-btn edit" @click="editItem(item)">
                  ✏️
                </button>
                <button class="action-btn delete" @click="confirmDeleteItem(item)">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pagination">
        <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage--">
          &laquo; Назад
        </button>
        <span class="pagination-info">Страница {{ currentPage }} из {{ totalPages }}</span>
        <button class="pagination-btn" :disabled="currentPage === totalPages" @click="currentPage++">
          Вперед &raquo;
        </button>
      </div>
      
      <!-- Modal для добавления товара (в реальном проекте вынесем в компонент) -->
      <div v-if="showAddItemModal" class="modal-overlay" @click="showAddItemModal = false">
        <div class="modal-content" @click.stop>
          <h2>Добавить товар</h2>
          <form @submit.prevent="addItem">
            <div class="form-group">
              <label for="itemName" class="form-label">Наименование</label>
              <input type="text" id="itemName" class="form-input" v-model="newItem.name" required />
            </div>
            
            <div class="form-group">
              <label for="itemCategory" class="form-label">Категория</label>
              <select id="itemCategory" class="form-input" v-model="newItem.category" required>
                <option value="electronics">Электроника</option>
                <option value="furniture">Мебель</option>
                <option value="office">Канцтовары</option>
                <option value="parts">Запчасти</option>
              </select>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="itemQuantity" class="form-label">Количество</label>
                <input type="number" id="itemQuantity" class="form-input" v-model="newItem.quantity" min="0" required />
              </div>
              
              <div class="form-group">
                <label for="itemUnit" class="form-label">Ед. изм.</label>
                <select id="itemUnit" class="form-input" v-model="newItem.unit" required>
                  <option value="шт">шт</option>
                  <option value="кг">кг</option>
                  <option value="л">л</option>
                  <option value="м">м</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="itemPrice" class="form-label">Цена</label>
                <input type="number" id="itemPrice" class="form-input" v-model="newItem.price" min="0" step="0.01" required />
              </div>
              
              <div class="form-group">
                <label for="itemMinQuantity" class="form-label">Мин. остаток</label>
                <input type="number" id="itemMinQuantity" class="form-input" v-model="newItem.minQuantity" min="0" required />
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="showAddItemModal = false">Отмена</button>
              <button type="submit" class="btn btn-primary">Добавить</button>
            </div>
          </form>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { gsap } from 'gsap';
import DefaultLayout from '@/components/layout/DefaultLayout.vue';

const router = useRouter();
const authStore = useAuthStore();
const isContentVisible = ref(false);

// Временные данные для таблицы (в реальном проекте будем получать с сервера)
const items = ref([
  { id: 1, code: 'KB001', name: 'Клавиатура KL-5000', category: 'Электроника', quantity: 15, unit: 'шт', price: 1200, minQuantity: 5 },
  { id: 2, code: 'MN001', name: 'Монитор MP-2700', category: 'Электроника', quantity: 8, unit: 'шт', price: 15000, minQuantity: 3 },
  { id: 3, code: 'MS001', name: 'Мышь ML-100', category: 'Электроника', quantity: 25, unit: 'шт', price: 800, minQuantity: 10 },
  { id: 4, code: 'HD001', name: 'Наушники NH-500', category: 'Электроника', quantity: 12, unit: 'шт', price: 2500, minQuantity: 5 },
  { id: 5, code: 'TB001', name: 'Стол офисный', category: 'Мебель', quantity: 3, unit: 'шт', price: 8000, minQuantity: 2 },
  { id: 6, code: 'CH001', name: 'Кресло офисное', category: 'Мебель', quantity: 5, unit: 'шт', price: 6000, minQuantity: 2 },
  { id: 7, code: 'PP001', name: 'Бумага A4', category: 'Канцтовары', quantity: 50, unit: 'шт', price: 300, minQuantity: 20 },
  { id: 8, code: 'PN001', name: 'Ручки шариковые', category: 'Канцтовары', quantity: 100, unit: 'шт', price: 30, minQuantity: 30 },
]);

// Состояние для модального окна и нового товара
const showAddItemModal = ref(false);
const newItem = ref({
  name: '',
  category: 'electronics',
  quantity: 0,
  unit: 'шт',
  price: 0,
  minQuantity: 0
});

// Состояние для фильтрации и сортировки
const searchQuery = ref('');
const categoryFilter = ref('');
const sortBy = ref('name');
const currentPage = ref(1);
const itemsPerPage = 5;

// Фильтрация и сортировка товаров
const filteredItems = computed(() => {
  let result = [...items.value];
  
  // Фильтрация по поиску
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.code.toLowerCase().includes(query)
    );
  }
  
  // Фильтрация по категории
  if (categoryFilter.value) {
    result = result.filter(item => item.category.toLowerCase() === categoryFilter.value);
  }
  
  // Сортировка
  result.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy.value === 'quantity') {
      return b.quantity - a.quantity;
    } else if (sortBy.value === 'price') {
      return b.price - a.price;
    }
    return 0;
  });
  
  // Пагинация
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  return result.slice(startIndex, startIndex + itemsPerPage);
});

// Вычисляем общее количество страниц
const totalPages = computed(() => {
  return Math.ceil(items.value.length / itemsPerPage);
});

// Методы для работы с товарами
const addItem = () => {
  const id = items.value.length + 1;
  const code = `IT${id.toString().padStart(3, '0')}`;
  
  items.value.push({
    id,
    code,
    ...newItem.value
  });
  
  // Сбрасываем форму и закрываем модальное окно
  newItem.value = {
    name: '',
    category: 'electronics',
    quantity: 0,
    unit: 'шт',
    price: 0,
    minQuantity: 0
  };
  showAddItemModal.value = false;
};

const editItem = (item) => {
  // В реальном проекте реализуем редактирование товара
  console.log('Edit item:', item);
};

const confirmDeleteItem = (item) => {
  // В реальном проекте реализуем удаление с подтверждением
  if (confirm(`Вы уверены, что хотите удалить товар "${item.name}"?`)) {
    items.value = items.value.filter(i => i.id !== item.id);
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
    
    // Показываем контент только после проверки авторизации
    isContentVisible.value = true;
    
    // Загружаем данные... (если есть)
  }
});
</script>

<style lang="scss" scoped>
.inventory {
  padding: 1rem 0;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

.page-title {
  margin: 0;
  font-size: 2rem;
  color: var(--text-color);
}

.inventory-actions {
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
}

.inventory-filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
  
  .search-group {
    flex: 1;
  }
  
  .filters-group {
    display: flex;
    gap: 0.5rem;
    
    @media (max-width: 768px) {
      width: 100%;
    }
    
    select {
      min-width: 150px;
      
      @media (max-width: 768px) {
        flex: 1;
      }
    }
  }
}

.inventory-table-container {
  overflow-x: auto;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.inventory-table {
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
    white-space: nowrap;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tr:hover td {
    background-color: #f3f4f6;
  }
  
  .low-stock {
    color: var(--error-color);
    font-weight: 600;
  }
  
  .actions-cell {
    white-space: nowrap;
    width: 100px;
  }
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #e5e7eb;
  }
  
  &.edit {
    margin-right: 0.5rem;
  }
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.pagination-btn {
  background-color: white;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.pagination-info {
  color: #6b7280;
}

.form-row {
  display: flex;
  gap: 1rem;
  
  .form-group {
    flex: 1;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  
  h2 {
    margin-bottom: 1.5rem;
    color: var(--primary-color);
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  
  .loading-spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: var(--primary-color);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
  }
  
  p {
    margin-top: 1rem;
    color: var(--text-color);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>