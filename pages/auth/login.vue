<template>
  <DefaultLayout>
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title">Вход в систему</h1>
        <form @submit.prevent="handleLogin" class="auth-form">
          <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
          </div>
          
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input 
              id="email" 
              v-model="email" 
              type="email" 
              required 
              class="form-input"
              placeholder="your@email.com"
            />
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Пароль</label>
            <input 
              id="password" 
              v-model="password" 
              type="password" 
              required 
              class="form-input"
              placeholder="Ваш пароль"
            />
          </div>
          
          <div class="form-actions">
            <label class="remember-me">
              <input 
                type="checkbox" 
                v-model="rememberMe"
              />
              <span>Запомнить меня</span>
            </label>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-full"
            :disabled="authStore.isLoading"
          >
            {{ authStore.isLoading ? 'Вход...' : 'Войти' }}
          </button>
        </form>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import DefaultLayout from '@/components/layout/DefaultLayout.vue';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);

onMounted(() => {
  // Проверяем статус аутентификации при загрузке компонента
  if (process.client) {
    authStore.checkAuth();
    
    // Если пользователь авторизован, перенаправляем его на соответствующую страницу
    if (authStore.isAuthenticated) {
      if (authStore.isAdmin || authStore.isManager) {
        router.push('/dashboard');
      } else {
        router.push('/inventory');
      }
    }
  }
});

const handleLogin = async () => {
  const success = await authStore.login({
    email: email.value,
    password: password.value,
    remember: rememberMe.value
  });
  
  if (success) {
    if (authStore.isAdmin || authStore.isManager) {
      router.push('/dashboard');
    } else {
      router.push('/inventory');
    }
  }
};
</script>

<style lang="scss" scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
  min-height: calc(100vh - 200px);
}

.auth-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 450px;
}

.auth-title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--primary-color);
  font-size: 1.75rem;
}

.auth-form {
  .form-group {
    margin-bottom: 1.5rem;
  }
}

.error-message {
  color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  input {
    cursor: pointer;
  }
  
  span {
    font-size: 0.875rem;
  }
}

.btn-full {
  width: 100%;
  padding: 0.75rem;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style> 