<template>
  <DefaultLayout>
    <div v-if="isContentVisible" class="container">
      <div class="admin-section">
        <h1 class="page-title">Управление пользователями</h1>
        
        <div class="admin-card">
          <!-- Форма добавления пользователя -->
          <div class="user-form-section">
            <h2 class="section-title">Добавить работника</h2>
            <div v-if="usersStore.error" class="error-message">
              {{ usersStore.error }}
            </div>
            <form @submit.prevent="addUser" class="user-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Имя пользователя</label>
                  <input id="name" v-model="newUser.name" type="text" class="form-input" required>
                </div>
                <div class="form-group">
                  <label for="email">Email</label>
                  <input id="email" v-model="newUser.email" type="email" class="form-input" required>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="password">Пароль</label>
                  <input 
                    id="password" 
                    v-model="newUser.password" 
                    type="password" 
                    class="form-input" 
                    required
                    minlength="6"
                    placeholder="Минимум 6 символов"
                  >
                  <small class="form-help">Пароль должен содержать не менее 6 символов</small>
                </div>
                <div class="form-group">
                  <label for="role">Роль</label>
                  <select id="role" v-model="newUser.role" class="form-input" required>
                    <option value="user">Работник</option>
                    <option value="manager">Менеджер</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Добавить работника</button>
              </div>
            </form>
          </div>
          
          <!-- Список пользователей -->
          <div class="user-list-section">
            <h2 class="section-title">Список работников</h2>
            
            <div class="list-filters">
              <div class="search-bar">
                <input type="text" v-model="searchQuery" placeholder="Поиск работников..." class="form-input">
              </div>
              <div class="filter-options">
                <select v-model="roleFilter" class="form-input">
                  <option value="">Все роли</option>
                  <option value="user">Работники</option>
                  <option value="manager">Менеджеры</option>
                  <option value="admin">Администраторы</option>
                </select>
              </div>
            </div>
            
            <div class="users-table-container">
              <table class="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span :class="'role-badge ' + user.role">
                        {{ getRoleName(user.role) }}
                      </span>
                    </td>
                    <td class="action-buttons">
                      <button class="btn-icon edit" @click="editUser(user)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-icon delete" @click="confirmDeleteUser(user)" 
                              :disabled="user.email === 'admin@smartsklad.com'">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredUsers.length === 0">
                    <td colspan="5" class="no-data">Работники не найдены</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>Загрузка...</p>
    </div>
    
    <!-- Модальное окно редактирования пользователя -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Редактирование пользователя</h3>
          <button class="close-btn" @click="closeEditModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="usersStore.error" class="error-message">
            {{ usersStore.error }}
          </div>
          <form @submit.prevent="updateUser" class="edit-user-form">
            <div class="form-group">
              <label for="edit-name">Имя пользователя</label>
              <input id="edit-name" v-model="editingUser.name" type="text" class="form-input" required>
            </div>
            <div class="form-group">
              <label for="edit-email">Email</label>
              <input id="edit-email" v-model="editingUser.email" type="email" class="form-input" required
                     :disabled="editingUser.email === 'admin@smartsklad.com'">
            </div>
            <div class="form-group">
              <label for="edit-role">Роль</label>
              <select id="edit-role" v-model="editingUser.role" class="form-input" required
                      :disabled="editingUser.email === 'admin@smartsklad.com'">
                <option value="user">Работник</option>
                <option value="manager">Менеджер</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
            <div class="form-group">
              <label for="edit-password">Новый пароль (оставьте пустым, чтобы не менять)</label>
              <input 
                id="edit-password" 
                v-model="editingUser.password" 
                type="password" 
                class="form-input"
                minlength="6"
                placeholder="Минимум 6 символов"
              >
              <small class="form-help">При изменении пароль должен содержать не менее 6 символов</small>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" @click="closeEditModal">Отмена</button>
              <button type="submit" class="btn btn-primary">Сохранить</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content confirmation-modal">
        <div class="modal-header">
          <h3>Подтверждение удаления</h3>
          <button class="close-btn" @click="closeDeleteModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>Вы действительно хотите удалить работника «{{ userToDelete?.name }}»?</p>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="closeDeleteModal">Отмена</button>
            <button type="button" class="btn btn-danger" @click="deleteUser">Удалить</button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useUsersStore } from '@/store/users';
import DefaultLayout from '@/components/layout/DefaultLayout.vue';

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

// Состояние для отображения контента только после авторизации
const isContentVisible = ref(false);

const searchQuery = ref('');
const roleFilter = ref('');
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingUser = ref({});
const userToDelete = ref(null);

