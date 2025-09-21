/**
 * 專案設定檔
 * 管理 GitHub 專案資訊和同步設定
 */

// 載入專案設定
function loadProjectConfig() {
    try {
        // 從 localStorage 載入設定
        const config = localStorage.getItem('projectConfig');
        if (config) {
            return JSON.parse(config);
        }
        
        // 預設設定
        return {
            currentProject: {
                name: "餐開月行程表",
                username: "sky770825",
                email: "sky19880825@gmail.com",
                repository: "https://github.com/sky770825/niceshow.git",
                website: "https://sky770825.github.io/niceshow",
                isDefault: true
            },
            syncSettings: {
                autoCheckUpdates: true,
                checkInterval: 5 * 60 * 1000, // 5分鐘
                enableNotifications: true
            },
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('載入專案設定失敗:', error);
        return null;
    }
}

// 儲存專案設定
function saveProjectConfig(config) {
    try {
        config.lastUpdated = new Date().toISOString();
        localStorage.setItem('projectConfig', JSON.stringify(config));
        return true;
    } catch (error) {
        console.error('儲存專案設定失敗:', error);
        return false;
    }
}

// 更新 GitHub 同步模組的專案資訊
function updateGitHubSyncProject() {
    if (typeof githubSync !== 'undefined') {
        const config = loadProjectConfig();
        if (config && config.currentProject) {
            // 更新專案資訊到 GitHub 同步模組
            githubSync.currentProject = {
                owner: config.currentProject.username,
                repo: config.currentProject.repository.split('/').pop().replace('.git', ''),
                website: config.currentProject.website
            };
            
            // 儲存到 localStorage 供其他模組使用
            localStorage.setItem('githubProjects', JSON.stringify([config.currentProject]));
        }
    }
}

// 初始化專案設定
function initializeProjectConfig() {
    const config = loadProjectConfig();
    if (config) {
        updateGitHubSyncProject();
        console.log('✅ 專案設定已載入:', config.currentProject.name);
        return config;
    }
    return null;
}

// 切換專案
function switchProject(projectInfo) {
    const config = loadProjectConfig();
    if (config) {
        config.currentProject = projectInfo;
        if (saveProjectConfig(config)) {
            updateGitHubSyncProject();
            console.log('✅ 已切換到專案:', projectInfo.name);
            return true;
        }
    }
    return false;
}

// 取得 GitHub Token
function getGitHubToken() {
    try {
        return localStorage.getItem('githubToken');
    } catch (error) {
        console.error('取得 GitHub Token 失敗:', error);
        return null;
    }
}

// 設定 GitHub Token
function setGitHubToken(token) {
    try {
        if (token && token.trim()) {
            localStorage.setItem('githubToken', token.trim());
            console.log('✅ GitHub Token 已儲存');
        } else {
            localStorage.removeItem('githubToken');
            console.log('🗑️ GitHub Token 已清除');
        }
        return true;
    } catch (error) {
        console.error('儲存 GitHub Token 失敗:', error);
        return false;
    }
}

// 取得當前專案資訊
function getCurrentProject() {
    try {
        const config = loadProjectConfig();
        return config ? config.currentProject : null;
    } catch (error) {
        console.error('取得當前專案失敗:', error);
        return null;
    }
}

// 儲存專案設定（供外部調用）
function saveProjectConfigWrapper() {
    try {
        const config = loadProjectConfig();
        if (config) {
            return saveProjectConfig(config);
        }
        return false;
    } catch (error) {
        console.error('儲存專案設定失敗:', error);
        return false;
    }
}

// 匯出供其他模組使用
if (typeof window !== 'undefined') {
    window.projectConfig = {
        load: loadProjectConfig,
        save: saveProjectConfigWrapper,
        updateGitHubSync: updateGitHubSyncProject,
        initialize: initializeProjectConfig,
        switch: switchProject,
        getGitHubToken: getGitHubToken,
        setGitHubToken: setGitHubToken,
        getCurrentProject: getCurrentProject
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadProjectConfig,
        saveProjectConfig,
        updateGitHubSyncProject,
        initializeProjectConfig,
        switchProject
    };
}

/**
 * 專案設定檔
 * 管理 GitHub 專案資訊和同步設定
 */

// 載入專案設定
function loadProjectConfig() {
    try {
        // 從 localStorage 載入設定
        const config = localStorage.getItem('projectConfig');
        if (config) {
            return JSON.parse(config);
        }
        
        // 預設設定
        return {
            currentProject: {
                name: "餐開月行程表",
                username: "sky770825",
                email: "sky19880825@gmail.com",
                repository: "https://github.com/sky770825/niceshow.git",
                website: "https://sky770825.github.io/niceshow",
                isDefault: true
            },
            syncSettings: {
                autoCheckUpdates: true,
                checkInterval: 5 * 60 * 1000, // 5分鐘
                enableNotifications: true
            },
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('載入專案設定失敗:', error);
        return null;
    }
}

// 儲存專案設定
function saveProjectConfig(config) {
    try {
        config.lastUpdated = new Date().toISOString();
        localStorage.setItem('projectConfig', JSON.stringify(config));
        return true;
    } catch (error) {
        console.error('儲存專案設定失敗:', error);
        return false;
    }
}

// 更新 GitHub 同步模組的專案資訊
function updateGitHubSyncProject() {
    if (typeof githubSync !== 'undefined') {
        const config = loadProjectConfig();
        if (config && config.currentProject) {
            // 更新專案資訊到 GitHub 同步模組
            githubSync.currentProject = {
                owner: config.currentProject.username,
                repo: config.currentProject.repository.split('/').pop().replace('.git', ''),
                website: config.currentProject.website
            };
            
            // 儲存到 localStorage 供其他模組使用
            localStorage.setItem('githubProjects', JSON.stringify([config.currentProject]));
        }
    }
}

// 初始化專案設定
function initializeProjectConfig() {
    const config = loadProjectConfig();
    if (config) {
        updateGitHubSyncProject();
        console.log('✅ 專案設定已載入:', config.currentProject.name);
        return config;
    }
    return null;
}

// 切換專案
function switchProject(projectInfo) {
    const config = loadProjectConfig();
    if (config) {
        config.currentProject = projectInfo;
        if (saveProjectConfig(config)) {
            updateGitHubSyncProject();
            console.log('✅ 已切換到專案:', projectInfo.name);
            return true;
        }
    }
    return false;
}

// 取得 GitHub Token
function getGitHubToken() {
    try {
        return localStorage.getItem('githubToken');
    } catch (error) {
        console.error('取得 GitHub Token 失敗:', error);
        return null;
    }
}

// 設定 GitHub Token
function setGitHubToken(token) {
    try {
        if (token && token.trim()) {
            localStorage.setItem('githubToken', token.trim());
            console.log('✅ GitHub Token 已儲存');
        } else {
            localStorage.removeItem('githubToken');
            console.log('🗑️ GitHub Token 已清除');
        }
        return true;
    } catch (error) {
        console.error('儲存 GitHub Token 失敗:', error);
        return false;
    }
}

// 取得當前專案資訊
function getCurrentProject() {
    try {
        const config = loadProjectConfig();
        return config ? config.currentProject : null;
    } catch (error) {
        console.error('取得當前專案失敗:', error);
        return null;
    }
}

// 儲存專案設定（供外部調用）
function saveProjectConfigWrapper() {
    try {
        const config = loadProjectConfig();
        if (config) {
            return saveProjectConfig(config);
        }
        return false;
    } catch (error) {
        console.error('儲存專案設定失敗:', error);
        return false;
    }
}

// 匯出供其他模組使用
if (typeof window !== 'undefined') {
    window.projectConfig = {
        load: loadProjectConfig,
        save: saveProjectConfigWrapper,
        updateGitHubSync: updateGitHubSyncProject,
        initialize: initializeProjectConfig,
        switch: switchProject,
        getGitHubToken: getGitHubToken,
        setGitHubToken: setGitHubToken,
        getCurrentProject: getCurrentProject
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadProjectConfig,
        saveProjectConfig,
        updateGitHubSyncProject,
        initializeProjectConfig,
        switchProject
    };
}
