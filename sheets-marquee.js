/* ==========================================================================
   sheets-marquee.js — 從 Google Sheets 載入餐車登錄資料
   並依「本週排班表上有的餐車名稱」過濾，注入跑馬燈
   ========================================================================== */

(function () {
  'use strict';

  // ⚙️ 設定
  const APPS_SCRIPT_URL = window.APPS_SCRIPT_URL || 'YOUR_APPS_SCRIPT_URL';
  const CACHE_KEY = 'sheetsTrucksCache';
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 分鐘

  /**
   * 載入 Sheets 上的所有餐車登錄資料（含快取）
   */
  async function loadSheetsTrucks() {
    if (APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL') {
      console.warn('[sheets-marquee] APPS_SCRIPT_URL 未設定，跳過');
      return [];
    }

    // 檢查快取
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        console.log('[sheets-marquee] 使用快取資料（' + cached.trucks.length + ' 筆）');
        return cached.trucks;
      }
    } catch (_) {}

    try {
      const res = await fetch(APPS_SCRIPT_URL, { method: 'GET' });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || '讀取失敗');
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        trucks: data.trucks,
        fetchedAt: Date.now(),
      }));
      console.log('[sheets-marquee] 從 Sheets 載入 ' + data.trucks.length + ' 筆餐車登錄資料');
      return data.trucks;
    } catch (err) {
      console.warn('[sheets-marquee] 載入 Sheets 失敗：', err.message);
      return [];
    }
  }

  /**
   * 從目前頁面上的排班表，撈出所有出現的餐車名稱
   */
  function getScheduledTruckNames() {
    const names = new Set();
    document.querySelectorAll('.truck-name').forEach(el => {
      const name = (el.getAttribute('data-truck-name') || el.textContent || '').trim();
      if (name) names.add(name);
    });
    return names;
  }

  /**
   * 模糊比對：去除空白、表情符號、標點，比對是否相符或互含
   */
  function normalize(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/[\s\p{P}\p{S}\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '');
  }
  function namesMatch(a, b) {
    const na = normalize(a), nb = normalize(b);
    if (!na || !nb) return false;
    return na === nb || na.includes(nb) || nb.includes(na);
  }

  /**
   * 把 Sheets 資料注入跑馬燈
   */
  function injectIntoMarquee(matchedTrucks) {
    const track = document.getElementById('marqueeTrack');
    if (!track || !matchedTrucks.length) return;

    matchedTrucks.forEach(truck => {
      // 防止重複注入
      if (track.querySelector(`[data-sheets-name="${CSS.escape(truck.truckName)}"]`)) return;

      const item = document.createElement('div');
      item.className = 'marquee-item';
      item.title = truck.truckName;
      item.setAttribute('data-sheets-name', truck.truckName);

      const linkData = (truck.links || [])
        .map(l => `${l.url}|${l.text}`).join(',');
      if (linkData) item.setAttribute('data-link', linkData);
      if (truck.menuUrl) item.setAttribute('data-img-link', truck.menuUrl);

      const img = document.createElement('img');
      img.src = truck.logoUrl || truck.menuUrl || '';
      img.alt = truck.truckName;
      img.loading = 'lazy';
      item.appendChild(img);

      // 如果沒圖就跳過
      if (!img.src) return;

      track.appendChild(item);
    });
    console.log('[sheets-marquee] 已注入 ' + matchedTrucks.length + ' 個排班餐車到跑馬燈');
  }

  /**
   * 主流程：載入 Sheets → 比對排班 → 注入
   */
  async function init() {
    const [allTrucks] = await Promise.all([loadSheetsTrucks()]);
    if (!allTrucks.length) return;

    // 等排班表渲染好（最多重試 5 次）
    let scheduled = getScheduledTruckNames();
    for (let i = 0; i < 5 && scheduled.size === 0; i++) {
      await new Promise(r => setTimeout(r, 600));
      scheduled = getScheduledTruckNames();
    }

    if (scheduled.size === 0) {
      console.log('[sheets-marquee] 排班表尚無餐車，本週無人出攤');
      return;
    }

    // 過濾：只保留排班表上出現的
    const matched = allTrucks.filter(t =>
      [...scheduled].some(s => namesMatch(s, t.truckName))
    );

    console.log(`[sheets-marquee] 排班 ${scheduled.size} 個 / Sheets ${allTrucks.length} 個 / 配對 ${matched.length} 個`);

    if (matched.length) injectIntoMarquee(matched);
  }

  // 等頁面載完且 marquee 初始化完成後執行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1500));
  } else {
    setTimeout(init, 1500);
  }

  // 換週時重跑
  document.addEventListener('weekChanged', () => setTimeout(init, 800));
})();
