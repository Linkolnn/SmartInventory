<template>
  <div class="layout">
    <ClientOnly>
      <TheHeader />
      <template #fallback>
        <div class="header-placeholder"></div>
      </template>
    </ClientOnly>
    <main class="main-content">
      <div class="container">
        <slot />
      </div>
    </main>
    <TheFooter />
  </div>
</template>

<script setup>
import TheHeader from './TheHeader.vue';
import TheFooter from './TheFooter.vue';
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.header-placeholder {
  height: 70px; /* Adjust based on your header height */
  width: 100%;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style> 