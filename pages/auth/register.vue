<template>
  <div>Redirecting...</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  // Redirect to login page
  router.push('/auth/login');
});
</script> 