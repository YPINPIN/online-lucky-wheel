<script setup>
import IconLogo from "@/components/icons/IconLogo.vue";
</script>

<template>
  <header class="app-header">
    <IconLogo />
    <h1 class="app-title">線上抽籤轉盤</h1>
  </header>
</template>

<style lang="scss" scoped>
.app {
  &-header {
    padding: 16px 0;
    margin-bottom: 20px;
    background-color: $base-background-color;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    border-bottom: 1px solid $base-border-color;

    display: flex;
    justify-content: center;
    align-items: center;
  }
  &-title {
    font-size: 28px;
    font-weight: bold;
    line-height: 1;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    padding-bottom: 2px; // 增加底部間距，讓標題與logo對齊
  }
}
</style>
