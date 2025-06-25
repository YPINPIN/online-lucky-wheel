<script setup>
import AppHeader from "@/components/AppHeader.vue";
</script>

<template>
  <div class="app-container">
    <AppHeader />
  </div>
</template>

<style lang="scss">
@use "@/styles/reset" as *;

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  background: $body-bg;
  font-family: $font-main;
  color: $font-color;
  line-height: 1.5;
}
</style>
