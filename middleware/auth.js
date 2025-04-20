export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  
  // Проверяем авторизацию, если не в режиме генерации
  if (process.client) {
    // Запускаем проверку авторизации
    authStore.checkAuth();
    
    // Перечень путей, которые требуют авторизации
    const authRequiredPaths = [
      '/profile',
      '/dashboard',
      '/inventory',
      '/reports'
    ];
    
    // Перечень путей, доступных только для администраторов
    const adminOnlyPaths = [
      '/admin/users'
    ];
    
    // Перечень путей, доступных для менеджеров и администраторов
    const managerPaths = [
      '/dashboard',
      '/reports'
    ];
    
    // Если путь требует авторизации и пользователь не авторизован
    if (authRequiredPaths.some(path => to.path.startsWith(path)) && !authStore.isAuthenticated) {
      return navigateTo('/auth/login');
    }
    
    // Если путь требует прав администратора и пользователь не админ
    if (adminOnlyPaths.some(path => to.path.startsWith(path)) && !authStore.isAdmin) {
      return navigateTo('/profile');
    }
    
    // Если путь требует прав менеджера и пользователь обычный работник
    if (managerPaths.some(path => to.path.startsWith(path)) && !authStore.isManager) {
      return navigateTo('/inventory');
    }
    
    // Если пользователь уже авторизован и пытается открыть страницы логина/регистрации
    if (authStore.isAuthenticated && to.path.startsWith('/auth/')) {
      // Перенаправляем в зависимости от роли
      if (authStore.isAdmin || authStore.isManager) {
        return navigateTo('/dashboard');
      } else {
        return navigateTo('/inventory');
      }
    }
  }
}); 