// Форма для нового пользователя
const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'user'
});

// Проверяем права доступа при загрузке страницы
onMounted(async () => {
  if (process.client) {
    // Проверяем авторизацию
    authStore.checkAuth();
    
    if (!authStore.isAuthenticated) {
      router.push('/');
      return;
    }
    
    if (!authStore.isAdmin) {
      router.push('/inventory');
      return;
    }
    
    // Загружаем список пользователей только после проверки авторизации
    await usersStore.loadUsers();
    
    // Показываем контент только после проверки авторизации и загрузки данных
    isContentVisible.value = true;
  }
});

// Отфильтрованный список пользователей
const filteredUsers = computed(() => {
  return usersStore.users.filter(user => {
    const matchesSearch = searchQuery.value === '' || 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesRole = roleFilter.value === '' || user.role === roleFilter.value;
    
    return matchesSearch && matchesRole;
  });
});

// Получение названия роли
function getRoleName(role) {
  const roleMap = {
    'admin': 'Администратор',
    'manager': 'Менеджер',
    'user': 'Работник'
  };
  return roleMap[role] || 'Работник';
}

// Добавление нового пользователя
async function addUser() {
  await usersStore.addUser({
    ...newUser.value,
    id: Date.now() // Временный ID для демо
  });
  
  // Сбрасываем форму
  newUser.value = {
    name: '',
    email: '',
    password: '',
    role: 'user'
  };
}

// Открытие модального окна редактирования
function editUser(user) {
  editingUser.value = { ...user, password: '' };
  showEditModal.value = true;
}

// Закрытие модального окна редактирования
function closeEditModal() {
  showEditModal.value = false;
  editingUser.value = {};
}

// Обновление данных пользователя
async function updateUser() {
  await usersStore.updateUser(editingUser.value);
  closeEditModal();
}

// Открытие модального окна подтверждения удаления
function confirmDeleteUser(user) {
  if (user.email === 'admin@smartsklad.com') return;
  
  userToDelete.value = user;
  showDeleteModal.value = true;
}

// Закрытие модального окна подтверждения удаления
function closeDeleteModal() {
  showDeleteModal.value = false;
  userToDelete.value = null;
}

// Удаление пользователя
async function deleteUser() {
  if (!userToDelete.value) return;
  
  await usersStore.deleteUser(userToDelete.value.id);
  closeDeleteModal();
}
</script>

<style lang="scss" scoped>
.admin-section {
  padding: 2rem 0;
}

.page-title {
  margin-bottom: 2rem;
  font-size: 2rem;
  color: var(--text-color);
  text-align: center;
}

.admin-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.user-form-section, .user-list-section {
  padding: 2rem;
}

.user-form-section {
  border-bottom: 1px solid #e5e7eb;
}

.user-form {
  .form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    
    .form-group {
      flex: 1;
    }
  }
}

.list-filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  .search-bar {
    flex: 1;
    margin-right: 1rem;
  }
  
  .filter-options {
    width: 200px;
  }
}

.users-table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }
  
  th {
    font-weight: 600;
    background-color: #f9fafb;
  }
  
  .role-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    
    &.admin {
      background-color: #fee2e2;
      color: #dc2626;
    }
    
    &.manager {
      background-color: #e0f2fe;
      color: #0284c7;
    }
    
    &.user {
      background-color: #f3f4f6;
      color: #4b5563;
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &.edit {
      background-color: #dbeafe;
      color: #2563eb;
      
      &:hover {
        background-color: #bfdbfe;
      }
    }
    
    &.delete {
      background-color: #fee2e2;
      color: #dc2626;
      
      &:hover {
        background-color: #fecaca;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
  
  .no-data {
    text-align: center;
    color: #6b7280;
    padding: 2rem 0;
  }
}

// Стили для модального окна
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.confirmation-modal {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-color);
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    
    &:hover {
      color: var(--text-color);
    }
  }
}

.modal-body {
  padding: 1.5rem;
}

.edit-user-form {
  .form-group {
    margin-bottom: 1.5rem;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
  
  &:hover {
    background-color: #b91c1c;
  }
}

@media (max-width: 768px) {
  .user-form {
    .form-row {
      flex-direction: column;
      gap: 0;
    }
  }
  
  .list-filters {
    flex-direction: column;
    
    .search-bar {
      margin-right: 0;
      margin-bottom: 1rem;
    }
    
    .filter-options {
      width: 100%;
    }
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--text-color);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-help {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.error-message {
  color: #dc2626;
  background-color: #fee2e2;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
</style> 