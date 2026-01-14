# 🔑 多設備 Token 同步解決方案

## 🚨 問題說明

目前系統使用 `localStorage` 儲存 GitHub Token，這導致：
- 每台電腦的瀏覽器都有獨立的 Token 設定
- 在 A 電腦設定的 Token 不會自動出現在 B 電腦上
- 需要每台電腦都重新設定 Token

## 💡 解決方案

我們提供了完整的 Token 管理功能來解決這個問題：

### 📤 匯出 Token
1. 在已設定 Token 的電腦上開啟管理後台
2. 點擊「📤 匯出 Token」按鈕
3. 下載產生的 JSON 檔案

### 📥 匯入 Token
1. 在新電腦上開啟管理後台
2. 點擊「📥 匯入 Token」按鈕
3. 選擇之前下載的 JSON 檔案
4. 確認匯入設定

### 🔍 檢查 Token 狀態
- 點擊「🔍 檢查 Token 狀態」按鈕
- 查看當前 Token 和專案設定狀態

### 🧪 測試同步
- 點擊「🧪 測試同步」按鈕
- 驗證 Token 是否有效並能正常同步

## 📋 使用步驟

### 方法一：使用匯出/匯入功能（推薦）

1. **在已設定 Token 的電腦上：**
   - 開啟 `admin.html`
   - 點擊「📤 匯出 Token」
   - 下載 JSON 檔案

2. **在新電腦上：**
   - 開啟 `admin.html`
   - 點擊「📥 匯入 Token」
   - 選擇 JSON 檔案並確認

3. **驗證設定：**
   - 點擊「🔍 檢查 Token 狀態」
   - 點擊「🧪 測試同步」

### 方法二：手動設定 Token

1. **取得 GitHub Token：**
   - 前往 [GitHub Token 設定頁面](https://github.com/settings/tokens)
   - 點擊「Generate new token (classic)」
   - 填寫 Token 名稱：`餐開月行程表同步`
   - 選擇過期時間：`No expiration`
   - 勾選權限：`repo`（完整倉庫存取權限）
   - 複製產生的 Token

2. **在每台電腦上設定：**
   - 開啟 `admin.html`
   - 點擊「🔑 設定 Token」
   - 貼上 Token 並確認

## 🔧 故障排除

### ❌ Token 驗證失敗 (401 錯誤)
- **原因：** Token 無效或已過期
- **解決：** 重新生成 Token 並重新設定

### ❌ 權限不足 (403 錯誤)
- **原因：** Token 沒有 repo 權限
- **解決：** 重新生成 Token 時確保勾選「repo」權限

### ❌ 找不到倉庫 (404 錯誤)
- **原因：** 專案設定不正確或倉庫不存在
- **解決：** 檢查專案設定，確認倉庫 URL 正確

### ❌ CORS 跨域限制
- **原因：** 瀏覽器安全限制
- **解決：**
  - 安裝瀏覽器擴展（如 CORS Unblock）
  - 使用代理服務器
  - 手動上傳 data.json 到 GitHub
  - 使用 GitHub CLI 工具

## 📊 專案資訊

- **專案名稱：** 餐開月行程表
- **GitHub 倉庫：** sky770825/niceshow
- **網站：** https://sky770825.github.io/niceshow

## 🛡️ 安全提醒

- Token 僅儲存在您的瀏覽器本地，不會上傳到任何伺服器
- 請妥善保管您的 Token，不要分享給他人
- 如果懷疑 Token 洩露，請立即在 GitHub 上撤銷並重新生成
- 匯出的 JSON 檔案包含敏感資訊，請妥善保管

## 📖 詳細指南

如需更詳細的說明，請查看 `token-guide.html` 頁面，或點擊管理後台中的「📖 Token 設定指南」按鈕。
