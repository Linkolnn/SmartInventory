<template>
  <DefaultLayout>
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">СмартСклад</h1>
        <p class="hero-subtitle">Современные решения для автоматизации складского учета</p>
        <div class="hero-buttons">
          <NuxtLink to="/auth/login" class="btn btn-primary">Начать работу</NuxtLink>
          <NuxtLink to="/about" class="btn btn-secondary">Узнать больше</NuxtLink>
        </div>
      </div>
      <div class="hero-image">
        <img src="https://img.recraft.ai/OISE48BEQSu5ecJoKzcnzgWJjeRxjt1LBCQUzjN07rQ/rs:fit:1024:1024:0/q:95/g:no/plain/abs://prod/images/8699b44b-6f9d-4e5d-aee7-c65d292b1dc8@jpg" alt="СмартСклад" class="hero-image-img">
      </div>
    </section>

    <section class="features">
      <h2 class="section-title">Возможности СмартСклада</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📦</div>
          <h3>Управление запасами</h3>
          <p>Отслеживайте остатки товаров в режиме реального времени и получайте уведомления о пополнении</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Аналитика и отчеты</h3>
          <p>Создавайте подробные отчеты о движении товаров, оборачиваемости и эффективности работы склада</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📝</div>
          <h3>Управление документами</h3>
          <p>Создавайте, редактируйте и управляйте всеми складскими документами в одном месте</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">👥</div>
          <h3>Многопользовательский доступ</h3>
          <p>Назначайте роли и разграничивайте доступ к функциям системы для различных сотрудников</p>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="cta-content">
        <h2>Готовы оптимизировать работу склада?</h2>
        <p>Начните использовать СмартСклад уже сегодня и почувствуйте разницу</p>
        <NuxtLink to="/auth/login" class="btn btn-accent">Войти в систему</NuxtLink>
      </div>
    </section>
  </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import { onMounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Регистрируем плагин ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

onMounted(() => {
  // Анимация заголовка и подзаголовка
  gsap.from('.hero-title', {
    opacity: 0,
    y: -50,
    duration: 1,
    ease: 'power3.out'
  });
  
  gsap.from('.hero-subtitle', {
    opacity: 0,
    y: -30,
    duration: 1,
    delay: 0.3,
    ease: 'power3.out'
  });
  
  gsap.from('.hero-buttons', {
    opacity: 0,
    y: 30,
    duration: 1,
    delay: 0.6,
    ease: 'power3.out'
  });
  
  // Анимация карточек возможностей
  gsap.from('.feature-card', {
    opacity: 0,
    y: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.features',
      start: 'top 80%'
    }
  });
});
</script>

<style lang="scss" scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
}

.hero-content {
  flex: 1;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-color);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
}

.hero-image {
  flex: 1;
  height: 400px;
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 500px;
  }
}

.hero-image-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 3rem;
}

.features {
  padding: 4rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  h3 {
    word-break: break-all;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.cta {
  background-color: var(--secondary-color);
  border-radius: 0.5rem;
  padding: 3rem 2rem;
  text-align: center;
  margin-top: 4rem;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
  
  h2 {
    color: white;
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 2rem;
  }
}
</style> 