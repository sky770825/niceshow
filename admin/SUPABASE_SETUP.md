# Supabase 設定指南

## 步驟 1: 建立 Supabase 專案

1. 前往 [https://supabase.com](https://supabase.com)
2. 註冊/登入帳號
3. 點擊「New Project」建立新專案
4. 填寫專案資訊：
   - Project Name: `food-truck-admin`（或您喜歡的名稱）
   - Database Password: 設定一個強密碼
   - Region: 選擇離您最近的區域（建議選擇 `Southeast Asia (Singapore)`）
5. 等待專案建立完成（約 2 分鐘）

## 步驟 2: 取得 API 金鑰

1. 在專案 Dashboard 中，點擊左側選單的「Settings」（設定）
2. 點擊「API」
3. 找到以下資訊：
   - **Project URL**: 複製這個 URL
   - **anon public key**: 複製這個金鑰

## 步驟 3: 建立 Storage Bucket

1. 在左側選單點擊「Storage」
2. 點擊「New bucket」
3. 設定：
   - **Name**: `food-truck-images`
   - **Public bucket**: ✅ 勾選（重要！這樣才能公開存取圖片）
4. 點擊「Create bucket」

## 步驟 4: 設定 Bucket 權限（可選）

如果需要更細緻的權限控制：

1. 在 Storage 頁面，點擊「Policies」
2. 可以設定上傳、讀取、刪除的權限規則

預設情況下，公開 bucket 允許所有人讀取，但只有認證用戶可以上傳。

## 步驟 5: 設定環境變數

1. 在 `admin` 資料夾中建立 `.env` 檔案
2. 複製 `.env.example` 的內容
3. 填入您的 Supabase 資訊：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 步驟 6: 測試連線

1. 啟動開發伺服器：`npm run dev`
2. 登入後台系統
3. 進入「圖片管理」頁面
4. 嘗試上傳一張圖片
5. 如果成功，圖片會出現在 Supabase Storage 中

## 疑難排解

### 問題：上傳失敗，顯示 CORS 錯誤
**解決方案**：確認 Supabase 專案的 CORS 設定允許您的網域

### 問題：無法讀取圖片
**解決方案**：
1. 確認 bucket 已設為公開（Public bucket）
2. 檢查圖片 URL 是否正確

### 問題：上傳權限被拒絕
**解決方案**：
1. 在 Supabase Dashboard 中檢查 Storage Policies
2. 確認 bucket 允許匿名上傳，或設定適當的認證規則

## 進階設定（可選）

### 啟用圖片壓縮
可以在上傳前使用瀏覽器 API 壓縮圖片，減少儲存空間。

### 設定圖片 CDN
Supabase 自動提供 CDN，圖片 URL 已經過 CDN 加速。

### 設定自動刪除舊圖片
可以在 Supabase 中設定 Database Functions 來自動清理未使用的圖片。

## 支援

如有問題，請參考：
- [Supabase 官方文件](https://supabase.com/docs)
- [Supabase Storage 文件](https://supabase.com/docs/guides/storage)
