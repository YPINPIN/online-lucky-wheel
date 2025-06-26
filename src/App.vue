<script setup>
import { ref } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import LuckyWheel from "@/components/LuckyWheel.vue";
import PrizeModal from "@/components/PrizeModal.vue";
import AppFooter from "@/components/AppFooter.vue";

// 預設獎品的背景色列表，如果獎品數量超過預設顏色數量，則會使用隨機顏色
const defaultColors = [
  "#f44336", // 紅
  "#ff9800", // 橘
  "#ffd600", // 黃
  "#4caf50", // 綠
  "#00bcd4", // 青
  "#2196f3", // 藍
  "#9c27b0", // 紫
  "#e91e63", // 粉
  "#8bc34a", // 青綠
  "#ffc107", // 金黃
  "#009688", // 藍綠
  "#3f51b5", // 靛藍
];

// 獎品列表，使用預設顏色生成獎品列表
const prizes = ref(
  defaultColors.slice(0, 8).map((color, index) => ({
    name: `獎項名稱 ${index + 1}`,
    color,
  }))
);

const selectedPrize = ref(null); // 中獎獎項對象

// 當抽獎結束時，更新中獎獎項
const onPrizeSelected = (prize) => {
  selectedPrize.value = prize;
};

// 重置中獎獎項
const resetSelectedPrize = () => {
  console.log("resetSelectedPrize");
  selectedPrize.value = null; // 重置中獎獎項
};
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <main class="wheel-wrapper">
      <LuckyWheel :prizes="prizes" @prize-selected="onPrizeSelected" />
      <PrizeModal
        v-if="selectedPrize"
        :selected-prize="selectedPrize"
        @modal-close="resetSelectedPrize"
      />
    </main>
    <AppFooter />
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

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.wheel-wrapper {
  width: 90%;
  margin: 0 auto;
  padding: 20px 0;
  // 避免轉盤旋轉超出畫面出現滾動條
  overflow: hidden;
  // main元素填滿剩餘空間
  flex: 1;

  // 將子元素置中
  display: flex;
  justify-content: center;
}
</style>
