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
function initializeMarquee() {
    const marqueeTrack = document.getElementById('marqueeTrack');
    if (!marqueeTrack) return;
    
    // 示例圖片（你可以替換成實際的餐車圖片）
    const sampleImages = [
        { src: 'https://via.placeholder.com/80x60/ff6b6b/ffffff?text=餐車1', alt: '餐車1' },
        { src: 'https://via.placeholder.com/80x60/4ecdc4/ffffff?text=餐車2', alt: '餐車2' },
        { src: 'https://via.placeholder.com/80x60/45b7d1/ffffff?text=餐車3', alt: '餐車3' },
        { src: 'https://via.placeholder.com/80x60/96ceb4/ffffff?text=餐車4', alt: '餐車4' },
        { src: 'https://via.placeholder.com/80x60/feca57/ffffff?text=餐車5', alt: '餐車5' },
        { src: 'https://via.placeholder.com/80x60/ff9ff3/ffffff?text=餐車6', alt: '餐車6' }
    ];
    
    // 清空現有內容
    marqueeTrack.innerHTML = '';
    
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
    
    console.log('🖼️ 圖片跑碼燈已初始化');
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
