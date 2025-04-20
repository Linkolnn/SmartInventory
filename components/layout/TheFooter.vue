<template>
  <footer class="footer">
    <div class="container footer-container">
      <div class="footer-info">
        <h2>СмартСклад</h2>
        <p>Решения для автоматизации складского учета</p>
      </div>
      <div class="footer-links">
        <div class="footer-links-group">
          <h3>Навигация</h3>
          <ul>
            <li><NuxtLink to="/">Главная</NuxtLink></li>
            <li><NuxtLink to="/inventory">Склад</NuxtLink></li>
            <li><NuxtLink to="/reports">Отчеты</NuxtLink></li>
            <li><NuxtLink to="/dashboard">Дашборд</NuxtLink></li>
          </ul>
        </div>
        <div class="footer-links-group">
          <h3>Поддержка</h3>
          <ul>
            <li><NuxtLink to="/contact">Контакты</NuxtLink></li>
            <li><NuxtLink to="/faq">Часто задаваемые вопросы</NuxtLink></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>&copy; {{ currentYear }} СмартСклад. Все права защищены.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const currentYear = ref(new Date().getFullYear());
</script>

<style lang="scss" scoped>
.footer {
  background-color: var(--dark-bg);
  color: white;
  padding: 3rem 0 0;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
  padding-bottom: 2rem;
}

.footer-info {
  flex: 1;
  min-width: 250px;
  
  h2 {
    color: var(--primary-color);
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    opacity: 0.8;
  }
}

.footer-links {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer-links-group {
  min-width: 150px;
  
  h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
    color: white;
  }
  
  ul {
    list-style: none;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: var(--primary-color);
    }
  }
}

.footer-bottom {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1rem 0;
  text-align: center;
  
  p {
    opacity: 0.7;
    font-size: 0.875rem;
  }
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
  }
}
</style> 