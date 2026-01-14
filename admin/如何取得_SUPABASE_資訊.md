# 如何取得 Supabase 專案資訊

## 步驟 1: 登入 Supabase

1. 前往 [https://supabase.com](https://supabase.com)
2. 登入您的帳號

## 步驟 2: 選擇專案

1. 在 Dashboard 中選擇您的專案
2. 如果還沒有專案，點擊「New Project」建立一個

## 步驟 3: 取得 Project URL

1. 在專案 Dashboard 中，點擊左側選單的 **Settings**（設定）
2. 點擊 **API**
3. 在 **Project URL** 區塊中，複製 URL
   - 格式類似：`https://xxxxxxxxxxxxx.supabase.co`
   - 這就是您的 `VITE_SUPABASE_URL`

## 步驟 4: 取得 Anon Key

1. 在同一個 **API** 頁面中
2. 找到 **Project API keys** 區塊
3. 找到 **anon public** key（不是 service_role key！）
4. 點擊眼睛圖示顯示 key，然後複製
   - 格式類似：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - 這就是您的 `VITE_SUPABASE_ANON_KEY`

## 步驟 5: 更新 .env 檔案

1. 打開 `admin/.env` 檔案
2. 將 `your-project-id.supabase.co` 替換為您實際的 Project URL
3. 將 `your-anon-key-here` 替換為您實際的 anon key

範例：
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 步驟 6: 確認 niceshow Bucket

1. 在 Supabase Dashboard 中，點擊左側選單的 **Storage**
2. 確認有一個名為 `niceshow` 的 bucket
3. 如果沒有，點擊 **New bucket** 建立：
   - Name: `niceshow`
   - **重要**：勾選 **Public bucket**（公開 bucket）

## 步驟 7: 重新啟動開發伺服器

更新 `.env` 後，需要重新啟動：

1. 停止目前的開發伺服器（在終端按 `Ctrl + C`）
2. 重新啟動：`npm run dev`

## 安全提醒

⚠️ **重要**：
- `.env` 檔案包含敏感資訊，**不要**提交到 Git
- `.env` 已經在 `.gitignore` 中，不會被上傳
- `anon key` 是公開的，但還是建議不要分享
- 絕對不要使用 `service_role key`（這個有完整權限，非常危險）

## 測試連線

設定完成後，可以測試連線：

1. 啟動開發伺服器：`npm run dev`
2. 登入後台系統
3. 進入「圖片管理」頁面
4. 嘗試上傳一張圖片
5. 如果成功，圖片會出現在 Supabase Storage 中

## 需要協助？

如果遇到問題：
1. 檢查 `.env` 檔案中的值是否正確（沒有多餘的空格）
2. 確認 Supabase 專案是否正常運行
3. 檢查瀏覽器控制台（F12）的錯誤訊息
4. 參考 `ERROR_FIX.md` 檔案
