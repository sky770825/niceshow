/**
 * 更新檢查優化工具
 * 提供更智能的更新檢查和通知機制
 */

class UpdateChecker {
    constructor() {
        this.checkInterval = 5 * 60 * 1000; // 5分鐘
        this.lastCheckTime = 0;
        this.isChecking = false;
        this.updateNotification = null;
    }

    /**
     * 初始化更新檢查
     */
    initialize() {
        console.log('🔄 初始化更新檢查器...');
        
        // 設定定期檢查
        this.startPeriodicCheck();
        
        // 頁面可見性變化時檢查
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkForUpdates();
            }
        });

        // 頁面焦點時檢查
        window.addEventListener('focus', () => {
            this.checkForUpdates();
        });
    }

    /**
     * 開始定期檢查
     */
    startPeriodicCheck() {
        setInterval(() => {
            this.checkForUpdates();
        }, this.checkInterval);
    }

    /**
     * 檢查更新
     */
    async checkForUpdates() {
        if (this.isChecking) {
            console.log('⏳ 更新檢查進行中，跳過...');
            return;
        }

        this.isChecking = true;
        const now = Date.now();

        try {
            console.log('🔍 檢查遠端更新...');
            
            // 檢查 GitHub 上的 data.json
            const updateInfo = await this.checkGitHubUpdate();
            
            if (updateInfo.hasUpdate) {
                console.log('🆕 發現更新:', updateInfo);
                this.showUpdateNotification(updateInfo);
            } else {
                console.log('✅ 已是最新版本');
            }

            this.lastCheckTime = now;
        } catch (error) {
            console.error('❌ 檢查更新失敗:', error);
        } finally {
            this.isChecking = false;
        }
    }

    /**
     * 檢查 GitHub 更新
     */
    async checkGitHubUpdate() {
        try {
            const response = await fetch(
                'https://api.github.com/repos/sky770825/niceshow/contents/data.json',
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (response.ok) {
                const file = await response.json();
                const remoteSha = file.sha;
                const localSha = localStorage.getItem('data.json_sha');
                
                return {
                    hasUpdate: remoteSha !== localSha,
                    remoteSha: remoteSha,
                    localSha: localSha,
                    lastModified: file.last_modified,
                    downloadUrl: file.download_url
                };
            }
            
            return { hasUpdate: false };
        } catch (error) {
            console.error('GitHub 更新檢查失敗:', error);
            return { hasUpdate: false };
        }
    }

    /**
     * 顯示更新通知
     */
    showUpdateNotification(updateInfo) {
        // 移除現有通知
        this.dismissUpdateNotification();

        // 建立通知元素
        const notification = document.createElement('div');
        notification.id = 'updateNotification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 350px;
            font-family: -apple-system, BlinkMacSystemFont, 'Microsoft JhengHei', sans-serif;
            animation: slideIn 0.3s ease-out;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 18px; margin-right: 8px;">🆕</span>
                <strong>發現新版本！</strong>
            </div>
            <div style="font-size: 14px; margin-bottom: 12px; opacity: 0.9;">
                遠端資料已更新，是否要同步最新版本？
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="updateChecker.updateFromRemote()" 
                        style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    🔄 立即更新
                </button>
                <button onclick="updateChecker.dismissUpdateNotification()" 
                        style="background: #6b7280; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    ⏰ 稍後提醒
                </button>
            </div>
        `;

        // 添加動畫樣式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // 添加到頁面
        document.body.appendChild(notification);
        this.updateNotification = notification;

        // 自動消失（30秒後）
        setTimeout(() => {
            this.dismissUpdateNotification();
        }, 30000);
    }

    /**
     * 從遠端更新
     */
    async updateFromRemote() {
        try {
            console.log('🔄 開始從遠端更新...');
            
            // 下載最新資料
            const response = await fetch('data.json?' + Date.now());
            const data = await response.json();
            
            // 更新本地儲存
            localStorage.setItem('foodTruckData', JSON.stringify(data));
            localStorage.setItem('data.json_sha', this.updateNotification?.dataset?.remoteSha || '');
            
            // 重新載入頁面
            window.location.reload();
            
        } catch (error) {
            console.error('❌ 更新失敗:', error);
            alert('更新失敗: ' + error.message);
        }
    }

    /**
     * 關閉更新通知
     */
    dismissUpdateNotification() {
        if (this.updateNotification) {
            this.updateNotification.remove();
            this.updateNotification = null;
        }
    }

    /**
     * 手動檢查更新
     */
    async manualCheck() {
        console.log('🔍 手動檢查更新...');
        await this.checkForUpdates();
    }

    /**
     * 設定檢查間隔
     */
    setCheckInterval(interval) {
        this.checkInterval = interval;
        console.log(`⏰ 更新檢查間隔已設定為 ${interval / 1000} 秒`);
    }
}

// 建立全域實例
window.updateChecker = new UpdateChecker();

// 自動初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 更新檢查器已載入');
    window.updateChecker.initialize();
});
