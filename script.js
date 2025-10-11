// ==================== 全域變數與設定 ====================

// 地址對應表
const addressMap = {
    '四維路59號': 'https://maps.app.goo.gl/jaKQjQ6jArFZda898',
    '四維路60號': 'https://maps.app.goo.gl/rxGpsi2UpsTEEV5w5',
    '四維路70號': 'https://maps.app.goo.gl/k3rPvM6UwQJqwC5k7',
    '四維路72號': 'https://maps.app.goo.gl/VP9nyyYg2n244WF49',
    '四維路77號': 'https://maps.app.goo.gl/ejp7GDgoJEyyEKZ56',
    '四維路190號': 'https://maps.app.goo.gl/JzDhpp6KHtuRZFfBA',
    '四維路216號': 'https://maps.app.goo.gl/LFtp8Cg33KXoSE1A7',
    '四維路218號': 'https://maps.app.goo.gl/89A6N9QCSgAURCFv9'
};

// 性能優化相關變數
const performanceConfig = {
    debounceDelay: 300,        // 防抖動延遲
    throttleDelay: 100,        // 節流延遲
    maxRetries: 3,             // 最大重試次數
    cacheTimeout: 5 * 60 * 1000, // 快取超時時間 (5分鐘)
    imageLoadTimeout: 10000,   // 圖片載入超時時間 (10秒)
    enableAnimations: false,   // 關閉動畫效果，避免閃爍
    enableAlignmentDetection: false  // 關閉對齊檢測功能
};

// 快取管理
const cache = {
    data: new Map(),
    timestamps: new Map(),
    
    set(key, value) {
        this.data.set(key, value);
        this.timestamps.set(key, Date.now());
    },
    
    get(key) {
        const timestamp = this.timestamps.get(key);
        if (timestamp && Date.now() - timestamp < performanceConfig.cacheTimeout) {
            return this.data.get(key);
        }
        this.delete(key);
        return null;
    },
    
    delete(key) {
        this.data.delete(key);
        this.timestamps.delete(key);
    }
};

// 防抖動函數
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// 節流函數
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}

// ==================== 除錯工具和日誌系統 ====================

/**
 * 日誌管理器
 */
const logger = {
    levels: {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    },
    currentLevel: 2, // 預設顯示 INFO 以上
    
    log(level, message, ...args) {
        if (this.levels[level] <= this.currentLevel) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${level}]`;
            console.log(prefix, message, ...args);
        }
    },
    
    error(message, ...args) {
        this.log('ERROR', message, ...args);
    },
    
    warn(message, ...args) {
        this.log('WARN', message, ...args);
    },
    
    info(message, ...args) {
        this.log('INFO', message, ...args);
    },
    
    debug(message, ...args) {
        this.log('DEBUG', message, ...args);
    }
};

/**
 * 性能監控器
 */
const performanceMonitor = {
    timers: new Map(),
    
    start(label) {
        this.timers.set(label, performance.now());
    },
    
    end(label) {
        const startTime = this.timers.get(label);
        if (startTime) {
            const duration = performance.now() - startTime;
            logger.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
            this.timers.delete(label);
            return duration;
        }
        return 0;
    }
};

/**
 * 錯誤邊界處理
 */
function errorBoundary(func, context = '') {
    return function(...args) {
        try {
            return func.apply(this, args);
        } catch (error) {
            logger.error(`❌ 錯誤發生在 ${context}:`, error);
            showNotification('發生未預期的錯誤，請重新整理頁面', 'error');
        }
    };
}

// ==================== LINE瀏覽器兼容性 ====================

/**
 * 檢測是否為LINE內建瀏覽器
 */
function isLineBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('line/') || userAgent.includes('line-');
}

/**
 * 處理LINE內建瀏覽器的連結兼容性
 */
function handleLineBrowserCompatibility() {
    if (isLineBrowser()) {
        // 處理所有 target="_blank" 的連結
        const links = document.querySelectorAll('a[target="_blank"]');
        links.forEach(link => {
            // 移除 target="_blank" 屬性
            link.removeAttribute('target');
            
            // 添加點擊事件處理
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                if (href && href.startsWith('http')) {
                    window.location.href = href;
                } else if (href && href.startsWith('tel:')) {
                    // 電話連結直接跳轉
                    window.location.href = href;
                }
            });
        });
        
        console.log('LINE內建瀏覽器兼容性處理已啟用');
    }
}

// ==================== 地圖導航功能 ====================

/**
 * 開啟地圖導航
 * @param {string} url - Google Maps 連結
 */
function openMap(url) {
    try {
        // 輸入驗證
        if (!url || typeof url !== 'string') {
            console.error('地圖連結參數無效:', url);
            showNotification('地圖連結無效，請稍後再試。', 'error');
            return;
        }

        // URL格式驗證
        if (!url.startsWith('http')) {
            console.error('地圖連結格式錯誤:', url);
            showNotification('地圖連結格式錯誤，請稍後再試。', 'error');
            return;
        }

        // 執行導航
        if (isLineBrowser()) {
            // LINE內建瀏覽器使用 location.href
            window.location.href = url;
        } else {
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
            // 檢查是否成功開啟新視窗（修正邏輯）
            if (!newWindow) {
                // 完全無法開啟新視窗（被阻擋）
                throw new Error('彈出視窗被阻擋');
            }
            
            // 使用延遲檢查來避免誤判（可選）
            setTimeout(() => {
                try {
                    // 檢查視窗是否真的被阻擋（延遲檢查）
                    if (newWindow.closed === false || newWindow.location.href === 'about:blank') {
                        // 視窗正常開啟，不需要顯示錯誤
                        return;
                    }
                } catch (e) {
                    // 跨域限制，無法檢查，但這不表示被阻擋
                    // 視窗可能已經正常開啟並導航到外部網站
                }
            }, 100);
        }
    } catch (error) {
        console.error('開啟地圖時發生錯誤:', error);
        showNotification('無法開啟地圖，請檢查您的瀏覽器設定或彈出視窗阻擋。', 'error');
    }
}

// ==================== 通知系統 ====================

/**
 * 顯示通知訊息
 * @param {string} message - 通知訊息
 * @param {string} type - 通知類型 (info, error)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * 顯示廠商聯絡資訊彈窗
 */
function showSponsorContact() {
    const modal = document.getElementById('sponsorModal');
    if (modal) {
        modal.classList.add('show');
        // 防止背景滾動
        document.body.style.overflow = 'hidden';
        
        // 確保彈窗在視窗中央
        setTimeout(() => {
            modal.scrollTop = 0;
            // 滾動到彈窗位置
            const modalContent = modal.querySelector('.sponsor-modal-content');
            if (modalContent) {
                modalContent.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center'
                });
            }
        }, 100);
    }
}

/**
 * 隱藏廠商聯絡資訊彈窗
 */
function hideSponsorContact() {
    const modal = document.getElementById('sponsorModal');
    if (modal) {
        modal.classList.remove('show');
        // 恢復背景滾動
        document.body.style.overflow = '';
    }
}

/**
 * 顯示醫療資訊彈窗
 */
function showMedicalInfo() {
    const modal = document.getElementById('medicalModal');
    if (modal) {
        modal.classList.add('show');
        // 防止背景滾動
        document.body.style.overflow = 'hidden';
        
        // 確保彈窗在視窗中央
        setTimeout(() => {
            modal.scrollTop = 0;
            // 滾動到彈窗位置
            const modalContent = modal.querySelector('.sponsor-modal-content');
            if (modalContent) {
                modalContent.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center'
                });
            }
        }, 100);
    }
}

/**
 * 隱藏醫療資訊彈窗
 */
function hideMedicalInfo() {
    const modal = document.getElementById('medicalModal');
    if (modal) {
        modal.classList.remove('show');
        // 恢復背景滾動
        document.body.style.overflow = '';
    }
}


/**
 * 顯示快速使用指南
 */
function showQuickGuide() {
    console.log('showQuickGuide function called'); // 調試信息
    const modal = document.getElementById('quickGuideModal');
    console.log('Modal element:', modal); // 調試信息
    if (modal) {
        modal.classList.add('show');
        console.log('Modal show class added'); // 調試信息
        // 防止背景滾動
        document.body.style.overflow = 'hidden';
        
        // 確保彈窗在視窗中央
        setTimeout(() => {
            modal.scrollTop = 0;
            // 滾動到彈窗位置
            const modalContent = modal.querySelector('.sponsor-modal-content');
            if (modalContent) {
                modalContent.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center'
                });
            }
        }, 100);
    } else {
        console.error('Modal element not found!'); // 錯誤信息
    }
}

/**
 * 隱藏快速使用指南
 */
function hideQuickGuide() {
    const modal = document.getElementById('quickGuideModal');
    if (modal) {
        modal.classList.remove('show');
        // 恢復背景滾動
        document.body.style.overflow = '';
    }
}

/**
 * 切換顯示的週次
 * @param {number} weekNumber - 週次編號 (0-5)
 */
function showWeek(weekNumber) {
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
    }
    
    // 激活對應的分頁
    const targetTab = document.querySelector(`[data-week="${weekNumber}"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // 添加切換動畫效果
    if (targetWeek) {
        targetWeek.style.opacity = '0';
        targetWeek.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            targetWeek.style.transition = 'all 0.3s ease';
            targetWeek.style.opacity = '1';
            targetWeek.style.transform = 'translateY(0)';
        }, 50);
    }
    
    // 平滑滾動到內容區域
    const content = document.querySelector('.content');
    if (content) {
        content.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    // 更新頁面標題
    updatePageTitle(weekNumber);
    
    // 記錄用戶行為（用於分析）
    console.log(`用戶切換到第${weekNumber + 1}週`);
}

