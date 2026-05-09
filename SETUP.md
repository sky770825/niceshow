# 餐車自助登錄系統 — 部署指南

完整流程：餐車老闆透過 LINE 群分享的 `upload.html` 表單登錄 → 圖片存 Cloudinary、資料寫進 Google Sheet → 前台首頁讀 Sheet 並配對當週排班，自動把出攤的餐車加進跑馬燈。

**完全免費**，不需要伺服器。

---

## 步驟 1️⃣：建立 Cloudinary 圖床帳號（5 分鐘）

1. 前往 [cloudinary.com](https://cloudinary.com/users/register_free) 免費註冊
2. 登入後在 Dashboard 看到你的 **Cloud name**（例如 `db0mzs6ps`），記下來
3. 進入 **Settings → Upload → Upload presets**
4. 點 **Add upload preset**
   - **Preset name**：自取，例如 `niceshow_unsigned`
   - **Signing Mode**：改成 **Unsigned**
   - **Folder**（選填）：`niceshow_trucks`
   - 其他保留預設，存檔
5. 記下 preset 名稱

---

## 步驟 2️⃣：建立 Google Sheet（2 分鐘）

1. 開新的 Google Sheet
2. 第一列填入欄位（**順序必須一致**）：

   | A | B | C | D | E | F |
   |---|---|---|---|---|---|
   | timestamp | truckName | phone | logoUrl | menuUrl | links |

3. 把工作表分頁名稱改成 `trucks`（在底下分頁標籤右鍵改名）

---

## 步驟 3️⃣：部署 Apps Script Web App（5 分鐘）

1. 在剛建立的 Sheet，點選單列的 **擴充功能 → Apps Script**
2. 把預設的 `Code.gs` 全部刪除，貼上專案中 `apps-script.gs` 的完整內容
3. 點儲存（💾）
4. 右上角點 **部署 → 新增部署**
   - 類型：⚙️ → 選 **網頁應用程式**
   - 說明：`餐車登錄 v1`
   - **執行身分**：我
   - **存取權**：**任何人**（必填，否則前台無法讀）
5. 點「部署」，第一次會要求授權 → 同意
6. 部署完成後，複製 **網頁應用程式 URL**（長得像 `https://script.google.com/macros/s/AKfy.../exec`）

> ⚠️ 之後每次改 `apps-script.gs` 都要點「部署 → 管理部署 → 編輯（鉛筆）→ 版本選『新版本』→ 部署」才會生效。

---

## 步驟 4️⃣：把金鑰填回專案（1 分鐘）

開啟 **`upload.js`** 最上方的 `CONFIG`：

```js
const CONFIG = {
  CLOUDINARY_CLOUD_NAME: '你的 cloud name',
  CLOUDINARY_UPLOAD_PRESET: '你的 preset 名稱',
  APPS_SCRIPT_URL: '你的 Apps Script URL',
};
```

然後開啟 **`index v2.html`**，找到這行替換：

```html
<script>window.APPS_SCRIPT_URL = '你的 Apps Script URL';</script>
```

---

## 步驟 5️⃣：分享給餐車老闆

把 `upload.html` 的網址放進 LINE 群（建議做個短網址）：

```
https://你的網址/upload.html
```

老闆填完表單按送出後：
- 圖片上傳到 Cloudinary
- 資料寫進你的 Google Sheet（你可以隨時打開試算表看）
- 同名餐車**會覆蓋**舊資料（方便老闆更新）

---

## 步驟 6️⃣：前台會自動運作

`index v2.html` 載入時：
1. 讀取你的 Apps Script URL
2. 取得 Sheet 上所有餐車登錄資料
3. 比對當週排班表上出現的餐車名稱
4. 配對成功的，自動加入跑馬燈輪播

> 比對是模糊比對（去空白、去表情符號、互含），所以排班上「阿明炸物」和登錄的「阿明手作炸物」可以對到。

---

## 🔧 疑難排解

| 問題 | 解法 |
|---|---|
| 上傳卡在「上傳餐車照片中…」 | Cloudinary cloud name 或 preset 名稱錯，或 preset 沒設成 Unsigned |
| 上傳成功但 Sheet 沒資料 | Apps Script 沒部署，或部署時存取權沒選「任何人」|
| 前台跑馬燈沒新增餐車 | 檢查 Console，看 `[sheets-marquee]` 訊息；或 Sheet 上的餐車名跟排班表完全沒交集 |
| 改了 Apps Script 程式碼沒效果 | 必須「部署 → 管理部署 → 新版本」才會更新 URL 行為 |

---

## 💸 成本

| 服務 | 免費額度 | 通常會超嗎？ |
|---|---|---|
| Cloudinary | 25 GB 儲存 + 25 GB/月流量 | 不會（餐車圖很小）|
| Google Sheets | 無限 | 不會 |
| Apps Script | 6 分鐘/次 + 每天 90 分鐘總時長 | 不會 |

---

## 🚀 下次想擴充什麼？

- 「上架後 24 小時自動下架」邏輯（要在 Apps Script 加 trigger）
- 餐車老闆登入系統（限定本人才能改自己的資料）
- 後台審核介面（你看過再上線）
- 簡訊 / Email 通知排班餐車

需要再說。
