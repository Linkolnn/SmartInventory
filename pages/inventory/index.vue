<template>
  <DefaultLayout>
    <div v-if="isContentVisible" class="inventory">
      <div class="inventory-header">
        <h1 class="page-title">Управление складом</h1>
        <div class="inventory-actions">
          <button class="btn btn-primary" @click="showAddItemModal = true">Добавить товар</button>
          <button class="btn btn-secondary" @click="exportToExcel">Экспорт в Excel</button>
          <button class="btn btn-secondary" @click="printInventory">Печать</button>
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
            <option v-for="category in categories" :value="category.name">{{ category.name }}</option>
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
                  <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                </button>
                <button class="action-btn delete" @click="confirmDeleteItem(item)">
                  <font-awesome-icon :icon="['fas', 'trash-alt']" />
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
      
      <!-- Modal для добавления товара -->
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
              <select id="itemCategory" class="form-input" v-model="newItem.category_id" required>
                <option v-for="category in categories" :value="category.id">{{ category.name }}</option>
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
      
      <!-- Modal для редактирования товара -->
      <div v-if="showEditItemModal" class="modal-overlay" @click="showEditItemModal = false">
        <div class="modal-content" @click.stop>
          <h2>Редактировать товар</h2>
          <form @submit.prevent="updateItem">
            <div class="form-group">
              <label for="editItemCode" class="form-label">Код: {{ editingItem.code }}</label>
              <label for="editItemName" class="form-label">Наименование</label>
              <input type="text" id="editItemName" class="form-input" v-model="editingItem.name" required />
            </div>
            
            <div class="form-group">
              <label for="editItemCategory" class="form-label">Категория</label>
              <select id="editItemCategory" class="form-input" v-model="editingItem.category_id" required>
                <option v-for="category in categories" :value="category.id">{{ category.name }}</option>
              </select>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="editItemQuantity" class="form-label">Количество</label>
                <input type="number" id="editItemQuantity" class="form-input" v-model="editingItem.quantity" min="0" required />
              </div>
              
              <div class="form-group">
                <label for="editItemUnit" class="form-label">Ед. изм.</label>
                <select id="editItemUnit" class="form-input" v-model="editingItem.unit" required>
                  <option value="шт">шт</option>
                  <option value="кг">кг</option>
                  <option value="л">л</option>
                  <option value="м">м</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="editItemPrice" class="form-label">Цена</label>
                <input type="number" id="editItemPrice" class="form-input" v-model="editingItem.price" min="0" step="0.01" required />
              </div>
              
              <div class="form-group">
                <label for="editItemMinQuantity" class="form-label">Мин. остаток</label>
                <input type="number" id="editItemMinQuantity" class="form-input" v-model="editingItem.minQuantity" min="0" required />
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="showEditItemModal = false">Отмена</button>
              <button type="submit" class="btn btn-primary">Сохранить</button>
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
import { useDatabaseStore } from '@/store/database';
import { gsap } from 'gsap';
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const router = useRouter();
const authStore = useAuthStore();
const databaseStore = useDatabaseStore();
const isContentVisible = ref(false);
const isLoading = ref(true);
const databaseData = ref(null);

// Состояние для фильтрации и сортировки
const searchQuery = ref('');
const categoryFilter = ref('');
const sortBy = ref('name');
const currentPage = ref(1);
const itemsPerPage = 5;

// Данные для инвентаря
const items = ref([]);

// Состояние для модального окна и нового товара
const showAddItemModal = ref(false);
const newItem = ref({
  name: '',
  category_id: 1,
  quantity: 0,
  unit: 'шт',
  price: 0,
  minQuantity: 0
});

// Состояние для модального окна редактирования
const showEditItemModal = ref(false);
const editingItem = ref({
  id: 0,
  code: '',
  name: '',
  category_id: 1,
  quantity: 0,
  unit: 'шт',
  price: 0,
  minQuantity: 0
});

// Загрузка данных из database.json
const loadData = async () => {
  try {
    isLoading.value = true;
    
    // Убеждаемся, что данные загружены
    if (!databaseStore.initialized) {
      await databaseStore.loadAllData();
    }
    
    if (databaseStore.products.length > 0) {
      // Преобразуем данные в нужный формат для инвентаря
      items.value = databaseStore.products.map(product => {
        const category = databaseStore.categories.find(c => c.id === product.category_id);
        return {
          id: product.id,
          code: product.code,
          name: product.name,
          category: category ? category.name : 'Без категории',
          category_id: product.category_id,
          quantity: product.quantity,
          unit: product.unit,
          price: product.price,
          minQuantity: product.minQuantity
        };
      });
      
      isLoading.value = false;
    }
  } catch (error) {
    isLoading.value = false;
  }
};

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

