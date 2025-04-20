<template>
  <DefaultLayout>
    <div class="container">
      <div class="about-section">
        <h1 class="page-title">О компании СмартСклад</h1>
        
        <div class="about-content">
          <div class="about-image">
            <img src="https://img.recraft.ai/ooYfFHZRHBtieqPRnviR3nXlXQVIMvWRfqMC_ng_DoQ/rs:fit:1024:1024:0/q:95/g:no/plain/abs://prod/images/b4137806-3a2e-4ed9-85ef-9f9d0a0c8f00@jpg" alt="СмартСклад" class="about-image-img">
          </div>
          
          <div class="about-text">
            <p>
              Компания <strong>СмартСклад</strong> была основана в 2020 году с целью создания современного 
              программного решения для автоматизации складского учета, которое было бы доступно как крупным, 
              так и малым предприятиям.
            </p>
            
            <p>
              Наша миссия — упростить процессы управления складом и логистикой для бизнеса любого размера, 
              используя современные технологии и инновационные подходы.
            </p>
            
            <h2>Наши ценности</h2>
            <ul class="values-list">
              <li>
                <strong>Простота</strong> — Мы стремимся сделать наш продукт интуитивно понятным и простым в использовании.
              </li>
              <li>
                <strong>Инновации</strong> — Мы постоянно следим за новыми технологиями и внедряем их в наши решения.
              </li>
              <li>
                <strong>Надёжность</strong> — Мы понимаем, что наша система критически важна для бизнеса наших клиентов.
              </li>
              <li>
                <strong>Клиентоориентированность</strong> — Мы всегда слушаем пожелания наших клиентов и развиваем продукт с учётом их потребностей.
              </li>
            </ul>
            
            <h2>Наша команда</h2>
            <p>
              В СмартСклад работают опытные специалисты в области разработки программного обеспечения, 
              логистики и бизнес-аналитики. Мы объединяем экспертизу из разных областей, чтобы создать 
              по-настоящему полезный продукт.
            </p>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
</script>

<style lang="scss" scoped>
.about-section {
  padding: 2rem 0;
}

.page-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.about-image {
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  min-height: 300px;
  width: 100%;
  background-image: url('/placeholder-company.jpg');
  background-size: cover;
  background-position: center;
}

.about-image-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-text {
  p {
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
  
  h2 {
    font-size: 1.5rem;
    color: var(--text-color);
    margin: 2rem 0 1rem;
  }
}

.values-list {
  padding-left: 1.25rem;
  
  li {
    margin-bottom: 1rem;
    line-height: 1.5;
  }
}
</style> 