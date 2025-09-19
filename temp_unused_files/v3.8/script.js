// 地址對應表
const addressMap = {
    '四維路59號': 'https://maps.app.goo.gl/jaKQjQ6jArFZda898',
    '四維路60號': 'https://maps.app.goo.gl/rxGpsi2UpsTEEV5w5',
    '四維路70號': 'https://maps.app.goo.gl/k3rPvM6UwQJqwC5k7',
    '四維路77號': 'https://maps.app.goo.gl/ejp7GDgoJEyyEKZ56',
    '四維路190號': 'https://maps.app.goo.gl/JzDhpp6KHtuRZFfBA',
    '四維路216號': 'https://maps.app.goo.gl/LFtp8Cg33KXoSE1A7',
    '四維路218號': 'https://maps.app.goo.gl/89A6N9QCSgAURCFv9'
};

/**
 * 開啟地圖導航
 * @param {string} url - Google Maps 連結
 */
function openMap(url) {
    try {
        if (url && url.startsWith('http')) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            console.error('無效的地圖連結:', url);
            showNotification('抱歉，地圖連結無效，請稍後再試。', 'error');
        }
    } catch (error) {
        console.error('開啟地圖時發生錯誤:', error);
        showNotification('無法開啟地圖，請檢查您的瀏覽器設定。', 'error');
    }
}

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
 * 切換顯示的週次
 * @param {number} weekNumber - 週次編號 (0-6)
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
    if (allTabs[weekNumber]) {
        allTabs[weekNumber].classList.add('active');
    }
    
    // 平滑滾動到頂部
    const content = document.querySelector('.content');
    if (content) {
        content.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
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
 * 添加鍵盤導航支援
 */
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        if (e.key >= '1' && e.key <= '7') {
            const weekNumber = parseInt(e.key) - 1;
            if (weekNumber >= 0 && weekNumber <= 6) {
                showWeek(weekNumber);
                // 更新分頁狀態
                const allTabs = document.querySelectorAll('.week-tab');
                allTabs.forEach(tab => tab.classList.remove('active'));
                if (allTabs[weekNumber]) {
                    allTabs[weekNumber].classList.add('active');
                }
            }
        }
    });
}

/**
 * 添加週次標籤的鍵盤支援
 */
