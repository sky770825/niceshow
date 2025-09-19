// 共享配置文件 - 用於 admin 和 main 頁面
const CONFIG = {
    // 地址對應表
    addressMap: {
        '四維路59號': 'https://maps.app.goo.gl/jaKQjQ6jArFZda898',
        '四維路60號': 'https://maps.app.goo.gl/rxGpsi2UpsTEEV5w5',
        '四維路70號': 'https://maps.app.goo.gl/k3rPvM6UwQJqwC5k7',
        '四維路77號': 'https://maps.app.goo.gl/ejp7GDgoJEyyEKZ56',
        '四維路190號': 'https://maps.app.goo.gl/JzDhpp6KHtuRZFfBA',
        '四維路216號': 'https://maps.app.goo.gl/LFtp8Cg33KXoSE1A7',
        '四維路218號': 'https://maps.app.goo.gl/89A6N9QCSgAURCFv9'
    },

    // 預設餐車資料
    defaultTrucks: [
        {
            id: 1,
            name: '美味餐車1',
            image: 'https://via.placeholder.com/300x200/ff6b6b/ffffff?text=餐車1',
            status: 'active',
            description: '提供各種美味料理',
            location: '四維路59號',
            phone: '0912-345-678'
        },
        {
            id: 2,
            name: '香香餐車2',
            image: 'https://via.placeholder.com/300x200/4ecdc4/ffffff?text=餐車2',
            status: 'active',
            description: '特色小吃專賣',
            location: '四維路60號',
            phone: '0912-345-679'
        },
        {
            id: 3,
            name: '好吃餐車3',
            image: 'https://via.placeholder.com/300x200/45b7d1/ffffff?text=餐車3',
            status: 'inactive',
            description: '暫時停業',
            location: '四維路70號',
            phone: '0912-345-680'
        }
    ],

    // 跑碼燈設定
    marquee: {
        speed: 30, // 秒
        imageHeight: 60,
        imageMargin: 20
    },

    // 通知設定
    notification: {
        duration: 3000, // 毫秒
        position: 'top-right'
    },

    // 本地儲存鍵值
    storageKeys: {
        truckData: 'truckData',
        marqueeImages: 'marqueeImages',
        settings: 'appSettings'
    },

    // API 設定（如果需要）
    api: {
        baseUrl: '', // 本地開發
        timeout: 5000
    },

    // 響應式斷點
    breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024
    }
};

// 工具函數
const Utils = {
    // 顯示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'};
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
        }, CONFIG.notification.duration);
    },

    // 開啟地圖
    openMap(url) {
        try {
            if (url && url.startsWith('http')) {
                window.open(url, '_blank', 'noopener,noreferrer');
            } else {
                console.error('無效的地圖連結:', url);
                this.showNotification('抱歉，地圖連結無效，請稍後再試。', 'error');
            }
        } catch (error) {
            console.error('開啟地圖時發生錯誤:', error);
            this.showNotification('無法開啟地圖，請檢查您的瀏覽器設定。', 'error');
        }
    },

    // 本地儲存
    storage: {
        get(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (error) {
                console.error('讀取本地儲存失敗:', error);
                return null;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('儲存到本地儲存失敗:', error);
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('刪除本地儲存失敗:', error);
                return false;
            }
        }
    },

    // 防抖函數
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 節流函數
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 格式化日期
    formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return new Date(date).toLocaleDateString('zh-TW', options);
    },

    // 檢查是否為手機裝置
    isMobile() {
        return window.innerWidth <= CONFIG.breakpoints.mobile;
    },

    // 檢查是否為平板裝置
    isTablet() {
        return window.innerWidth > CONFIG.breakpoints.mobile && 
               window.innerWidth <= CONFIG.breakpoints.tablet;
    },

    // 檢查是否為桌面裝置
    isDesktop() {
        return window.innerWidth > CONFIG.breakpoints.tablet;
    }
};

// 匯出到全域
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.Utils = Utils;
}

// 如果是 Node.js 環境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, Utils };
}
