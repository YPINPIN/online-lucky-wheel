<script setup>
import { ref, onMounted } from "vue";

const { prizes } = defineProps({
  prizes: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["prizeSelected"]);

const canvasRef = ref(null); // 轉盤畫布
const spinning = ref(false); // 是否正在旋轉轉盤
const spinTime = ref(8); // 旋轉時間 (s)
const rotation = ref(0); // 轉盤旋轉角度，初始值為 0
const prizeIndex = ref(null); // 中獎獎項索引

const drawWheel = () => {
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");

  /**
   * 設定畫布顯示尺寸與縮放：
   * 1. displayWidth, displayHeight：畫布在頁面上的實際顯示大小（單位：像素）。
   * 2. canvas.width, canvas.height：設為顯示尺寸乘上 devicePixelRatio，確保高解析度螢幕下畫面清晰。
   * 3. ctx.scale(dpr, dpr)：將繪圖上下文縮放，讓繪圖內容與顯示尺寸一致。
   */
  const displayWidth = 500;
  const displayHeight = 500;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(displayWidth * dpr);
  canvas.height = Math.floor(displayHeight * dpr);
  ctx.scale(dpr, dpr);

  // 計算中心點和半徑（使用顯示尺寸）
  const centerX = displayWidth / 2;
  const centerY = displayHeight / 2;
  const radius = displayWidth / 2;

  // 清除畫布（使用顯示尺寸)
  ctx.clearRect(0, 0, displayWidth, displayHeight);

  // 繪製圓形背景做為轉盤底色
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = "#333";
  ctx.fill();

  // 計算每個獎項的扇形角度
  const segmentAngle = 360 / prizes.length;
  // 繪製每個獎項
  prizes.forEach((prize, index) => {
    // 調整起始角度到上方(減 90 度)
    let startAngle = index * segmentAngle - 90;
    let endAngle = (index + 1) * segmentAngle - 90;
    // 將角度轉換為弧度
    startAngle = (startAngle * Math.PI) / 180;
    endAngle = (endAngle * Math.PI) / 180;

    // 如果是中獎的獎項，繪製一個亮色的扇形背景
    if (prizeIndex.value === index) {
      // 繪製扇形
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = "#ffeb3b";
      ctx.fill();
    }

    // 繪製獎項本身扇形
    let w = 8; // 扇形距離 border 的寬度
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius - w, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = prize.color;
    ctx.fill();

    // 繪製獎項文字
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((startAngle + endAngle) / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "bold 32px Noto Sans TC, system-ui, sans-serif";
    ctx.fillText(truncateText(ctx, prize.name, 200), radius - w - 6, 12);
    ctx.restore();
  });

  // 繪製轉盤中心圓點
  ctx.beginPath();
  ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = "#d93b3b"; // 中心圓點顏色
  ctx.strokeStyle = "#000"; // 中心圓點邊框顏色
  ctx.lineWidth = 2; // 中心圓點邊框寬度
  ctx.stroke();
  ctx.fill();
};

/**
 * 將文字裁切至最大寬度，超出則加「...」。
 * @param {CanvasRenderingContext2D} c - Canvas 2D context
 * @param {string} text - 文字內容
 * @param {number} maxWidth - 最大寬度（像素）
 * @returns {string} 處理後的文字
 */
const truncateText = (c, text, maxWidth) => {
  const width = c.measureText(text).width;
  if (width <= maxWidth) {
    return text;
  }

  const ellipsis = "...";
  const len = text.length;
  for (let i = len; i > 0; i--) {
    const str = text.substring(0, i) + ellipsis;
    if (c.measureText(str).width <= maxWidth) {
      return str;
    }
  }
};

// 轉盤旋轉的函式
const spinWheel = () => {
  if (spinning.value) return;
  console.log("spinWheel");

  // 重置中獎索引
  prizeIndex.value = null;
  // 重新繪製輪盤，恢復初始樣式
  drawWheel();

  spinning.value = true;

  const minSpins = 5; // 最小旋轉圈數
  const randomSpin = Math.floor(Math.random() * 360) + 360 * minSpins; // 隨機旋轉角度

  const segmentAngle = 360 / prizes.length; // 每個獎品的角度範圍
  let normalizedRotation = 0;
  let adjustedRotation = 0;

  // 順時針設置旋轉角度
  rotation.value += randomSpin;
  // 將旋轉角度歸一化到 0-360 度範圍內
  normalizedRotation = rotation.value % 360;
  // 由於旋轉及獎項繪製是順時針方向，所以需要將 normalizedRotation 轉換為逆時針方向的角度來計算中獎獎品
  adjustedRotation = 360 - normalizedRotation;
  // 計算中獎的獎品索引
  prizeIndex.value = Math.floor(adjustedRotation / segmentAngle);
  console.log("Prize Index:", prizeIndex.value);

  // 等待旋轉完成，並且顯示中獎獎項
  setTimeout(() => {
    console.log("spinWheel done");
    // 重新繪製輪盤顯示中獎效果
    drawWheel();
    // 顯示中獎 modal
    emit("prizeSelected", prizes[prizeIndex.value]);
    spinning.value = false;
  }, spinTime.value * 1000);
};

onMounted(() => {
  drawWheel();
});
</script>

<template>
  <div class="wheel-container">
    <canvas
      class="wheel-canvas"
      ref="canvasRef"
      :style="{
        transform: `rotate(${rotation}deg)`,
        transition: spinning ? `transform ${spinTime}s cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
      }"
    ></canvas>
    <div class="wheel-pointer"></div>
    <div class="wheel-controls">
      <button class="btn-spin" @click="spinWheel" :disabled="spinning || prizes.length === 0">
        抽籤
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$wheel-border: 5px solid #000;
$pointer-width: 38px;
$pointer-height: 40px;
$pointer-border-width: 5px; //指針邊框粗細變數
$pointer-color: #d93b3b;
$pointer-border-color: #000;

.wheel {
  &-container {
    width: 500px;
    max-width: 100%;

    position: relative;
    text-align: center;
  }

  /* 轉盤樣式 */
  &-canvas {
    width: 100%;
    border-radius: 50%;
    border: $wheel-border;
  }

  /* 箭頭樣式 */
  &-pointer {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: $pointer-width;
    height: $pointer-height;
    z-index: 10;
    pointer-events: none;
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: $pointer-width;
      height: $pointer-height;
      /* 外層黑色三角形（邊框） */
      clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
      background: $pointer-border-color;
      z-index: 1;
    }
    &::after {
      content: "";
      position: absolute;
      left: calc(1.5 * $pointer-border-width);
      top: $pointer-border-width;
      width: calc($pointer-width - 3 * $pointer-border-width);
      height: calc($pointer-height - 3 * $pointer-border-width);
      /* 內層紅色三角形（指針本體） */
      clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
      background: $pointer-color;
      z-index: 2;
    }
  }
}

.btn-spin {
  @include btn-base;
  margin-top: 20px;
  background-color: $btn-spin-bg;
  box-shadow: $btn-box-shadow-1;
  &:hover {
    background-color: $btn-spin-hover-bg;
  }
  &:disabled {
    @include btn-disabled;
  }
}
</style>
