/**
 * GitHub 同步模組
 * 處理與 GitHub API 的互動，包括資料同步和更新檢查
 */

class GitHubSync {
    constructor() {
        this.currentProject = null;
        this.isInitialized = false;
    }

    /**
     * 初始化 GitHub 同步模組
     */
    async initialize() {
        try {
            console.log('🔄 初始化 GitHub 同步模組...');
            
            // 等待 projectConfig 初始化
            if (typeof projectConfig === 'undefined') {
                console.log('⚠️ projectConfig 尚未載入，等待中...');
                await this.waitForProjectConfig();
            }
            
            this.currentProject = projectConfig.getCurrentProject();
            
            if (this.currentProject) {
                console.log(`✅ GitHub 同步模組已初始化: ${this.currentProject.name}`);
                this.isInitialized = true;
            } else {
                console.log('⚠️ 未找到當前專案設定');
            }
            
        } catch (error) {
            console.error('❌ GitHub 同步模組初始化失敗:', error);
        }
    }

    /**
     * 等待 projectConfig 載入
     */
    async waitForProjectConfig() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (typeof projectConfig !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    /**
     * 取得專案狀態
     */
    getProjectStatus() {
        const token = projectConfig.getGitHubToken();
        return {
            hasToken: !!token,
            hasProject: !!this.currentProject,
            projectName: this.currentProject?.name || '未設定',
            repository: this.currentProject?.repository || '未設定'
        };
    }

    /**
     * 顯示 Token 設定對話框
     */
    showTokenDialog() {
        const token = prompt(
            '請輸入您的 GitHub Personal Access Token:\n\n' +
            '1. 前往 https://github.com/settings/tokens\n' +
            '2. 點擊 "Generate new token"\n' +
            '3. 選擇 "repo" 權限\n' +
            '4. 複製產生的 Token 並貼上此處'
        );
        
        if (token && token.trim()) {
            projectConfig.setGitHubToken(token.trim());
            return true;
        }
        
        return false;
    }

    /**
     * 驗證 GitHub Token
     */
    async validateToken() {
        try {
            const token = projectConfig.getGitHubToken();
            
            if (!token) {
                return {
                    valid: false,
                    message: '未設定 GitHub Token'
                };
            }

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
                    message: `Token 有效，使用者: ${user.login}`,
                    user: user
                };
            } else {
                return {
                    valid: false,
                    message: `Token 無效: ${response.status} ${response.statusText}`
                };
            }

        } catch (error) {
            return {
                valid: false,
                message: `驗證失敗: ${error.message}`
            };
        }
    }

    /**
     * 同步資料到 GitHub
     */
    async syncData(data) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const token = projectConfig.getGitHubToken();
            if (!token) {
                throw new Error('未設定 GitHub Token');
            }

            if (!this.currentProject) {
                throw new Error('未設定當前專案');
            }

            // 取得倉庫資訊
            const repoInfo = this.parseRepositoryUrl(this.currentProject.repository);
            if (!repoInfo) {
                throw new Error('無效的倉庫 URL');
            }

            // 取得當前檔案內容
            const fileResponse = await fetch(
                `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/data.json`,
                {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            let sha = null;
            if (fileResponse.ok) {
                const fileData = await fileResponse.json();
                sha = fileData.sha;
            }

            // 準備上傳資料
            const content = JSON.stringify(data, null, 2);
            const encodedContent = btoa(unescape(encodeURIComponent(content)));

            const uploadData = {
                message: '自動同步餐車資料',
                content: encodedContent,
                branch: 'main'
            };

            if (sha) {
                uploadData.sha = sha;
            }

            // 上傳到 GitHub
            const uploadResponse = await fetch(
                `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/data.json`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(uploadData)
                }
            );

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(`上傳失敗: ${uploadResponse.status} ${errorData.message || uploadResponse.statusText}`);
            }

            const result = await uploadResponse.json();
            
            return {
                success: true,
                commitUrl: result.commit.html_url,
                commitMessage: result.commit.message,
                commitSha: result.commit.sha
            };

        } catch (error) {
            console.error('同步失敗:', error);
            throw error;
        }
    }

    /**
     * 檢查遠端更新
     */
    async checkForUpdates() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const token = projectConfig.getGitHubToken();
            if (!token) {
                return {
                    hasUpdates: false,
                    message: '未設定 GitHub Token，無法檢查更新'
                };
            }

            const repoInfo = this.parseRepositoryUrl(this.currentProject.repository);
            if (!repoInfo) {
                return {
                    hasUpdates: false,
                    message: '無效的倉庫 URL'
                };
            }

            // 取得最新提交
            const response = await fetch(
                `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/commits/main`,
                {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`檢查更新失敗: ${response.status} ${response.statusText}`);
            }

            const commit = await response.json();
            
            // 檢查本地最後更新時間
            const localData = localStorage.getItem('foodTruckData');
            let localLastUpdated = null;
            
            if (localData) {
                try {
                    const parsed = JSON.parse(localData);
                    localLastUpdated = new Date(parsed.lastUpdated);
                } catch (e) {
                    // 忽略解析錯誤
                }
            }

            const remoteLastUpdated = new Date(commit.commit.author.date);
            
            return {
                hasUpdates: !localLastUpdated || remoteLastUpdated > localLastUpdated,
                localLastUpdated: localLastUpdated,
                remoteLastUpdated: remoteLastUpdated,
                commitMessage: commit.commit.message,
                commitUrl: commit.html_url
            };

        } catch (error) {
            console.error('檢查更新失敗:', error);
            return {
                hasUpdates: false,
                message: `檢查更新失敗: ${error.message}`
            };
        }
    }

    /**
     * 從遠端拉取資料
     */
    async pullData() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const token = projectConfig.getGitHubToken();
            if (!token) {
                throw new Error('未設定 GitHub Token');
            }

            const repoInfo = this.parseRepositoryUrl(this.currentProject.repository);
            if (!repoInfo) {
                throw new Error('無效的倉庫 URL');
            }

            // 取得檔案內容
            const response = await fetch(
                `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/data.json`,
                {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`拉取資料失敗: ${response.status} ${response.statusText}`);
            }

            const fileData = await response.json();
            const content = JSON.parse(atob(fileData.content));
            
            // 儲存到本地
            localStorage.setItem('foodTruckData', JSON.stringify(content));
            sessionStorage.setItem('foodTruckData', JSON.stringify(content));
            
            return {
                success: true,
                data: content,
                message: '資料已從遠端拉取並儲存到本地'
            };

        } catch (error) {
            console.error('拉取資料失敗:', error);
            throw error;
        }
    }

    /**
     * 解析倉庫 URL
     */
    parseRepositoryUrl(url) {
        try {
            // 支援多種 URL 格式
            const patterns = [
                /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/,
                /github\.com\/([^\/]+)\/([^\/]+?)(?:\/)?$/
            ];
            
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) {
                    return {
                        owner: match[1],
                        repo: match[2]
                    };
                }
            }
            
            return null;
        } catch (error) {
            console.error('解析倉庫 URL 失敗:', error);
            return null;
        }
    }
}

// 建立全域實例
const githubSync = new GitHubSync();

// 自動初始化
if (typeof projectConfig !== 'undefined') {
    githubSync.initialize();
} else {
    // 等待 projectConfig 載入
    document.addEventListener('DOMContentLoaded', () => {
        githubSync.initialize();
    });
}