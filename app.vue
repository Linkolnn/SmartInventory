<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useDatabaseStore } from '@/store/database';

const databaseStore = useDatabaseStore();

// Следим за изменениями в хранилище и сохраняем данные в localStorage
watch(() => databaseStore.products, () => {
  if (databaseStore.initialized && process.client) {
    databaseStore.saveDataToLocalStorage();
  }
}, { deep: true });

watch(() => databaseStore.statistics, () => {
  if (databaseStore.initialized && process.client) {
    databaseStore.saveDataToLocalStorage();
  }
}, { deep: true });

onMounted(async () => {
  if (process.client) {
    // Загружаем базу данных при запуске приложения
    // Сначала пробуем загрузить из localStorage, затем из файла
    await databaseStore.loadAllData();
  }
});
</script>

<style lang="scss">
@import '@/assets/styles/main.scss';
</style>
