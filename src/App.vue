<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

const auth = useAuthStore()

onMounted(() => {
  auth.initializeAuth()
})
</script>

<template>
  <div>
    <router-view />
  </div>
</template>
