/**
 * Supabase 餐車報名表整合模組
 * 專門用於從 Supabase 資料庫讀取餐車報名表格式的資料
 */

// ==================== Supabase 設定 ====================

const SUPABASE_CONFIG = {
    // Supabase URL
    URL: 'https://sqgrnowrcvspxhuudrqc.supabase.co',
    
    // Supabase Anon Key
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZ3Jub3dyY3ZzcHhodXVkcnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTExNjYsImV4cCI6MjA4Mzc4NzE2Nn0.VMg-7oQTmPapHLGeLzEZ3l_5zcyCZRjJdw_X2J-8kRw',
    
    // 資料表名稱
    TABLE_NAME: 'foodcarcalss',
    
    // 是否啟用
    ENABLED: true,
    
    // 地址對應表（從預約場地中提取地址）
    addressMap: {
        '四維路70號': '四維路70號',
        '四維路60號': '四維路60號',
        '四維路59號': '四維路59號',
        '四維路190號': '四維路190號',
        '四維路216號': '四維路216號',
        '四維路218號': '四維路218號',
        '四維路72號': '四維路72號',
        '四維路77號': '四維路77號'
    }
};

// Supabase 客戶端
let supabaseClient = null;

// 初始化 Supabase 客戶端
function initSupabaseClient() {
    // 優先使用全局已初始化的客戶端
    if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient) {
        supabaseClient = window.supabaseClient;
        console.log('✅ 使用全局 Supabase 客戶端');
        return true;
    }
    
    // 如果沒有全局客戶端，嘗試創建新的
    let createClientFn = null;
    
    // 嘗試多種方式獲取 createClient 函數
    if (typeof window.supabase !== 'undefined') {
        if (typeof window.supabase.createClient === 'function') {
            createClientFn = window.supabase.createClient;
        } else if (window.supabase.default && typeof window.supabase.default.createClient === 'function') {
            createClientFn = window.supabase.default.createClient;
        }
    }
    
    // 檢查全局 supabase 變數
    if (!createClientFn && typeof supabase !== 'undefined') {
        if (typeof supabase.createClient === 'function') {
            createClientFn = supabase.createClient;
        } else if (supabase.default && typeof supabase.default.createClient === 'function') {
            createClientFn = supabase.default.createClient;
        }
    }
    
    if (createClientFn) {
        try {
            supabaseClient = createClientFn(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
            console.log('✅ Supabase 客戶端初始化成功');
            return true;
        } catch (error) {
            console.error('❌ Supabase 客戶端初始化失敗:', error);
            return false;
        }
    } else {
        console.error('❌ Supabase JS 庫未載入，請確認已引入: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
        return false;
    }
}

// ==================== 資料庫讀取 ====================

/**
 * 從 Supabase 資料庫讀取餐車報名表資料
 * @returns {Promise<Array>} 餐車報名資料陣列
 */
async function fetchBookingData() {
    try {
        // 檢查設定
        if (!SUPABASE_CONFIG.ENABLED) {
            console.log('ℹ️ 餐車報名表整合已停用');
            return null;
        }
        
        // 初始化 Supabase 客戶端
        if (!supabaseClient) {
            if (!initSupabaseClient()) {
                return null;
            }
        }
        
        console.log('🌐 正在從 Supabase 資料庫讀取餐車報名表資料...');
        console.time('⏱️ Supabase 載入時間');
        
        // 從 Supabase 獲取資料
        const { data, error } = await supabaseClient
            .from(SUPABASE_CONFIG.TABLE_NAME)
            .select('*')
            .order('booking_date', { ascending: true });
        
        console.timeEnd('⏱️ Supabase 載入時間');
        
        if (error) {
            throw error;
        }
        
        // 轉換為與 Google Sheets 相同的格式
        const rows = (data || []).map(row => ({
            timestamp: row.timestamp || row.created_at || new Date().toISOString(),
            storeName: row.vendor || '',
            type: row.food_type || '',
            venue: row.location || '',
            bookingDate: row.booking_date || '',
            serviceDate: row.service_date || '',
            status: row.status || '',
            fee: row.fee || '',
            paid: row.payment || '',
            note: row.note || ''
        }));
        
        console.log('✅ 餐車報名表資料讀取成功，共', rows.length, '筆資料');
        
        // 顯示前幾筆資料作為調試
        if (rows.length > 0) {
            console.log('📋 前3筆資料範例:', rows.slice(0, 3).map(r => ({
                店名: r.storeName,
                日期: r.bookingDate,
                狀態: r.status,
                場地: r.venue
            })));
        }
        
        return rows;
        
    } catch (error) {
        console.error('❌ 讀取餐車報名表失敗:', error);
        console.error('可能原因：');
        console.error('1. Supabase 連線問題');
        console.error('2. 資料表名稱設定錯誤');
        console.error('3. 網路連線問題');
        return null;
    }
}

// CSV 解析函數已移除，因為現在直接從資料庫讀取

/**
 * 從預約場地中提取地址
 * @param {string} venue - 預約場地字串（如："漢堡大亨 四維路70號(週一~週六)"）
 * @returns {string} 地址
 */
function extractAddress(venue) {
    if (!venue) return '';
    
    // 嘗試匹配地址對應表中的地址
    for (const address in SUPABASE_CONFIG.addressMap) {
        if (venue.includes(address)) {
            return address;
        }
    }
    
    // 如果沒有匹配，返回原始場地資訊
    return venue;
}

/**
 * 從預約日期中提取日期和星期
 * @param {string} bookingDate - 預約日期字串（如："10月1日(星期三)"）
 * @returns {Object} {date: '10/1', dayName: '週三', month: 10, day: 1}
 */
function parseBookingDate(bookingDate) {
    if (!bookingDate) return null;
    
    // 匹配格式：10月1日(星期三) 或 10月1日（星期三）
    const match = bookingDate.match(/(\d+)月(\d+)日[\(（]星期([一二三四五六日])[\)）]/);
    
    if (match) {
        const month = parseInt(match[1]);
        const day = parseInt(match[2]);
        
        // 調試：顯示1月的日期
        if (month === 1) {
            console.log('⚠️ 發現1月的日期:', bookingDate);
        }
        
        const dayNameMap = {
            '一': '週一',
            '二': '週二',
            '三': '週三',
            '四': '週四',
            '五': '週五',
            '六': '週六',
            '日': '週日'
        };
        const dayName = dayNameMap[match[3]] || '';
        
        return {
            date: `${month}/${day}`,
            dayName: dayName,
            month: month,
            day: day,
            fullDate: bookingDate
        };
    }
    
    return null;
}

/**
 * 將餐車報名表資料轉換為行程表格式
 * @param {Array} bookingData - 餐車報名表資料
 * @returns {Object} 格式化後的行程資料
 */
function convertBookingToSchedule(bookingData) {
    const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
    const dateKey = (year, month, day) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const groups = new Map();
    for (const booking of bookingData || []) {
        if (!['己排班', '己排'].includes(booking.status)) continue;
        const raw = String(booking.serviceDate || booking.bookingDate || '');
        const full = raw.match(/(\d{4})[年\/-](\d{1,2})[月\/-](\d{1,2})/);
        const partial = raw.match(/(\d{1,2})月(\d{1,2})日/);
        if (!full && !partial) continue;
        let year, month, day;
        if (full) {
            [, year, month, day] = full.map(Number);
        } else {
            month = Number(partial[1]);
            day = Number(partial[2]);
            // Legacy dates lack a year: anchor to creation date, never viewing date.
            const stamp = new Date(booking.timestamp);
            if (!Number.isFinite(stamp.getTime())) continue;
            const anchor = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit'
            }).format(stamp).split('-').map(Number);
            year = anchor[0];
            if (month < anchor[1]) year++;
        }
        const date = new Date(Date.UTC(year, month - 1, day));
        if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) continue;
        const key = dateKey(year, month, day);
        if (!groups.has(key)) groups.set(key, {
            year, month, day, date: `${month}/${day}`, isoDate: key,
            dayName: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][date.getUTCDay()],
            hasTrucks: true, trucks: []
        });
        groups.get(key).trucks.push({
            name: booking.storeName, address: extractAddress(booking.venue),
            type: booking.type, venue: booking.venue
        });
    }
    const weeks = new Map();
    for (const item of [...groups.values()].sort((a, b) => a.isoDate.localeCompare(b.isoDate))) {
        const monday = new Date(`${item.isoDate}T00:00:00Z`);
        monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
        const key = monday.toISOString().slice(0, 10);
        if (!weeks.has(key)) weeks.set(key, { days: [] });
        weeks.get(key).days.push(item);
    }
    const cutoff = new Date(`${today}T00:00:00Z`);
    cutoff.setUTCDate(cutoff.getUTCDate() - 7);
    const all = [...weeks.values()];
    let active = all.filter(week => week.days.at(-1).isoDate >= cutoff.toISOString().slice(0, 10));
    if (!active.length && all.length) active = [all.at(-1)];
    return { weeks: active.slice(0, 4).map((week, index) => {
        const first = week.days[0], last = week.days.at(-1);
        const label = day => `${day.year}/${day.month}/${day.day}`;
        return { ...week, id: `week${index}`, title: `${label(first)} - ${label(last)}`,
            tabLabel: `${label(first)}-${label(last)}` };
    }) };
}

