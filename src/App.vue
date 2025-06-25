<script setup>
import AppHeader from "@/components/AppHeader.vue";
import LuckyWheel from "@/components/LuckyWheel.vue";
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <main class="wheel-wrapper">
      <LuckyWheel />
    </main>
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

.wheel-wrapper {
  width: 90%;
  margin: 0 auto;
  padding: 20px 0;

  // 將子元素置中
  display: flex;
  justify-content: center;
}
</style>
