/**
 * 排除的特殊顏色列表，這些顏色不會被用作獎品顏色，避免與轉盤的其他元素顏色衝突。
 *
 * 白色(#ffffff)、黑色(轉盤邊框 #000000)、紅色(指針色 #d93b3b)、深灰色(轉盤背景色 #333)、亮黃色(中獎色 #ffeb3b)。
 */
const excludedColors = ["#ffffff", "#000000", "#d93b3b", "#333", "#ffeb3b"];

/**
 * 預設獎品的色碼列表。
 *
 * 如果獎品數量超過預設顏色數量，則會使用隨機顏色。
 */
export const defaultColors = [
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
  "#ff5722", // 橘紅
  "#cddc39", // 檸檬黃
  "#607d8b", // 藍灰
  "#795548", // 咖啡
  "#e57373", // 淺紅
  "#ffb74d", // 淺橘
  "#fff176", // 淺黃
  "#81c784", // 淺綠
  "#4dd0e1", // 淺青
  "#64b5f6", // 淺藍
  "#ba68c8", // 淺紫
  "#f06292", // 淺粉
  "#aed581", // 淺青綠
  "#ffd54f", // 淺金黃
  "#4db6ac", // 淺藍綠
  "#7986cb", // 淺靛藍
  "#ff8a65", // 淺橘紅
  "#afb42b", // 深檸檬黃
  "#90a4ae", // 淺藍灰
  "#bcaaa4", // 淺咖啡
  "#d32f2f", // 深紅
  "#f57c00", // 深橘
  "#fbc02d", // 深黃
  "#388e3c", // 深綠
  "#00838f", // 深青
  "#1976d2", // 深藍
  "#6a1b9a", // 深紫
  "#ad1457", // 深粉
  "#689f38", // 深青綠
  "#ffa000", // 深金黃
  "#00695c", // 深藍綠
  "#283593", // 深靛藍
  "#bf360c", // 深橘紅
  "#37474f", // 深藍灰
  "#4e342e", // 深咖啡
  "#aeea00", // 螢光黃綠
  "#00e676", // 螢光綠
  "#00b8d4", // 螢光藍
  "#d500f9", // 螢光紫
];

/**
 * 找到第一個未使用的預設顏色。
 * @param {string[]} usedColors - 已使用的顏色列表
 * @returns {string} 可用的預設色碼
 */
const getAvailableColor = (usedColors = []) => {
  return defaultColors.find((color) => !usedColors.includes(color.toLowerCase()));
};

/**
 * 隨機產生一個不重複於現有獎品顏色與排除色的十六進位色碼。
 * @param {string[]} usedColors - 已使用的顏色列表
 * @returns {string} 隨機色碼（如 "#a1b2c3"）
 */
const getRandomColor = (usedColors = []) => {
  let color;
  do {
    color = `#${Math.floor(Math.random() * 0x1000000)
      .toString(16)
      .padStart(6, "0")}`;
  } while (
    usedColors.includes(color.toLowerCase()) ||
    excludedColors.includes(color.toLowerCase())
  );
  return color;
};

/**
 * 獲取新的獎項顏色。
 *
 * 如果有未使用的預設顏色，使用該顏色；否則使用隨機顏色。
 * @param {string[]} usedColors - 已使用的顏色列表
 * @returns {string} 新的獎項顏色
 */
export const getNewPrizeColor = (usedColors = []) => {
  return getAvailableColor(usedColors) || getRandomColor(usedColors);
};
