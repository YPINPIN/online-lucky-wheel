<script setup>
import { ref } from "vue";
import { getNewPrizeColor } from "@/utils/colors.js";

// 獎項列表
const prizes = defineModel("prizes", { type: Array, required: true });
// 是否正在旋轉轉盤
const spinning = defineModel("spinning", { type: Boolean, required: true });
// 新增的獎項名稱
const newPrizeName = ref("");

/**
 * 新增獎項的函數。
 * - 將用戶輸入的新獎項加入獎品列表。
 * - 優先使用未被佔用的預設顏色，否則隨機產生顏色。
 */
const addPrize = () => {
  if (newPrizeName.value) {
    // 已使用的顏色
    const usedColors = prizes.value.map((prize) => prize.color.toLowerCase());
    // 新的獎項顏色
    const color = getNewPrizeColor(usedColors);
    // 新增獎項
    prizes.value.push({ name: newPrizeName.value, color });
    newPrizeName.value = "";
  }
};
</script>

<template>
  <div class="manager">
    <div class="manager-header">
      <h2 class="manager-title">獎項管理</h2>
    </div>
    <div class="manager-form">
      <input
        v-model.trim="newPrizeName"
        maxlength="12"
        placeholder="新增獎項名稱 (最多12字)"
        :disabled="spinning"
        @keyup.enter="addPrize"
      />
      <button class="btn-add" @click="addPrize" :disabled="spinning">新增</button>
    </div>
    <div class="list">
      <div class="list-header">
        <h3 class="list-title">獎項列表</h3>
      </div>
      <p class="list-info">點擊獎項可以編輯獎項名稱</p>
      <ul class="list-items">
        <li class="list-item" v-for="prize in prizes" :key="prize.name + prize.color">
          <span class="list-item-color" :style="{ backgroundColor: prize.color }"></span>
          <span class="list-item-name">{{ prize.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.manager {
  flex-shrink: 0; // 禁止縮小
  width: 350px;
  max-width: 100%;
  padding: 10px;
  background-color: $manager-bg;
  border: $manager-border;
  border-radius: $manager-border-radius;
  box-shadow: $box-shadow-2;

  &-header {
    margin: 10px 0 5px;
  }
  &-title {
    font-size: 20px;
    font-weight: bold;
  }

  &-form {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 5px;

    input {
      min-width: 100%;
      padding: 8px;
      font-size: 16px;
      border: $manager-border;
      border-radius: $manager-border-radius;
      box-shadow: $box-shadow-2;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      &:focus {
        border-color: $btn-add-bg;
        box-shadow: 0 0 5px rgba($color: $btn-add-bg, $alpha: 0.5);
        outline: none;
      }
    }

    .btn-add {
      @include btn-base-sm;
      font-size: 16px;
      background-color: $btn-add-bg;
      box-shadow: $box-shadow-2;
      min-width: 100%;
      &:hover {
        background-color: $btn-add-hover-bg;
      }
    }

    input:disabled,
    .btn-add:disabled {
      @include btn-disabled;
    }
  }
}

.list {
  &-header {
    margin-bottom: 5px;
  }
  &-title {
    font-size: 20px;
    font-weight: bold;
  }
  &-info {
    margin-bottom: 5px;
    font-size: 14px;
    color: $font-color-light;
  }

  &-items {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 10px;
    padding: 10px;
    background-color: $manager-list-bg;
    border: $manager-border;
    border-radius: $manager-border-radius;
    box-shadow: $box-shadow-2;
  }
  &-item {
    margin-bottom: 6px;
    padding: 6px 8px;
    display: flex;
    align-items: center;
    border-radius: $manager-border-radius;

    &-color {
      @include prize-color-style(20px, 1px);
      margin-right: 8px;
    }
    &-name {
      flex: 1;
      font-size: 16px;
    }
  }
}

/* 響應式設計 */
@media (max-width: 850px) {
  .manager {
    width: 400px;
  }
}
</style>
