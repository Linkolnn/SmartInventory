<template>
  <div class="layout">
    <TheHeader />
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
</style> 