/**
 * 生成週次標題
 * @param {Array} weekDays - 該週的日期資料
 * @returns {string} 週次標題（如："10月1日 - 10月7日"）
 */
function generateWeekTitle(weekDays) {
    if (!weekDays || weekDays.length === 0) return '';
    
    // 過濾掉無效的日期資料
    const validDays = weekDays.filter(day => day && day.month && day.day);
    if (validDays.length === 0) return '';
    
    const firstDay = validDays[0];
    const lastDay = validDays[validDays.length - 1];
    
    return `${firstDay.month}月${firstDay.day}日 - ${lastDay.month}月${lastDay.day}日`;
}

/**
 * 生成週次標籤
 * @param {Array} weekDays - 該週的日期資料
 * @returns {string} 週次標籤（如："10/1-10/7"）
 */
function generateWeekLabel(weekDays) {
    if (!weekDays || weekDays.length === 0) return '';
    
    // 過濾掉無效的日期資料
    const validDays = weekDays.filter(day => day && day.month && day.day);
    if (validDays.length === 0) return '';
    
    const firstDay = validDays[0];
    const lastDay = validDays[validDays.length - 1];
    
    return `${firstDay.month}/${firstDay.day}-${lastDay.month}/${lastDay.day}`;
}

/**
 * 載入並處理餐車報名表資料
 * @returns {Promise<Object>} 格式化後的行程資料
 */
