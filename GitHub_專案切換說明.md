# GitHub 專案切換工具說明

## 問題背景
當您需要在不同的 GitHub 專案之間切換時，每個專案可能需要不同的認證設定（用戶名、電子郵件、倉庫 URL 等）。手動切換這些設定既麻煩又容易出錯。

## 解決方案
我為您創建了兩個工具來解決這個問題：

### 1. 🔄 完整版：`github_project_switcher.bat`
**功能最全面的專案管理工具**

**主要功能：**
- ✅ 管理多個 GitHub 專案配置
- ✅ 一鍵切換到任何已配置的專案
- ✅ 添加、編輯、刪除專案設定
- ✅ 查看所有專案列表
- ✅ 修復認證問題
- ✅ 快速推送功能

**使用場景：**
- 當您有多個 GitHub 專案需要管理時
- 需要詳細的專案配置管理時
- 團隊協作需要切換不同帳戶時

### 2. ⚡ 簡化版：`quick_github_switch.bat`
**快速切換工具，操作簡單**

**主要功能：**
- ✅ 快速切換到餐開月行程表專案
- ✅ 添加新專案並立即切換
- ✅ 修復當前認證問題
- ✅ 一鍵推送變更

**使用場景：**
- 主要使用餐開月行程表專案
- 偶爾需要切換到其他專案
- 希望操作簡單快速

## 已記錄的帳戶

### 📋 帳戶清單
1. **sky770825 帳戶**
   - 用戶名：`sky770825`
   - 電子郵件：`sky19880825@gmail.com`
   - 專案：餐開月行程表 (主要)
   - 網站：https://sky770825.github.io/niceshow

2. **liny14705 帳戶**
   - 用戶名：`liny14705`
   - 電子郵件：`liny14705@gmail.com`
   - 專案：餐開月行程表 (備用)
   - 網站：https://liny14705.github.io/niceshow

## 使用指南

### 快速開始
1. 雙擊 `quick_github_switch.bat` 開始使用
2. 選擇 "1" 切換到 sky770825 帳戶
3. 選擇 "2" 切換到 liny14705 帳戶
4. 選擇 "y" 立即推送變更

### 添加新專案
1. 選擇 "3" 添加新專案
2. 輸入專案資訊：
   - 專案名稱（例如：我的部落格）
   - GitHub 用戶名
   - GitHub 電子郵件
   - 倉庫 URL（例如：https://github.com/username/repo.git）
   - 網站 URL（例如：https://username.github.io/repo）

### 修復認證問題
如果遇到認證錯誤：
1. 選擇 "4" 修復當前認證
2. 輸入正確的 GitHub 用戶名和電子郵件
3. 工具會自動修復並嘗試推送

## 常見問題

### Q: 為什麼需要切換認證？
A: 不同的 GitHub 專案可能屬於不同的帳戶，每個帳戶有不同的用戶名和電子郵件。Git 需要知道您要使用哪個身份來提交代碼。

### Q: 推送失敗怎麼辦？
A: 如果推送失敗，通常需要：
1. 檢查 Personal Access Token 是否有效
2. 確認倉庫 URL 是否正確
3. 確認您有該倉庫的寫入權限

### Q: 如何獲取 Personal Access Token？
A: 
1. 前往 https://github.com/settings/tokens
2. 點擊 "Generate new token"
3. 選擇 "repo" 權限
4. 複製生成的 token
5. 在推送時使用：`git push https://username:token@github.com/username/repo.git main`

### Q: 可以同時管理多少個專案？
A: 理論上沒有限制，但建議不要超過 20 個專案以保持管理效率。

## 技術細節

### 配置文件
- 專案配置保存在 `github_projects.json` 文件中
- 格式為標準 JSON，可以手動編輯
- 包含專案名稱、用戶名、電子郵件、倉庫 URL、網站 URL 等資訊

### 認證管理
- 自動清除 Windows 認證快取
- 重置 Git 全域配置
- 重新設定遠端倉庫 URL

### 安全注意事項
- Personal Access Token 不會被保存
- 每次使用都需要重新輸入敏感資訊
- 建議定期更換 Personal Access Token

## 更新日誌

### v1.0 (2025-01-16)
- ✅ 創建完整的專案切換工具
- ✅ 支援多專案管理
- ✅ 添加快速切換功能
- ✅ 包含認證修復功能

## 支援
如果您遇到任何問題，請檢查：
1. 網路連接是否正常
2. GitHub 帳戶是否有效
3. 倉庫 URL 是否正確
4. 是否有適當的權限

---

**提示：** 建議先使用 `quick_github_switch.bat` 熟悉基本操作，然後再使用 `github_project_switcher.bat` 進行更詳細的專案管理。
