<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import { useDatabaseStore } from '@/store/database';

const databaseStore = useDatabaseStore();

onMounted(async () => {
  if (process.client) {
    // Загружаем базу данных при запуске приложения
    await databaseStore.loadAllData();
  }
});
</script>

<style lang="scss">
@import '@/assets/styles/main.scss';
</style>
