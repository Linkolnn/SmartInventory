import { useAuthStore } from '@/store/auth';

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    const authStore = useAuthStore();
    
    // Проверяем авторизацию при инициализации приложения
    nuxtApp.hook('app:mounted', () => {
      authStore.checkAuth();
    });
    
    // Добавляем метод для проверки доступа к защищенным разделам
    const checkAccess = (requiresAuth = false, requiresAdmin = false) => {
      if (requiresAuth && !authStore.isAuthenticated) {
        return false;
      }
      
      if (requiresAdmin && !authStore.isAdmin) {
        return false;
      }
      
      return true;
    };
    
    return {
      provide: {
        auth: {
          checkAccess
        }
      }
    };
  }
}); 