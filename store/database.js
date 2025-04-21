import { defineStore } from 'pinia';

export const useDatabaseStore = defineStore('database', {
  state: () => ({
    users: [],
    products: [],
    categories: [],
    suppliers: [],
    orders: [],
    orderItems: [],
    inventoryTransactions: [],
    purchaseOrders: [],
    purchaseOrderItems: [],
    statistics: null,
    loading: false,
    error: null,
    initialized: false
  }),
  
  getters: {
    // Получаем продукты с названиями категорий
    productsWithCategories: (state) => {
      return state.products.map(product => {
        const category = state.categories.find(cat => cat.id === product.category_id);
        return {
          ...product,
          category_name: category ? category.name : 'Без категории'
        };
      });
    },
    
    // Получаем заказы с информацией о пользователе
    ordersWithUserInfo: (state) => {
      return state.orders.map(order => {
        const user = state.users.find(user => user.id === order.user_id);
        return {
          ...order,
          user_name: user ? user.name : 'Неизвестный пользователь',
          user_email: user ? user.email : ''
        };
      });
    },
    
    // Получаем детали заказа с информацией о продуктах
    orderDetailsWithProducts: (state) => (orderId) => {
      const orderItems = state.orderItems.filter(item => item.order_id === orderId);
      return orderItems.map(item => {
        const product = state.products.find(prod => prod.id === item.product_id);
        return {
          ...item,
          product_name: product ? product.name : 'Неизвестный продукт',
          product_sku: product ? product.sku : '',
          total_price: item.quantity * item.price
        };
      });
    },
    
    // Получаем транзакции инвентаря с информацией о продуктах и пользователях
    inventoryTransactionsWithDetails: (state) => {
      return state.inventoryTransactions.map(transaction => {
        const product = state.products.find(prod => prod.id === transaction.product_id);
        const user = state.users.find(user => user.id === transaction.user_id);
        return {
          ...transaction,
          product_name: product ? product.name : 'Неизвестный продукт',
          product_sku: product ? product.sku : '',
          user_name: user ? user.name : 'Неизвестный пользователь'
        };
      });
    },
    
    // Получаем запасы с низким уровнем
    lowStockProducts: (state) => {
      return state.products.filter(product => {
        // Используем reorder_level из продукта или minQuantity, или 5 как дефолтное значение
        const reorderLevel = product.reorder_level || product.minQuantity || 5;
        return product.quantity <= reorderLevel * 1.2; // 20% запас от уровня перезаказа
      }).sort((a, b) => {
        // Сортировка: сначала самые критичные (с наименьшим отношением quantity / reorder_level)
        const reorderLevelA = a.reorder_level || a.minQuantity || 5;
        const reorderLevelB = b.reorder_level || b.minQuantity || 5;
        const ratioA = a.quantity / reorderLevelA;
        const ratioB = b.quantity / reorderLevelB;
        return ratioA - ratioB;
      });
    },
    
    // Расчет стоимости инвентаря
    totalInventoryValue: (state) => {
      return state.products.reduce((total, product) => {
        return total + (product.price * product.quantity);
      }, 0);
    },
    
    // Расчет стоимости инвентаря по категориям
    inventoryValueByCategory: (state) => {
      const valueByCategory = {};
      
      state.products.forEach(product => {
        const category = state.categories.find(cat => cat.id === product.category_id);
        const categoryName = category ? category.name : 'Без категории';
        const productValue = product.price * product.quantity;
        
        if (valueByCategory[categoryName]) {
          valueByCategory[categoryName] += productValue;
        } else {
          valueByCategory[categoryName] = productValue;
        }
      });
      
      return Object.entries(valueByCategory).map(([category, value]) => ({
        category,
        value
      })).sort((a, b) => b.value - a.value); // Сортировка по убыванию стоимости
    },
    
    // Топ продаж по количеству заказов
    topSellingProducts: (state) => {
      const productSales = {};
      
      state.orderItems.forEach(item => {
        if (productSales[item.product_id]) {
          productSales[item.product_id].quantity += item.quantity;
          productSales[item.product_id].revenue += item.price * item.quantity;
        } else {
          productSales[item.product_id] = {
            product_id: item.product_id,
            quantity: item.quantity,
            revenue: item.price * item.quantity
          };
        }
      });
      
      return Object.values(productSales)
        .map(sale => {
          const product = state.products.find(prod => prod.id === sale.product_id);
          return {
            ...sale,
            product_name: product ? product.name : 'Неизвестный продукт',
            product_sku: product ? product.sku : ''
          };
        })
        .sort((a, b) => b.quantity - a.quantity) // Сортировка по убыванию количества продаж
        .slice(0, 10); // Топ 10
    },
    
    // Расчет общей выручки по месяцам
    monthlySalesData: (state) => {
      // Предполагаем, что данные о заказах уже содержат информацию о дате и сумме
      const monthlySales = {};
      
      state.orders.forEach(order => {
        if (!order.order_date) return;
        
        const date = new Date(order.order_date);
        const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (monthlySales[yearMonth]) {
          monthlySales[yearMonth] += order.total_amount;
        } else {
          monthlySales[yearMonth] = order.total_amount;
        }
      });
      
      // Преобразуем в массив для графика
      return Object.entries(monthlySales).map(([yearMonth, value]) => {
        const [year, month] = yearMonth.split('-');
        const monthName = new Date(year, month - 1).toLocaleString('ru-RU', { month: 'short' });
        return {
          month: monthName,
          value
        };
      }).sort((a, b) => {
        // Сортировка по дате (год-месяц)
        const [yearA, monthA] = Object.keys(monthlySales).find(key => {
          const [year, month] = key.split('-');
          const monthName = new Date(year, month - 1).toLocaleString('ru-RU', { month: 'short' });
          return monthName === a.month;
        }).split('-');
        
        const [yearB, monthB] = Object.keys(monthlySales).find(key => {
          const [year, month] = key.split('-');
          const monthName = new Date(year, month - 1).toLocaleString('ru-RU', { month: 'short' });
          return monthName === b.month;
        }).split('-');
        
        return new Date(yearA, monthA - 1).getTime() - new Date(yearB, monthB - 1).getTime();
      });
    }
  },
  
  actions: {
    // Загрузка всех данных из файла JSON
    async loadAllData() {
      // Инициализируем только один раз
      if (this.initialized) return true;
      
      this.loading = true;
      this.error = null;
      
      try {
        // Сначала пробуем загрузить из localStorage
        if (process.client && this.loadDataFromLocalStorage()) {
          this.loading = false;
          return true;
        }
        
        // Если в localStorage нет данных, загружаем из файла
        if (process.client) {
          const response = await fetch('/data/database.json');
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data) {
            // Заполняем данные из файла
            this.users = data.users || [];
            this.products = data.products || [];
            this.categories = data.categories || [];
            this.suppliers = data.suppliers || [];
            this.orders = data.orders || [];
            this.orderItems = data.order_items || [];
            this.inventoryTransactions = data.inventory_transactions || [];
            this.purchaseOrders = data.purchase_orders || [];
            this.purchaseOrderItems = data.purchase_order_items || [];
            this.statistics = data.statistics || null;
            
            // Обновляем статус инициализации
            this.initialized = true;
            
            // Сохраняем в localStorage для последующего использования
            this.saveDataToLocalStorage();
            
            return true;
          } else {
            throw new Error('Данные не получены');
          }
        }
        
        return false;
      } catch (err) {
        this.error = err.message || 'Ошибка загрузки данных';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Получение данных для дашборда
    async getDashboardData() {
      await this.loadAllData();
      
      return {
        totalProducts: this.products.length,
        totalCategories: this.categories.length,
        totalOrders: this.orders.length,
        totalInventoryValue: this.totalInventoryValue,
        lowStockProducts: this.lowStockProducts.slice(0, 5),
        topSellingProducts: this.topSellingProducts.slice(0, 5),
        monthlySalesData: this.statistics?.monthly_sales || this.monthlySalesData,
        inventoryValueByCategory: this.statistics?.inventory_value?.by_category || this.inventoryValueByCategory
      };
    },
    
    // Получение продукта по ID
    getProductById(productId) {
      return this.products.find(product => product.id === productId);
    },
    
    // Поиск продуктов
    searchProducts(query) {
      if (!query) return this.productsWithCategories;
      
      const lowercaseQuery = query.toLowerCase();
      return this.productsWithCategories.filter(product => {
        return product.name.toLowerCase().includes(lowercaseQuery) ||
               product.sku.toLowerCase().includes(lowercaseQuery) ||
               product.description.toLowerCase().includes(lowercaseQuery) ||
               product.category_name.toLowerCase().includes(lowercaseQuery);
      });
    },
    
    // Получение списка заказов с фильтрацией по статусу
    getFilteredOrders(status = null) {
      if (!status) return this.ordersWithUserInfo;
      
      return this.ordersWithUserInfo.filter(order => order.status === status);
    },
    
    // Фильтрация транзакций инвентаря
    getFilteredInventoryTransactions(filters = {}) {
      let transactions = this.inventoryTransactionsWithDetails;
      
      if (filters.type) {
        transactions = transactions.filter(transaction => transaction.type === filters.type);
      }
      
      if (filters.productId) {
        transactions = transactions.filter(transaction => transaction.product_id === filters.productId);
      }
      
      if (filters.userId) {
        transactions = transactions.filter(transaction => transaction.user_id === filters.userId);
      }
      
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        transactions = transactions.filter(transaction => new Date(transaction.date) >= fromDate);
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        transactions = transactions.filter(transaction => new Date(transaction.date) <= toDate);
      }
      
      return transactions;
    },
    
    // Сохранение всех данных в localStorage
    saveDataToLocalStorage() {
      if (process.client) {
        // Создаем объект базы данных
        const databaseData = {
          users: this.users,
          products: this.products,
          categories: this.categories,
          suppliers: this.suppliers,
          orders: this.orders,
          order_items: this.orderItems,
          inventory_transactions: this.inventoryTransactions,
          purchase_orders: this.purchaseOrders,
          purchase_order_items: this.purchaseOrderItems,
          statistics: this.statistics,
          recent_activity: this.statistics?.recent_activity || [],
          summary: this.statistics?.summary || {},
          low_stock_alerts: this.statistics?.low_stock_alerts || []
        };
        
        // Сохраняем в localStorage
        localStorage.setItem('smartsklad_database', JSON.stringify(databaseData));
      }
    },
    
    // Загрузка всех данных из localStorage
    loadDataFromLocalStorage() {
      if (process.client && localStorage.getItem('smartsklad_database')) {
        try {
          const data = JSON.parse(localStorage.getItem('smartsklad_database'));
          
          // Заполняем данные из localStorage
          this.users = data.users || [];
          this.products = data.products || [];
          this.categories = data.categories || [];
          this.suppliers = data.suppliers || [];
          this.orders = data.orders || [];
          this.orderItems = data.order_items || [];
          this.inventoryTransactions = data.inventory_transactions || [];
          this.purchaseOrders = data.purchase_orders || [];
          this.purchaseOrderItems = data.purchase_order_items || [];
          
          if (data.statistics) {
            this.statistics = data.statistics;
          } else {
            this.statistics = {
              inventory_value: {
                by_category: data.statistics?.inventory_value?.by_category || []
              },
              monthly_sales: data.statistics?.monthly_sales || [],
              monthly_stock_movement: data.statistics?.monthly_stock_movement || [],
              product_movement: data.statistics?.product_movement || [],
              turnover_metrics: data.statistics?.turnover_metrics || [],
              recent_activity: data.recent_activity || [],
              summary: data.summary || {},
              low_stock_alerts: data.low_stock_alerts || []
            };
          }
          
          this.initialized = true;
          return true;
        } catch (error) {
          return false;
        }
      }
      return false;
    },
    
    // Добавить новый продукт
    addProduct(productData) {
      try {
        // Найти максимальный id для создания нового
        const maxId = this.products.length > 0
          ? Math.max(...this.products.map(product => product.id))
          : 0;
        
        // Генерируем 5-значный код товара (IT + 3 цифры)
        const code = `IT${(maxId + 1).toString().padStart(3, '0')}`;
        
        const newProduct = {
          id: maxId + 1,
          code, // Добавляем сгенерированный код
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Добавление продукта в массив
        this.products.push(newProduct);
        
        // Обновляем статистику
        this.updateStatisticsWithNewProducts();
        
        // Сохраняем обновленные данные в localStorage
        this.saveDataToLocalStorage();
        
        return {
          success: true,
          product: newProduct
        };
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Произошла ошибка при добавлении продукта'
        };
      }
    },
    
    // Метод для обновления статистики после добавления нового товара
    updateStatisticsWithNewProducts() {
      if (!this.statistics) {
        // Если статистика отсутствует, создаем базовую структуру
        this.statistics = {
          summary: {
            total_items: this.products.length,
            total_inventory_value: this.totalInventoryValue,
            low_stock_count: this.lowStockProducts.length,
            total_movement_30days: 30 // Фиксированное значение для примера
          },
          inventory_value: {
            total_value: this.totalInventoryValue,
            by_category: this.inventoryValueByCategory
          },
          monthly_stock_movement: {
            incoming: Array(12).fill(0).map(() => Math.floor(Math.random() * 50) + 10),
            outgoing: Array(12).fill(0).map(() => Math.floor(Math.random() * 30) + 5)
          },
          monthly_sales: Array(12).fill(0).map((_, i) => ({
            month: new Date(2023, i).toLocaleString('ru-RU', { month: 'short' }),
            value: Math.floor(Math.random() * 500000) + 100000
          })),
          recent_activity: [],
          low_stock_alerts: this.lowStockProducts.slice(0, 5).map(product => ({
            product_id: product.id,
            name: product.name,
            current_level: product.quantity,
            reorder_level: product.reorder_level
          })),
          turnover_metrics: [],
          product_movement: []
        };
      }
      
      // Убедимся, что свойство summary существует
      if (!this.statistics.summary) {
        this.statistics.summary = {};
      }
      
      // Обновляем основные показатели
      this.statistics.summary.total_items = this.products.length;
      this.statistics.summary.total_inventory_value = this.totalInventoryValue;
      this.statistics.summary.low_stock_count = this.lowStockProducts.length;
      this.statistics.summary.total_movement_30days = 30; // Фиксированное значение как пример
      
      // Убедимся, что свойство inventory_value существует
      if (!this.statistics.inventory_value) {
        this.statistics.inventory_value = {
          total_value: this.totalInventoryValue,
          by_category: []
        };
      }
      
      // Обновляем стоимость инвентаря
      this.statistics.inventory_value.total_value = this.totalInventoryValue;
      this.statistics.inventory_value.by_category = this.inventoryValueByCategory;
      
      // Убедимся, что есть свойство product_movement
      if (!this.statistics.product_movement) {
        this.statistics.product_movement = [];
      }
      
      // Убедимся, что в monthly_stock_movement есть 12 месяцев с данными
      if (!this.statistics.monthly_stock_movement) {
        this.statistics.monthly_stock_movement = {
          incoming: Array(12).fill(0).map(() => Math.floor(Math.random() * 50) + 10),
          outgoing: Array(12).fill(0).map(() => Math.floor(Math.random() * 30) + 5)
        };
      } else {
        // Проверяем, что incoming и outgoing существуют и являются массивами
        if (!this.statistics.monthly_stock_movement.incoming || !Array.isArray(this.statistics.monthly_stock_movement.incoming)) {
          this.statistics.monthly_stock_movement.incoming = Array(12).fill(0).map(() => Math.floor(Math.random() * 50) + 10);
        }
        
        if (!this.statistics.monthly_stock_movement.outgoing || !Array.isArray(this.statistics.monthly_stock_movement.outgoing)) {
          this.statistics.monthly_stock_movement.outgoing = Array(12).fill(0).map(() => Math.floor(Math.random() * 30) + 5);
        }
      }
      
      // Убедимся, что monthly_sales существует
      if (!this.statistics.monthly_sales) {
        this.statistics.monthly_sales = Array(12).fill(0).map((_, i) => ({
          month: new Date(2023, i).toLocaleString('ru-RU', { month: 'short' }),
          value: Math.floor(Math.random() * 500000) + 100000
        }));
      }
      
      // Обновляем метрики оборачиваемости
      if (!this.statistics.turnover_metrics) {
        this.statistics.turnover_metrics = [];
      }
      
      const existingProductIds = this.statistics.turnover_metrics.map(item => item.product_id);
      const missingProducts = this.products.filter(product => 
        !existingProductIds.includes(product.id)
      );
      
      // Добавляем метрики для новых товаров
      if (missingProducts.length > 0) {
        missingProducts.forEach(product => {
          // Получаем категорию товара
          const category = this.categories.find(c => c.id === product.category_id);
          
          // Создаем стандартные значения для нового товара
          const defaultSalesVolume = product.price * product.quantity * 0.7; // Примерный объем продаж (70% от стоимости)
          const defaultAverageStock = Math.round(product.quantity * 0.8); // Примерный средний остаток (80% от текущего), округленный до целого
          const defaultTurnoverRate = (defaultSalesVolume / product.price) / defaultAverageStock;
          const defaultTurnoverDays = defaultTurnoverRate > 0 ? Math.round(30 / defaultTurnoverRate) : 0;
          
          this.statistics.turnover_metrics.push({
            product_id: product.id,
            name: product.name,
            category: category ? category.name : 'Без категории',
            average_stock: defaultAverageStock,
            sales_volume: defaultSalesVolume,
            turnover_rate: defaultTurnoverRate,
            turnover_days: defaultTurnoverDays
          });
          
          // Также добавляем товар в product_movement
          const existingMovementIndex = this.statistics.product_movement.findIndex(
            item => item.product_id === product.id
          );
          
          if (existingMovementIndex === -1) {
            this.statistics.product_movement.push({
              product_id: product.id,
              name: product.name,
              initial_quantity: Math.floor(product.quantity * 0.2), // Начальное кол-во как 20% от текущего
              incoming: product.quantity,
              outgoing: Math.floor(product.quantity * 0.1), // Отгрузки как 10% от текущего
              final_quantity: product.quantity
            });
          }
        });
      }
      
      // Убедимся, что low_stock_alerts существует
      if (!this.statistics.low_stock_alerts) {
        this.statistics.low_stock_alerts = [];
      }
      
      // Обновляем предупреждения о низком уровне запасов
      this.statistics.low_stock_alerts = this.lowStockProducts.slice(0, 5).map(product => ({
        product_id: product.id,
        name: product.name,
        current_level: product.quantity,
        reorder_level: product.reorder_level
      }));
      
      // Убедимся, что recent_activity существует
      if (!this.statistics.recent_activity) {
        this.statistics.recent_activity = [];
      }
      
      // Добавляем транзакцию для последних активностей
      if (missingProducts.length > 0) {
        const now = new Date();
        
        missingProducts.forEach(product => {
          this.statistics.recent_activity.push({
            id: this.statistics.recent_activity.length + 1,
            product_id: product.id,
            type: 'in',
            quantity: product.quantity,
            date: now.toISOString()
          });
        });
        
        // Ограничиваем список последних активностей до 10
        if (this.statistics.recent_activity.length > 10) {
          this.statistics.recent_activity = this.statistics.recent_activity.slice(-10);
        }
      }
    },
    
    // Обновление существующего товара
    updateProduct(productData) {
      try {
        // Находим индекс товара в массиве
        const index = this.products.findIndex(p => p.id === productData.id);
        
        if (index === -1) {
          throw new Error('Товар не найден');
        }
        
        // Обновляем товар
        this.products[index] = {
          ...this.products[index],
          name: productData.name,
          category_id: productData.category_id,
          quantity: productData.quantity,
          unit: productData.unit,
          price: productData.price,
          minQuantity: productData.minQuantity
        };
        
        // Обновляем связанные данные в статистике
        if (this.statistics?.product_movement) {
          const movementIndex = this.statistics.product_movement.findIndex(p => p.product_id === productData.id);
          if (movementIndex !== -1) {
            this.statistics.product_movement[movementIndex].name = productData.name;
          }
        }
        
        // Обновляем информацию об оборачиваемости
        if (this.statistics?.turnover_metrics) {
          const turnoverIndex = this.statistics.turnover_metrics.findIndex(p => p.product_id === productData.id);
          if (turnoverIndex !== -1) {
            this.statistics.turnover_metrics[turnoverIndex].name = productData.name;
            this.statistics.turnover_metrics[turnoverIndex].average_stock = productData.quantity;
          }
        }
        
        // Сохраняем в localStorage
        this.saveDataToLocalStorage();
        
        return { success: true, product: this.products[index] };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    
    // Удаление товара
    deleteProduct(productId) {
      try {
        // Удаляем товар из списка
        this.products = this.products.filter(p => p.id !== productId);
        
        // Удаляем связанные данные из статистики
        if (this.statistics?.product_movement) {
          this.statistics.product_movement = this.statistics.product_movement.filter(p => p.product_id !== productId);
        }
        
        if (this.statistics?.turnover_metrics) {
          this.statistics.turnover_metrics = this.statistics.turnover_metrics.filter(p => p.product_id !== productId);
        }
        
        if (this.statistics?.low_stock_alerts) {
          this.statistics.low_stock_alerts = this.statistics.low_stock_alerts.filter(p => p.product_id !== productId);
        }
        
        // Обновляем суммарную статистику
        if (this.statistics?.summary) {
          this.statistics.summary.total_items = Math.max(0, (this.statistics.summary.total_items || 0) - 1);
        }
        
        // Сохраняем в localStorage
        this.saveDataToLocalStorage();
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    
    // Метод для загрузки данных из файла JSON
    async loadFromFile() {
      try {
        // Загружаем базу данных из файла
        const response = await fetch('/data/database.json');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch database: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Обновляем состояние хранилища
        this.products = data.products || [];
        this.categories = data.categories || [];
        this.statistics = data.statistics || null;
        this.users = data.users || [];
        
        // Отмечаем, что инициализация успешна
        this.initialized = true;
        this.error = null;
        
        return true;
      } catch (error) {
        this.error = error.message;
        this.initialized = false;
        return false;
      }
    },
    
    // Метод для сохранения данных в localStorage
    saveDataToLocalStorage() {
      if (process.client) {
        const data = {
          products: this.products,
          categories: this.categories,
          statistics: this.statistics,
          users: this.users
        };
        
        localStorage.setItem('smartsklad_database', JSON.stringify(data));
      }
    }
  }
}); 