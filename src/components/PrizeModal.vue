<script setup>
const selectedPrize = defineModel("selectedPrize", { type: Object, required: true });
const onBtnClose = () => {
  selectedPrize.value = null; // 重置中獎獎項
};
</script>

<template>
  <div class="modal-mask">
    <div class="modal-popup">
      <div class="modal-popup-content">
        <div class="modal-popup-header">
          <p>🎊 恭喜你抽中</p>
        </div>
        <div class="modal-popup-info">
          <span class="modal-popup-color" :style="{ backgroundColor: selectedPrize.color }"></span>
          <span class="modal-popup-name">{{ selectedPrize.name }}</span>
        </div>
        <button class="modal-popup-close" @click="onBtnClose">關閉</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal {
  /* 遮罩層樣式 */
  &-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: $modal-mask-bg;
    z-index: 999;

    display: flex;
    justify-content: center;
    align-items: center;
  }
  /* 中獎提示彈窗樣式 */
  &-popup {
    width: 90%;
    max-width: 400px;
    padding: 30px 40px;
    background-color: $modal-bg;
    border: $modal-border;
    border-radius: $modal-border-radius;
    box-shadow: $modal-box-shadow;
    animation: fade-in 0.3s ease-out;

    &-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    &-header {
      margin-bottom: 20px;
      p {
        font-size: 24px;
        font-weight: bold;
      }
    }

    &-info {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    &-color {
      @include prize-color-style(40px, 2px);
    }

    &-name {
      font-size: 22px;
      font-weight: bold;
    }

    &-close {
      @include btn-base;
      background-color: $btn-close-bg;
      &:hover {
        background-color: $btn-close-hover-bg;
      }
      &:disabled {
        @include btn-disabled;
      }
    }
  }
}
</style>