async function loadBookingSchedule() {
    try {
        // 檢查是否啟用
        if (!SUPABASE_CONFIG.ENABLED) {
            console.log('ℹ️ 餐車報名表整合已停用');
            return null;
        }
        
        // ==================== 檢查快取版本並清除舊快取 ====================
        const cacheVersion = localStorage.getItem('scheduleData_booking_version');
        const currentVersion = '1.3'; // Year-aware schedule cache.
        
        if (cacheVersion !== currentVersion) {
            console.log('🔄 檢測到版本更新，清除舊快取...');
            localStorage.removeItem('scheduleData_booking');
            localStorage.removeItem('scheduleData_booking_timestamp');
            localStorage.setItem('scheduleData_booking_version', currentVersion);
        }
        
        // ==================== 優先使用快取 ====================
        const cachedData = localStorage.getItem('scheduleData_booking');
        const cachedTimestamp = localStorage.getItem('scheduleData_booking_timestamp');
        const CACHE_DURATION = 5 * 60 * 1000; // 5分鐘快取時間
        
        if (cachedData && cachedTimestamp) {
            const cacheAge = Date.now() - parseInt(cachedTimestamp);
            
            if (cacheAge < CACHE_DURATION) {
                const remainingTime = Math.round((CACHE_DURATION - cacheAge) / 1000);
                console.log(`💾 使用快取資料（快取剩餘時間: ${remainingTime}秒）`);
                console.log('⚡ 載入速度: < 0.1秒（使用快取）');
                return JSON.parse(cachedData);
            } else {
                console.log('⏰ 快取已過期，重新載入資料...');
            }
        } else {
            console.log('📥 首次載入，從 Supabase 資料庫讀取資料...');
        }
        
        // ==================== 從 Supabase 資料庫載入新資料 ====================
        const bookingData = await fetchBookingData();
        
        if (!bookingData) {
            console.warn('⚠️ 無法讀取餐車報名表資料');
            
            // 如果載入失敗但有舊快取，使用舊快取
            if (cachedData) {
                console.log('📱 使用舊快取資料（因為網路載入失敗）');
                return JSON.parse(cachedData);
            }
            
            return null;
        }
        
        // 轉換為行程表格式
        const scheduleData = convertBookingToSchedule(bookingData);
        
        if (!scheduleData) {
            console.warn('⚠️ 餐車報名表資料轉換失敗');
            console.log('bookingData 長度:', bookingData ? bookingData.length : 0);
            
            // 如果轉換失敗但有舊快取，使用舊快取
            if (cachedData) {
                console.log('📱 使用舊快取資料（因為資料轉換失敗）');
                return JSON.parse(cachedData);
            }
            
            return null;
        }
        
        console.log('📊 轉換後的行程資料:', {
            週次數量: scheduleData.weeks ? scheduleData.weeks.length : 0,
            第一週: scheduleData.weeks && scheduleData.weeks[0] ? scheduleData.weeks[0].title : '無'
        });
        
        // 儲存到 localStorage（快取）
        localStorage.setItem('scheduleData_booking', JSON.stringify(scheduleData));
        localStorage.setItem('scheduleData_booking_timestamp', Date.now().toString());
        console.log('💾 資料已儲存到快取（5分鐘內不會重新載入）');
        
        return scheduleData;
        
    } catch (error) {
        console.error('❌ 載入餐車報名表資料失敗:', error);
        
        // 嘗試使用快取資料（緊急備援）
        const cachedData = localStorage.getItem('scheduleData_booking');
        if (cachedData) {
            console.log('📱 使用本地快取資料（因為發生錯誤）');
            return JSON.parse(cachedData);
        }
        
        return null;
    }
}

