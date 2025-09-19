// Main 專用 JavaScript - 完全獨立
// 載入共享配置

/**
 * 開啟地圖導航
 * @param {string} url - Google Maps 連結
 */
function openMap(url) {
    Utils.openMap(url);
}

/**
 * 顯示通知訊息
 * @param {string} message - 通知訊息
 * @param {string} type - 通知類型 (info, error)
 */
function showNotification(message, type = 'info') {
    Utils.showNotification(message, type);
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
            mapUrl = CONFIG.addressMap[locationText];
        } else {
            // 從.truck-location元素獲取地址
            const locationElement = nameElement.parentElement.querySelector('.truck-location');
            if (locationElement) {
                locationText = locationElement.textContent.replace('📍', '').trim();
                mapUrl = CONFIG.addressMap[locationText];
                
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
 * 初始化圖片跑碼燈
 */
async function initializeMarquee() {
    const marqueeTrack = document.getElementById('marqueeTrack');
    if (!marqueeTrack) return;
    
    // 清空現有內容
    marqueeTrack.innerHTML = '';
    
    try {
        // 優先從 admin_new.html 的本地儲存載入餐車資料
        const adminData = localStorage.getItem('foodTruckData');
        if (adminData) {
            const data = JSON.parse(adminData);
            if (data.foodTrucks && data.foodTrucks.length > 0) {
                console.log('📱 從 admin 後台載入跑碼燈圖片');
                loadMarqueeImages(data.foodTrucks);
                return;
            }
        }
        
        // 嘗試從其他本地儲存鍵載入
        const localData = Utils.storage.get(CONFIG.storageKeys.marqueeImages);
        if (localData && localData.length > 0) {
            console.log('📱 從本地儲存載入跑碼燈圖片');
            loadMarqueeImages(localData);
            return;
        }
        
        // 嘗試從 data.json 載入餐車資料
        const response = await fetch('data.json');
        const data = await response.json();
        
        if (data.foodTrucks && data.foodTrucks.length > 0) {
            console.log('🌐 從 data.json 載入跑碼燈圖片');
            loadMarqueeImages(data.foodTrucks);
            return;
        }
        
        // 如果沒有找到餐車資料，使用預設示例圖片
        console.log('⚠️ 未找到餐車圖片資料，使用預設示例圖片');
        loadDefaultMarqueeImages();
        
    } catch (error) {
        console.error('載入跑碼燈資料失敗:', error);
        loadDefaultMarqueeImages();
    }
}

/**
 * 載入跑碼燈圖片
 */
function loadMarqueeImages(truckData) {
    const marqueeTrack = document.getElementById('marqueeTrack');
    if (!marqueeTrack) return;
    
    console.log('🔍 載入的餐車資料:', truckData);
    
    // 過濾出活躍的餐車
    const activeTrucks = truckData.filter(truck => truck.isActive !== false);
    
    console.log('✅ 活躍的餐車數量:', activeTrucks.length);
    
    if (activeTrucks.length === 0) {
        console.log('⚠️ 沒有活躍的餐車，載入預設圖片');
        loadDefaultMarqueeImages();
        return;
    }
    
    // 按優先級排序
    activeTrucks.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    
    // 只顯示一次餐車，不重複
    activeTrucks.forEach(truck => {
        const imgElement = document.createElement('img');
        imgElement.src = truck.src || `https://via.placeholder.com/80x60/667eea/ffffff?text=${encodeURIComponent(truck.title || truck.alt || '餐車')}`;
        imgElement.alt = truck.alt || truck.title || '餐車';
        imgElement.style.height = '60px';
        imgElement.style.marginRight = '20px';
        imgElement.style.borderRadius = '8px';
        imgElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        imgElement.style.flexShrink = '0';
        imgElement.style.cursor = 'pointer';
        
        // 添加點擊事件
        if (truck.imgLink) {
            imgElement.addEventListener('click', () => {
                window.open(truck.imgLink, '_blank', 'noopener,noreferrer');
            });
        }
        
        marqueeTrack.appendChild(imgElement);
    });
    
    // 根據餐車數量調整動畫速度
    marqueeTrack.className = 'marquee-track';
    if (activeTrucks.length === 1) {
        marqueeTrack.classList.add('single-image');
    } else {
        marqueeTrack.classList.add('multiple-images');
    }
    
    console.log(`🖼️ 跑碼燈已載入 ${activeTrucks.length} 個餐車圖片（無重複）`);
}

/**
 * 載入預設跑碼燈圖片
 */
function loadDefaultMarqueeImages() {
    const marqueeTrack = document.getElementById('marqueeTrack');
    if (!marqueeTrack) return;
    
    // 預設示例圖片
    const sampleImages = [
        { src: 'https://via.placeholder.com/80x60/ff6b6b/ffffff?text=QQ炸熱狗', alt: 'QQ炸熱狗餐車' },
        { src: 'https://via.placeholder.com/80x60/4ecdc4/ffffff?text=黃佳香', alt: '黃佳香碳烤玉米' },
        { src: 'https://via.placeholder.com/80x60/45b7d1/ffffff?text=A+happiness', alt: 'A happiness手作奶酪' },
        { src: 'https://via.placeholder.com/80x60/96ceb4/ffffff?text=蒸珍飽', alt: '蒸珍飽' },
        { src: 'https://via.placeholder.com/80x60/feca57/ffffff?text=臧記排骨酥', alt: '臧記排骨酥' },
        { src: 'https://via.placeholder.com/80x60/ff9ff3/ffffff?text=台東放山豬', alt: '台東放山豬石板烤肉' }
    ];
    
    // 添加圖片（重複兩次以實現無縫循環）
    [...sampleImages, ...sampleImages].forEach(img => {
        const imgElement = document.createElement('img');
        imgElement.src = img.src;
        imgElement.alt = img.alt;
        imgElement.style.height = '60px';
        imgElement.style.marginRight = '20px';
        imgElement.style.borderRadius = '8px';
        imgElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        imgElement.style.flexShrink = '0';
        marqueeTrack.appendChild(imgElement);
    });
    
    console.log('🖼️ 跑碼燈已載入預設示例圖片');
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
    initializeMarquee();
}

// 頁面載入完成後執行初始化
document.addEventListener('DOMContentLoaded', initializeApp);
