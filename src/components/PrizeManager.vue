<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import { getNewPrizeColor } from "@/utils/colors.js";
import IconList from "@/components/icons/IconList.vue";
import IconPen from "@/components/icons/IconPen.vue";
import IconGroup from "@/components/icons/IconGroup.vue";
import presetsJson from "@/assets/presets.json";

// 獎項列表
const prizes = defineModel("prizes", { type: Array, required: true });
// 是否正在旋轉轉盤
const spinning = defineModel("spinning", { type: Boolean, required: true });
// 新增的獎項名稱
const newPrizeName = ref("");
// 正在編輯的獎項索引
const editingIndex = ref(null);
// 編輯的獎項名稱
const editingName = ref("");
// 是否為列表模式
const isListMode = ref(true);
// 預設獎項資料
const presets = ref(presetsJson);
// 範例選單開啟狀態
const isMenuOpen = ref(false);
// 範例選單的元素
const managerMenu = ref(null);

let textareaTimer = null; // 用於節流的定時器
let waitTime = 500; // 節流等待時間，單位為毫秒
// 用於存儲 textarea 的內容，使用 computed 來實現雙向綁定
const textareaContent = computed({
  get() {
    // 將獎項名稱轉換為以換行符分隔的字符串
    return prizes.value.map((prize) => prize.name).join("\n");
  },
  set(val) {
    if (textareaTimer) {
      clearTimeout(textareaTimer);
    }
    textareaTimer = setTimeout(() => {
      textareaTimer = null;
      // 當 textarea 的內容改變時，更新獎項列表
      updatePrizesFromTextarea(val);
    }, waitTime);
  },
});

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

/**
 * 根據索引從獎品列表中移除指定獎項。
 * @param {number} index - 要移除的獎項的索引。
 */
const deletePrize = (index) => {
  prizes.value.splice(index, 1);
};

/**
 * 開始編輯指定索引的獎項名稱。
 *
 * 如果轉盤正在旋轉、有其他或同一個獎項正在編輯，
 * 則不允許開始新的編輯。
 *
 * @param {number} index - 要編輯的獎項索引。
 * @param {string} name - 當前獎項名稱。
 */
const startEdit = (index, name) => {
  if (spinning.value || editingIndex.value !== null || editingIndex.value === index) {
    return;
  }
  editingIndex.value = index;
  editingName.value = name;
};

/**
 * 儲存當前正在編輯的獎品名稱。
 *
 * 如果 `editingName.value` 有值，則將該名稱儲存到對應的獎品項目中，並重置編輯狀態。
 */
const saveEdit = () => {
  if (editingName.value) {
    prizes.value[editingIndex.value].name = editingName.value;
    resetEdit();
  }
};

/**
 * 重置編輯狀態的函式。
 * - 如果目前沒有正在編輯的項目則直接返回。
 * - 將 `editingIndex.value` 設為 `null`，並清空 `editingName.value`，以結束編輯。
 */
const resetEdit = () => {
  if (editingIndex.value === null) return;
  editingIndex.value = null;
  editingName.value = "";
};

/**
 * 切換獎項編輯區域顯示模式。
 * - 如果當前是列表模式，則切換到文本區域模式，反之亦然。
 * - 在切換模式前，先重置編輯狀態，確保不會有未保存的編輯狀態。
 */
const toggleMode = () => {
  resetEdit();
  isListMode.value = !isListMode.value;
};

