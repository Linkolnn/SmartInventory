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
          <div v-if="authStore.isAuthenticated" class="mobile-user-profile">
            <ClientOnly>
              <span class="mobile-user-name">{{ authStore.user?.name || 'Пользователь' }}</span>
            </ClientOnly>
            <div class="mobile-user-buttons">
              <NuxtLink to="/profile" class="mobile-profile-btn" @click="closeMobileMenu">Профиль</NuxtLink>
              <button class="mobile-logout-btn" @click="handleLogout">Выйти</button>
            </div>
          </div>
          <div v-else class="mobile-login-container">
            <NuxtLink to="/auth/login" class="mobile-login-btn" @click="closeMobileMenu">Войти</NuxtLink>
          </div>
        </div>
        
        <ul>
          <li><NuxtLink to="/" @click="closeMobileMenu">Главная</NuxtLink></li>
          <li v-if="!authStore.isAuthenticated"><NuxtLink to="/about" @click="closeMobileMenu">О нас</NuxtLink></li>
          <li v-if="!authStore.isAuthenticated"><NuxtLink to="/faq" @click="closeMobileMenu">FAQ</NuxtLink></li>
          <li v-if="!authStore.isAuthenticated"><NuxtLink to="/contact" @click="closeMobileMenu">Контакты</NuxtLink></li>
          <li v-show="authStore.isAuthenticated"><NuxtLink to="/inventory" @click="closeMobileMenu">Склад</NuxtLink></li>
          <li v-show="authStore.isAuthenticated && authStore.isManager"><NuxtLink to="/reports" @click="closeMobileMenu">Отчеты</NuxtLink></li>
          <li v-show="authStore.isAuthenticated && authStore.isManager"><NuxtLink to="/dashboard" @click="closeMobileMenu">Дашборд</NuxtLink></li>
          
          <!-- Дополнительный элемент для администраторов -->
          <li v-if="showMobileMenu && authStore.isAuthenticated && authStore.isAdmin">
            <NuxtLink to="/admin/users" @click="closeMobileMenu">Управление пользователями</NuxtLink>
          </li>
        </ul>
      </nav>
      
      <div class="user-actions desktop-actions">
        <div v-show="authStore.isAuthenticated" class="auth-user-container">
          <div class="user-profile" @click="toggleUserMenu">
            <ClientOnly>
              <span>{{ authStore.user?.name || 'Пользователь' }}</span>
            </ClientOnly>
            <div class="user-menu" v-show="showUserMenu">
              <ul>
                <li><NuxtLink to="/profile">Профиль</NuxtLink></li>
                <li v-if="authStore.isAdmin"><NuxtLink to="/admin/users">Управление пользователями</NuxtLink></li>
                <li><a href="#" @click.prevent="handleLogout">Выйти</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div v-show="!authStore.isAuthenticated" class="non-auth-container">
          <NuxtLink to="/auth/login" class="btn btn-primary">Войти</NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const showUserMenu = ref(false);
const showMobileMenu = ref(false);
const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  // Проверяем статус аутентификации при загрузке компонента
  if (process.client) {
    authStore.checkAuth();
  }
  
  // Добавляем обработчик для закрытия меню при клике вне его
  if (process.client) {
    document.addEventListener('click', closeMenuOnClickOutside);
    // Закрываем мобильное меню при изменении размера экрана
    window.addEventListener('resize', handleResize);
  }
});

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  if (showMobileMenu.value) {
    // Блокируем прокрутку при открытом меню
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
  document.body.style.overflow = '';
};

const handleLogout = () => {
  authStore.logout();
  showUserMenu.value = false;
  showMobileMenu.value = false;
  document.body.style.overflow = '';
  router.push('/');
};

// Закрываем меню при клике вне его
const closeMenuOnClickOutside = (event) => {
  if (showUserMenu.value && !event.target.closest('.user-profile')) {
    showUserMenu.value = false;
  }
};

// Отслеживаем изменение размера окна
const handleResize = () => {
  if (window.innerWidth > 1024 && showMobileMenu.value) {
    closeMobileMenu();
  }
};

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('click', closeMenuOnClickOutside);
    window.removeEventListener('resize', handleResize);
    document.body.style.overflow = '';
  }
});
</script>

<style lang="scss" scoped>
.header {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  h1 {
    color: var(--primary-color);
    font-size: 1.5rem;
    font-weight: 700;
  }
  
  a {
    text-decoration: none;
  }
}

.main-nav {
  ul {
    display: flex;
    list-style: none;
    gap: 1.5rem;
  }
  
  a {
    text-decoration: none;
    color: var(--text-color);
    font-weight: 500;
    transition: color 0.2s ease;
    
    &:hover, &.router-link-active {
      color: var(--primary-color);
    }
  }
}

.user-actions {
  position: relative;
}

.user-profile {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    font-weight: 500;
  }
}

.user-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  width: 200px;
  margin-top: 0.5rem;
  z-index: 100;
  
  ul {
    list-style: none;
  }
  
  li {
    &:not(:last-child) {
      border-bottom: 1px solid #e5e7eb;
    }
  }
  
  a {
    display: block;
    padding: 0.75rem 1rem;
    text-decoration: none;
    color: var(--text-color);
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: #f3f4f6;
    }
  }
}

// Стили для мобильного меню
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  cursor: pointer;
  position: relative;
  z-index: 110;
  
  span {
    width: 100%;
    height: 3px;
    background-color: var(--primary-color);
    border-radius: 3px;
    transition: all 0.3s ease;
  }
  
  &.active {
    span:nth-child(1) {
      transform: translateY(9px) rotate(45deg);
    }
    span:nth-child(2) {
      opacity: 0;
    }
    span:nth-child(3) {
      transform: translateY(-9px) rotate(-45deg);
    }
  }
}

// Новые стили для мобильного блока пользователя
.mobile-user-actions {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.mobile-user-profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-user-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
}

.mobile-user-buttons {
  display: flex;
  gap: 1rem;
}

.mobile-profile-btn {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white !important;
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: darken(#3b82f6, 10%);
  }
}

.mobile-logout-btn {
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: darken(#ef4444, 10%);
  }
}

.mobile-login-container {
  display: flex;
  justify-content: flex-start;
}

.mobile-login-btn {
  padding: 0.5rem 1.5rem;
  background-color: var(--primary-color);
  color: white !important;
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: darken(#3b82f6, 10%);
  }
}

// Медиа-запрос для мобильных устройств
@media (max-width: 1024px) {
  .mobile-menu-toggle {
    display: flex;
  }
  
  .main-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: white;
    z-index: 100;
    padding: 5rem 2rem 2rem;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
    
    &.mobile-active {
      transform: translateX(0);
    }
    
    ul {
      flex-direction: column;
      gap: 1rem;
    }
    
    a {
      display: block;
      padding: 0.5rem 0;
      font-size: 1.25rem;
    }
  }
  
  .desktop-actions {
    display: none;
  }
  
  .header-container {
    padding: 0 1rem;
  }
}

/* Add style for auth placeholder */
.auth-placeholder {
  width: 80px;
  height: 36px;
}
</style> 