// Получаем список категорий
const categories = computed(() => {
  return databaseStore.categories;
});

// Методы для работы с товарами
const addItem = async () => {
  // Создаем объект товара для добавления
  const productData = {
    name: newItem.value.name,
    category_id: newItem.value.category_id,
    quantity: newItem.value.quantity,
    unit: newItem.value.unit,
    price: newItem.value.price,
    minQuantity: newItem.value.minQuantity
  };
  
  // Добавляем товар через Pinia store
  const result = databaseStore.addProduct(productData);
  
  if (result.success) {
    // Добавляем товар в локальный массив для отображения
    const category = databaseStore.categories.find(c => c.id === result.product.category_id);
    items.value.push({
      id: result.product.id,
      code: result.product.code,
      name: result.product.name,
      category: category ? category.name : 'Без категории',
      category_id: result.product.category_id,
      quantity: result.product.quantity,
      unit: result.product.unit,
      price: result.product.price,
      minQuantity: result.product.minQuantity
    });
    
    // Сбрасываем форму и закрываем модальное окно
    newItem.value = {
      name: '',
      category_id: 1,
      quantity: 0,
      unit: 'шт',
      price: 0,
      minQuantity: 0
    };
    showAddItemModal.value = false;
    
    // Уведомляем пользователя
    alert('Товар успешно добавлен');
  } else {
    alert(`Ошибка при добавлении товара: ${result.error || 'Неизвестная ошибка'}`);
  }
};

const editItem = (item) => {
  // Копируем данные товара в редактируемый объект
  editingItem.value = { ...item };
  // Открываем модальное окно редактирования
  showEditItemModal.value = true;
};

const updateItem = async () => {
  // Находим индекс товара в массиве
  const index = items.value.findIndex(i => i.id === editingItem.value.id);
  
  if (index !== -1) {
    // Создаем объект товара для обновления
    const productData = {
      id: editingItem.value.id,
      code: editingItem.value.code,
      name: editingItem.value.name,
      category_id: editingItem.value.category_id,
      quantity: editingItem.value.quantity,
      unit: editingItem.value.unit,
      price: editingItem.value.price,
      minQuantity: editingItem.value.minQuantity
    };
    
    // Обновляем товар через Pinia store
    const result = databaseStore.updateProduct(productData);
    
    if (result.success) {
      // Обновляем товар в локальном массиве
      const category = databaseStore.categories.find(c => c.id === productData.category_id);
      items.value[index] = {
        ...editingItem.value,
        category: category ? category.name : 'Без категории'
      };
      
      // Закрываем модальное окно
      showEditItemModal.value = false;
      
      // Уведомляем пользователя
      alert('Товар успешно обновлен');
    } else {
      alert(`Ошибка при обновлении товара: ${result.error || 'Неизвестная ошибка'}`);
    }
  }
};

const confirmDeleteItem = (item) => {
  // В реальном проекте реализуем удаление с подтверждением
  if (confirm(`Вы уверены, что хотите удалить товар "${item.name}"?`)) {
    // Удаляем товар через Pinia store
    const result = databaseStore.deleteProduct(item.id);
    
    if (result.success) {
      // Удаляем товар из локального массива
      items.value = items.value.filter(i => i.id !== item.id);
      
      // Уведомляем пользователя
      alert('Товар успешно удален');
    } else {
      alert(`Ошибка при удалении товара: ${result.error || 'Неизвестная ошибка'}`);
    }
  }
};

