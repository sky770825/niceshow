# 錯誤修復指南

## 常見錯誤與解決方案

### 1. Supabase 配置錯誤

**錯誤訊息：**
```
請先設定 Supabase URL，請在 .env 檔案中設定 VITE_SUPABASE_URL
```

**解決方案：**
1. 在 `admin` 資料夾中建立 `.env` 檔案
2. 填入您的 Supabase 資訊：
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
3. 重新啟動開發伺服器：`npm run dev`

### 2. Bucket 不存在錯誤

**錯誤訊息：**
```
找不到 Storage Bucket "niceshow"
```

**解決方案：**
1. 登入 Supabase Dashboard
2. 前往 Storage 頁面
3. 建立新的 bucket，名稱設為 `niceshow`
4. **重要**：勾選「Public bucket」（公開 bucket）
5. 重新嘗試上傳

### 3. 權限錯誤

**錯誤訊息：**
```
上傳權限被拒絕，請檢查 Supabase Storage Policies 設定
```

**解決方案：**
1. 在 Supabase Dashboard 中，前往 Storage > Policies
2. 為 `niceshow` bucket 設定以下 Policy：

**上傳 Policy（INSERT）：**
```sql
-- 允許所有人上傳（公開）
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'niceshow');
```

**讀取 Policy（SELECT）：**
```sql
-- 允許所有人讀取（公開）
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'niceshow');
```

**刪除 Policy（DELETE）：**
```sql
-- 允許所有人刪除（公開）
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'niceshow');
```

### 4. CORS 錯誤

**錯誤訊息：**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**解決方案：**
Supabase 預設已處理 CORS，如果仍有問題：
1. 確認 Supabase URL 正確
2. 檢查瀏覽器控制台的完整錯誤訊息
3. 確認 bucket 設為公開

### 5. 圖片刪除失敗

**錯誤訊息：**
```
無法從 URL 中提取檔案路徑
```

**解決方案：**
- 這是警告訊息，圖片已從列表中移除
- 如果圖片仍在 Supabase 中，可以手動在 Supabase Dashboard 中刪除

## 檢查清單

在開始使用前，請確認：

- [ ] 已建立 `.env` 檔案並填入 Supabase 資訊
- [ ] 已在 Supabase 中建立 `niceshow` bucket
- [ ] `niceshow` bucket 已設為公開（Public）
- [ ] 已設定 Storage Policies（如果需要）
- [ ] 已重新啟動開發伺服器

## 測試連線

在瀏覽器控制台（F12）中執行：

```javascript
// 測試 Supabase 連線
import { supabase } from './src/config/supabase.js'
const { data, error } = await supabase.storage.from('niceshow').list()
console.log('Bucket 內容:', data)
console.log('錯誤:', error)
```

如果看到 bucket 內容，表示連線成功！

## 需要協助？

如果問題持續存在，請檢查：
1. 瀏覽器控制台的完整錯誤訊息
2. Supabase Dashboard 中的 Storage 設定
3. `.env` 檔案中的配置是否正確
