<script setup>
import { onMounted, ref, watch } from "vue";
import { defaultColors } from "@/utils/colors.js";
import AppHeader from "@/components/AppHeader.vue";
import LuckyWheel from "@/components/LuckyWheel.vue";
import PrizeModal from "@/components/PrizeModal.vue";
import PrizeManager from "@/components/PrizeManager.vue";
import AppFooter from "@/components/AppFooter.vue";

// 獎品列表，使用預設顏色生成獎品列表
const prizes = ref(
  defaultColors.slice(0, 8).map((color, index) => ({
    name: `獎項名稱 ${index + 1}`,
    color,
  }))
);
const spinning = ref(false); // 是否正在旋轉轉盤
const selectedPrize = ref(null); // 中獎獎項對象

onMounted(() => {
  // 從 localStorage 讀取已有的獎品列表
  const stored = localStorage.getItem("prizes");
  if (stored && stored !== "[]") {
    prizes.value = JSON.parse(stored);
  }

  // 監聽獎品列表的變更
  watch(
    prizes,
    (newPrizes) => {
      // console.log("Watch Prizes updated and saved:", newPrizes);
      // 將新的獎品列表存入 localStorage
      localStorage.setItem("prizes", JSON.stringify(newPrizes));
    },
    { deep: true }
  );
});
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <main class="wheel-wrapper">
      <LuckyWheel
        :prizes="prizes"
        v-model:spinning="spinning"
        v-model:selected-prize="selectedPrize"
      />
      <PrizeModal v-if="selectedPrize" v-model:selected-prize="selectedPrize" />
      <PrizeManager v-model:prizes="prizes" v-model:spinning="spinning" />
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
  // 高度填滿剩餘空間
  flex: 1;
  width: 90%;
  margin: 0 auto;
  // 增加內邊距，避免指針被遮擋
  padding: 20px 0;
  // 避免轉盤旋轉超出畫面出現滾動條
  overflow: hidden;

  // 將子元素置中
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 30px;
}

/* 響應式設計 */
@media (max-width: 850px) {
  .wheel-wrapper {
    flex-direction: column;
    align-items: center;
  }
}
</style>