function initializeWeekTabs() {
    const weekTabs = document.querySelectorAll('.week-tab');
    weekTabs.forEach((tab, index) => {
        tab.setAttribute('tabindex', '0');
        tab.setAttribute('role', 'button');
        tab.setAttribute('aria-label', `切換到第${index + 1}週`);
        
        tab.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showWeek(index);
                this.classList.add('active');
            }
        });
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
const foodTruckDatabase = [
    {
        id: 'truck_001',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990540/S__4653108_0_u5egpg.jpg',
        alt: '餐車品牌1',
        title: '餐車品牌1',
        isActive: true,
        priority: 1,
        category: 'main'
    },
    {
        id: 'truck_002',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990540/S__4653107_0_igxhgl.jpg',
        alt: '餐車品牌2',
        title: '餐車品牌2',
        isActive: true,
        priority: 2,
        category: 'main'
    },
    {
        id: 'truck_003',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990540/S__4653105_0_keaqnp.jpg',
        alt: '餐車品牌3',
        title: '餐車品牌3',
        isActive: true,
        priority: 3,
        category: 'main'
    },
    {
        id: 'truck_004',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653102_0_iwonvd.jpg',
        alt: '餐車品牌4',
        title: '餐車品牌4',
        isActive: true,
        priority: 4,
        category: 'main'
    },
    {
        id: 'truck_005',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653103_0_ste4ns.jpg',
        alt: '餐車品牌5',
        title: '餐車品牌5',
        isActive: true,
        priority: 5,
        category: 'main'
    },
    {
        id: 'truck_006',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653100_0_ono2dd.jpg',
        alt: '餐車品牌6',
        title: '餐車品牌6',
        isActive: true,
        priority: 6,
        category: 'main'
    },
    {
        id: 'truck_007',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653096_0_vycs5h.jpg',
        alt: '餐車品牌7',
        title: '餐車品牌7',
        isActive: true,
        priority: 7,
        category: 'main'
    },
    {
        id: 'truck_008',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653098_0_gidf0n.jpg',
        alt: '餐車品牌8',
        title: '餐車品牌8',
        isActive: true,
        priority: 8,
        category: 'main'
    },
    {
        id: 'truck_009',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653094_0_mxdtdj.jpg',
        alt: '餐車品牌9',
        title: '餐車品牌9',
        isActive: true,
        priority: 9,
        category: 'main'
    },
    {
        id: 'truck_010',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653099_0_sxppso.jpg',
        alt: '餐車品牌10',
        title: '餐車品牌10',
        isActive: true,
        priority: 10,
        category: 'main'
    },
    {
        id: 'truck_011',
        src: 'https://res.cloudinary.com/db0mzs6ps/image/upload/v1757990539/S__4653095_0_scixck.jpg',
        alt: '餐車品牌11',
        title: '餐車品牌11',
        isActive: true,
        priority: 11,
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
    const now = Date.now();
    
    // 防止重複初始化
    if (isInitializing) {
        console.log('⚠️ 正在初始化中，跳過重複調用');
        return;
    }
    
    // 防止短時間內重複調用（500ms內）
    if (now - lastInitTime < 500) {
        console.log('⚠️ 距離上次初始化時間太短，跳過重複調用');
        return;
    }
    
    isInitializing = true;
    lastInitTime = now;
    
    console.log('🚀 開始初始化圖片跑碼燈...');
    
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
        } else {
            // 如果本地沒有資料，從 data.json 載入
            const response = await fetch('data.json');
            const data = await response.json();
            imageData = data.foodTrucks
                .filter(truck => truck.isActive)
                .sort((a, b) => a.priority - b.priority);
            console.log('🌐 從 data.json 載入餐車圖片資料');
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
            
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt;
            img.loading = 'lazy';
            
            // 添加點擊事件
            marqueeItem.addEventListener('click', () => {
                showImageModal(item.src, item.alt, item.title);
            });
            
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
    
    // 重置初始化標記
    setTimeout(() => {
        isInitializing = false;
        console.log('✅ 初始化完成，標記已重置');
    }, 500);
}

/**
 * 顯示圖片放大彈窗
 * @param {string} src - 圖片來源
 * @param {string} alt - 圖片替代文字
 * @param {string} title - 圖片標題
 */
function showImageModal(src, alt, title) {
    // 創建彈窗元素
    let modal = document.getElementById('imageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'image-modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="image-modal-content">
            <button class="image-modal-close" onclick="hideImageModal()">&times;</button>
            <img src="${src}" alt="${alt}" title="${title}">
        </div>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
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
 * 初始化所有功能
 */
function initializeApp() {
    console.log('🍽️ 四維商圈餐車月行程表已載入完成！');
    
    // 初始化各種功能
    initializeTruckNames();
    initializeDayCards();
    initializeKeyboardNavigation();
    initializeWeekTabs();
    initializePageAnimation();
    initializeImageMarquee();
    
    // 設定定期檢查資料更新
    setInterval(checkDataUpdate, 1000); // 每1秒檢查一次，提高同步速度
}

// 聯絡四維總召懸浮按鈕功能
let contactPanelVisible = false;
let contactButtonVisible = false;

/**
 * 切換聯絡按鈕顯示狀態
 */
function toggleContactButton() {
    const contactButtonMain = document.querySelector('.contact-button-main');
    const floatingButton = document.getElementById('contactFloatingButton');
    
    if (!contactButtonMain || !floatingButton) {
        console.error('聯絡按鈕元素未找到');
        return;
    }
    
    contactButtonVisible = !contactButtonVisible;
    
    if (contactButtonVisible) {
        // 顯示聯絡按鈕
        contactButtonMain.classList.add('show');
        floatingButton.classList.add('collapsed');
    } else {
        // 隱藏聯絡按鈕
        contactButtonMain.classList.remove('show');
        floatingButton.classList.remove('collapsed');
        
        // 同時隱藏面板
        const contactPanel = document.getElementById('contactPanel');
        if (contactPanel) {
            contactPanel.classList.remove('show');
            contactPanelVisible = false;
        }
    }
}

/**
 * 切換聯絡面板顯示狀態
 */
function toggleContactPanel() {
    const contactPanel = document.getElementById('contactPanel');
    const floatingButton = document.getElementById('contactFloatingButton');
    
    if (!contactPanel || !floatingButton) {
        console.error('聯絡面板元素未找到');
        return;
    }
    
    contactPanelVisible = !contactPanelVisible;
    
    if (contactPanelVisible) {
        // 顯示面板
        contactPanel.classList.add('show');
        
        // 添加點擊外部關閉功能
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);
        
        // 顯示通知
        showNotification('聯絡資訊已展開', 'info');
    } else {
        // 隱藏面板
        contactPanel.classList.remove('show');
        
        // 移除點擊外部關閉功能
        document.removeEventListener('click', handleOutsideClick);
    }
}

/**
 * 處理點擊外部區域關閉面板
 * @param {Event} event - 點擊事件
 */
function handleOutsideClick(event) {
    const floatingButton = document.getElementById('contactFloatingButton');
    const contactPanel = document.getElementById('contactPanel');
    
    if (!floatingButton || !contactPanel) return;
    
    // 如果點擊的不是懸浮按鈕區域，則關閉面板
    if (!floatingButton.contains(event.target)) {
        contactPanelVisible = false;
        contactPanel.classList.remove('show');
        document.removeEventListener('click', handleOutsideClick);
    }
}

/**
 * 初始化聯絡懸浮按鈕
 */
function initializeContactButton() {
    const floatingButton = document.getElementById('contactFloatingButton');
    
    if (!floatingButton) {
        console.warn('聯絡懸浮按鈕元素未找到');
        return;
    }
    
    // 添加鍵盤支援
    floatingButton.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleContactPanel();
        }
    });
    
    // 設定可訪問性屬性
    floatingButton.setAttribute('role', 'button');
    floatingButton.setAttribute('tabindex', '0');
    floatingButton.setAttribute('aria-label', '聯絡四維總召');
    
    console.log('✅ 聯絡懸浮按鈕初始化完成');
}

// 頁面載入完成後執行初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeContactButton();
});