/**
 * 渲染行程表（使用餐車報名表資料）
 * @param {Object} scheduleData - 行程資料
 */
function renderBookingSchedule(scheduleData) {
    if (!scheduleData || !scheduleData.weeks) {
        console.error('❌ 沒有行程資料可以渲染');
        console.error('scheduleData:', scheduleData);
        
        // 隱藏載入訊息
        const loadingMsg = document.querySelector('.loading-message');
        if (loadingMsg) {
            loadingMsg.innerHTML = '<div style="text-align: center; padding: 3rem; color: #e74c3c;"><h3>❌ 無法載入資料</h3><p>請檢查瀏覽器控制台查看詳細錯誤</p></div>';
        }
        return;
    }
    
    console.log('🎨 開始渲染餐車報名表行程...');
    console.log('週次數量:', scheduleData.weeks.length);
    
    // 隱藏載入訊息
    const loadingMsg = document.querySelector('.loading-message');
    if (loadingMsg) {
        loadingMsg.style.display = 'none';
    }
    
    // 渲染週次標籤
    renderWeekTabsBooking(scheduleData.weeks);
    
    // 渲染週次內容
    renderWeekContentBooking(scheduleData.weeks);
    
    console.log('✅ 餐車報名表行程渲染完成');
}

/**
 * 渲染週次標籤
 * @param {Array} weeks - 週次資料陣列
 */