/**
 * 更新頁面標題
 * @param {number} weekNumber - 週次編號
 */
function updatePageTitle(weekNumber) {
    const weekTitles = [
        '9月22日-9月28日',
        '9月29日-10月5日', 
        '10月6日-10月12日',
        '10月13日-10月19日',
        '10月20日-10月26日',
        '10月27日-11月2日'
    ];
    
    const title = weekTitles[weekNumber] || '餐車月行程表';
    document.title = `四維商圈餐車月行程表 - ${title} | 楊梅美食地圖 | 一鍵導航`;
}

/**
 * 初始化餐車名稱的點擊事件和tooltip
 */
function initializeTruckNames() {
    const truckNames = document.querySelectorAll('.truck-name');
    truckNames.forEach(nameElement => {
        let locationText = '';
        let mapUrl = '';
        
        // 檢查是否已經有data-address屬性
        if (nameElement.hasAttribute('data-address')) {
            locationText = nameElement.getAttribute('data-address');
            mapUrl = addressMap[locationText];
        } else {
            // 從.truck-location元素獲取地址
            const locationElement = nameElement.parentElement.querySelector('.truck-location');
            if (locationElement) {
                locationText = locationElement.textContent.replace('📍', '').trim();
                mapUrl = addressMap[locationText];
                
                // 添加地址到data-address屬性
                nameElement.setAttribute('data-address', locationText);
            }
        }
        
        if (mapUrl) {
            nameElement.style.cursor = 'pointer';
            nameElement.addEventListener('click', function() {
                openMap(mapUrl);
            });
        }
    });
}

/**
 * 添加日期卡片的互動效果
 */
function initializeDayCards() {
    const dayCards = document.querySelectorAll('.day-card');
    dayCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}


/**
 * 初始化週次標籤
 */
function initializeWeekTabs() {
    const weekTabs = document.querySelectorAll('.week-tab');
    weekTabs.forEach((tab, index) => {
        tab.setAttribute('role', 'button');
        tab.setAttribute('aria-label', `切換到第${index + 1}週`);
    });
}

/**
 * 添加頁面載入動畫
 */
function initializePageAnimation() {
    // 頁面載入動畫
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // 添加載入動畫
    const container = document.querySelector('.container');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            container.style.transition = 'all 0.6s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
}

/**
 * 餐車圖片資料庫 - 方便管理上架/下架
 * 使用方式：
 * 1. 要上架：將 isActive 設為 true
 * 2. 要下架：將 isActive 設為 false
 * 3. 要新增：在陣列中新增物件
 * 4. 要修改：直接編輯對應的物件
 */
