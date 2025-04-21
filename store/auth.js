import { defineStore } from 'pinia';
import { useCookie } from '#app';
import { useDatabaseStore } from '@/store/database';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isClientSideInitialized: false
  }),
  
  getters: {
    isAuthenticated: (state) => {
      // В режиме SSR не считаем пользователя аутентифицированным, пока не инициализируемся на клиенте
      if (!process.client && !state.isClientSideInitialized) return false;
      return !!state.token && !!state.user;
    },
    isAdmin: (state) => state.user?.role === 'admin',
    isManager: (state) => state.user?.role === 'manager' || state.user?.role === 'admin'
  },
  
  actions: {
    async login({ email, password }) {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Пробуем напрямую загрузить данные из database.json
        const response = await fetch('/data/database.json');
        
        if (!response.ok) {
          throw new Error(`Ошибка загрузки данных: ${response.status}`);
        }
        
        const data = await response.json();
        const users = data.users || [];
        
        // Ищем пользователя по email
        const foundUser = users.find(u => u.email === email);
        
        if (!foundUser) {
          throw new Error('Пользователь с таким email не найден');
        }
        
        // Проверяем пароль
        if (foundUser.password !== password) {
          throw new Error('Неверный пароль');
        }
        
        // Успешная авторизация
        this.user = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          position: foundUser.position || (foundUser.role === 'manager' ? 'Менеджер' : 'Работник склада')
        };
        
        // Генерируем токен
        this.token = `auth_token_${Date.now()}_${this.user.id}`;
        
        // Сохраняем в куки
        const authCookie = useCookie('auth_token');
        authCookie.value = this.token;
        
        // Сохраняем пользователя в localStorage для демо
        if (process.client) {
          localStorage.setItem('current_user', JSON.stringify(this.user));
        }
        
        return true;
      } catch (err) {
        this.error = err.message || 'Ошибка при входе';
        return false;
      } finally {
        this.isLoading = false;
      }
    },
    
    checkAuth() {
      // Для SSR изначально устанавливаем состояние аутентификации в null
      // Клиентская сторона обновит после монтирования
      
      if (process.client) {
        const authCookie = useCookie('auth_token');
        
        if (authCookie.value) {
          this.token = authCookie.value;
          
          // Восстанавливаем пользователя из localStorage
          const savedUser = localStorage.getItem('current_user');
          
          if (savedUser) {
            try {
              this.user = JSON.parse(savedUser);
            } catch (e) {
              this.logout();
            }
          } else {
            this.logout();
          }
        }
        
        // Отмечаем как инициализированный на клиентской стороне
        this.isClientSideInitialized = true;
      } else {
        // В режиме SSR не устанавливаем данные пользователя
        this.user = null;
        this.token = null;
      }
    },
    
    initializeClientSide() {
      if (!this.isClientSideInitialized && process.client) {
        this.checkAuth();
      }
    },
    
    logout() {
      this.user = null;
      this.token = null;
      
      // Удаляем куки
      const authCookie = useCookie('auth_token');
      authCookie.value = null;
      
      // Удаляем из localStorage
      if (process.client) {
        localStorage.removeItem('current_user');
      }
    },
    
    setUser(userData) {
      // Обновляем пользователя в store
      this.user = userData;
      
      // Обновляем в localStorage на клиенте
      if (process.client) {
        localStorage.setItem('current_user', JSON.stringify(userData));
      }
    }
  }
});