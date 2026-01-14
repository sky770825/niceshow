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
    if (!bookingData || bookingData.length === 0) {
        console.warn('⚠️ 沒有資料可以轉換');
        return null;
    }
    
    console.log('🔄 開始轉換餐車報名表資料...');
    console.log('📊 原始資料筆數:', bookingData.length);
    
    // 按日期分組
    const dateMap = new Map();
    
    // 獲取當前年份和月份
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    console.log(`📅 當前日期: ${currentYear}年${currentMonth}月`);
    
    let processedCount = 0;
    let skippedCount = 0;
    let statusFilteredCount = 0;
    
    bookingData.forEach(booking => {
        const dateInfo = parseBookingDate(booking.bookingDate);
        if (!dateInfo) {
            skippedCount++;
            // 顯示前幾個解析失敗的資料
            if (skippedCount <= 3) {
                console.log('❌ 日期解析失敗:', {
                    店名: booking.storeName,
                    預約日期: booking.bookingDate,
                    預約場地: booking.venue,
                    狀態: booking.status
                });
            }
            return;
        }
        
        // 處理1月份的資料
        if (dateInfo.month === 1) {
            // 如果當前是12月，1月是下個月，應該保留
            if (currentMonth === 12) {
                console.log('✅ 保留1月資料（12月時的下個月）:', booking.bookingDate);
                // 保留，不返回
            }
            // 如果當前是1月，檢查年份
            else if (currentMonth === 1) {
                // 從時間戳記解析年份
                let bookingYear = currentYear; // 預設為當前年份
                if (booking.timestamp) {
                    try {
                        const timestampDate = new Date(booking.timestamp);
                        bookingYear = timestampDate.getFullYear();
                        console.log('🔍 檢查1月資料:', {
                            預約日期: booking.bookingDate,
                            時間戳記: booking.timestamp,
                            解析年份: bookingYear,
                            當前年份: currentYear
                        });
                    } catch (e) {
                        // 解析失敗，使用預設值
                    }
                }
                
                // 只保留當前年份的1月資料
                if (bookingYear !== currentYear) {
                    console.log('🚫 已隱藏1月資料（年份不符）:', booking.bookingDate, '年份:', bookingYear);
                    return;
                }
            }
            // 如果當前是其他月份（2-11月），1月可能是明年的，也應該保留
            else {
                console.log('✅ 保留1月資料（可能是明年的）:', booking.bookingDate);
                // 保留，不返回
            }
        }
        
        const address = extractAddress(booking.venue);
        
        // 使用日期作為 key
        const dateKey = `${dateInfo.month}-${dateInfo.day}`;
        
        if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, {
                date: dateInfo.date,
                dayName: dateInfo.dayName,
                month: dateInfo.month,
                day: dateInfo.day,
                trucks: []
            });
        }
        
        // 只添加已排班的餐車（支援 '己排班' 和 '己排' 兩種狀態）
        if (booking.status === '己排班' || booking.status === '己排') {
            dateMap.get(dateKey).trucks.push({
                name: booking.storeName,
                address: address,
                type: booking.type,
                venue: booking.venue
            });
            processedCount++;
        } else {
            statusFilteredCount++;
            // 顯示前幾個被過濾的資料
            if (statusFilteredCount <= 3) {
                console.log('⚠️ 狀態不符合，已過濾:', {
                    店名: booking.storeName,
                    日期: booking.bookingDate,
                    狀態: `"${booking.status}"`,
                    需要: '"己排班" 或 "己排"'
                });
            }
        }
    });
    
    console.log('📊 轉換統計:', {
        總資料: bookingData.length,
        成功處理: processedCount,
        日期解析失敗: skippedCount,
        狀態過濾: statusFilteredCount,
        有效日期數: dateMap.size
    });
    
    // 將日期按時間排序（從1月開始：1月、2月、3月...12月）
    const sortedDates = Array.from(dateMap.values()).sort((a, b) => {
        // 按月份排序（1月、2月、3月...12月）
        if (a.month !== b.month) {
            return a.month - b.month;
        }
        // 同月份按日期排序
        return a.day - b.day;
    });
    
    console.log('📊 共有', sortedDates.length, '天有餐車資料');
    
    if (sortedDates.length === 0) {
        console.warn('⚠️ 沒有有效的日期資料！可能原因：');
        console.warn('1. 所有資料的狀態都不是 "己排班" 或 "己排"');
        console.warn('2. 日期格式無法解析');
        console.warn('3. 資料庫中沒有符合條件的資料');
    } else {
        // 調試：顯示排序後的前幾個日期
        console.log('🔍 排序後的前5個日期:', sortedDates.slice(0, 5).map(d => `${d.month}/${d.day} (${d.trucks.length}個餐車)`));
        console.log('🔍 排序後的最後5個日期:', sortedDates.slice(-5).map(d => `${d.month}/${d.day} (${d.trucks.length}個餐車)`));
    }
    
    // 按週次分組（每7天一組）
    const weeks = [];
    let currentWeek = null;
    let weekStartMonth = null;
    let weekStartDay = null;
    
    sortedDates.forEach((dayData, index) => {
        // 每7天開始新的一週，或第一天
        const shouldStartNewWeek = index % 7 === 0 || !currentWeek;
        
        if (shouldStartNewWeek) {
            if (currentWeek && currentWeek.days.length > 0) {
                weeks.push(currentWeek);
            }
            
            weekStartMonth = dayData.month;
            weekStartDay = dayData.day;
            
            // 計算週次標題
            const weekNum = weeks.length + 1;
            // 預設標題，稍後會根據實際資料更新
            const weekTitle = `${dayData.month}月${dayData.day}日`;
            const weekLabel = `${dayData.month}/${dayData.day}`;
            
            currentWeek = {
                id: `week${weekNum - 1}`,
                title: weekTitle,
                tabLabel: weekLabel,
                days: []
            };
        }
        
        currentWeek.days.push({
            date: dayData.date,
            dayName: dayData.dayName,
            month: dayData.month,
            day: dayData.day,
            hasTrucks: dayData.trucks.length > 0,
            trucks: dayData.trucks
        });
    });
    
    // 添加最後一週
    if (currentWeek && currentWeek.days.length > 0) {
        weeks.push(currentWeek);
    }
    
    // 資料添加完成後，更新週次標題
    weeks.forEach(week => {
        if (week.days && week.days.length > 0) {
            const firstDay = week.days[0];
            const lastDay = week.days[week.days.length - 1];
            if (firstDay && lastDay && firstDay.month && lastDay.month) {
                // 直接使用 month 和 day 屬性，不需要解析 date 字串
                week.title = `${firstDay.month}月${firstDay.day}日 - ${lastDay.month}月${lastDay.day}日`;
                week.tabLabel = `${firstDay.month}/${firstDay.day}-${lastDay.month}/${lastDay.day}`;
            }
        }
    });
    
    console.log('📅 資料轉換完成，共', weeks.length, '週');
    
    // 過濾已經過期的週次
    const currentDate = now.getDate();
    
    console.log(`📅 當前日期: ${currentMonth}/${currentDate}`);
    console.log('📊 週次過濾檢查：');
    
    const activeWeeks = weeks.filter(week => {
        if (week.days.length === 0) {
            console.log(`❌ 跳過空週次: ${week.title}`);
            return false;
        }
        
        // 取得這週的第一天和最後一天
        const firstDay = week.days[0];
        const lastDay = week.days[week.days.length - 1];
        
        // 調試：檢查資料結構
        console.log(`🔍 檢查: ${week.title}`);
        console.log(`   firstDay:`, firstDay);
        console.log(`   lastDay:`, lastDay);
        console.log(`   week.days 長度:`, week.days.length);
        
        // 直接使用 month 和 day 屬性
        const firstDate = { month: firstDay.month, day: firstDay.day };
        const lastDate = { month: lastDay.month, day: lastDay.day };
        
        console.log(`   日期: ${firstDate.month}/${firstDate.day} - ${lastDate.month}/${lastDate.day}`);
        
        // 檢查這週是否完全過期
        // 只有當整週的最後一天都過了，才過濾掉
        // 處理跨年情況：如果當前是12月，1月是下個月（未來）
        const isFutureMonth = (lastDate.month > currentMonth) || 
                              (currentMonth === 12 && lastDate.month === 1);
        
        if (isFutureMonth) {
            console.log(`✅ 保留（未來月份）`);
            return true; // 未來的月份
        } else if (lastDate.month === currentMonth) {
            if (lastDate.day >= currentDate) {
                console.log(`✅ 保留（本月未過期）`);
                return true; // 當月且最後一天還沒過
            } else {
                console.log(`❌ 隱藏（本月已過期）`);
                return false; // 當月且最後一天已過
            }
        } else {
            // 過去的月份，檢查是否最近（保留最近幾週）
            // 處理跨年情況：如果當前是1月，12月是上個月
            let daysDiff;
            if (currentMonth === 1 && lastDate.month === 12) {
                // 跨年情況：從12月到1月
                daysDiff = (1 - lastDate.day) + currentDate;
            } else {
                daysDiff = (currentMonth - lastDate.month) * 30 + (currentDate - lastDate.day);
            }
            
            if (daysDiff <= 7) {
                console.log(`✅ 保留（最近過期，${daysDiff}天前）`);
                return true; // 最近7天內過期的，仍然保留
            } else {
                console.log(`❌ 隱藏（過期太久，${daysDiff}天前）`);
                return false; // 過期太久的，過濾掉
            }
        }
    });
    
    console.log('🗓️ 過濾結果:', activeWeeks.length, '/', weeks.length, '週');
    
    // 如果過濾後沒有任何週次，至少要保留一週（最新的一週）
    if (activeWeeks.length === 0) {
        console.warn('⚠️ 過濾後沒有週次，保留最新一週');
        const latestWeek = weeks[weeks.length - 1];
        return { weeks: [latestWeek] };
    }
    
    // 調試：顯示所有週次的詳細資訊
    console.log('📊 過濾前所有週次：');
    weeks.forEach((week, index) => {
        if (week.days.length > 0) {
            const lastDay = week.days[week.days.length - 1];
            console.log(`  週次 ${index + 1}: ${week.title} (最後一天: ${lastDay.month}/${lastDay.day})`);
        }
    });
    
    console.log('📊 過濾後保留週次：');
    activeWeeks.forEach((week, index) => {
        if (week.days.length > 0) {
            const lastDay = week.days[week.days.length - 1];
            console.log(`  週次 ${index + 1}: ${week.title} (最後一天: ${lastDay.month}/${lastDay.day})`);
        }
    });
    
    // 限制只顯示最近的4週
    const maxWeeks = 4;
    if (activeWeeks.length > maxWeeks) {
        console.log(`📌 限制顯示週數：從 ${activeWeeks.length} 週減少到 ${maxWeeks} 週`);
        activeWeeks.splice(maxWeeks); // 只保留前4週
    }
    
    // 重新編號週次 ID（重要！）
    activeWeeks.forEach((week, index) => {
        week.id = `week${index}`;
        console.log(`📝 週次 ${index + 1}: ${week.title} (ID: ${week.id})`);
    });
    
    return { weeks: activeWeeks };
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
        const currentVersion = '1.2'; // 更新版本號以清除舊快取
        
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
            <div class="day-card">
                <div class="day-number">${day.date}</div>
                <div class="day-name">${day.dayName}</div>
                <div class="no-trucks">無餐車</div>
            </div>
        `;
    }
    
    const trucksHTML = day.trucks.map(truck => `
        <li class="truck-item">
            <div class="truck-name" data-address="${truck.address}">${truck.name}</div>
        </li>
    `).join('');
    
    return `
        <div class="day-card has-trucks">
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

