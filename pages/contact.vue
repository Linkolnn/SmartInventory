<template>
  <DefaultLayout>
    <div class="container">
      <div class="contact-section">
        <h1 class="page-title">Свяжитесь с нами</h1>
        
        <div class="contact-content">
          <div class="contact-info">
            <div class="info-card">
              <h3>Адрес</h3>
              <p>г. Москва, ул. Строителей, д. 15, офис 42</p>
            </div>
            
            <div class="info-card">
              <h3>Телефон</h3>
              <p>+7 (495) 123-45-67</p>
              <p>+7 (800) 123-45-67</p>
            </div>
            
            <div class="info-card">
              <h3>Email</h3>
              <p>info@smartsklad.ru</p>
              <p>support@smartsklad.ru</p>
            </div>
            
            <div class="info-card">
              <h3>Режим работы</h3>
              <p>Пн-Пт: 9:00 - 18:00</p>
              <p>Сб-Вс: Выходные</p>
            </div>
          </div>
          
          <div class="contact-form-container">
            <h2>Отправить сообщение</h2>
            <form @submit.prevent="submitForm" class="contact-form">
              <div class="form-group">
                <label for="name">Ваше имя</label>
                <input 
                  id="name" 
                  v-model="form.name" 
                  type="text" 
                  class="form-input" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  id="email" 
                  v-model="form.email" 
                  type="email" 
                  class="form-input" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="subject">Тема</label>
                <input 
                  id="subject" 
                  v-model="form.subject" 
                  type="text" 
                  class="form-input" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="message">Сообщение</label>
                <textarea 
                  id="message" 
                  v-model="form.message" 
                  class="form-input" 
                  rows="5" 
                  required
                ></textarea>
              </div>
              
              <button type="submit" class="btn btn-primary">Отправить</button>
            </form>
            
            <div v-if="formSubmitted" class="form-success">
              Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время.
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref } from 'vue';
import DefaultLayout from '@/components/layout/DefaultLayout.vue';

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const formSubmitted = ref(false);

const submitForm = () => {
  // В реальном приложении здесь будет отправка данных на сервер
  
  // Имитация успешной отправки
  setTimeout(() => {
    formSubmitted.value = true;
    
    // Сброс формы
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
    
    // Скрываем сообщение об успешной отправке через 5 секунд
    setTimeout(() => {
      formSubmitted.value = false;
    }, 5000);
  }, 1000);
};
</script>

<style lang="scss" scoped>
.contact-section {
  padding: 2rem 0;
}

.page-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.contact-info {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.info-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  
  h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
  
  p {
    margin-bottom: 0.5rem;
    color: var(--text-color);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.contact-form-container {
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  
  h2 {
    color: var(--text-color);
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
}

.contact-form {
  .form-group {
    margin-bottom: 1.5rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
  }
  
  button {
    width: 100%;
    padding: 0.75rem;
  }
}

.form-success {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-radius: 0.5rem;
  text-align: center;
}
</style> 