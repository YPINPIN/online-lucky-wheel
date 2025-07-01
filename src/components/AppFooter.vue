<script setup>
import IconGithub from "@/components/icons/IconGithub.vue";
import IconLogo from "@/components/icons/IconLogo.vue";
</script>

<template>
  <header class="app-footer">
    <IconLogo class="app-footer-logo" />
    <span>線上抽籤轉盤 © 2025 – </span>
    <a href="https://github.com/YPINPIN/online-lucky-wheel" target="_blank">
      <IconGithub /><span>YPINPIN</span>
    </a>
  </header>
</template>

<style lang="scss" scoped>
$footer-color: #555;
$footer-hover-color: #000;

.app-footer {
  padding: 8px;
  background-color: $base-background-color;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.04);
  border-top: 1px solid $base-border-color;
  font-size: 14px;
  color: $footer-color;
  display: flex;
  justify-content: center;
  align-items: center;

  &-logo {
    width: 20px;
    height: 20px;
  }

  a {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    margin-left: 5px;
    color: $footer-color;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      color: $footer-hover-color;
      text-decoration: underline;
    }
  }
}
</style>