function renderWeekTabsBooking(weeks) {
    const weekTabsContainer = document.querySelector('.week-tabs');
    if (!weekTabsContainer) {
        console.error('❌ 找不到週次標籤容器 (.week-tabs)');
        return;
    }
    
    console.log('📝 開始渲染週次標籤，共', weeks.length, '個週次');
    weekTabsContainer.innerHTML = '';
    
    weeks.forEach((week, index) => {
        const trucksCount = week.days ? week.days.filter(day => day.hasTrucks).length : 0;
        
        // 第一週默認激活
        const isFirstWeek = index === 0;
        const tabHTML = `
            <button class="week-tab${isFirstWeek ? ' active' : ''}" onclick="showWeek(${index})" data-week="${index}" aria-label="第${index + 1}週：${week.tabLabel || week.title}">
                <div class="week-tab-content">
                    <div class="week-tab-title">第${index + 1}週</div>
                    <div class="week-tab-dates">${week.tabLabel || week.title || ''}</div>
                    <div class="week-tab-trucks">${trucksCount}天有餐車</div>
                </div>
            </button>
        `;
        
        weekTabsContainer.insertAdjacentHTML('beforeend', tabHTML);
    });
    
    console.log('✅ 週次標籤渲染完成');
}

/**
 * 渲染週次內容
 * @param {Array} weeks - 週次資料陣列
 */
function renderWeekContentBooking(weeks) {
    const contentContainer = document.querySelector('.content');
    if (!contentContainer) {
        console.error('❌ 找不到內容容器 (.content)');
        return;
    }
    
    console.log('📝 開始渲染週次內容，共', weeks.length, '個週次');
    
    // 清空現有內容（但保留 loading-message，稍後會隱藏）
    const loadingMsg = contentContainer.querySelector('.loading-message');
    contentContainer.innerHTML = '';
    if (loadingMsg) {
        contentContainer.appendChild(loadingMsg);
    }
    
    weeks.forEach((week, weekIndex) => {
        if (!week.days || week.days.length === 0) {
            console.warn(`⚠️ 週次 ${weekIndex + 1} 沒有日期資料`);
            return;
        }
        
        // 第一週默認顯示
        const isFirstWeek = weekIndex === 0;
        const weekHTML = `
            <div id="${week.id || `week${weekIndex}`}" class="week-content${isFirstWeek ? ' active' : ''}">
                <div class="week-header">
                    <div class="week-title">${week.title || `第${weekIndex + 1}週`}</div>
                </div>

                <div class="calendar-grid">
                    <div class="day-header">週一</div>
                    <div class="day-header">週二</div>
                    <div class="day-header">週三</div>
                    <div class="day-header">週四</div>
                    <div class="day-header">週五</div>
                    <div class="day-header">週六</div>
                    <div class="day-header">週日</div>
                    
                    ${week.days.map(day => renderDayCardBooking(day)).join('')}
                </div>
            </div>
        `;
        
        contentContainer.insertAdjacentHTML('beforeend', weekHTML);
    });
    
    console.log('✅ 週次內容渲染完成');
}

/**
 * 渲染日期卡片
 * @param {Object} day - 日期資料
 * @returns {string} 日期卡片 HTML
 */
function renderDayCardBooking(day) {
    if (!day.hasTrucks || day.trucks.length === 0) {
        return `
            <div class="day-card" data-year="${day.year}" data-month="${day.month}" data-day="${day.day}" data-date="${day.isoDate}">
                <div class="day-number">${day.date}</div>
                <div class="day-name">${day.dayName}</div>
                <div class="no-trucks">無餐車</div>
            </div>
        `;
    }
    
    const trucksHTML = day.trucks.map(truck => {
        const addr = (truck.address || '').trim();
        return `
        <li class="truck-item">
            <div class="truck-name" data-address="${addr}">${truck.name}</div>
            ${addr ? '<div class="truck-location">📍' + addr + '</div>' : ''}
        </li>
    `;
    }).join('');
    
    return `
        <div class="day-card has-trucks" data-year="${day.year}" data-month="${day.month}" data-day="${day.day}" data-date="${day.isoDate}">
            <div class="day-number">${day.date}</div>
            <div class="day-name">${day.dayName}</div>
            <ul class="truck-list">
                ${trucksHTML}
            </ul>
        </div>
    `;
}

/**
 * 自動選擇週次（預設顯示第1週）
 * @param {Object} scheduleData - 行程資料
 */
