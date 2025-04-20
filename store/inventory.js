import { defineStore } from 'pinia';

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    // Список товаров
    items: [
      { id: 1, code: 'KB001', name: 'Клавиатура KL-5000', category: 'Электроника', quantity: 15, unit: 'шт', price: 1200, minQuantity: 5 },
      { id: 2, code: 'MN001', name: 'Монитор MP-2700', category: 'Электроника', quantity: 8, unit: 'шт', price: 15000, minQuantity: 3 },
      { id: 3, code: 'MS001', name: 'Мышь ML-100', category: 'Электроника', quantity: 25, unit: 'шт', price: 800, minQuantity: 10 },
      { id: 4, code: 'HD001', name: 'Наушники NH-500', category: 'Электроника', quantity: 12, unit: 'шт', price: 2500, minQuantity: 5 },
      { id: 5, code: 'TB001', name: 'Стол офисный', category: 'Мебель', quantity: 3, unit: 'шт', price: 8000, minQuantity: 2 },
      { id: 6, code: 'CH001', name: 'Кресло офисное', category: 'Мебель', quantity: 5, unit: 'шт', price: 6000, minQuantity: 2 },
      { id: 7, code: 'PP001', name: 'Бумага A4', category: 'Канцтовары', quantity: 50, unit: 'шт', price: 300, minQuantity: 20 },
      { id: 8, code: 'PN001', name: 'Ручки шариковые', category: 'Канцтовары', quantity: 100, unit: 'шт', price: 30, minQuantity: 30 },
    ],
    
    // Список категорий
    categories: [
      { id: 1, name: 'Электроника' },
      { id: 2, name: 'Мебель' },
      { id: 3, name: 'Канцтовары' },
      { id: 4, name: 'Запчасти' },
    ],
    
    // Список единиц измерения
    units: [
      { id: 1, name: 'шт' },
      { id: 2, name: 'кг' },
      { id: 3, name: 'л' },
      { id: 4, name: 'м' },
    ],
    
    // История движения товаров
    movements: [
      { id: 1, date: '2023-11-14T15:30:00', type: 'in', itemId: 1, quantity: 10, price: 1200, totalPrice: 12000, description: 'Поступление товара' },
      { id: 2, date: '2023-11-14T14:15:00', type: 'out', itemId: 2, quantity: 3, price: 15000, totalPrice: 45000, description: 'Отгрузка товара' },
      { id: 3, date: '2023-11-13T11:45:00', type: 'in', itemId: 3, quantity: 20, price: 800, totalPrice: 16000, description: 'Поступление товара' },
      { id: 4, date: '2023-11-13T10:20:00', type: 'out', itemId: 4, quantity: 5, price: 2500, totalPrice: 12500, description: 'Отгрузка товара' },
    ],
    
    // Флаги состояния
    loading: false,
    error: null
  }),
  
  getters: {
    // Получение всех товаров
    getAllItems: (state) => state.items,
    
    // Получение товаров с низким остатком
    getLowStockItems: (state) => state.items.filter(item => item.quantity <= item.minQuantity),
    
    // Получение товаров по категории
    getItemsByCategory: (state) => (category) => {
      return state.items.filter(item => item.category === category);
    },
    
    // Получение товара по ID
    getItemById: (state) => (id) => {
      return state.items.find(item => item.id === id);
    },
    
    // Получение движений товара по ID
    getItemMovements: (state) => (itemId) => {
      return state.movements.filter(movement => movement.itemId === itemId);
    },
    
    // Общая стоимость всех товаров на складе
    getTotalInventoryValue: (state) => {
      return state.items.reduce((total, item) => total + (item.quantity * item.price), 0);
    },
    
    // Получение всех категорий
    getAllCategories: (state) => state.categories,
    
    // Получение всех единиц измерения
    getAllUnits: (state) => state.units,
  },
  
  actions: {
    // Добавление нового товара
    addItem(item) {
      const id = this.items.length + 1;
      const code = `IT${id.toString().padStart(3, '0')}`;
      
      this.items.push({
        id,
        code,
        ...item
      });
      
      // Добавляем запись о движении товара (поступление)
      this.addMovement({
        type: 'in',
        itemId: id,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.quantity * item.price,
        description: 'Первичное поступление товара'
      });
    },
    
    // Редактирование существующего товара
    updateItem(id, updatedItem) {
      const index = this.items.findIndex(item => item.id === id);
      if (index !== -1) {
        this.items[index] = { ...this.items[index], ...updatedItem };
      }
    },
    
    // Удаление товара
    deleteItem(id) {
      this.items = this.items.filter(item => item.id !== id);
    },
    
    // Добавление записи о движении товара
    addMovement(movement) {
      const id = this.movements.length + 1;
      const date = new Date().toISOString();
      
      this.movements.push({
        id,
        date,
        ...movement
      });
      
      // Обновляем количество товара в зависимости от типа движения
      const itemIndex = this.items.findIndex(item => item.id === movement.itemId);
      if (itemIndex !== -1) {
        if (movement.type === 'in') {
          this.items[itemIndex].quantity += movement.quantity;
        } else if (movement.type === 'out') {
          this.items[itemIndex].quantity -= movement.quantity;
          
          // Проверяем, что количество не стало отрицательным
          if (this.items[itemIndex].quantity < 0) {
            this.items[itemIndex].quantity = 0;
          }
        }
      }
    },
    
    // Добавление новой категории
    addCategory(category) {
      const id = this.categories.length + 1;
      this.categories.push({
        id,
        name: category.name
      });
    },
    
    // Загрузка всех товаров из API
    async fetchItems() {
      this.loading = true;
      this.error = null;
      
      try {
        // Здесь будет запрос к API
        // Имитируем задержку запроса
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // В реальном приложении тут будет код для загрузки данных с сервера
        // this.items = await fetchFromApi('/api/items');
        
        return this.items;
      } catch (err) {
        this.error = err.message || 'Произошла ошибка при загрузке товаров';
        return [];
      } finally {
        this.loading = false;
      }
    }
  }
}); 