// 根據 textarea 更新獎項列表。
const updatePrizesFromTextarea = (textValue) => {
  // console.log("updatePrizesFromTextarea:", textValue);
  if (!textValue) {
    // 如果 textarea 為空，則清空獎品列表
    prizes.value = [];
  } else {
    // 將 textarea 的內容按行分割成獎品名稱
    const names = textValue.split("\n");
    // console.log("Parsed names:", names);

    // 已使用的顏色
    let usedColors = prizes.value.map((prize) => prize.color.toLowerCase());
    // 根據輸入的名稱更新獎品列表
    prizes.value = names.map((newPrizeName, index) => {
      // 如果名稱為空，則使用預設名稱，並且限制名稱長度為 12
      let name = !newPrizeName.trim() ? "--預設名稱--" : newPrizeName.trim().slice(0, 12);
      let color;
      if (prizes.value[index]) {
        // 如果已有顏色，則使用原有顏色
        color = prizes.value[index].color;
      } else {
        // 如果沒有顏色，取得新的獎項顏色
        color = getNewPrizeColor(usedColors);
        // 將新顏色加入已使用顏色列表
        usedColors.push(color);
      }
      return { name, color };
    });
  }
};

/**
 * 切換選單的開合狀態。
 */
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

/**
 * 載入預設獎品資料。
 */
const loadPreset = (type) => {
  const preset = presets.value[type];
  if (preset) {
    textareaContent.value = preset.items.join("\n");
    toggleMenu();
  }
};

/**
 * 當點擊選單外部時，關閉選單。
 */
const handleClickOutside = (e) => {
  if (managerMenu.value && !managerMenu.value.contains(e.target)) {
    isMenuOpen.value = false;
  }
};

// 自定義指令：自動聚焦
const vFocus = {
  mounted: (el) => el.focus(),
};

watch(spinning, () => {
  // 如果轉盤正在旋轉中且有正在編輯的項目，結束編輯
  if (spinning.value) {
    resetEdit();
  }
});

