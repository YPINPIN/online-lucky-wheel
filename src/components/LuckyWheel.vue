<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";

import spinSound from "@/assets/sounds/spin-sound.mp3"; // 旋轉音效
import winSound from "@/assets/sounds/win-sound.mp3"; // 中獎音效
// 音效引用
const spinAudio = ref(null);
const winAudio = ref(null);

// 獎項列表
const { prizes } = defineProps({
  prizes: {
    type: Array,
    required: true,
  },
});

// 中獎獎項對象，控制中獎 modal 顯示
const selectedPrize = defineModel("selectedPrize", { required: true });
// 是否正在旋轉轉盤
const spinning = defineModel("spinning", { type: Boolean, required: true });

const canvasRef = ref(null); // 轉盤畫布
const spinTime = ref(8); // 旋轉時間 (s)
const rotation = ref(0); // 轉盤旋轉角度，初始值為 0
const prizeIndex = ref(null); // 中獎獎項索引
const rotateDirection = ref(true); // 控制旋轉方向，true 順時針旋轉，false 逆時針旋轉。

/**
 * 在 canvas 上繪製轉盤與獎項。
 *
 * 1. 設定高解析度畫布並清除畫布。
 * 2. 繪製轉盤底色與獎項扇形。
 * 3. 檢查中獎獎項使用亮色背景。
 * 4. 扇形上顯示獎項名稱，過長自動截斷。
 * 5. 中心繪製紅色圓點。
 */
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

/**
 * 轉盤旋轉的函式。
 *
 * 此函式會根據獎品數量隨機決定旋轉圈數，計算最終中獎的獎品索引，並在旋轉結束後顯示中獎結果。
 *
 * 流程說明：
 * 1. 若當前正在旋轉則直接返回。
 * 2. 重置中獎狀態並重新繪製轉盤。
 * 3. 計算最小旋轉圈數（根據獎品數量動態調整）。
 * 4. 隨機產生旋轉角度，並根據旋轉方向（順時針或逆時針）計算中獎獎品的索引。
 * 5. 設定旋轉動畫結束後，顯示重新繪製轉盤顯示中獎效果。
 *
 * 注意：旋轉動畫持續時間為 spinTime，期間會鎖定旋轉狀態避免重複觸發。
 */
const spinWheel = () => {
  if (spinning.value) return;

  // 重置中獎索引
  prizeIndex.value = null;
  // 重新繪製轉盤，恢復初始樣式
  drawWheel();

  spinning.value = true;

  // 隨機旋轉角度，根據獎品數量決定最小旋轉圈數
  // 獎品數量大於 5 時，最小旋轉圈數為 5；大於 3 時，最小旋轉圈數為 7；否則為 8
  const minSpins = prizes.length > 5 ? 5 : prizes.length > 3 ? 7 : 8;
  const randomSpin = Math.floor(Math.random() * 360) + 360 * minSpins;
  // 每個獎品的角度範圍
  const segmentAngle = 360 / prizes.length;

  // 根據旋轉方向設置旋轉角度
  rotation.value = rotateDirection.value
    ? rotation.value + randomSpin
    : rotation.value - randomSpin;
  // 將旋轉角度歸一化到 0-360 度範圍內
  let normalizedRotation = Math.abs(rotation.value % 360);
  // 計算已經旋轉了幾個獎品
  let passedSegments = Math.floor(normalizedRotation / segmentAngle);
  // 根據旋轉方向計算中獎獎品的索引，順時針需要從最後開始計算，逆時針則等於已經旋轉了幾個獎品
  prizeIndex.value = rotateDirection.value ? prizes.length - 1 - passedSegments : passedSegments;
  // console.log("Prize Index:", prizeIndex.value);

  // 等待旋轉完成，並且顯示中獎獎項
  setTimeout(() => {
    // 播放中獎音效
    winAudio.value.play();

    // 重新繪製轉盤顯示中獎效果
    drawWheel();
    // 顯示中獎 modal
    selectedPrize.value = prizes[prizeIndex.value];
    spinning.value = false;
  }, spinTime.value * 1000);
};

// 轉盤狀態變數
let animationFrameId = null; // 用於 requestAnimationFrame 的 ID
let lastRotation = 0; // 追蹤最後旋轉角度
let accumulatedRotation = 0; // 追蹤累積旋轉角度
let lastSegmentCount = 0; // 追蹤累積經過的獎項數

/**
 * 重置轉盤相關的狀態變數。
 *
 * 將旋轉角度、最後旋轉角度、累積旋轉角度及經過的獎項數全部歸零，
 * 以便重新開始轉盤操作。
 */
const resetRotationState = () => {
  rotation.value = 0; // 重置轉盤旋轉角度
  lastRotation = 0; // 重置最後旋轉角度
  accumulatedRotation = 0; // 重置累積旋轉角度
  lastSegmentCount = 0; // 重置累積經過的獎項數
};

/**
 * 此函數會在轉盤旋轉時持續監聽其旋轉角度變化，並根據當前角度判斷是否進入新的獎品段。
 * 當進入新的獎品段時，會觸發旋轉音效播放。
 *
 * 主要流程：
 * 1. 若轉盤未在旋轉，則取消動畫幀並結束函數。
 * 2. 取得轉盤當前的旋轉矩陣，計算出目前的旋轉角度（0~359度）。
 * 3. 計算本次與上次的角度差值，並處理角度跳變（如359到0）。
 * 4. 累加實際旋轉角度。
 * 5. 判斷是否跨越新的獎品段若跨越新的獎品段，則播放旋轉音效。
 * 6. 持續以 requestAnimationFrame 方式遞迴檢查旋轉狀態。
 */