// 預設餐車資料庫（備用資料，主要資料來源為 data.json）
const foodTruckDatabase = [
    {
        id: 'truck_1758002427365',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1758002363/%E6%88%91%E7%9A%84dm_mfegnq.png',
        alt: '聯絡我',
        title: '版主：蔡濬瑒',
        link: [
            {
                url: 'https://realtor.houseprice.tw/agent/buy/0925666597/',
                text: '精選物件'
            },
            {
                url: 'https://www.tiktok.com/@aihouse168?is_from_webapp=1&sender_device=pc',
                text: 'Tiktok'
            }
        ],
        isActive: true,
        priority: 1,
        category: 'main'
    },
    {
        id: 'truck_001',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990540/S__4653108_0_u5egpg.jpg',
        alt: '餐車品牌1',
        title: '露露姐',
        isActive: true,
        priority: 2,
        category: 'main'
    },
    {
        id: 'truck_002',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990540/S__4653107_0_igxhgl.jpg',
        alt: '餐車品牌2',
        title: '花生捲冰淇淋',
        isActive: true,
        priority: 3,
        category: 'main'
    },
    {
        id: 'truck_003',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990540/S__4653105_0_keaqnp.jpg',
        alt: '餐車品牌3',
        title: '鄭老爹乾麵',
        isActive: true,
        priority: 4,
        category: 'main'
    },
    {
        id: 'truck_004',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653102_0_iwonvd.jpg',
        alt: '餐車品牌4',
        title: '蔬孟園',
        isActive: true,
        priority: 5,
        category: 'main'
    },
    {
        id: 'truck_005',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653103_0_ste4ns.jpg',
        alt: '餐車品牌5',
        title: '台東放山豬',
        isActive: true,
        priority: 6,
        category: 'main'
    },
    {
        id: 'truck_006',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653100_0_ono2dd.jpg',
        alt: '餐車品牌6',
        title: '安德尼斯烘培坊',
        isActive: true,
        priority: 7,
        category: 'main'
    },
    {
        id: 'truck_007',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653096_0_vycs5h.jpg',
        alt: '餐車品牌7',
        title: '韓式飯捲',
        isActive: true,
        priority: 8,
        category: 'main'
    },
    {
        id: 'truck_008',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653098_0_gidf0n.jpg',
        alt: '餐車品牌8',
        title: '炸蛋𣄃魚黑輪',
        isActive: true,
        priority: 9,
        category: 'main'
    },
    {
        id: 'truck_009',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653094_0_mxdtdj.jpg',
        alt: '餐車品牌9',
        title: '向陽坡刈包',
        isActive: true,
        priority: 10,
        category: 'main'
    },
    {
        id: 'truck_010',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653099_0_sxppso.jpg',
        alt: '餐車品牌10',
        title: '滷拉拉',
        isActive: true,
        priority: 11,
        category: 'main'
    },
    {
        id: 'truck_011',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653095_0_scixck.jpg',
        alt: '餐車品牌11',
        title: '餓食鬼美味販賣所',
        isActive: true,
        priority: 12,
        category: 'main'
    }
];

/**
 * 獲取活躍的餐車圖片
 * @returns {Array} 活躍的餐車圖片陣列
 */
function getActiveFoodTrucks() {
    return foodTruckDatabase
        .filter(truck => truck.isActive)
        .sort((a, b) => a.priority - b.priority);
}

// 管理功能 - 僅供後台使用，前端不顯示

/**
 * 初始化圖片跑碼燈
 */
async function initializeImageMarquee() {
    performanceMonitor.start('initializeImageMarquee');
    const now = Date.now();
    
    // 防止重複初始化
    if (isInitializing) {
        logger.warn('⚠️ 正在初始化中，跳過重複調用');
        return;
    }
    
    // 防止短時間內重複調用（500ms內）
    if (now - lastInitTime < 500) {
        logger.warn('⚠️ 距離上次初始化時間太短，跳過重複調用');
        return;
    }
    
    isInitializing = true;
    lastInitTime = now;
    
    logger.info('🚀 開始初始化圖片跑碼燈...');
    
    // 從資料檔案讀取餐車資料
    let imageData = [];
    try {
        // 優先從本地儲存載入
        const localData = localStorage.getItem('foodTruckData');
        if (localData) {
            const data = JSON.parse(localData);
            imageData = data.foodTrucks
                .filter(truck => truck.isActive)
                .sort((a, b) => a.priority - b.priority);
            console.log('📱 從本地儲存載入餐車圖片資料');
            
            // 檢查遠端更新（背景檢查，不影響主要載入）
            setTimeout(() => {
                checkForRemoteUpdates();
            }, 1000);
        } else {
            // 如果本地沒有資料，從 data.json 載入
            const response = await fetch('data.json');
            const data = await response.json();
            imageData = data.foodTrucks
                .filter(truck => truck.isActive)
                .sort((a, b) => a.priority - b.priority);
            console.log('🌐 從 data.json 載入餐車圖片資料');
            
            // 儲存到本地
            localStorage.setItem('foodTruckData', JSON.stringify(data));
        }
    } catch (error) {
        console.error('無法載入餐車資料:', error);
        // 使用預設資料
        imageData = getActiveFoodTrucks();
    }
    
    const marqueeTrack = document.getElementById('marqueeTrack');
    if (!marqueeTrack) return;
    
    // 如果沒有圖片資料，直接返回
    if (!imageData || imageData.length === 0) {
        console.log('🖼️ 沒有餐車圖片資料');
        marqueeTrack.innerHTML = '';
        isInitializing = false;
        return;
    }
    
    // 計算預期圖片數量（不重複）
    const expectedCount = imageData.length;
    
    // 檢查是否已經有相同數量的圖片，避免重複添加
    if (marqueeTrack.children.length === expectedCount && currentImageCount === expectedCount) {
        console.log('🖼️ 圖片數量未變化，跳過重新初始化');
        console.log(`📊 當前數量: ${marqueeTrack.children.length}, 預期數量: ${expectedCount}`);
        isInitializing = false;
        return;
    }
    
    console.log(`🔄 需要重新初始化，當前: ${marqueeTrack.children.length}, 預期: ${expectedCount}`);
    
    // 完全清空現有內容
    marqueeTrack.innerHTML = '';
    console.log('🧹 已清空跑碼燈內容');
    
    // 創建圖片元素
    const createImageItems = (images) => {
        return images.map(item => {
            const marqueeItem = document.createElement('div');
            marqueeItem.className = 'marquee-item';
            marqueeItem.title = item.title;
            
            // 處理多個連結（支援字串、陣列或物件陣列）
            let linkData = '';
            if (item.link) {
                if (Array.isArray(item.link)) {
                    // 檢查是否為物件陣列（包含 url 和 text）
                    if (item.link.length > 0 && typeof item.link[0] === 'object' && item.link[0].url) {
                        // 物件陣列格式：將物件轉換為字串格式
                        linkData = item.link.map(linkObj => `${linkObj.url}|${linkObj.text}`).join(',');
                    } else {
                        // 普通字串陣列格式
                        linkData = item.link.join(',');
                    }
                } else {
                    linkData = item.link;
                }
                marqueeItem.dataset.link = linkData;
            }
            
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt;
            img.loading = 'lazy';
            
            // 添加圖片載入錯誤處理
            img.onerror = function() {
                console.warn('圖片載入失敗:', item.src);
                this.style.background = '#f8f9fa';
                this.style.border = '1px solid #e9ecef';
                this.style.display = 'flex';
                this.style.alignItems = 'center';
                this.style.justifyContent = 'center';
                this.style.fontSize = '0.7em';
                this.style.color = '#6c757d';
                this.alt = '圖片載入失敗';
                this.title = '圖片載入失敗';
            };
            
            // 添加圖片載入成功處理
            img.onload = function() {
                console.log('圖片載入成功:', item.src);
            };
            
            // 如果有超連結，也儲存到圖片的 dataset 中
            if (linkData) {
                img.dataset.link = linkData;
            }
            
            // 儲存圖片超連結
            if (item.imgLink) {
                marqueeItem.dataset.imgLink = item.imgLink;
                img.dataset.imgLink = item.imgLink;
            }
            
            // 點擊事件由事件委託處理
            
            marqueeItem.appendChild(img);
            return marqueeItem;
        });
    };
    
    // 添加圖片到跑碼燈軌道（只添加一次，不重複）
    const imageItems = createImageItems(imageData);
    imageItems.forEach(item => marqueeTrack.appendChild(item));
    console.log(`📝 已添加 ${imageItems.length} 個餐車圖片`);
    
    // 更新當前圖片數量
    currentImageCount = marqueeTrack.children.length;
    
    console.log(`🖼️ 圖片跑碼燈已初始化，共 ${currentImageCount} 個圖片元素`);
    console.log(`📊 預期數量: ${expectedCount}, 實際數量: ${currentImageCount}`);
    
    // 初始化互動功能
    initializeMarqueeInteraction();
    
    // 重置初始化標記
    setTimeout(() => {
        isInitializing = false;
        console.log('✅ 初始化完成，標記已重置');
    }, 500);
}

