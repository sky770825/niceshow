# 四維商圈餐車月行程表

這個資料夾包含「四維商圈餐車月行程表」專案的所有相關檔案。

## 檔案說明

- **index.html** - 主頁面檔案，包含完整的 HTML 結構
- **style.css** - 樣式表檔案，包含所有 CSS 樣式
- **script.js** - JavaScript 主程式檔案，包含所有互動功能
- **sheets-booking.js** - Google Sheets 餐車報名表整合模組
- **data.json** - 餐車圖片資料檔案（用於圖片跑碼燈功能）

## 功能說明

這個專案是一個餐車月行程表系統，主要功能包括：

1. **週次選擇** - 可以選擇不同週次查看餐車安排
2. **Google Maps 導航** - 點擊餐車名稱即可開啟 Google Maps 導航
3. **圖片跑碼燈** - 顯示餐車品牌圖片
4. **Google Sheets 整合** - 從 Google Sheets 讀取餐車報名表資料
5. **響應式設計** - 支援手機、平板、電腦等各種裝置

## 使用方式

直接在瀏覽器中開啟 `index.html` 即可使用。

## 注意事項

- 確保 `sheets-booking.js` 中的 Google Sheets ID 設定正確
- `data.json` 中的圖片連結需要保持有效
- 所有檔案需要放在同一個資料夾中
