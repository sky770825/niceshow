/**
 * 自動設定 GitHub Token 輔助工具
 * 提供預設 Token 和自動設定功能
 */

class TokenAutoSetup {
    constructor() {
        // 預設的 GitHub Token（請替換為您的實際 Token）
        this.defaultToken = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
        this.tokenName = '餐開月行程表自動同步';
    }

    /**
     * 自動設定 Token
     */
    autoSetupToken() {
        console.log('🔑 開始自動設定 GitHub Token...');
        
        // 檢查是否已有 Token
        const existingToken = localStorage.getItem('githubToken');
        if (existingToken && existingToken.length > 20) {
            console.log('✅ 已存在有效的 GitHub Token');
            return {
                success: true,
                message: '已存在有效的 GitHub Token',
                token: existingToken
            };
        }

        // 設定預設 Token
        try {
            localStorage.setItem('githubToken', this.defaultToken);
            console.log('✅ GitHub Token 已自動設定');
            
            return {
                success: true,
                message: 'GitHub Token 已自動設定',
                token: this.defaultToken
            };
        } catch (error) {
            console.error('❌ 設定 Token 失敗:', error);
            return {
                success: false,
                message: '設定 Token 失敗: ' + error.message
            };
        }
    }

    /**
     * 驗證 Token 是否有效
     */
    async validateToken() {
        const token = localStorage.getItem('githubToken');
        if (!token) {
            return { valid: false, message: '未設定 Token' };
        }

        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const user = await response.json();
                return {
                    valid: true,
                    message: `Token 有效，用戶: ${user.login}`,
                    user: user
                };
            } else {
                return {
                    valid: false,
                    message: `Token 無效，狀態碼: ${response.status}`
                };
            }
        } catch (error) {
            return {
                valid: false,
                message: '驗證失敗: ' + error.message
            };
        }
    }

    /**
     * 顯示 Token 設定狀態
     */
    showTokenStatus() {
        const token = localStorage.getItem('githubToken');
        const status = {
            hasToken: !!token,
            tokenLength: token ? token.length : 0,
            tokenPreview: token ? token.substring(0, 8) + '...' : '無'
        };

        console.log('🔑 Token 狀態:', status);
        return status;
    }

    /**
     * 清除 Token
     */
    clearToken() {
        localStorage.removeItem('githubToken');
        console.log('🗑️ GitHub Token 已清除');
        return { success: true, message: 'Token 已清除' };
    }

    /**
     * 手動設定 Token
     */
    setCustomToken(token) {
        if (!token || token.length < 20) {
            return {
                success: false,
                message: 'Token 格式不正確，長度至少需要 20 個字符'
            };
        }

        try {
            localStorage.setItem('githubToken', token.trim());
            console.log('✅ 自定義 Token 已設定');
            return {
                success: true,
                message: '自定義 Token 已設定'
            };
        } catch (error) {
            return {
                success: false,
                message: '設定失敗: ' + error.message
            };
        }
    }
}

// 建立全域實例
window.tokenAutoSetup = new TokenAutoSetup();

// 自動執行設定
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Token 自動設定工具已載入');
    
    // 自動設定 Token
    const result = window.tokenAutoSetup.autoSetupToken();
    console.log('🔑 Token 設定結果:', result);
    
    // 顯示狀態
    const status = window.tokenAutoSetup.showTokenStatus();
    console.log('📊 Token 狀態:', status);
});
