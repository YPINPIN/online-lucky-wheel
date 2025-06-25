<script setup>
import { ref, onMounted } from "vue";

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

const canvasRef = ref(null); // 轉盤畫布

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
  const segmentAngle = 360 / prizes.value.length;
  // 繪製每個獎項
  prizes.value.forEach((prize, index) => {
    // 調整起始角度到上方(減 90 度)
    let startAngle = index * segmentAngle - 90;
    let endAngle = (index + 1) * segmentAngle - 90;
    // 將角度轉換為弧度
    startAngle = (startAngle * Math.PI) / 180;
    endAngle = (endAngle * Math.PI) / 180;

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

onMounted(() => {
  drawWheel();
});
</script>

<template>
  <div class="wheel-container">
    <canvas ref="canvasRef"></canvas>
    <div class="wheel-pointer"></div>
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

canvas {
  width: 100%;
  border-radius: 50%;
  border: $wheel-border;
}
</style>
