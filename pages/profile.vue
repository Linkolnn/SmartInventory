<template>
  <DefaultLayout>
    <div class="container">
      <div class="profile-section">
        <h1 class="page-title">Мой профиль</h1>
        
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">
              <span>{{ getInitials }}</span>
            </div>
            <div class="profile-info">
              <h2>{{ authStore.user?.name || 'Пользователь' }}</h2>
              <p class="profile-role">{{ userRole }}</p>
              <p class="profile-email">{{ authStore.user?.email }}</p>
            </div>
          </div>
          
          <div class="profile-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'info' }]" 
              @click="activeTab = 'info'"
            >
              Личная информация
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'security' }]" 
              @click="activeTab = 'security'"
            >
              Безопасность
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'settings' }]" 
              @click="activeTab = 'settings'"
            >
              Настройки
            </button>
          </div>
          
          <div class="profile-content">
            <!-- Личная информация -->
            <div v-show="activeTab === 'info'" class="profile-form">
              <div class="form-group">
                <label for="name">Имя</label>
                <input id="name" v-model="formData.name" type="text" class="form-input">
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input id="email" v-model="formData.email" type="email" class="form-input" disabled>
              </div>
              
              <div class="form-group">
                <label for="phone">Телефон</label>
                <input id="phone" v-model="formData.phone" type="tel" class="form-input">
              </div>
              
              <div class="form-group">
                <label for="position">Должность</label>
                <input id="position" v-model="formData.position" type="text" class="form-input">
              </div>
              
              <div class="form-actions">
                <button class="btn btn-primary" @click="saveProfile">Сохранить изменения</button>
              </div>
            </div>
            
            <!-- Безопасность -->
            <div v-show="activeTab === 'security'" class="profile-form">
              <div class="form-group">
                <label for="currentPassword">Текущий пароль</label>
                <input id="currentPassword" v-model="passwordData.current" type="password" class="form-input">
              </div>
              
              <div class="form-group">
                <label for="newPassword">Новый пароль</label>
                <input id="newPassword" v-model="passwordData.new" type="password" class="form-input">
              </div>
              
              <div class="form-group">
                <label for="confirmPassword">Подтвердите пароль</label>
                <input id="confirmPassword" v-model="passwordData.confirm" type="password" class="form-input">
              </div>
              
              <div class="form-actions">
                <button class="btn btn-primary" @click="changePassword">Изменить пароль</button>
              </div>
            </div>
            
            <!-- Настройки -->
            <div v-show="activeTab === 'settings'" class="profile-form">
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="settings.notifications">
                  <span>Включить уведомления по email</span>
                </label>
              </div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="settings.twoFactor">
                  <span>Включить двухфакторную аутентификацию</span>
                </label>
              </div>
              
              <div class="form-group">
                <label for="language">Язык интерфейса</label>
                <select id="language" v-model="settings.language" class="form-input">
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              <div class="form-actions">
                <button class="btn btn-primary" @click="saveSettings">Сохранить настройки</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="logout-section">
          <button class="btn btn-outline" @click="handleLogout">Выйти из аккаунта</button>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import { useCookie } from '#app';

const router = useRouter();
const authStore = useAuthStore();
const activeTab = ref('info');

// Проверяем, вошел ли пользователь
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login');
  } else {
    initFormData();
  }
});

// Получаем инициалы пользователя для аватара
const getInitials = computed(() => {
  const name = authStore.user?.name || 'Пользователь';
  return name.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

// Получаем человекочитаемое название роли
const userRole = computed(() => {
  const roleMap = {
    'admin': 'Администратор',
    'manager': 'Менеджер',
    'user': 'Пользователь'
  };
  return roleMap[authStore.user?.role] || 'Пользователь';
});

// Данные формы профиля
const formData = ref({
  name: '',
  email: '',
  phone: '',
  position: ''
});

// Данные для смены пароля
const passwordData = ref({
  current: '',
  new: '',
  confirm: ''
});

// Настройки
const settings = ref({
  notifications: true,
  twoFactor: false,
  language: 'ru'
});

// Инициализация данных формы
function initFormData() {
  formData.value.name = authStore.user?.name || '';
  formData.value.email = authStore.user?.email || '';
  formData.value.phone = ''; // Заполнить, если будет в модели пользователя
  formData.value.position = ''; // Заполнить, если будет в модели пользователя
}

// Сохранение профиля
async function saveProfile() {
  // Здесь будет логика сохранения профиля
  // Для демо просто обновим имя пользователя в хранилище
  const userData = { ...authStore.user, name: formData.value.name };
  authStore.setUser(userData);
  
  // Обновляем куки
  const userCookie = useCookie('user');
  userCookie.value = userData;
  
  alert('Профиль успешно обновлен');
}

// Смена пароля
function changePassword() {
  if (passwordData.value.new !== passwordData.value.confirm) {
    alert('Пароли не совпадают');
    return;
  }
  
  // Здесь будет логика изменения пароля
  // Для демо просто покажем сообщение об успехе
  
  passwordData.value.current = '';
  passwordData.value.new = '';
  passwordData.value.confirm = '';
  
  alert('Пароль успешно изменен');
}

// Сохранение настроек
function saveSettings() {
  // Здесь будет логика сохранения настроек
  // Для демо просто покажем сообщение об успехе
  
  alert('Настройки успешно сохранены');
}

// Выход из аккаунта
const handleLogout = () => {
  authStore.logout();
  const tokenCookie = useCookie('token');
  tokenCookie.value = null;
  router.push('/auth/login');
};
</script>

<style lang="scss" scoped>
.profile-section {
  padding: 2rem 0;
}

.page-title {
  margin-bottom: 2rem;
  font-size: 2rem;
  color: var(--text-color);
  text-align: center;
}

.profile-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 2rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  margin-right: 1.5rem;
}

.profile-info {
  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-color);
  }
  
  .profile-role {
    font-size: 1rem;
    color: var(--primary-color);
    margin-bottom: 0.25rem;
  }
  
  .profile-email {
    font-size: 0.875rem;
    color: #6b7280;
  }
}

.profile-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  
  .tab-btn {
    flex: 1;
    padding: 1rem;
    text-align: center;
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      color: var(--primary-color);
    }
    
    &.active {
      color: var(--primary-color);
      border-bottom: 2px solid var(--primary-color);
    }
  }
}

.profile-content {
  padding: 2rem;
}

.profile-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-color);
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  
  input {
    margin-right: 0.5rem;
  }
}

.form-actions {
  margin-top: 2rem;
}

.logout-section {
  text-align: center;
  margin-top: 3rem;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-avatar {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .profile-tabs {
    overflow-x: auto;
    
    .tab-btn {
      white-space: nowrap;
      padding: 1rem 0.5rem;
    }
  }
}
</style> 