const checkRotationAndPlaySound = () => {
  if (!spinning.value) {
    cancelAnimationFrame(animationFrameId);
    return;
  }

  // 獲取當前轉盤的旋轉矩陣
  const matrix = new DOMMatrix(getComputedStyle(canvasRef.value).transform);
  // atan2 獲得目前的旋轉角度
  let currentRotation = Math.round(Math.atan2(matrix.b, matrix.a) * (180 / Math.PI));
  // 由於 atan2 返回的角度範圍是 -180 到 180 度，因此需要將其轉換到 0 到 360 度範圍
  currentRotation = currentRotation < 0 ? currentRotation + 360 : currentRotation;
  // console.log("Current Rotation:", currentRotation);

  if (currentRotation !== lastRotation) {
    // 計算角度差值
    let delta = currentRotation - lastRotation;
    // 處理角度跳變（順時針從 359 到 0 或逆時針從 0 到 359 ）
    if (rotateDirection.value && delta < 0) delta += 360;
    if (!rotateDirection.value && delta > 0) delta -= 360;
    // 累加實際旋轉角度
    accumulatedRotation += Math.abs(delta);
    // console.log("Accumulated Rotation:", accumulatedRotation);

    // 計算每個獎品段的角度
    const segmentAngle = 360 / prizes.length;
    // 檢查是否達到新的獎品段
    const currentSegmentCount = Math.floor(accumulatedRotation / segmentAngle);
    if (currentSegmentCount > lastSegmentCount) {
      // console.log("New Segment Count:", currentSegmentCount);
      // 播放旋轉音效
      playSpinSound();
      lastSegmentCount = currentSegmentCount;
    }
    lastRotation = currentRotation;
  }

  animationFrameId = requestAnimationFrame(checkRotationAndPlaySound);
};

let lastPlayTime = 0; // 用於節流的時間變數
/**
 * 控制播放旋轉音效的函數。
 *
 * 控制播放旋轉音效，並加入 100 毫秒的節流機制，避免音效過於頻繁地觸發。
 */
const playSpinSound = () => {
  // 添加 100ms 節流
  if (!lastPlayTime || Date.now() - lastPlayTime >= 100) {
    spinAudio.value.currentTime = 0; // 重置音效播放時間
    spinAudio.value.play();
    lastPlayTime = Date.now();
  }
};

/**
 * 過渡動畫開始時的處理函式。
 *
 * 調用 checkRotationAndPlaySound() 方法以檢查元素的旋轉狀態。
 */
const transitionStartHandler = () => {
  checkRotationAndPlaySound();
};
/**
 * 過渡動畫結束時的處理函式。
 *
 * 通過 cancelAnimationFrame(animationFrameId) 取消動畫幀請求，以防止不必要的動畫執行。
 */
const transitionEndHandler = () => {
  cancelAnimationFrame(animationFrameId);
};

// 改變旋轉方向
const changeDirection = () => {
  rotateDirection.value = !rotateDirection.value;

  // 如果旋轉角度不為 0，重置轉盤相關狀態
  if (rotation.value !== 0) {
    // 重置轉盤狀態
    resetRotationState();
    // 重置中獎索引
    prizeIndex.value = null;
    // 重新繪製轉盤，恢復初始樣式
    drawWheel();
  }
};

onMounted(() => {
  // 監聽獎品列表的變更
  watch(
    () => prizes,
    () => {
      // console.log("Watch Prizes updated:", newPrizes);
      // 當獎品列表變更時
      prizeIndex.value = null; // 重置中獎索引
      resetRotationState(); // 重置轉盤狀態
      drawWheel(); // 重新繪製轉盤
    },
    { deep: true }
  );

  // 繪製轉盤
  drawWheel();

  // 監聽 transition
  const canvas = canvasRef.value;
  if (canvas) {
    canvas.addEventListener("transitionstart", transitionStartHandler);
    canvas.addEventListener("transitionend", transitionEndHandler);
  }
});

onUnmounted(() => {
  const canvas = canvasRef.value;
  if (canvas) {
    transitionStartHandler && canvas.removeEventListener("transitionstart", transitionStartHandler);
    transitionEndHandler && canvas.removeEventListener("transitionend", transitionEndHandler);
  }
});
</script>

<template>
  <div class="wheel-container">
    <audio ref="spinAudio" :src="spinSound" preload="auto"></audio>
    <audio ref="winAudio" :src="winSound" preload="auto"></audio>
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
      <button
        @click="changeDirection"
        class="btn-direction"
        :disabled="spinning || prizes.length === 0"
      >
        {{ rotateDirection ? "↻ 順" : "↺ 逆" }}
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
    vertical-align: top; // 消除底部空白
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
  box-shadow: $box-shadow-1;
  &:hover {
    background-color: $btn-spin-hover-bg;
  }
  &:disabled {
    @include btn-disabled;
  }
}

.btn-direction {
  @include btn-base;
  padding: 6px 12px;
  font-size: 16px;
  background-color: $btn-direction-bg;
  position: absolute;
  top: 0;
  left: 0;
  &:hover {
    background-color: $btn-direction-hover-bg;
  }
  &:disabled {
    @include btn-disabled;
  }
}

/* 響應式設計 */
@media (max-width: 400px) {
  .btn-direction {
    padding: 4px 8px;
    font-size: 14px;
  }
}
</style>
