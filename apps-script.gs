/**
 * ==========================================================================
 * Apps Script 後端 — 餐車自助登錄
 * ==========================================================================
 *
 * 部署步驟（詳見 SETUP.md）：
 * 1. 建立一個 Google Sheet，貼上下方欄位標題到第一列
 * 2. 開啟「Extensions → Apps Script」
 * 3. 把這整個檔案複製進去取代預設內容
 * 4. 部署 → 新增部署 → 類型「Web 應用程式」→ 存取「任何人」
 * 5. 把得到的 URL 貼到 upload.js 的 CONFIG.APPS_SCRIPT_URL
 *
 * Sheet 第一列欄位（請完全照這順序）：
 * | timestamp | truckName | phone | logoUrl | menuUrl | links |
 *
 * ==========================================================================
 */

const SHEET_NAME = 'trucks'; // 工作表分頁名稱（建議改成 trucks，預設是「工作表1」也可）

/**
 * 接收 upload.html 表單送來的 JSON，寫入 Sheet（同名覆蓋）
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    const truckName = (payload.truckName || '').trim();
    if (!truckName) {
      return jsonResponse_({ ok: false, error: '餐車名稱為必填' });
    }

    const row = [
      payload.timestamp || new Date().toISOString(),
      truckName,
      payload.phone || '',
      payload.logoUrl || '',
      payload.menuUrl || '',
      JSON.stringify(payload.links || []),
    ];

    // 同名餐車 → 覆蓋；新名 → 追加
    const data = sheet.getDataRange().getValues();
    let foundRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]).trim() === truckName) {
        foundRow = i + 1;
        break;
      }
    }
    if (foundRow > 0) {
      sheet.getRange(foundRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return jsonResponse_({ ok: true, name: truckName, action: foundRow > 0 ? 'updated' : 'created' });

  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

/**
 * 前台讀取所有餐車登錄資料
 * 呼叫範例：fetch(APPS_SCRIPT_URL + '?action=list')
 */
function doGet(e) {
  try {
    const sheet = getSheet_();
    const data = sheet.getDataRange().getValues();
    const trucks = [];

    for (let i = 1; i < data.length; i++) {
      const r = data[i];
      const name = String(r[1] || '').trim();
      if (!name) continue;

      let links = [];
      try { links = JSON.parse(r[5] || '[]'); } catch (_) {}

      trucks.push({
        timestamp: r[0],
        truckName: name,
        phone: r[2] || '',
        logoUrl: r[3] || '',
        menuUrl: r[4] || '',
        links: links,
      });
    }

    return jsonResponse_({ ok: true, trucks: trucks });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

/* ---------------- helpers ---------------- */

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0]; // fallback：第一個分頁
  return sheet;
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
