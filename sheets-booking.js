/**
 * Google Sheets 餐車報名表整合模組
 * 專門用於讀取餐車報名表格式的資料
 */

// ==================== 餐車報名表設定 ====================

const BOOKING_SHEETS_CONFIG = {
    // Google Sheets ID
    // 從您的 Google Sheets URL 中取得
    SHEET_ID: '1oS9zTU6DL_cCRnOI6A4ffAeXXn7fXkr6URxxMVprlG4',
    
    // 工作表的 GID
    SHEET_GID: '782323585',
    
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

// ==================== CSV 讀取與解析 ====================

/**
 * 從 Google Sheets 讀取餐車報名表資料
 * @returns {Promise<Array>} CSV 資料陣列
 */
async function fetchBookingData() {
    try {
        // 檢查設定
        if (!BOOKING_SHEETS_CONFIG.ENABLED) {
            console.log('ℹ️ 餐車報名表整合已停用');
            return null;
        }
        
        // 建立 CSV 導出 URL
        const csvURL = `https://docs.google.com/spreadsheets/d/${BOOKING_SHEETS_CONFIG.SHEET_ID}/export?format=csv&gid=${BOOKING_SHEETS_CONFIG.SHEET_GID}`;
        
        console.log('🌐 正在從 Google Sheets 讀取餐車報名表資料...');
        console.time('⏱️ Google Sheets 載入時間');
        
        const response = await fetch(csvURL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.timeEnd('⏱️ Google Sheets 載入時間');
        
        // 解析 CSV
        const rows = parseBookingCSV(csvText);
        
        console.log('✅ 餐車報名表資料讀取成功，共', rows.length, '筆資料');
        return rows;
        
    } catch (error) {
        console.error('❌ 讀取餐車報名表失敗:', error);
        console.error('可能原因：');
        console.error('1. Google Sheets 未設為公開（請設為「知道連結的任何人」可檢視）');
        console.error('2. Sheet ID 或 GID 設定錯誤');
        console.error('3. 網路連線問題');
        return null;
    }
}

/**
 * 解析 CSV 文字（餐車報名表格式）
 * @param {string} csvText - CSV 文字
 * @returns {Array} 解析後的資料陣列
 */
function parseBookingCSV(csvText) {
    const rows = [];
    const lines = csvText.split('\n');
    
    // 從第2行開始（跳過標題列）
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // 解析 CSV（處理逗號和雙引號）
        const cells = parseCSVLine(line);
        
        if (cells.length >= 5 && cells[1] && cells[4]) {
            // cells[0] = 時間戳記
            // cells[1] = 您的店名
            // cells[2] = 餐車類型
            // cells[3] = 預約場地
            // cells[4] = 預約日期
            
            rows.push({
                timestamp: cells[0],
                storeName: cells[1].trim(),
                type: cells[2] ? cells[2].trim() : '',
                venue: cells[3] ? cells[3].trim() : '',
                bookingDate: cells[4].trim(),
                status: cells[5] ? cells[5].trim() : '',
                fee: cells[6] ? cells[6].trim() : '',
                paid: cells[7] ? cells[7].trim() : '',
                note: cells[8] ? cells[8].trim() : ''
            });
        }
    }
    
    return rows;
}

/**
 * 解析 CSV 行（處理逗號和雙引號）
 * @param {string} line - CSV 行
 * @returns {Array} 解析後的欄位陣列
 */
function parseCSVLine(line) {
    const cells = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            cells.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    cells.push(current); // 最後一個欄位
    
    return cells.map(cell => cell.replace(/^"|"$/g, '').trim());
}

/**
 * 從預約場地中提取地址
 * @param {string} venue - 預約場地字串（如："漢堡大亨 四維路70號(週一~週六)"）
 * @returns {string} 地址
 */
function extractAddress(venue) {
    if (!venue) return '';
    
    // 嘗試匹配地址對應表中的地址
    for (const address in BOOKING_SHEETS_CONFIG.addressMap) {
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
        return null;
    }
    
    console.log('🔄 開始轉換餐車報名表資料...');
    
    // 按日期分組
    const dateMap = new Map();
    
    // 獲取當前年份和月份
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    console.log(`📅 當前日期: ${currentYear}年${currentMonth}月`);
    
    bookingData.forEach(booking => {
        const dateInfo = parseBookingDate(booking.bookingDate);
        if (!dateInfo) {
            // 只顯示包含 "10月13日" 的錯誤
            if (booking.bookingDate && booking.bookingDate.includes('10月13日')) {
                console.log('❌ 日期解析失敗:', {
                    店名: booking.storeName,
                    預約日期: booking.bookingDate,
                    預約場地: booking.venue,
                    己排: booking.status
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
        
        // 只添加已排班的餐車
        if (booking.status === '己排班') {
            dateMap.get(dateKey).trucks.push({
                name: booking.storeName,
                address: address,
                type: booking.type,
                venue: booking.venue
            });
            
            // 只顯示 10月13日 的資料
            if (dateInfo.month === 10 && dateInfo.day === 13) {
                console.log('✅ 10/13 資料已加入:', {
                    店名: booking.storeName,
                    地址: address,
                    場地: booking.venue
                });
            }
        } else {
            // 只顯示 10月13日 但狀態不是「己排班」的
            if (dateInfo.month === 10 && dateInfo.day === 13) {
                console.log('⚠️ 10/13 未加入 (狀態錯誤):', {
                    店名: booking.storeName,
                    己排欄位: `"${booking.status}"`,
                    應該填: '"己排班"'
                });
            }
        }
    });
    
    // 將日期按時間排序（處理跨年情況：12月在前，1月在後）
    const sortedDates = Array.from(dateMap.values()).sort((a, b) => {
        // 處理跨年情況：確保12月排在1月之前
        // 方法：將1月的月份值轉換為13，這樣12月（12）就會排在1月（13）之前
        
        let aMonth = a.month;
        let bMonth = b.month;
        
        // 如果月份是1月，轉換為13以便排序（12月在前，1月在後）
        if (aMonth === 1) aMonth = 13;
        if (bMonth === 1) bMonth = 13;
        
        // 按轉換後的月份值排序
        if (aMonth !== bMonth) {
            return aMonth - bMonth;
        }
        return a.day - b.day;
    });
    
    console.log('📊 共有', sortedDates.length, '天有餐車資料');
    // 調試：顯示排序後的前幾個日期
    if (sortedDates.length > 0) {
        console.log('🔍 排序後的前5個日期:', sortedDates.slice(0, 5).map(d => `${d.month}/${d.day}`));
        console.log('🔍 排序後的最後5個日期:', sortedDates.slice(-5).map(d => `${d.month}/${d.day}`));
    }
    
    // 按週次分組（每7天一組）
    const weeks = [];
    let currentWeek = null;
    let weekStartMonth = null;
    let weekStartDay = null;
    
    sortedDates.forEach((dayData, index) => {
        // 每7天開始新的一週，或第一天，或遇到月份邊界（從12月到1月）
        const shouldStartNewWeek = index % 7 === 0 || 
                                   !currentWeek || 
                                   (currentWeek && currentWeek.days.length > 0 && 
                                    currentWeek.days[currentWeek.days.length - 1].month === 12 && 
                                    dayData.month === 1);
        
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
            if (firstDay && lastDay) {
                // 解析日期字串 (如 "10/13")
                const parseDateString = (dateStr) => {
                    const parts = dateStr.split('/');
                    return {
                        month: parseInt(parts[0]),
                        day: parseInt(parts[1])
                    };
                };
                const firstDate = parseDateString(firstDay.date);
                const lastDate = parseDateString(lastDay.date);
                week.title = `${firstDate.month}月${firstDate.day}日 - ${lastDate.month}月${lastDate.day}日`;
                week.tabLabel = `${firstDate.month}/${firstDate.day}-${lastDate.month}/${lastDate.day}`;
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
        
        // 解析日期字串 (如 "10/13")
        const parseDateString = (dateStr) => {
            const parts = dateStr.split('/');
            return {
                month: parseInt(parts[0]),
                day: parseInt(parts[1])
            };
        };
        
        const firstDate = parseDateString(firstDay.date);
        const lastDate = parseDateString(lastDay.date);
        
        console.log(`   解析後: ${firstDate.month}/${firstDate.day} - ${lastDate.month}/${lastDate.day}`);
        
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
        if (!BOOKING_SHEETS_CONFIG.ENABLED) {
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
            console.log('📥 首次載入，從 Google Sheets 讀取資料...');
        }
        
        // ==================== 從 Google Sheets 載入新資料 ====================
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
            
            // 如果轉換失敗但有舊快取，使用舊快取
            if (cachedData) {
                console.log('📱 使用舊快取資料（因為資料轉換失敗）');
                return JSON.parse(cachedData);
            }
            
            return null;
        }
        
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
        return;
    }
    
    console.log('🎨 開始渲染餐車報名表行程...');
    
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
        console.error('❌ 找不到週次標籤容器');
        return;
    }
    
    weekTabsContainer.innerHTML = '';
    
    weeks.forEach((week, index) => {
        const trucksCount = week.days.filter(day => day.hasTrucks).length;
        
        const tabHTML = `
            <button class="week-tab" onclick="showWeek(${index})" data-week="${index}" aria-label="第${index + 1}週：${week.tabLabel}">
                <div class="week-tab-content">
                    <div class="week-tab-title">第${index + 1}週</div>
                    <div class="week-tab-dates">${week.tabLabel}</div>
                    <div class="week-tab-trucks">${trucksCount}天有餐車</div>
                </div>
            </button>
        `;
        
        weekTabsContainer.insertAdjacentHTML('beforeend', tabHTML);
    });
}

/**
 * 渲染週次內容
 * @param {Array} weeks - 週次資料陣列
 */
function renderWeekContentBooking(weeks) {
    const contentContainer = document.querySelector('.content');
    if (!contentContainer) {
        console.error('❌ 找不到內容容器');
        return;
    }
    
    // 清空現有內容
    contentContainer.innerHTML = '';
    
    weeks.forEach((week, weekIndex) => {
        const weekHTML = `
            <div id="${week.id}" class="week-content">
                <div class="week-header">
                    <div class="week-title">${week.title}</div>
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
 * 根據當前日期自動選擇週次（動態版）
 * @param {Object} scheduleData - 行程資料
 */
function autoSelectWeekByCurrentDate(scheduleData) {
    if (!scheduleData || !scheduleData.weeks || scheduleData.weeks.length === 0) {
        console.log('⚠️ 沒有週次資料，無法自動選擇');
        return;
    }
    
    const now = new Date();
    const currentDate = now.getDate();
    const currentMonth = now.getMonth() + 1; // getMonth() 返回 0-11，需要 +1
    
    console.log(`📅 當前日期: ${currentMonth}/${currentDate}`);
    console.log(`🔍 開始檢查週次匹配...`);
    
    let selectedWeekIndex = 0; // 預設第一週
    let found = false;
    
    // 遍歷所有週次，尋找包含當前日期的週次
    for (let i = 0; i < scheduleData.weeks.length; i++) {
        const week = scheduleData.weeks[i];
        
        // 檢查這週的所有日期
        for (const day of week.days) {
            if (day.month === currentMonth && day.day === currentDate) {
                selectedWeekIndex = i;
                found = true;
                console.log(`✅ 找到匹配週次: ${week.title}`);
                break;
            }
        }
        
        if (found) break;
        
        // 如果當前日期在這週的日期範圍內
        if (week.days.length > 0) {
            const firstDay = week.days[0];
            const lastDay = week.days[week.days.length - 1];
            
            // 檢查是否在範圍內（處理跨年情況）
            let isInRange = false;
            
            // 處理跨年情況：如果當前是12月，1月是下個月
            if (currentMonth === 12 && firstDay.month === 1) {
                // 12月到1月的跨年情況
                isInRange = (currentDate >= firstDay.day) || (currentDate <= lastDay.day);
            }
            // 處理跨年情況：如果當前是1月，12月是上個月
            else if (currentMonth === 1 && lastDay.month === 12) {
                // 12月到1月的跨年情況
                isInRange = (currentDate >= firstDay.day) || (currentDate <= lastDay.day);
            }
            // 一般情況
            else {
                isInRange = (
                    (currentMonth === firstDay.month && currentDate >= firstDay.day) &&
                    (currentMonth === lastDay.month && currentDate <= lastDay.day)
                ) || (
                    // 跨月情況（非跨年）
                    (currentMonth === firstDay.month && currentDate >= firstDay.day) ||
                    (currentMonth === lastDay.month && currentDate <= lastDay.day)
                );
            }
            
            if (isInRange) {
                selectedWeekIndex = i;
                found = true;
                console.log(`✅ 當前日期在週次範圍內: ${week.title}`);
                break;
            }
        }
    }
    
    if (!found) {
        console.log(`⚠️ 當前日期不在任何週次範圍內，顯示第一週`);
    }
    
    // 選擇週次
    console.log(`📍 自動選擇週次: 第${selectedWeekIndex + 1}週`);
    if (typeof showWeek === 'function') {
        showWeek(selectedWeekIndex);
    }
}

/**
 * 初始化餐車報名表整合
 */
async function initBookingSheetsIntegration() {
    console.log('🚀 初始化餐車報名表整合（從 Google Sheets）...');
    
    try {
        // 載入餐車報名表資料
        const scheduleData = await loadBookingSchedule();
        
        if (scheduleData) {
            // 渲染行程表
            renderBookingSchedule(scheduleData);
            
            // 重新初始化互動功能
            setTimeout(() => {
                if (typeof initializeTruckNames === 'function') {
                    initializeTruckNames();
                }
                
                if (typeof initializeDayCards === 'function') {
                    initializeDayCards();
                }
                
                if (typeof initializeWeekTabs === 'function') {
                    initializeWeekTabs();
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
    BOOKING_SHEETS_CONFIG
};

console.log('📦 餐車報名表整合模組已載入');

