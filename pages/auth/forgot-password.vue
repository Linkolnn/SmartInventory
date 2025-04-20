<template>
  <DefaultLayout>
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title">Восстановление пароля</h1>
        <form @submit.prevent="handleForgotPassword" class="auth-form">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              class="form-input" 
              placeholder="Введите ваш email" 
              required
            />
          </div>
          
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>
          
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-full" 
            :disabled="loading"
          >
            <span v-if="loading">Отправка...</span>
            <span v-else>Восстановить пароль</span>
          </button>
          
          <div class="auth-links">
            <p>Вспомнили пароль? <NuxtLink to="/auth/login">Войти</NuxtLink></p>
          </div>
        </form>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref } from 'vue';
import DefaultLayout from '@/components/layout/DefaultLayout.vue';

const email = ref('');
const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const handleForgotPassword = async () => {
  if (!email.value) {
    errorMessage.value = 'Пожалуйста, введите ваш email';
    return;
  }
  
  loading.value = true;
  errorMessage.value = '';
  
  try {
    // Здесь будет запрос к API для восстановления пароля
    // Сейчас просто имитируем успешный запрос
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    successMessage.value = 'Инструкции по восстановлению пароля были отправлены на ваш email';
    email.value = '';
  } catch (error) {
    errorMessage.value = 'Произошла ошибка при отправке запроса. Пожалуйста, попробуйте позже.';
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
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

.form-group {
  margin-bottom: 1.5rem;
}

.success-message {
  padding: 0.75rem;
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
}

.error-message {
  padding: 0.75rem;
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
}

.btn-full {
  width: 100%;
  padding: 0.75rem;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.auth-links {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style> 