<template>
  <DefaultLayout>
    <div class="container">
      <h1 class="page-title">Часто задаваемые вопросы</h1>
      
      <div class="faq-container">
        <div class="faq-item" v-for="(item, index) in faqItems" :key="index">
          <div class="faq-question" @click="toggleFaq(index)">
            <h3>{{ item.question }}</h3>
            <span class="toggle-icon">{{ item.isOpen ? '−' : '+' }}</span>
          </div>
          <div class="faq-answer" v-show="item.isOpen">
            <p>{{ item.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref } from 'vue';
import DefaultLayout from '@/components/layout/DefaultLayout.vue';

const faqItems = ref([
  {
    question: 'Что такое СмартСклад?',
    answer: 'СмартСклад - это современная система для автоматизации управления складскими запасами и логистики. Наше решение помогает отслеживать товары, управлять поставками и анализировать данные склада в режиме реального времени.',
    isOpen: true
  },
  {
    question: 'Как начать использовать СмартСклад?',
    answer: 'Чтобы начать использовать СмартСклад, зарегистрируйтесь на нашем сайте, создайте учётную запись и следуйте инструкциям по настройке системы. При необходимости наша служба поддержки поможет вам с установкой и начальной настройкой.',
    isOpen: false
  },
  {
    question: 'Какие возможности предоставляет система?',
    answer: 'СмартСклад предоставляет широкий спектр возможностей, включая управление запасами, отслеживание движения товаров, генерацию отчётов, аналитику, управление поставщиками и интеграцию с другими бизнес-системами.',
    isOpen: false
  },
  {
    question: 'Сколько стоит использование СмартСклад?',
    answer: 'Мы предлагаем различные тарифные планы, начиная от базового (бесплатного) и заканчивая корпоративным. Стоимость зависит от количества пользователей, объема хранимых данных и дополнительных функций. Свяжитесь с нами для получения детального предложения.',
    isOpen: false
  },
  {
    question: 'Можно ли интегрировать СмартСклад с другими системами?',
    answer: 'Да, СмартСклад предоставляет API для интеграции с бухгалтерскими системами, CRM, ERP и другими бизнес-приложениями. Мы также предлагаем готовые интеграции с популярными сервисами.',
    isOpen: false
  }
]);

const toggleFaq = (index) => {
  faqItems.value[index].isOpen = !faqItems.value[index].isOpen;
};
</script>

<style lang="scss" scoped>
.page-title {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: white;
  cursor: pointer;
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
  }
  
  .toggle-icon {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
  }
}

.faq-answer {
  padding: 1rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  
  p {
    margin: 0;
    line-height: 1.6;
  }
}
</style> 