onMounted(() => {
  // 添加點擊事件監聽器以關閉選單
  document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  // 移除點擊事件監聽器
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="manager">
    <div class="manager-header">
      <h2 class="manager-title">獎項管理</h2>
      <div ref="managerMenu" class="manager-menu" :class="{ open: isMenuOpen }">
        <button class="btn btn-menu" @click="toggleMenu" :disabled="spinning">
          <span><IconGroup />範例</span>
        </button>
        <div class="manager-menu-buttons">
          <button v-for="(preset, key) in presets" :key="key" @click="loadPreset(key)">
            {{ preset.label }}
          </button>
        </div>
      </div>
    </div>
    <div class="manager-form">
      <input
        v-model.trim="newPrizeName"
        maxlength="12"
        placeholder="新增獎項名稱 (最多12字)"
        :disabled="spinning"
        @keyup.enter="addPrize"
        @focus="resetEdit"
      />
      <button class="btn-add" @click="addPrize" :disabled="spinning">新增</button>
    </div>
    <div class="list">
      <div class="list-header">
        <h3 class="list-title">獎項列表</h3>
        <button class="btn btn-toggle" @click="toggleMode" :disabled="spinning">
          <span v-if="isListMode"><IconPen />文本</span>
          <span v-else><IconList />列表</span>
        </button>
      </div>
      <p class="list-info">
        {{ isListMode ? "點擊獎項可以編輯獎項名稱" : "可新增、修改、刪除文本區域中的獎項" }}
      </p>
      <template v-if="isListMode">
        <ul class="list-items">
          <li
            class="list-item"
            v-for="(prize, index) in prizes"
            :key="prize.name + prize.color"
            @click="startEdit(index, prize.name)"
            :class="{
              editing: !spinning && index === editingIndex,
              disabled: spinning || editingIndex !== null,
            }"
          >
            <span class="list-item-color" :style="{ backgroundColor: prize.color }"></span>
            <template v-if="!spinning && editingIndex === index">
              <input
                class="list-item-edit"
                type="text"
                v-model.trim="editingName"
                maxlength="12"
                @keyup.enter="saveEdit"
                v-focus
              />
              <button class="btn btn-edit" @click.stop="saveEdit">保存</button>
            </template>
            <template v-else>
              <span class="list-item-name">{{ prize.name }}</span>
              <button
                class="btn btn-delete"
                @click.stop="deletePrize(index)"
                :disabled="spinning || editingIndex !== null"
              >
                刪除
              </button>
            </template>
          </li>
        </ul>
      </template>
      <template v-else>
        <textarea
          v-model.trim="textareaContent"
          class="list-textarea"
          :disabled="spinning"
        ></textarea>
      </template>
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
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &-title {
    font-size: 20px;
    font-weight: bold;
  }
  &-menu {
    position: relative;
    &-buttons {
      position: absolute;
      top: 110%;
      right: 0;
      padding: 10px;
      background-color: $manager-menu-bg;
      border: $manager-border;
      border-radius: $manager-border-radius;
      box-shadow: $box-shadow-2;
      z-index: 100;

      display: none;
      flex-wrap: wrap;
      gap: 8px;
      button {
        @include btn-base-sm;
        color: $font-color;
        font-weight: 400;
        border: $manager-border;
        white-space: nowrap;
        background-color: $btn-menu-item-bg;
        &:hover {
          background-color: $btn-menu-item-hover-bg;
        }
      }
    }

    &.open {
      .manager-menu-buttons {
        display: flex;
      }
    }
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
    display: flex;
    justify-content: space-between;
    align-items: center;
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
  /* 獎項列表 */
  &-items {
    height: 300px;
    overflow-y: auto;
    margin-bottom: 10px;
    padding: 10px;
    background-color: $manager-list-bg;
    border: $manager-border;
    border-radius: $manager-border-radius;
    box-shadow: $box-shadow-2;
  }
  &-item {
    margin-bottom: 5px;
    padding: 6px 8px;
    display: flex;
    align-items: center;
    border-radius: $manager-border-radius;
    transition: background-color 0.3s ease;
    cursor: pointer;
    &:hover {
      background-color: $manager-item-hover-bg;
    }
    &.editing {
      background-color: $manager-item-edit-bg;
      cursor: default;
    }
    &.disabled {
      background-color: $manager-item-disabled-bg;
      cursor: not-allowed;
    }
    /* 獎項顏色 */
    &-color {
      @include prize-color-style(20px, 1px);
      margin-right: 8px;
    }
    /* 獎項名稱 */
    &-name {
      flex: 1;
      font-size: 16px;
    }
    /* 編輯獎項 input */
    &-edit {
      flex: 1;
      width: 100%;
      margin-right: 8px;
      padding: 4px 8px;
      font-size: 16px;
      border: 1px solid $btn-edit-bg;
      border-radius: $manager-border-radius;
      transition: box-shadow 0.3s ease;

      &:focus {
        box-shadow: 0 0 5px rgba($color: $btn-edit-bg, $alpha: 0.5);
        outline: none;
      }
    }
  }
  /* 獎項文本 textarea */
  &-textarea {
    vertical-align: top; // 消除底部空白
    width: 100%;
    height: 300px;
    resize: none;
    padding: 10px;
    margin-bottom: 10px;
    font-size: 16px;
    border: $manager-border;
    border-radius: $manager-border-radius;
    box-shadow: $box-shadow-2;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    &:focus {
      border-color: $btn-edit-bg;
      box-shadow: 0 0 5px rgba($color: $btn-edit-bg, $alpha: 0.5);
      outline: none;
    }
    &:disabled {
      background-color: $manager-textarea-disabled-bg;
      color: $manager-textarea-disabled-color;
      cursor: not-allowed;
    }
  }
}

.btn {
  // 避免按鈕被縮小
  flex-shrink: 0;
  @include btn-base-sm;
  box-shadow: $box-shadow-2;
  &-delete {
    background-color: $btn-delete-bg;
    &:hover {
      background-color: $btn-delete-hover-bg;
    }
  }
  &-edit {
    background-color: $btn-edit-bg;
    &:hover {
      background-color: $btn-edit-hover-bg;
    }
  }
  &-toggle,
  &-menu {
    background-color: $btn-toggle-bg;
    &:hover {
      background-color: $btn-toggle-hover-bg;
    }
    span {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  &:disabled {
    @include btn-disabled;
  }
}

/* 響應式設計 */
@media (max-width: 850px) {
  .manager {
    width: 400px;
  }
}
</style>
