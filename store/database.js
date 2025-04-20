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
        return product.quantity <= product.reorder_level * 1.2; // 20% запас от уровня перезаказа
      }).sort((a, b) => {
        // Сортировка: сначала самые критичные (с наименьшим отношением quantity / reorder_level)
        const ratioA = a.quantity / a.reorder_level;
        const ratioB = b.quantity / b.reorder_level;
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
        // Используем нативный fetch вместо useFetch
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
            
            console.log('База данных успешно загружена', {
              users: this.users.length,
              products: this.products.length
            });
            
            return true;
          } else {
            throw new Error('Данные не получены');
          }
        }
        
        return false;
      } catch (err) {
        this.error = err.message || 'Ошибка загрузки данных';
        console.error('Ошибка загрузки данных:', err);
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
    }
  }
}); 