// ==================== 圖片載入優化 ====================

/**
 * 預載入圖片
 * @param {string} src - 圖片來源
 * @returns {Promise<HTMLImageElement>} 載入完成的圖片元素
 */
function preloadImage(src) {
    return new Promise((resolve, reject) => {
        // 檢查快取
        const cached = cache.get(`image_${src}`);
        if (cached) {
            resolve(cached);
            return;
        }

        const img = new Image();
        const timeout = setTimeout(() => {
            reject(new Error('圖片載入超時'));
        }, performanceConfig.imageLoadTimeout);

        img.onload = () => {
            clearTimeout(timeout);
            cache.set(`image_${src}`, img);
            resolve(img);
        };

        img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('圖片載入失敗'));
        };

        img.src = src;
    });
}

/**
 * 顯示圖片放大彈窗
 * @param {string} src - 圖片來源
 * @param {string} alt - 圖片替代文字
 * @param {string} title - 圖片標題
 * @param {string|Array} links - 超連結網址（可選，支援多個連結）
 */
function showImageModal(src, alt, title, links = '', imgLink = '') {
    // 創建彈窗元素
    let modal = document.getElementById('imageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'image-modal';
        document.body.appendChild(modal);
    }
    
    // 處理連結資料
    let linkButtons = '';
    let firstLink = '';
    let imgClickable = '';
    
    // 處理圖片超連結
    if (imgLink) {
        firstLink = imgLink;
        imgClickable = 'style="cursor: pointer;"';
    }
    
    // 處理按鈕連結（即使有圖片超連結也要顯示按鈕）
    if (links) {
        let linkArray = [];
        
        // 處理不同的連結格式
        if (typeof links === 'string') {
            // 字串格式：可能是逗號分隔的連結，或包含文字的分隔格式
            if (links.includes('|')) {
                // 包含按鈕文字的格式：url|text,url|text
                linkArray = links.split(',').map(linkStr => {
                    const [url, text] = linkStr.split('|');
                    return { url: url.trim(), text: text ? text.trim() : '連結' };
                });
            } else {
                // 普通逗號分隔的連結
                linkArray = links.split(',').map(link => ({ url: link.trim(), text: '連結' }));
            }
        } else if (Array.isArray(links)) {
            // 陣列格式
            linkArray = links.map(link => {
                if (typeof link === 'object' && link.url) {
                    // 物件格式：{url: '...', text: '...'}
                    return { url: link.url, text: link.text || '連結' };
                } else {
                    // 字串格式
                    return { url: link, text: '連結' };
                }
            });
        }
        
        // 過濾掉空連結
        const validLinks = linkArray.filter(link => link.url && link.url.trim() !== '');
        
        if (validLinks.length > 0) {
            // 只有在沒有圖片超連結時，才使用第一個按鈕連結作為 firstLink
            if (!imgLink) {
                firstLink = validLinks[0].url;
            }
            
            // 創建連結按鈕（最多3個）
            const linkButtonsHTML = validLinks.slice(0, 3).map((linkObj, index) => {
                const buttonText = linkObj.text || ['官網', 'FB', 'IG'][index] || `連結${index + 1}`;
                if (isLineBrowser()) {
                    return `<a href="${linkObj.url}" class="link-button" onclick="window.location.href='${linkObj.url}'">${buttonText}</a>`;
                } else {
                    return `<a href="${linkObj.url}" target="_blank" class="link-button">${buttonText}</a>`;
                }
            }).join('');
            
            linkButtons = `
                <div class="link-buttons-container">
                    ${linkButtonsHTML}
                </div>
            `;
        }
    }
    
    modal.innerHTML = `
        <div class="image-modal-content">
            <button class="image-modal-close" onclick="hideImageModal()">&times;</button>
            <img src="${src}" alt="${alt}" title="${title}" ${imgClickable}>
            ${linkButtons}
        </div>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // 如果有超連結，添加圖片點擊事件
    if (firstLink) {
        const modalImage = modal.querySelector('img');
        modalImage.addEventListener('click', function() {
            if (isLineBrowser()) {
                window.location.href = firstLink;
            } else {
                window.open(firstLink, '_blank');
            }
        });
    }
    
    // 點擊背景關閉
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideImageModal();
        }
    });
    
    // ESC鍵關閉
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideImageModal();
        }
    });
}

/**
 * 隱藏圖片放大彈窗
 */
function hideImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// 防止重複初始化的標記
let isInitializing = false;
let currentImageCount = 0;
let lastInitTime = 0;

/**
 * 檢查資料更新
 */
function checkDataUpdate() {
    // 如果正在初始化，跳過檢查
    if (isInitializing) return;
    
    const localData = localStorage.getItem('foodTruckData');
    if (localData) {
        try {
            const data = JSON.parse(localData);
            const lastUpdated = data.lastUpdated;
            
            // 檢查是否有新的更新
            const lastCheck = sessionStorage.getItem('lastDataCheck');
            if (!lastCheck || lastUpdated > lastCheck) {
                console.log('🔄 檢測到資料更新，重新載入餐車圖片');
                console.log('📅 更新時間:', lastUpdated);
                console.log('📊 餐車數量:', data.foodTrucks ? data.foodTrucks.length : 0);
                console.log('🖼️ 活躍餐車:', data.foodTrucks ? data.foodTrucks.filter(t => t.isActive).length : 0);
                
                isInitializing = true;
                initializeImageMarquee();
                sessionStorage.setItem('lastDataCheck', lastUpdated);
                
                // 設定標記，防止短時間內重複調用
                setTimeout(() => {
                    isInitializing = false;
                }, 1000);
            }
        } catch (error) {
            console.error('❌ 解析 localStorage 資料失敗:', error);
        }
    } else {
        // 如果沒有 localStorage 資料，嘗試從 data.json 載入
        console.log('📥 沒有 localStorage 資料，嘗試從 data.json 載入');
        initializeImageMarquee();
    }
}


/**
 * 根據當前日期自動選擇對應的週次
 */
function autoSelectWeekByDate() {
    console.log('🚀 autoSelectWeekByDate 函數開始執行');
    
    const now = new Date();
    const currentDate = now.getDate();
    const currentMonth = now.getMonth() + 1; // getMonth() 返回 0-11，需要 +1
    const currentYear = now.getFullYear();
    
    console.log(`📅 當前日期: ${currentYear}/${currentMonth}/${currentDate}`);
    console.log(`🔍 開始檢查週次匹配...`);
    
    // 檢查是否在行程表的年份範圍內（支援2024年和2025年）
    if (currentYear < 2024 || currentYear > 2025) {
        console.log(`📅 當前年份 ${currentYear} 不在行程表範圍內（支援2024-2025年），預設顯示第2週（9/29-10/5）`);
        showWeek(1); // 預設顯示第2週
        return;
    }
    
    console.log(`📅 當前年份 ${currentYear} 在支援範圍內，繼續執行自動選擇邏輯`);
    
    // 定義各週的日期範圍（更清晰的邏輯）
    const weekRanges = [
        { start: 22, end: 28, month: 9, weekIndex: 0, name: '第1週：9/22-9/28' },
        { start: 29, end: 5, month: 9, weekIndex: 1, name: '第2週：9/29-10/5', isCrossMonth: true },
        { start: 6, end: 12, month: 10, weekIndex: 2, name: '第3週：10/6-10/12' },
        { start: 13, end: 19, month: 10, weekIndex: 3, name: '第4週：10/13-10/19' },
        { start: 20, end: 26, month: 10, weekIndex: 4, name: '第5週：10/20-10/26' },
        { start: 27, end: 2, month: 10, weekIndex: 5, name: '第6週：10/27-11/2', isCrossMonth: true }
    ];
    
    let targetWeekIndex = 1; // 預設顯示第2週（9/29-10/5）
    
    // 檢查當前日期是否在任一週的範圍內
    for (const week of weekRanges) {
        console.log(`🔍 檢查 ${week.name}...`);
        
        if (week.isCrossMonth) {
            // 處理跨月情況
            if (week.month === currentMonth) {
                // 當前月份是開始月份（如9月29日）
                if (currentDate >= week.start) {
                    console.log(`✅ 匹配跨月週期開始部分: ${week.name}`);
                    targetWeekIndex = week.weekIndex;
                    break;
                }
            } else if (currentMonth === week.month + 1) {
                // 當前月份是結束月份（如10月5日對於9/29-10/5）
                if (currentDate <= week.end) {
                    console.log(`✅ 匹配跨月週期結束部分: ${week.name}`);
                    targetWeekIndex = week.weekIndex;
                    break;
                }
            }
        } else {
            // 正常範圍（不跨月）
            if (week.month === currentMonth) {
                if (currentDate >= week.start && currentDate <= week.end) {
                    console.log(`✅ 匹配正常週期: ${week.name}`);
                    targetWeekIndex = week.weekIndex;
                    break;
                }
            }
        }
    }
    
    console.log(`📅 最終選擇: ${weekRanges[targetWeekIndex]?.name || '未知週次'}`);
    
    // 額外驗證：確保邏輯正確性
    const selectedWeek = weekRanges[targetWeekIndex];
    if (selectedWeek) {
        console.log(`✅ 選擇的週次: ${selectedWeek.name}`);
        console.log(`📊 週次索引: ${selectedWeek.weekIndex}`);
        
        // 驗證選擇是否合理
        if (selectedWeek.isCrossMonth) {
            console.log(`🔄 跨月週期: 從${selectedWeek.month}月${selectedWeek.start}日到${selectedWeek.month + 1}月${selectedWeek.end}日`);
        } else {
            console.log(`📅 正常週期: ${selectedWeek.month}月${selectedWeek.start}日到${selectedWeek.end}日`);
        }
    } else {
        console.warn(`⚠️ 未找到匹配的週次，使用預設第2週`);
    }
    
    // 自動切換到對應週次
    showWeek(targetWeekIndex);
}

/**
 * 初始化所有功能
 */
function initializeApp() {
    console.log('🍽️ 四維商圈餐車月行程表已載入完成！');
    
    // 初始化專案設定（如果模組存在）
    if (typeof projectConfig !== 'undefined') {
        projectConfig.initialize();
    } else {
        console.log('ℹ️ 專案設定模組未載入，跳過初始化');
    }
    
    // 初始化各種功能
    initializeTruckNames();
    initializeDayCards();
    initializeWeekTabs();
    initializePageAnimation();
    initializeImageMarquee();
    
    // 延遲執行自動選擇週次或 Google Sheets 整合
    setTimeout(() => {
        // 優先檢查餐車報名表整合
        if (typeof bookingSheetsIntegration !== 'undefined' && 
            bookingSheetsIntegration.BOOKING_SHEETS_CONFIG.ENABLED) {
            console.log('🔗 啟用餐車報名表整合模式（從 Google Sheets）');
            bookingSheetsIntegration.initBookingSheetsIntegration();
        }
        // 其次檢查簡易版整合
        else if (typeof simpleSheetsIntegration !== 'undefined' && 
            simpleSheetsIntegration.SIMPLE_SHEETS_CONFIG.ENABLED) {
            console.log('🔗 啟用 Google Sheets 簡易整合模式');
            simpleSheetsIntegration.initSimpleSheetsIntegration();
        } 
        // 最後使用本地資料
        else {
            console.log('⏰ 使用本地資料模式，開始執行自動週次選擇...');
            autoSelectWeekByDate();
        }
    }, 100);
    
    // 設定定期檢查資料更新
    setInterval(checkDataUpdate, 1000); // 每1秒檢查一次，提高同步速度
}






// ==================== 跑馬燈互動控制功能 ====================

// 跑馬燈互動控制變數
let marqueeInteraction = {
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    offset: 0,
    velocity: 0,
    lastMoveTime: 0,
    lastMoveX: 0,
    autoScrollSpeed: 1, // 像素/毫秒
    isUserControlled: false,
    userControlTimeout: null,
    marqueeTrack: null,
    wrapper: null,
    isHorizontalSwipe: false
};

// 初始化跑馬燈互動功能
function initializeMarqueeInteraction() {
    const marqueeTrack = document.getElementById('marqueeTrack');
    const wrapper = document.querySelector('.marquee-wrapper');
    
    if (!marqueeTrack || !wrapper) {
        console.log('⚠️ 找不到跑馬燈容器，跳過互動功能初始化');
        return;
    }
    
    // 儲存引用
    marqueeInteraction.marqueeTrack = marqueeTrack;
    marqueeInteraction.wrapper = wrapper;
    
    // 檢測設備類型
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0);
    
    marqueeInteraction.isMobile = isMobile;
    
    if (isMobile) {
        // 手機版：觸控滑動 + 點擊
        initializeMobileInteraction();
    } else {
        // 電腦版：滾輪 + 鍵盤 + 點擊
        initializeDesktopInteraction();
    }
    
    // 使用事件委託處理圖片點擊
    wrapper.addEventListener('click', handleImageClick);
    
    console.log(`🎮 跑馬燈互動功能已初始化 (${isMobile ? '手機版' : '電腦版'})`);
}

// 手機版互動初始化
function initializeMobileInteraction() {
    const { wrapper } = marqueeInteraction;
    
    // 手機版只保留點擊功能，移除滑動控制
    // 觸控事件已移除，只保留點擊功能
    
    // 鍵盤事件（手機版也支援外接鍵盤）
    wrapper.addEventListener('keydown', handleKeyDown);
    wrapper.setAttribute('tabindex', '0');
    
    console.log('📱 手機版互動功能已初始化（僅點擊功能）');
}

// 電腦版互動初始化
function initializeDesktopInteraction() {
    const { wrapper } = marqueeInteraction;
    
    // 滾輪事件 - 使用 capture 模式確保能捕獲到事件
    wrapper.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    
    // 鍵盤事件
    wrapper.addEventListener('keydown', handleKeyDown);
    wrapper.setAttribute('tabindex', '0');
    
    // 添加調試信息
    console.log('💻 電腦版互動功能已初始化');
    console.log('🔧 滾輪事件已綁定到:', wrapper);
}

// 處理圖片點擊事件
function handleImageClick(e) {
    // 檢查是否點擊的是圖片或圖片容器
    const marqueeItem = e.target.closest('.marquee-item');
    if (!marqueeItem) return;
    
    // 如果沒有移動，則允許點擊
    if (!marqueeInteraction.hasMoved) {
        const img = marqueeItem.querySelector('img');
        if (img) {
            // 從圖片或容器中獲取超連結資訊
            const linkData = img.dataset.link || marqueeItem.dataset.link || '';
            const imgLink = img.dataset.imgLink || marqueeItem.dataset.imgLink || '';
            
            // 直接傳遞連結資料給 showImageModal，讓它處理格式解析
            showImageModal(img.src, img.alt, marqueeItem.title || img.alt, linkData, imgLink);
        }
    }
}

// 電腦版不支援滑鼠拖拽，只保留觸控滑動

// 觸控事件處理已移除 - 手機版不再支援滑動控制

// 鍵盤事件處理
function handleKeyDown(e) {
    const step = 50; // 每次移動的像素數
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            marqueeInteraction.offset -= step;
            updateMarqueePosition();
            setUserControl();
            break;
        case 'ArrowRight':
            e.preventDefault();
            marqueeInteraction.offset += step;
            updateMarqueePosition();
            setUserControl();
            break;
        case 'Home':
            e.preventDefault();
            marqueeInteraction.offset = 0;
            updateMarqueePosition();
            setUserControl();
            break;
        case 'End':
            e.preventDefault();
            // 跳到最後一個圖片的位置
            const trackWidth = marqueeInteraction.marqueeTrack.scrollWidth;
            const wrapperWidth = marqueeInteraction.wrapper.clientWidth;
            marqueeInteraction.offset = -(trackWidth - wrapperWidth);
            updateMarqueePosition();
            setUserControl();
            break;
    }
}

// 滾輪事件處理
function handleWheel(e) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 30 : -30; // 滾輪靈敏度
    marqueeInteraction.offset += delta;
    updateMarqueePosition();
    
    setUserControl();
    
    console.log('🖱️ 滾輪事件觸發:', e.deltaY, 'offset:', marqueeInteraction.offset);
}

// 更新跑馬燈位置
function updateMarqueePosition() {
    if (!marqueeInteraction.marqueeTrack) return;
    
    marqueeInteraction.marqueeTrack.style.setProperty('--user-offset', `${marqueeInteraction.offset}px`);
}

// 設定使用者控制狀態
function setUserControl() {
    marqueeInteraction.isUserControlled = true;
    marqueeInteraction.marqueeTrack.classList.add('user-controlled');
    marqueeInteraction.wrapper.classList.add('user-controlled');
    
    // 清除之前的計時器
    if (marqueeInteraction.userControlTimeout) {
        clearTimeout(marqueeInteraction.userControlTimeout);
    }
    
    // 3秒後恢復自動滾動
    marqueeInteraction.userControlTimeout = setTimeout(() => {
        resetToAutoScroll();
    }, 3000);
}

// 重置為自動滾動
function resetToAutoScroll() {
    marqueeInteraction.isUserControlled = false;
    marqueeInteraction.marqueeTrack.classList.remove('user-controlled');
    marqueeInteraction.wrapper.classList.remove('user-controlled');
    marqueeInteraction.offset = 0;
    updateMarqueePosition();
    
    if (marqueeInteraction.userControlTimeout) {
        clearTimeout(marqueeInteraction.userControlTimeout);
        marqueeInteraction.userControlTimeout = null;
    }
}

// 開始慣性滾動
function startMomentumScroll() {
    const momentum = marqueeInteraction.velocity * 100; // 慣性係數
    let momentumOffset = momentum;
    
    const animate = () => {
        marqueeInteraction.offset += momentumOffset;
        updateMarqueePosition();
        
        momentumOffset *= 0.95; // 摩擦力
        
        if (Math.abs(momentumOffset) > 0.1) {
            requestAnimationFrame(animate);
        } else {
            resetToAutoScroll();
        }
    };
    
    animate();
}

// 測試函數 - 可以在控制台手動調用
function testAutoWeekSelection() {
    console.log('🧪 開始測試自動週次選擇功能');
    autoSelectWeekByDate();
}

// 強制跳轉到特定週次的測試函數
function forceShowWeek(weekNumber) {
    console.log(`🔧 強制跳轉到第${weekNumber + 1}週`);
    showWeek(weekNumber);
}

// 頁面載入完成後執行初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // 處理LINE內建瀏覽器兼容性
    handleLineBrowserCompatibility();
    
    // 初始化重疊檢測
    initOverlapDetection();
    
    // 清除所有對齊檢測標記（避免綠色虛線）
    clearAlignmentDetection();
    
    // 初始化對齊檢測（可選）
    if (performanceConfig.enableAlignmentDetection) {
        initAlignmentDetection();
    }
});

// ==================== 重疊檢測功能 ====================

// 使用Intersection Observer API檢測重疊
function detectOverlaps() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.intersectionRatio < 0.1) {
                entry.target.style.zIndex = '999';
                entry.target.classList.add('overlap-warning');
            } else {
                entry.target.style.zIndex = '';
                entry.target.classList.remove('overlap-warning');
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '10px'
    });
    
    // 監控所有可能重疊的元素
    const elementsToWatch = [
        '.day-card',
        '.truck-item',
        '.ad-item',
        '.week-tab',
        '.image-marquee-item'
    ];
    
    elementsToWatch.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            observer.observe(el);
        });
    });
}

// 初始化重疊檢測
function initOverlapDetection() {
    // 檢查瀏覽器是否支援 Intersection Observer
    if ('IntersectionObserver' in window) {
        detectOverlaps();
        
        // 當內容動態更新時重新檢測 - 減少頻率
        const mutationObserver = new MutationObserver((mutations) => {
            let shouldRefresh = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldRefresh = true;
                }
            });
            
            // 只在有實際內容變化時才重新檢測
            if (shouldRefresh) {
                setTimeout(detectOverlaps, 500);
            }
        });
        
        // 監控整個文檔的變化
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        console.warn('Intersection Observer API 不支援，跳過重疊檢測');
    }
}

// 手動檢測重疊（備用方案）
function manualOverlapDetection() {
    const elements = document.querySelectorAll('.day-card, .truck-item, .ad-item');
    
    elements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        let hasOverlap = false;
        
        elements.forEach((otherElement, otherIndex) => {
            if (index !== otherIndex) {
                const otherRect = otherElement.getBoundingClientRect();
                
                // 檢查是否有重疊
                if (rect.left < otherRect.right && 
                    rect.right > otherRect.left && 
                    rect.top < otherRect.bottom && 
                    rect.bottom > otherRect.top) {
                    hasOverlap = true;
                }
            }
        });
        
        if (hasOverlap) {
            element.classList.add('overlap-warning');
            element.style.zIndex = '999';
        } else {
            element.classList.remove('overlap-warning');
            element.style.zIndex = '';
        }
    });
}

// ==================== 對齊檢測功能 ====================

// 自動檢測和修正對齊問題
class AlignmentDetector {
    constructor() {
        this.threshold = 2; // 2px容差
        this.gridLines = [];
        this.detectMisalignment();
    }
    
    detectMisalignment() {
        const elements = document.querySelectorAll('[data-align-check]');
        this.gridLines = this.calculateGridLines();
        
        // 如果沒有足夠的網格線參考，跳過檢測
        if (this.gridLines.vertical.length < 2 && this.gridLines.horizontal.length < 2) {
            return;
        }
        
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const alignmentScore = this.calculateAlignmentScore(rect, this.gridLines);
            
            // 提高對齊分數閾值，減少誤判
            if (alignmentScore < 0.7) {
                this.suggestAlignment(element, rect, this.gridLines);
            }
        });
    }
    
    calculateGridLines() {
        const container = document.querySelector('.container');
        if (!container) return [];
        
        const containerRect = container.getBoundingClientRect();
        const gridLines = {
            vertical: [],
            horizontal: []
        };
        
        // 計算垂直網格線
        const weekTabs = document.querySelectorAll('.week-tab');
        if (weekTabs.length > 0) {
            weekTabs.forEach(tab => {
                const rect = tab.getBoundingClientRect();
                gridLines.vertical.push({
                    position: rect.left - containerRect.left,
                    type: 'left'
                });
                gridLines.vertical.push({
                    position: rect.right - containerRect.left,
                    type: 'right'
                });
            });
        }
        
        // 計算水平網格線
        const dayCards = document.querySelectorAll('.day-card');
        if (dayCards.length > 0) {
            dayCards.forEach(card => {
                const rect = card.getBoundingClientRect();
                gridLines.horizontal.push({
                    position: rect.top - containerRect.top,
                    type: 'top'
                });
                gridLines.horizontal.push({
                    position: rect.bottom - containerRect.top,
                    type: 'bottom'
                });
            });
        }
        
        return gridLines;
    }
    
    calculateAlignmentScore(rect, gridLines) {
        let score = 0;
        let totalChecks = 0;
        
        // 檢查垂直對齊
        gridLines.vertical.forEach(line => {
            const distance = Math.abs(rect.left - line.position);
            if (distance <= this.threshold) {
                score += 1;
            }
            totalChecks++;
        });
        
        // 檢查水平對齊
        gridLines.horizontal.forEach(line => {
            const distance = Math.abs(rect.top - line.position);
            if (distance <= this.threshold) {
                score += 1;
            }
            totalChecks++;
        });
        
        return totalChecks > 0 ? score / totalChecks : 1;
    }
    
    suggestAlignment(element, rect, gridLines) {
        const suggestion = this.findBestAlignment(rect, gridLines);
        if (suggestion) {
            element.style.setProperty('--suggested-margin-left', suggestion.marginLeft + 'px');
            element.style.setProperty('--suggested-margin-top', suggestion.marginTop + 'px');
            element.classList.add('alignment-suggestion');
            
            // 添加視覺提示
            this.addAlignmentHint(element, suggestion);
        }
    }
    
    findBestAlignment(rect, gridLines) {
        let bestAlignment = null;
        let bestScore = 0;
        
        // 尋找最佳垂直對齊
        gridLines.vertical.forEach(line => {
            const marginLeft = line.position - rect.left;
            const score = 1 - Math.abs(marginLeft) / 100; // 正規化分數
            
            if (score > bestScore && Math.abs(marginLeft) <= 20) {
                bestScore = score;
                bestAlignment = {
                    marginLeft: marginLeft,
                    marginTop: 0,
                    type: 'vertical',
                    line: line
                };
            }
        });
        
        // 尋找最佳水平對齊
        gridLines.horizontal.forEach(line => {
            const marginTop = line.position - rect.top;
            const score = 1 - Math.abs(marginTop) / 100; // 正規化分數
            
            if (score > bestScore && Math.abs(marginTop) <= 20) {
                bestScore = score;
                bestAlignment = {
                    marginLeft: 0,
                    marginTop: marginTop,
                    type: 'horizontal',
                    line: line
                };
            }
        });
        
        return bestAlignment;
    }
    
    addAlignmentHint(element, suggestion) {
        // 移除現有的提示
        const existingHint = element.querySelector('.alignment-hint');
        if (existingHint) {
            existingHint.remove();
        }
        
        // 創建新的提示
        const hint = document.createElement('div');
        hint.className = 'alignment-hint';
        hint.innerHTML = `
            <div class="hint-arrow"></div>
            <div class="hint-text">
                ${suggestion.type === 'vertical' ? '垂直對齊' : '水平對齊'}
                <br>
                <small>建議調整: ${Math.round(suggestion.marginLeft || suggestion.marginTop)}px</small>
            </div>
        `;
        
        element.appendChild(hint);
        
        // 3秒後自動移除提示
        setTimeout(() => {
            if (hint.parentNode) {
                hint.remove();
            }
        }, 3000);
    }
    
    // 應用對齊建議
    applyAlignment(element) {
        const marginLeft = element.style.getPropertyValue('--suggested-margin-left');
        const marginTop = element.style.getPropertyValue('--suggested-margin-top');
        
        if (marginLeft) {
            element.style.marginLeft = marginLeft;
        }
        if (marginTop) {
            element.style.marginTop = marginTop;
        }
        
        element.classList.remove('alignment-suggestion');
        element.classList.add('alignment-applied');
    }
    
    // 重新檢測所有元素
    refresh() {
        // 清除現有建議
        document.querySelectorAll('.alignment-suggestion').forEach(el => {
            el.classList.remove('alignment-suggestion');
            const hint = el.querySelector('.alignment-hint');
            if (hint) hint.remove();
        });
        
        // 重新檢測
        this.detectMisalignment();
    }
}

// 初始化對齊檢測器
let alignmentDetector = null;
let detectionTimeout = null;

function initAlignmentDetection() {
    // 為需要檢測對齊的元素添加標記
    const elementsToCheck = [
        '.day-card',
        '.truck-item',
        '.ad-item',
        '.week-tab'
    ];
    
    elementsToCheck.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.setAttribute('data-align-check', 'true');
        });
    });
    
    // 延遲創建對齊檢測器，避免頁面載入時過度檢測
    setTimeout(() => {
        alignmentDetector = new AlignmentDetector();
    }, 1000);
    
    // 監聽視窗大小變化 - 增加防抖動時間
    window.addEventListener('resize', debounce(() => {
        if (alignmentDetector) {
            // 清除之前的檢測
            if (detectionTimeout) {
                clearTimeout(detectionTimeout);
            }
            // 延遲檢測，避免頻繁觸發
            detectionTimeout = setTimeout(() => {
                alignmentDetector.refresh();
            }, 500);
        }
    }, 1000));
    
    // 監聽內容變化 - 減少檢測頻率
    const mutationObserver = new MutationObserver((mutations) => {
        let shouldRefresh = false;
        
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // 為新元素添加檢測標記
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        const elements = node.querySelectorAll('.day-card, .truck-item, .ad-item, .week-tab');
                        elements.forEach(el => {
                            el.setAttribute('data-align-check', 'true');
                        });
                        if (elements.length > 0) {
                            shouldRefresh = true;
                        }
                    }
                });
            }
        });
        
        // 只在有實際內容變化時才重新檢測
        if (shouldRefresh && alignmentDetector) {
            // 清除之前的檢測
            if (detectionTimeout) {
                clearTimeout(detectionTimeout);
            }
            // 延遲檢測
            detectionTimeout = setTimeout(() => {
                alignmentDetector.refresh();
            }, 800);
        }
    });
    
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// 清除所有對齊檢測標記和樣式
function clearAlignmentDetection() {
    // 移除所有對齊建議樣式
    document.querySelectorAll('.alignment-suggestion').forEach(el => {
        el.classList.remove('alignment-suggestion');
        el.style.removeProperty('--suggested-margin-left');
        el.style.removeProperty('--suggested-margin-top');
    });
    
    // 移除所有對齊提示
    document.querySelectorAll('.alignment-hint').forEach(hint => {
        hint.remove();
    });
    
    // 移除所有檢測標記
    document.querySelectorAll('[data-align-check]').forEach(el => {
        el.removeAttribute('data-align-check');
    });
    
    // 停止對齊檢測器
    if (alignmentDetector) {
        alignmentDetector = null;
    }
}

// ==================== 遠端更新檢查功能 ====================

/**
 * 檢查遠端更新（背景執行）
 */
async function checkForRemoteUpdates() {
    try {
        // 檢查是否有 GitHub 同步模組
        if (typeof githubSync === 'undefined') {
            console.log('ℹ️ GitHub 同步模組未載入，跳過遠端更新檢查');
            return;
        }

        const status = githubSync.getProjectStatus();
        if (!status.hasProject) {
            console.log('ℹ️ 未設定專案，跳過遠端更新檢查');
            return;
        }

        console.log('🔄 背景檢查遠端更新...');
        
        const updateInfo = await githubSync.checkForUpdates('data.json');
        
        if (updateInfo.hasUpdate) {
            console.log('🆕 發現遠端更新，準備更新資料');
            
            // 顯示更新通知
            showUpdateNotification(updateInfo);
        } else {
            console.log('✅ 已是最新版本');
        }
    } catch (error) {
        console.log('⚠️ 檢查遠端更新失敗:', error.message);
    }
}

/**
 * 顯示更新通知
 */
function showUpdateNotification(updateInfo) {
    // 建立更新通知元素
    const notification = document.createElement('div');
    notification.id = 'updateNotification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Microsoft JhengHei', sans-serif;
        animation: slideInRight 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="font-size: 1.2rem;">🆕</span>
            <strong>發現新更新</strong>
        </div>
        <div style="font-size: 0.9rem; margin-bottom: 1rem; opacity: 0.9;">
            遠端資料已更新，是否要重新載入？
        </div>
        <div style="display: flex; gap: 0.5rem;">
            <button onclick="updateFromRemote()" style="
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9rem;
            ">立即更新</button>
            <button onclick="dismissUpdateNotification()" style="
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9rem;
            ">稍後</button>
        </div>
    `;
    
    // 添加動畫樣式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 5秒後自動隱藏
    setTimeout(() => {
        if (document.getElementById('updateNotification')) {
            dismissUpdateNotification();
        }
    }, 5000);
}

/**
 * 從遠端更新資料
 */
async function updateFromRemote() {
    try {
        console.log('🔄 正在從遠端更新資料...');
        
        // 檢查是否有 GitHub 同步模組
        if (typeof githubSync === 'undefined') {
            console.log('⚠️ GitHub 同步模組未載入，無法更新');
            alert('GitHub 同步模組未載入，無法更新資料');
            return;
        }
        
        const result = await githubSync.pullData('data.json');
        const data = JSON.parse(result.content);
        
        // 更新本地儲存
        localStorage.setItem('foodTruckData', JSON.stringify(data));
        sessionStorage.setItem('foodTruckData', JSON.stringify(data));
        
        console.log('✅ 遠端資料已更新');
        
        // 隱藏通知
        dismissUpdateNotification();
        
        // 重新載入頁面
        location.reload();
        
    } catch (error) {
        console.error('更新失敗:', error);
        alert('更新失敗：' + error.message);
    }
}

/**
 * 隱藏更新通知
 */
function dismissUpdateNotification() {
    const notification = document.getElementById('updateNotification');
    if (notification) {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}