// Функция для экспорта данных в Excel
const exportToExcel = () => {
  // Формируем заголовки для CSV
  const headers = ['Код', 'Наименование', 'Категория', 'Количество', 'Ед. изм.', 'Цена', 'Сумма', 'Мин. остаток'];
  
  // Формируем данные для CSV
  const data = filteredItems.value.map(item => [
    item.code,
    item.name,
    item.category,
    item.quantity,
    item.unit,
    item.price,
    item.quantity * item.price,
    item.minQuantity
  ]);
  
  // Создаем CSV строку
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Добавляем заголовок
  csvContent += "Экспорт складских остатков\r\n";
  csvContent += `Дата: ${new Date().toLocaleDateString('ru-RU')}\r\n\r\n`;
  
  // Добавляем заголовки столбцов
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
  
  // Добавляем итоговую строку
  const totalValue = filteredItems.value.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  csvContent += `\r\nИтого: ${totalValue.toLocaleString().replace('.', ',')} ₽\r\n`;
  
  // Создаем ссылку для скачивания и имитируем клик
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `inventory_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Функция для печати инвентаря
const printInventory = () => {
  // Сохраняем текущий title
  const originalTitle = document.title;
  
  // Устанавливаем новый title для печати
  document.title = "Складские остатки";
  
  // Создаем стили для печати
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    @media print {
      body * {
        visibility: hidden;
      }
      
      .inventory-table-container, .inventory-table-container * {
        visibility: visible;
      }
      
      .inventory-table-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      
      .action-btn, .actions-cell {
        display: none;
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
      
      .print-footer {
        margin-top: 30px;
        text-align: right;
      }
    }
  `;
  
  document.head.appendChild(style);
  
  // Создаем заголовок и дату для печати
  const header = document.createElement('div');
  header.className = 'print-header';
  header.innerHTML = `<h1>Складские остатки</h1>`;
  
  const dateInfo = document.createElement('div');
  dateInfo.className = 'print-date';
  dateInfo.innerHTML = `Дата: ${new Date().toLocaleDateString('ru-RU')}`;
  
  // Создаем подвал для печати с итогами
  const footer = document.createElement('div');
  footer.className = 'print-footer';
  const totalValue = filteredItems.value.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  footer.innerHTML = `<strong>Итого:</strong> ${totalValue.toLocaleString()} ₽`;
  
  // Находим контейнер таблицы и вставляем информацию для печати
  const tableContainer = document.querySelector('.inventory-table-container');
  tableContainer.insertBefore(dateInfo, tableContainer.firstChild);
  tableContainer.insertBefore(header, tableContainer.firstChild);
  tableContainer.appendChild(footer);
  
  // Вызываем печать
  window.print();
  
  // Восстанавливаем оригинальный заголовок и удаляем временные элементы
  document.title = originalTitle;
  tableContainer.removeChild(header);
  tableContainer.removeChild(dateInfo);
  tableContainer.removeChild(footer);
  document.head.removeChild(style);
};

// Вспомогательная функция для получения названия категории
const getCategoryName = (categoryId) => {
  if (!databaseStore.categories) return '';
  const category = databaseStore.categories.find(c => c.id === categoryId);
  return category ? category.name : '';
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
    
    // Загружаем данные
    await loadData();
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
  width: 100%;
  overflow-x: auto;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem;
    text-align: center;
    border-bottom: 1px solid #e5e7eb;
  }
  
  th {
    font-weight: 600;
    background-color: #f9fafb;
    position: sticky;
    top: 0;
  }
  
  tbody tr {
    &:hover {
      background-color: #f3f4f6;
    }
  }
  
  .low-stock {
    color: #ef4444;
    font-weight: 600;
  }
  
  .actions-cell {
    white-space: nowrap;
  }
  
  .action-btn {
    background: none;
    border: none;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    transition: transform 0.2s ease;
    
    &:hover {
      transform: scale(1.2);
    }
    
    &.edit {
      color: #3b82f6;
    }
    
    &.delete {
      color: #ef4444;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    
    th, td {
      padding: 0.5rem;
    }
  }
  
  @media (max-width: 640px) {
    // On very small screens
    font-size: 0.8rem;
    
    th, td {
      padding: 0.4rem 0.3rem;
    }
    
    th:nth-child(2), td:nth-child(2) { // Name column
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
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

// Добавляем стили для адаптивности остальных элементов
.inventory-actions {
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    width: 100%;
    
    .btn {
      width: 100%;
      margin-bottom: 0.5rem;
    }
  }
}

.inventory-filters {
  @media (max-width: 768px) {
    flex-direction: column;
    
    .search-group, .filters-group {
      width: 100%;
      margin-bottom: 1rem;
    }
    
    .filters-group {
      flex-direction: column;
      
      select {
        width: 100%;
        margin-bottom: 0.5rem;
      }
    }
  }
}
</style>