# 📱 完整響應式設計指南

## 🎯 **響應式設計斷點總覽**

### **1. 基本斷點 (必做)**
| 斷點 | 寬度範圍 | 設備類型 | 日曆欄數 | 週次選擇器 | 用途 |
|------|---------|---------|---------|-----------|------|
| 超小螢幕 | ≤375px | 小手機 | 1欄 | 2欄 | iPhone SE等 |
| 小手機 | ≤480px | 一般手機 | 1欄 | 2欄 | iPhone 12等 |
| 大手機 | 481-768px | 大手機/小平板 | 2欄 | 4欄 | iPhone Pro Max等 |
| 平板 | 769-1024px | 平板 | 3欄 | 4欄 | iPad等 |
| 桌面 | 1025px+ | 桌面/筆電 | 7欄 | 7欄 | 電腦螢幕 |

### **2. 進階斷點 (建議做)**
| 斷點 | 寬度範圍 | 設備類型 | 特殊優化 |
|------|---------|---------|---------|
| 極小螢幕 | ≤320px | 老舊手機 | 極簡化設計 |
| 大手機橫向 | 481-768px | 大手機橫向 | 2欄日曆 |
| 大平板 | 1025-1200px | 大平板/小筆電 | 5欄週次選擇器 |
| 標準桌面 | 1025-1366px | 一般桌面 | 6欄廣告 |
| 大螢幕 | 1367-1919px | 大螢幕 | 7欄廣告 |
| 超大螢幕 | 1920px+ | 4K螢幕 | 8欄廣告 |

### **3. 特殊情況斷點**
| 類型 | 斷點 | 用途 |
|------|------|------|
| 橫向模式 | `@media (orientation: landscape)` | 手機/平板橫向 |
| 高解析度 | `@media (-webkit-min-device-pixel-ratio: 2)` | Retina螢幕 |
| 可折疊螢幕 | `@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape)` | 可折疊設備 |

## 📐 **設計原則**

### **Mobile First 策略**
```css
/* 1. 先寫手機版樣式 (預設) */
.day-card { padding: 16px; }

/* 2. 再寫平板版樣式 */
@media (min-width: 769px) {
    .day-card { padding: 18px; }
}

/* 3. 最後寫桌面版樣式 */
@media (min-width: 1025px) {
    .day-card { padding: 20px; }
}
```

### **流暢的斷點過渡**
- 避免突然的樣式跳躍
- 使用相對單位 (em, rem, %)
- 保持視覺一致性

## 🎨 **各設備優化重點**

### **手機版 (≤768px)**
- ✅ 單欄佈局
- ✅ 大按鈕 (最小44px觸控目標)
- ✅ 簡化導航
- ✅ 優化載入速度

### **平板版 (769-1024px)**
- ✅ 2-3欄佈局
- ✅ 平衡的字體大小
- ✅ 觸控友好的間距
- ✅ 橫向/直向適配

### **桌面版 (1025px+)**
- ✅ 多欄佈局
- ✅ 懸停效果
- ✅ 鍵盤導航
- ✅ 滑鼠滾輪支援

## 🛠️ **實作技巧**

### **1. 彈性網格系統**
```css
.calendar-grid {
    display: grid;
    grid-template-columns: 1fr; /* 手機預設 */
}

@media (min-width: 769px) {
    .calendar-grid {
        grid-template-columns: repeat(3, 1fr); /* 平板 */
    }
}

@media (min-width: 1025px) {
    .calendar-grid {
        grid-template-columns: repeat(7, 1fr); /* 桌面 */
    }
}
```

### **2. 彈性字體大小**
```css
.header h1 {
    font-size: 1.8em; /* 手機 */
}

@media (min-width: 769px) {
    .header h1 {
        font-size: 2.2em; /* 平板 */
    }
}

@media (min-width: 1025px) {
    .header h1 {
        font-size: 3em; /* 桌面 */
    }
}
```

### **3. 觸控目標優化**
```css
.truck-name {
    min-height: 44px; /* 最小觸控目標 */
    padding: 12px; /* 足夠的觸控區域 */
}
```

## 📊 **測試建議**

### **必測設備尺寸**
1. **320px** - iPhone SE
2. **375px** - iPhone 12
3. **414px** - iPhone 12 Pro Max
4. **768px** - iPad (直向)
5. **1024px** - iPad (橫向)
6. **1366px** - 筆電
7. **1920px** - 桌面螢幕

### **測試工具**
- Chrome DevTools
- Firefox Responsive Design Mode
- Safari Web Inspector
- 實際設備測試

## 🚀 **進階優化**

### **1. 效能優化**
```css
/* 使用 will-change 優化動畫 */
.marquee-track {
    will-change: transform;
}

/* 使用 contain 優化重排 */
.day-card {
    contain: layout style paint;
}
```

### **2. 無障礙優化**
```css
/* 高對比度支援 */
@media (prefers-contrast: high) {
    .truck-name {
        border: 2px solid currentColor;
    }
}

/* 減少動畫支援 */
@media (prefers-reduced-motion: reduce) {
    .marquee-track {
        animation: none;
    }
}
```

### **3. 深色模式支援**
```css
@media (prefers-color-scheme: dark) {
    body {
        background: #1a1a1a;
        color: #ffffff;
    }
}
```

## 📝 **檢查清單**

### **基本檢查**
- [ ] 所有斷點都有對應樣式
- [ ] 觸控目標不小於44px
- [ ] 文字在小螢幕上可讀
- [ ] 圖片響應式載入
- [ ] 導航在手機上可用

### **進階檢查**
- [ ] 橫向/直向切換正常
- [ ] 高解析度螢幕優化
- [ ] 載入效能良好
- [ ] 無障礙功能完整
- [ ] 跨瀏覽器相容

## 🎯 **總結**

完整的響應式設計需要考慮：
1. **7個基本斷點** (320px → 1920px+)
2. **3種特殊情況** (橫向、高解析度、可折疊)
3. **4大優化方向** (佈局、字體、觸控、效能)
4. **5項測試重點** (尺寸、功能、效能、無障礙、相容性)

這樣的設計能確保您的網站在任何設備上都有最佳的用戶體驗！ 🎉