function autoSelectWeekByCurrentDate(scheduleData) {
    if (!scheduleData || !scheduleData.weeks || scheduleData.weeks.length === 0) {
        console.log('⚠️ 沒有週次資料，無法自動選擇');
        return;
    }
    
    console.log(`📊 共有 ${scheduleData.weeks.length} 個週次`);
    console.log(`📍 預設顯示第1週`);
    
    // 直接顯示第1週（索引 0）
    const selectedWeekIndex = 0;
    const selectedWeek = scheduleData.weeks[selectedWeekIndex];
    
    console.log(`✅ 選擇週次: 第${selectedWeekIndex + 1}週 (${selectedWeek ? selectedWeek.title : '未知'})`);
    
    // 等待 DOM 更新後再調用 showWeek
    setTimeout(() => {
        if (typeof showWeek === 'function') {
            console.log('✅ 調用 showWeek 函數顯示第', selectedWeekIndex + 1, '週');
            showWeek(selectedWeekIndex);
        } else {
            console.warn('⚠️ showWeek 函數尚未載入，嘗試手動顯示週次');
            // 手動實現 showWeek 的功能
            const allWeeks = document.querySelectorAll('.week-content');
            allWeeks.forEach(week => {
                week.classList.remove('active');
            });
            
            const allTabs = document.querySelectorAll('.week-tab');
            allTabs.forEach(tab => {
                tab.classList.remove('active');
            });
            
            const targetWeek = document.getElementById(`week${selectedWeekIndex}`);
            if (targetWeek) {
                targetWeek.classList.add('active');
                console.log('✅ 手動顯示週次:', selectedWeekIndex);
            } else {
                console.error('❌ 找不到週次元素: week' + selectedWeekIndex);
            }
            
            const targetTab = document.querySelector(`[data-week="${selectedWeekIndex}"]`);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        }
    }, 200);
}

/**
 * 初始化餐車報名表整合
 */
async function initBookingSheetsIntegration() {
    console.log('🚀 初始化餐車報名表整合（從 Supabase 資料庫）...');
    
    try {
        // 初始化 Supabase 客戶端
        if (!supabaseClient) {
            const initResult = initSupabaseClient();
            if (!initResult) {
                throw new Error('Supabase 客戶端初始化失敗');
            }
        }
        
        console.log('📥 開始載入餐車報名表資料...');
        
        // 載入餐車報名表資料
        const scheduleData = await loadBookingSchedule();
        
        console.log('📊 載入結果:', scheduleData ? '成功' : '失敗');
        
        if (scheduleData) {
            // 渲染行程表
            renderBookingSchedule(scheduleData);
            
            // 重新初始化互動功能
            setTimeout(() => {
                console.log('🔧 初始化互動功能...');
                
                if (typeof initializeTruckNames === 'function') {
                    initializeTruckNames();
                    console.log('✅ initializeTruckNames 已執行');
                } else {
                    console.warn('⚠️ initializeTruckNames 函數不存在');
                }
                
                if (typeof initializeDayCards === 'function') {
                    initializeDayCards();
                    console.log('✅ initializeDayCards 已執行');
                } else {
                    console.warn('⚠️ initializeDayCards 函數不存在');
                }
                
                if (typeof initializeWeekTabs === 'function') {
                    initializeWeekTabs();
                    console.log('✅ initializeWeekTabs 已執行');
                } else {
                    console.warn('⚠️ initializeWeekTabs 函數不存在');
                }
                
                // 自動選擇當前週次（使用動態版本）
                autoSelectWeekByCurrentDate(scheduleData);
            }, 500);
            
        } else {
            console.warn('⚠️ 無法載入餐車報名表資料，使用現有的 HTML 內容');
        }
        
    } catch (error) {
        console.error('❌ 初始化餐車報名表整合失敗:', error);
        console.warn('⚠️ 將使用現有的 HTML 內容');
    }
}

/**
 * 手動重新載入資料
 */
async function reloadBookingData() {
    console.log('🔄 手動重新載入餐車報名表資料...');
    
    // 清除快取
    localStorage.removeItem('scheduleData_booking');
    localStorage.removeItem('scheduleData_booking_timestamp');
    
    // 重新初始化
    await initBookingSheetsIntegration();
}

// ==================== 導出函數 ====================

// 讓這些函數可以在全域使用
window.bookingSheetsIntegration = {
    loadBookingSchedule,
    renderBookingSchedule,
    initBookingSheetsIntegration,
    reloadBookingData,
    SUPABASE_CONFIG
};

console.log('📦 餐車報名表整合模組已載入（Supabase 版本）');

// ==================== 備用 showWeek 函數 ====================
// 如果 script.js 中的 showWeek 尚未載入，使用此備用函數

if (typeof showWeek === 'undefined') {
    window.showWeek = function(weekNumber) {
        console.log('📅 備用 showWeek 函數被調用，顯示第', weekNumber + 1, '週');
        
        // 隱藏所有週的內容
        const allWeeks = document.querySelectorAll('.week-content');
        allWeeks.forEach(week => {
            week.classList.remove('active');
        });
        
        // 移除所有分頁的active狀態
        const allTabs = document.querySelectorAll('.week-tab');
        allTabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 顯示選中的週
        const targetWeek = document.getElementById(`week${weekNumber}`);
        if (targetWeek) {
            targetWeek.classList.add('active');
        } else {
            console.error('❌ 找不到週次元素: week' + weekNumber);
        }
        
        // 激活對應的分頁
        const targetTab = document.querySelector(`[data-week="${weekNumber}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // 平滑滾動到內容區域
        const content = document.querySelector('.content');
        if (content) {
            content.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };
    
    console.log('✅ 已創建備用 showWeek 函數');
}

// ==================== 自動初始化 ====================

// 當頁面載入完成後自動初始化
function waitForSupabaseAndInit() {
    let attempts = 0;
    const maxAttempts = 100; // 最多嘗試 10 秒 (100 * 100ms)
    
    // 檢查 Supabase 是否已載入
    const checkSupabase = () => {
        attempts++;
        
        // 檢查 Supabase 是否可用（檢查全局客戶端或庫）
        const hasGlobalClient = typeof window.supabaseClient !== 'undefined' && window.supabaseClient;
        const hasSupabaseLib = 
            (typeof window.supabase !== 'undefined' && window.supabase.createClient) || 
            (typeof supabase !== 'undefined' && supabase.createClient);
        
        if (hasGlobalClient || hasSupabaseLib) {
            // Supabase 已載入，初始化
            console.log('✅ Supabase 已準備就緒，開始初始化餐車報名表整合...');
            console.log('🔍 檢查結果:', {
                全局客戶端: hasGlobalClient,
                Supabase庫: hasSupabaseLib,
                嘗試次數: attempts
            });
            
            setTimeout(() => {
                initBookingSheetsIntegration();
            }, 200);
        } else if (attempts < maxAttempts) {
            // 每 10 次嘗試顯示一次進度
            if (attempts % 10 === 0) {
                console.log(`⏳ 等待 Supabase 載入中... (${attempts}/${maxAttempts})`);
            }
            // 等待 100ms 後再次檢查
            setTimeout(checkSupabase, 100);
        } else {
            console.error('❌ Supabase 庫載入超時！');
            console.error('可能原因：');
            console.error('1. 網路連線問題，無法載入 Supabase CDN');
            console.error('2. CDN 服務暫時不可用');
            console.error('3. 瀏覽器阻擋了外部腳本');
            
            // 顯示錯誤訊息給用戶
            const loadingMsg = document.querySelector('.loading-message');
            if (loadingMsg) {
                loadingMsg.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: #e74c3c;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                        <h3>無法載入資料庫連線</h3>
                        <p style="margin-top: 1rem; color: #888;">
                            請檢查網路連線，或稍後再試。<br>
                            如果問題持續，請聯繫管理員。
                        </p>
                        <button onclick="location.reload()" style="margin-top: 1rem; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            重新載入
                        </button>
                    </div>
                `;
            }
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkSupabase);
    } else {
        checkSupabase();
    }
}

// 開始等待並初始化
console.log('📦 餐車報名表整合模組開始初始化...');
waitForSupabaseAndInit();

