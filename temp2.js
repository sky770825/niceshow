
        // 內建專案設定功能
        const SimpleProjectConfig = {
            // 載入專案設定
            load() {
                try {
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
                            checkInterval: 5 * 60 * 1000,
                            enableNotifications: true
                        },
                        lastUpdated: new Date().toISOString()
                    };
                } catch (error) {
                    console.error('載入專案設定失敗:', error);
                    return null;
                }
            },
            
            // 儲存專案設定
            save(config) {
                try {
                    config.lastUpdated = new Date().toISOString();
                    localStorage.setItem('projectConfig', JSON.stringify(config));
                    return true;
                } catch (error) {
                    console.error('儲存專案設定失敗:', error);
                    return false;
                }
            },
            
            // 取得 GitHub Token
            getGitHubToken() {
                try {
                    return localStorage.getItem('githubToken');
                } catch (error) {
                    console.error('取得 GitHub Token 失敗:', error);
                    return null;
                }
            },
            
            // 設定 GitHub Token
            setGitHubToken(token) {
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
            },
            
            // 取得當前專案資訊
            getCurrentProject() {
                try {
                    const config = this.load();
                    return config ? config.currentProject : null;
                } catch (error) {
                    console.error('取得當前專案失敗:', error);
                    return null;
                }
            },
            
            // 初始化專案設定
            initialize() {
                try {
                    const config = this.load();
                    if (config) {
                        console.log('✅ 專案設定已載入:', config.currentProject.name);
                        return config;
                    }
                    return null;
                } catch (error) {
                    console.error('初始化專案設定失敗:', error);
                    return null;
                }
            }
        };

        // 簡化版 GitHub 同步功能
        const SimpleGitHubSync = {
            currentProject: {
                name: "餐開月行程表",
                username: "sky770825",
                repository: "https://github.com/sky770825/niceshow.git",
                website: "https://sky770825.github.io/niceshow"
            },
            
            getProjectStatus() {
                const token = SimpleProjectConfig?.getGitHubToken();
                return {
                    hasToken: !!token,
                    hasProject: !!this.currentProject,
                    projectName: this.currentProject?.name || '未設定',
                    repository: this.currentProject?.repository || '未設定'
                };
            },
            
            async validateToken() {
                try {
                    const token = SimpleProjectConfig?.getGitHubToken();
                    
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
            },
            
            async syncData(data) {
                try {
                    const token = SimpleProjectConfig?.getGitHubToken();
                    if (!token) {
                        throw new Error('未設定 GitHub Token');
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
            },
            
            parseRepositoryUrl(url) {
                try {
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
        };

        // 餐車資料庫（從 data.json 載入）
        let foodTruckDatabase = [];
        let filteredTrucks = [];
        let selectedTrucks = new Set();

        // 載入策略管理器
        const LoadStrategy = {
            // 智能載入策略（強制從 data.json 載入）
            async smartLoad() {
                console.log('🧠 智能載入：強制從 data.json 載入...');
                
                // 1. 強制從遠端載入 data.json
                try {
                    const remoteData = await DataManager.loadFromRemote();
                    console.log('✅ 從 data.json 載入成功');
                    return this.applyRemoteData(remoteData);
                } catch (error) {
                    console.log('⚠️ 從 data.json 載入失敗:', error.message);
                    
                    // 2. 遠端載入失敗，嘗試從本地載入
                    const localData = DataManager.loadFromLocal();
                    if (localData) {
                        console.log('✅ 使用本地資料（備用）');
                        return this.applyLocalData(localData);
                    }
                    
                    // 3. 都失敗了，使用空狀態
                    console.log('⚠️ 沒有找到任何資料，使用空狀態');
                    return this.applyDefaultData();
                }
            },
            
            // 強制遠端載入策略
            async forceRemote() {
                console.log('🌐 強制從遠端載入資料...');
                
                try {
                    const remoteData = await DataManager.loadFromRemote();
                    return this.applyRemoteData(remoteData);
                    } catch (error) {
                    console.log('⚠️ 強制遠端載入失敗，使用預設資料');
                    return this.applyDefaultData();
                }
            },
            
            // 應用本地資料（強制覆蓋）
            applyLocalData(data) {
                console.log('🔄 強制應用本地資料到 foodTruckDatabase...');
                console.log(`   本地資料包含 ${data.foodTrucks.length} 個餐車`);
                
                // 強制覆蓋 foodTruckDatabase
                foodTruckDatabase = [...data.foodTrucks];
                
                // 檢查是否有編輯中的餐車
                const editingCount = foodTruckDatabase.filter(truck => truck.isEditing).length;
                if (editingCount > 0) {
                    console.log(`   ⚠️ 發現 ${editingCount} 個餐車正在編輯中`);
                }
                
                console.log(`✅ 本地資料已強制應用到 foodTruckDatabase`);
                return { 
                    success: true, 
                    source: 'localStorage', 
                    count: foodTruckDatabase.length,
                    data: data
                };
            },
            
            // 應用遠端資料
            applyRemoteData(data) {
                console.log('🔄 應用遠端資料到 foodTruckDatabase...');
                console.log(`   遠端資料包含 ${data.foodTrucks.length} 個餐車`);
                
                // 直接覆蓋 foodTruckDatabase
                foodTruckDatabase = [...data.foodTrucks];
                
                // 更新 filteredTrucks
                filteredTrucks = [...foodTruckDatabase];
                
                // 儲存到本地作為備份
                DataManager.saveToLocal();
                console.log('💾 遠端資料已儲存到本地');
                
                return { 
                    success: true,
                    source: 'remote', 
                    count: foodTruckDatabase.length,
                    data: data
                };
            },
            
            // 應用預設資料（空狀態）
            applyDefaultData() {
                // 保持空陣列，不載入任何預設資料
                console.log('⚠️ 沒有找到任何資料，使用空狀態');
                return { 
                    success: false, 
                    source: 'empty', 
                    count: 0,
                    data: null
                };
            }
        };
        
        // 主要的資料載入函數
        async function loadFoodTruckData(forceRemote = false) {
            console.log('🔄 開始載入餐車資料...');
            
            try {
                if (forceRemote) {
                    return await LoadStrategy.forceRemote();
                } else {
                    return await LoadStrategy.smartLoad();
                }
            } catch (error) {
                console.error('❌ 載入餐車資料失敗:', error);
                return LoadStrategy.applyDefaultData();
            }
        }
        
        // ==================== 編輯管理模組 ====================
        
        const EditManager = {
            // 開始編輯
            startEdit(truckId) {
                const truck = foodTruckDatabase.find(t => t.id === truckId);
                if (truck) {
                    truck.isEditing = true;
                    this.saveState();
                    console.log(`✏️ 開始編輯餐車: ${truck.title}`);
                    return true;
                }
                return false;
            },
            
            // 保存編輯
            async saveEdit(truckId) {
                const truck = foodTruckDatabase.find(t => t.id === truckId);
                if (!truck) return false;
                
                // 獲取編輯後的值
                const newTitle = document.getElementById(`edit-title-${truckId}`)?.value.trim();
                const newAlt = document.getElementById(`edit-alt-${truckId}`)?.value.trim();
                
                if (!newTitle) {
                    alert('餐車名稱不能為空！');
                    return false;
                }
                
                // 更新基本資訊
                truck.title = newTitle;
                truck.alt = newAlt || newTitle;
                
                // 更新連結
                const linkData = [];
                for (let i = 1; i <= 3; i++) {
                    const textInput = document.getElementById(`edit-text-${truckId}-${i}`);
                    const urlInput = document.getElementById(`edit-url-${truckId}-${i}`);
                    
                    if (textInput && urlInput) {
                        const text = textInput.value.trim();
                        const url = urlInput.value.trim();
                        
                        if (text && url) {
                            linkData.push({ text, url });
                        }
                    }
                }
                
                truck.link = linkData.length > 0 ? linkData : '';
                truck.isEditing = false;
                
                // 保存狀態
                this.saveState();
                
                console.log(`💾 餐車 "${truck.title}" 編輯已保存`);
                return true;
            },
            
            // 取消編輯
            cancelEdit(truckId) {
                const truck = foodTruckDatabase.find(t => t.id === truckId);
                if (truck) {
                    truck.isEditing = false;
                    this.saveState();
                    console.log(`❌ 取消編輯餐車: ${truck.title}`);
                    return true;
                }
                return false;
            },
            
            // 保存編輯狀態到本地
            saveState() {
                console.log('💾 保存編輯狀態...');
                DataManager.saveToLocal();
                console.log('✅ 編輯狀態已保存');
            },
            
            // 檢查是否有餐車正在編輯
            hasEditingTruck() {
                return foodTruckDatabase && foodTruckDatabase.some(truck => truck.isEditing);
            },
            
            // 獲取正在編輯的餐車
            getEditingTrucks() {
                return foodTruckDatabase ? foodTruckDatabase.filter(truck => truck.isEditing) : [];
            }
        };

        // 獨立的資料驗證函數
        function validateData() {
            console.log('🔍 驗證資料完整性...');
            
            // 檢查 foodTruckDatabase
            if (!foodTruckDatabase || !Array.isArray(foodTruckDatabase)) {
                console.log('❌ foodTruckDatabase 不是有效陣列');
                return false;
            }
            
            // 檢查每個餐車資料
            let validCount = 0;
            foodTruckDatabase.forEach((truck, index) => {
                if (truck && truck.id && truck.title && truck.src) {
                    validCount++;
                } else {
                    console.log(`⚠️ 餐車 ${index} 資料不完整:`, truck);
                    console.log(`   - ID: ${truck?.id || '缺少'}`);
                    console.log(`   - Title: ${truck?.title || '缺少'}`);
                    console.log(`   - Src: ${truck?.src || '缺少'}`);
                    console.log(`   - 編輯狀態: ${truck?.isEditing || false}`);
                }
            });
            
            console.log(`📊 資料驗證結果: ${validCount}/${foodTruckDatabase.length} 個有效餐車`);
            return validCount > 0;
        }

        // ==================== 資料管理模組 ====================
            
        // 資料管理器 - 負責所有資料操作
        const DataManager = {
            // 儲存資料到本地
            saveToLocal() {
            const data = {
                foodTrucks: foodTruckDatabase,
                    lastUpdated: new Date().toISOString(),
                    version: '1.0',
                    syncCount: this.getSyncCount()
            };
            
            localStorage.setItem('foodTruckData', JSON.stringify(data));
            sessionStorage.setItem('foodTruckData', JSON.stringify(data));
            
                console.log('💾 資料已儲存到本地儲存');
                return data;
            },
            
            // 從本地載入資料（更積極的載入策略）
            loadFromLocal() {
                console.log('📱 檢查本地儲存資料...');
                const localData = localStorage.getItem('foodTruckData');
                
                if (!localData) {
                    console.log('📱 localStorage 中沒有 foodTruckData');
                    return null;
                }
                
                try {
                    const data = JSON.parse(localData);
                    console.log('📱 成功解析本地資料');
                    
                    if (data && data.foodTrucks && Array.isArray(data.foodTrucks) && data.foodTrucks.length > 0) {
                        console.log(`📱 本地資料包含 ${data.foodTrucks.length} 個餐車`);
                        console.log(`📱 最後更新時間: ${data.lastUpdated}`);
                        
                        // 檢查是否有編輯中的餐車
                        const editingCount = data.foodTrucks.filter(truck => truck.isEditing).length;
                        if (editingCount > 0) {
                            console.log(`📱 ⚠️ 發現 ${editingCount} 個餐車正在編輯中，優先使用本地資料`);
                        }
                        
                        return data;
                    } else {
                        console.log('📱 本地資料格式不正確或為空');
                        return null;
                    }
                } catch (error) {
                    console.error('❌ 解析本地資料失敗:', error);
                    return null;
                }
            },
            
            // 從遠端載入資料
            async loadFromRemote() {
                try {
                    const response = await fetch('data.json?' + Date.now());
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    if (data && data.foodTrucks && Array.isArray(data.foodTrucks)) {
                        console.log('🌐 從遠端載入資料成功');
                        return data;
                    }
                    throw new Error('遠端資料格式不正確');
                } catch (error) {
                    console.error('❌ 從遠端載入資料失敗:', error);
                    throw error;
                }
            },
            
            // 獲取同步計數
            getSyncCount() {
                try {
                    const existingData = localStorage.getItem('foodTruckData');
                    if (existingData) {
                        const parsed = JSON.parse(existingData);
                        return parsed.syncCount || 0;
                    }
                } catch (error) {
                    console.warn('⚠️ 獲取同步計數失敗:', error);
                }
                return 0;
            },
            
            // 更新同步計數
            incrementSyncCount() {
                const currentCount = this.getSyncCount();
                const newCount = currentCount + 1;
                console.log(`📊 同步計數: ${currentCount} → ${newCount}`);
                return newCount;
            }
        };
        
        // 統一的本地儲存函數（向後兼容）
        function saveDataToLocal() {
            return DataManager.saveToLocal();
        }

        // 編輯狀態管理函數（向後兼容）
        function saveEditingState() {
            EditManager.saveState();
        }

        // 獨立的資料修復函數
        function repairData() {
            console.log('🔧 開始修復資料...');
            
            // 1. 修復 foodTruckDatabase
            if (!foodTruckDatabase || !Array.isArray(foodTruckDatabase)) {
                console.log('🔧 修復 foodTruckDatabase 陣列');
                foodTruckDatabase = [];
            }
            
            // 2. 修復每個餐車資料
            foodTruckDatabase = foodTruckDatabase.filter(truck => {
                if (!truck || typeof truck !== 'object') return false;
                if (!truck.id || !truck.title || !truck.src) return false;
                return true;
            });
            
            // 3. 重新設定優先級和預設值（保留編輯狀態）
            foodTruckDatabase.forEach((truck, index) => {
                truck.priority = index + 1;
                if (truck.isActive === undefined) truck.isActive = true;
                if (!truck.category) truck.category = 'main';
                // 重要：保留編輯狀態，絕對不要重置！
                // truck.isEditing 保持原值，不進行任何修改
                console.log(`🔧 修復餐車 ${index}: ${truck.title}, 編輯狀態: ${truck.isEditing}`);
            });
            
            console.log(`🔧 資料修復完成: ${foodTruckDatabase.length} 個有效餐車`);
            return foodTruckDatabase.length;
        }

        // 獨立的初始化函數
        function initializeData() {
            console.log('🔄 初始化資料狀態...');
            
            // 1. 驗證資料完整性
            const isValid = validateData();
            
            // 2. 如果資料無效，嘗試修復
            if (!isValid) {
                console.log('🔧 資料無效，開始修復...');
                const repairedCount = repairData();
                console.log(`🔧 修復完成: ${repairedCount} 個餐車`);
            }
            
            // 3. 確保 foodTruckDatabase 有資料
            if (!foodTruckDatabase || foodTruckDatabase.length === 0) {
                console.log('⚠️ foodTruckDatabase 為空，保持空狀態');
                // 保持空陣列，不載入預設資料
            }
            
            // 4. 初始化 filteredTrucks
            filteredTrucks = [...foodTruckDatabase];
            
            // 5. 確保 selectedTrucks 是有效的 Set
            if (!selectedTrucks || !(selectedTrucks instanceof Set)) {
                selectedTrucks = new Set();
            }
            
            console.log(`✅ 資料初始化完成: ${foodTruckDatabase.length} 個餐車`);
            
            return {
                foodTruckCount: foodTruckDatabase.length,
                filteredCount: filteredTrucks.length,
                hasData: foodTruckDatabase.length > 0,
                isValid: isValid
            };
        }

        let isSaving = false;
        let lastSaveTime = 0;
        
        // ==================== 同步管理模組 ====================
        
        const SyncManager = {
            // 手動儲存並同步
            async manualSave() {
            const now = Date.now();
            
            if (isSaving || now - lastSaveTime < 300) {
                console.log('⚠️ 跳過重複儲存');
                return;
            }
            
            isSaving = true;
            lastSaveTime = now;
            
                // 1. 儲存到本地
                const data = DataManager.saveToLocal();
                
                // 2. 增加同步計數
                data.syncCount = DataManager.incrementSyncCount();
            localStorage.setItem('foodTruckData', JSON.stringify(data));
            sessionStorage.setItem('foodTruckData', JSON.stringify(data));
            
            console.log('💾 資料已儲存到本地');
            
            try {
                    // 3. 檢查 GitHub 設定
                const status = SimpleGitHubSync.getProjectStatus();
                
                if (!status.hasToken) {
                        // 靜默處理，不顯示 Token 設定提醒
                        showSyncStatus('❌ 未設定 Token，僅儲存到本地');
                    } else {
                    await validateAndSync(data);
                }
            } catch (error) {
                    console.error('同步失敗:', error);
                    showSyncStatus('❌ 同步失敗，但已儲存到本地');
                    // 移除自動下載檔案功能
                }
                
                setTimeout(() => {
                    isSaving = false;
                }, 300);
            },
            
            // 處理 Token 設定（靜默模式，不顯示提醒）
            async handleTokenSetup(data) {
                try {
                    // 直接嘗試同步，不顯示確認對話框
                    await validateAndSync(data);
                } catch (error) {
                    // 如果同步失敗，僅儲存到本地，不顯示錯誤提醒
                    console.log('⚠️ 同步失敗，僅儲存到本地:', error.message);
                    showSyncStatus('💾 已儲存到本地（未同步到遠端）');
                }
            }
        };
        
        // 手動儲存資料函數（向後兼容）
        async function manualSaveData() {
            await SyncManager.manualSave();
        }

        async function validateAndSync(data) {
            try {
                console.log('🔍 開始驗證 Token 和同步...');
                
                // 驗證 Token
                const validation = await SimpleGitHubSync.validateToken();
                console.log('🔍 Token 驗證結果:', validation);
                
                if (!validation.valid) {
                    throw new Error(validation.message);
                }
                
                showSyncStatus('🔄 正在同步到 GitHub...');
                
                // 同步到 GitHub
                const result = await SimpleGitHubSync.syncData(data);
                console.log('✅ 同步結果:', result);
                
                showSyncStatus('✅ 資料已同步到 GitHub！');
                
                // 靜默成功，只顯示狀態訊息
                console.log('✅ 同步成功:', result.commitUrl);
                
            } catch (error) {
                console.error('❌ 同步失敗詳細錯誤:', error);
                console.error('❌ 錯誤堆疊:', error.stack);
                
                // 提供更詳細的錯誤訊息
                let errorMessage = error.message;
                if (error.message.includes('401')) {
                    errorMessage = 'Token 無效或已過期，請檢查 GitHub Token';
                } else if (error.message.includes('403')) {
                    errorMessage = '權限不足，請確認 Token 有 repo 權限';
                } else if (error.message.includes('404')) {
                    errorMessage = '找不到倉庫或檔案，請檢查專案設定';
                } else if (error.message.includes('CORS')) {
                    errorMessage = '網路連線問題，請檢查網路設定';
                }
                
                showSyncStatus(`❌ 同步失敗：${errorMessage}`);
                
                // 移除自動下載檔案功能
            }
        }
        
        function autoSaveData() {
            console.log('🔄 資料已更新（未同步）');
        }
        
        function updateDataJsonAndPush(data) {
            // 已移除自動下載和彈出視窗功能
            console.log('📄 資料已更新，但未自動下載檔案');
            showSyncStatus('📄 資料已更新到本地');
        }

        function showSyncStatus(message) {
            const syncStatus = document.getElementById('syncStatus');
            const syncMessage = document.getElementById('syncMessage');
            
            syncMessage.textContent = message;
            syncStatus.style.display = 'block';
            
            setTimeout(() => {
                syncStatus.style.display = 'none';
            }, 3000);
        }

        function saveFoodTruckData() {
            const data = {
                foodTrucks: foodTruckDatabase,
                lastUpdated: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            autoSaveData();
            showAlert('資料已匯出為data.json並儲存到本地', 'success');
        }

        function updateStats() {
            const total = foodTruckDatabase.length;
            const active = foodTruckDatabase.filter(t => t.isActive).length;
            const inactive = total - active;
            
            // 移除了統計卡片的更新，因為已經刪除了統計區域
            console.log(`統計更新: 總數${total}, 已上架${active}, 已下架${inactive}`);
        }

        function showAlert(message, type = 'success') {
            const alert = document.getElementById('alertMessage');
            alert.className = `alert alert-${type}`;
            alert.textContent = message;
            alert.style.display = 'block';
            
            setTimeout(() => {
                alert.style.display = 'none';
            }, 3000);
        }

        function applyFilters() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const statusFilter = document.getElementById('statusFilter').value;
            const sortBy = document.getElementById('sortBy').value;

            // 確保 foodTruckDatabase 有資料
            if (!foodTruckDatabase || foodTruckDatabase.length === 0) {
                console.log('⚠️ foodTruckDatabase 為空，無法篩選');
                filteredTrucks = [];
                renderTruckCards();
                updateStats();
                return;
            }

            filteredTrucks = foodTruckDatabase.filter(truck => {
                const matchesSearch = truck.title.toLowerCase().includes(searchTerm) || 
                                    truck.alt.toLowerCase().includes(searchTerm);
                const matchesStatus = statusFilter === 'all' || 
                                    (statusFilter === 'active' && truck.isActive) ||
                                    (statusFilter === 'inactive' && !truck.isActive);
                return matchesSearch && matchesStatus;
            });

            filteredTrucks.sort((a, b) => {
                switch(sortBy) {
                    case 'title':
                        return a.title.localeCompare(b.title);
                    case 'id':
                        return a.id.localeCompare(b.id);
                    case 'priority':
                    default:
                        return a.priority - b.priority;
                }
            });

            console.log(`🔍 篩選結果: ${filteredTrucks.length} 個餐車`);
            renderTruckCards();
            updateStats();
        }

        function clearFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('statusFilter').value = 'all';
            document.getElementById('sortBy').value = 'priority';
            
            // 確保 foodTruckDatabase 有資料
            if (!foodTruckDatabase || foodTruckDatabase.length === 0) {
                console.log('⚠️ foodTruckDatabase 為空，無法清除篩選');
                filteredTrucks = [];
            } else {
                filteredTrucks = [...foodTruckDatabase];
            }
            
            console.log(`🔄 清除篩選: ${filteredTrucks.length} 個餐車`);
            renderTruckCards();
            updateStats();
        }

        function showImageModal(src, alt, link = '') {
            const modal = document.getElementById('imageModal');
            const modalImage = document.getElementById('modalImage');
            modalImage.src = src;
            modalImage.alt = alt;
            
            if (link) {
                modalImage.style.cursor = 'pointer';
                modalImage.onclick = function() {
                    window.open(link, '_blank');
                };
            } else {
                modalImage.style.cursor = 'default';
                modalImage.onclick = null;
            }
            
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        function hideImageModal() {
            const modal = document.getElementById('imageModal');
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }

        function toggleTruckSelection(truckId) {
            if (selectedTrucks.has(truckId)) {
                selectedTrucks.delete(truckId);
            } else {
                selectedTrucks.add(truckId);
            }
            updateBatchActions();
            renderTruckCards();
        }

        function updateBatchActions() {
            const batchActions = document.getElementById('batchActions');
            const selectedCount = document.getElementById('selectedCount');
            
            if (selectedTrucks.size > 0) {
                batchActions.classList.add('show');
                selectedCount.textContent = selectedTrucks.size;
            } else {
                batchActions.classList.remove('show');
            }
        }

        async function batchToggle(isActive) {
            if (selectedTrucks.size === 0) return;
            
            let count = 0;
            selectedTrucks.forEach(truckId => {
                const truck = foodTruckDatabase.find(t => t.id === truckId);
                if (truck) {
                    truck.isActive = isActive;
                    count++;
                }
            });
            
            // 即時更新本地儲存
            saveDataToLocal();
            
            showAlert(`已${isActive ? '上架' : '下架'} ${count} 個餐車`, 'success');
            clearSelection();
            applyFilters();
            
            // 批量狀態變更完成，等待手動同步
            console.log('✅ 批量狀態變更完成，請點擊「儲存並同步」按鈕進行遠端同步');
        }

        function clearSelection() {
            selectedTrucks.clear();
            updateBatchActions();
            renderTruckCards();
        }

        async function batchDelete() {
            if (selectedTrucks.size === 0) return;
            
            const confirmDelete = confirm(`確定要刪除選中的 ${selectedTrucks.size} 個餐車嗎？\n\n此操作無法復原！`);
            if (confirmDelete) {
                let count = 0;
                const truckIdsToDelete = Array.from(selectedTrucks);
                
                truckIdsToDelete.forEach(truckId => {
                    const index = foodTruckDatabase.findIndex(t => t.id === truckId);
                    if (index > -1) {
                        foodTruckDatabase.splice(index, 1);
                        count++;
                    }
                });
                
                foodTruckDatabase.forEach((t, idx) => {
                    t.priority = idx + 1;
                });
                
                // 即時更新本地儲存
                saveDataToLocal();
                
                showAlert(`已刪除 ${count} 個餐車`, 'success');
                clearSelection();
                applyFilters();
                renderPreview();
                
                // 批量刪除完成，等待手動同步
                console.log('✅ 批量刪除完成，請點擊「儲存並同步」按鈕進行遠端同步');
            }
        }

        async function deleteTruck(truckId) {
            const truck = foodTruckDatabase.find(t => t.id === truckId);
            if (truck) {
                const confirmDelete = confirm(`確定要刪除餐車 "${truck.title}" 嗎？\n\n此操作無法復原！`);
                if (confirmDelete) {
                    const index = foodTruckDatabase.findIndex(t => t.id === truckId);
                    if (index > -1) {
                        foodTruckDatabase.splice(index, 1);
                        
                        foodTruckDatabase.forEach((t, idx) => {
                            t.priority = idx + 1;
                        });
                        
                        // 即時更新本地儲存
                        saveDataToLocal();
                        
                        showAlert(`餐車 "${truck.title}" 已刪除`, 'success');
                        updateStats();
                        applyFilters();
                        renderPreview();
                        
                        // 刪除完成，等待手動同步
                        console.log('✅ 刪除完成，請點擊「儲存並同步」按鈕進行遠端同步');
                    }
                }
            }
        }

        function renderTruckCards() {
            console.log('🎨 renderTruckCards 開始執行...');
            
            const grid = document.getElementById('truckGrid');
            if (!grid) {
                console.error('❌ 找不到 truckGrid 元素');
                return;
            }
            
            console.log('✅ 找到 truckGrid 元素');
            grid.innerHTML = '';
            
            // 確保 foodTruckDatabase 有資料
            if (!foodTruckDatabase || foodTruckDatabase.length === 0) {
                console.log('⚠️ foodTruckDatabase 為空，顯示空狀態');
                console.log('🔍 foodTruckDatabase 詳細資訊:', foodTruckDatabase);
                grid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #64748b;">暫無餐車資料</div>';
                return;
            }
            
            // 確保 filteredTrucks 有資料
            if (!filteredTrucks || filteredTrucks.length === 0) {
                console.log('⚠️ filteredTrucks 為空，重新初始化');
                filteredTrucks = [...foodTruckDatabase];
            }
            
            console.log(`🖼️ 渲染 ${filteredTrucks.length} 個餐車卡片 (總共 ${foodTruckDatabase.length} 個)`);
            console.log('🔍 filteredTrucks 詳細資訊:', filteredTrucks);
            
            filteredTrucks.forEach(truck => {
                const isSelected = selectedTrucks.has(truck.id);
                const isEditing = truck.isEditing || false;
                const card = document.createElement('div');
                card.className = `truck-card ${truck.isActive ? 'active' : 'inactive'} ${isSelected ? 'selected' : ''} ${isEditing ? 'editing' : ''}`;
                
                let linkButtons = '';
                let editLinksHTML = '';
                
                if (isEditing) {
                    // 編輯模式的連結輸入
                    const links = Array.isArray(truck.link) ? truck.link : [];
                    editLinksHTML = `
                        <div class="edit-links-container">
                            ${[1,2,3].map(i => {
                                const link = links[i-1] || { text: '', url: '' };
                                return `
                                    <div class="edit-link-group">
                                        <div>
                                            <div class="edit-link-label">按鈕${i}</div>
                                            <input type="text" class="truck-link-input" 
                                                   id="edit-text-${truck.id}-${i}" 
                                                   value="${link.text || ''}" 
                                                   placeholder="文字" maxlength="10">
                                        </div>
                                        <div>
                                            <div class="edit-link-label">網址${i}</div>
                                            <input type="url" class="truck-link-input" 
                                                   id="edit-url-${truck.id}-${i}" 
                                                   value="${link.url || ''}" 
                                                   placeholder="https://...">
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                } else {
                    // 顯示模式的連結按鈕
                    if (truck.link && Array.isArray(truck.link)) {
                        linkButtons = truck.link.map(link => 
                            `<a href="${link.url}" target="_blank" class="truck-link-btn">${link.text}</a>`
                        ).join('');
                    }
                }
                
                card.innerHTML = `
                    <div class="truck-image-container">
                        <div class="drag-handle" title="拖曳排序">⋮⋮</div>
                        <div class="truck-priority-badge">#${truck.priority}</div>
                        <input type="checkbox" class="truck-checkbox" ${isSelected ? 'checked' : ''} 
                               onchange="toggleTruckSelection('${truck.id}')">
                        <img src="${truck.src}" alt="${truck.alt}" class="truck-image" 
                             onclick="showImageModal('${truck.src}', '${truck.alt}', '${truck.imgLink || ''}')"
                             onerror="this.src='https://via.placeholder.com/200x120/e2e8f0/64748b?text=圖片載入失敗'">
                        <div class="move-buttons">
                            <button class="move-btn" onclick="moveTruck('${truck.id}', 'up')" title="上移">↑</button>
                            <button class="move-btn" onclick="moveTruck('${truck.id}', 'down')" title="下移">↓</button>
                        </div>
                    </div>
                    
                    <div class="truck-info">
                        ${isEditing ? `
                            <input type="text" class="truck-title-input" 
                                   id="edit-title-${truck.id}" 
                                   value="${truck.title}" placeholder="餐車名稱">
                            <textarea class="truck-alt-input" 
                                      id="edit-alt-${truck.id}" 
                                      placeholder="圖片描述">${truck.alt}</textarea>
                            ${editLinksHTML}
                        ` : `
                            <div class="truck-title" onclick="editTitle('${truck.id}')" title="點擊編輯">${truck.title}</div>
                            <div class="truck-alt">${truck.alt}</div>
                            ${linkButtons ? `<div class="truck-links">${linkButtons}</div>` : ''}
                        `}
                        
                        <div class="truck-actions">
                            <div>
                                <span class="status-badge status-${truck.isActive ? 'active' : 'inactive'}">
                                    ${truck.isActive ? '已上架' : '已下架'}
                                </span>
                            </div>
                            <div style="display: flex; gap: 0.25rem;">
                                ${truck.isActive ? 
                                    `<button class="btn btn-danger btn-sm" onclick="toggleTruck('${truck.id}')">下架</button>` :
                                    `<button class="btn btn-success btn-sm" onclick="toggleTruck('${truck.id}')">上架</button>`
                                }
                                ${isEditing ? 
                                    `<button class="btn btn-success btn-sm" onclick="saveTruckEdit('${truck.id}')">儲存</button>
                                     <button class="btn btn-secondary btn-sm" onclick="cancelTruckEdit('${truck.id}')">取消</button>` :
                                    `<button class="btn btn-warning btn-sm" onclick="startTruckEdit('${truck.id}')">編輯</button>`
                                }
                                <button class="btn btn-danger btn-sm" onclick="deleteTruck('${truck.id}')">刪除</button>
                            </div>
                        </div>
                    </div>
                `;
                
                grid.appendChild(card);
            });
            
            // 初始化拖曳功能
            setTimeout(() => {
                updateDragEvents();
            }, 100);
        }

        // ==================== 編輯函數（使用新的 EditManager） ====================

        // 開始編輯模式
        function startTruckEdit(truckId) {
            if (EditManager.startEdit(truckId)) {
                renderTruckCards();
            }
        }

        // 儲存編輯
        async function saveTruckEdit(truckId) {
            const success = await EditManager.saveEdit(truckId);
            if (success) {
            const truck = foodTruckDatabase.find(t => t.id === truckId);
            showAlert(`餐車 "${truck.title}" 已更新並儲存`, 'success');
            renderTruckCards();
            renderPreview();
            
            // 編輯完成，等待手動同步
            console.log('✅ 編輯完成，請點擊「儲存並同步」按鈕進行遠端同步');
        }

        // 取消編輯
        function cancelTruckEdit(truckId) {
            if (EditManager.cancelEdit(truckId)) {
                renderTruckCards();
            }
        }

        // 簡化原有的編輯函數
        function editTruck(truckId) {
            startTruckEdit(truckId);
        }

        function renderPreview() {
            const preview = document.getElementById('marqueePreview');
            const activeTrucks = foodTruckDatabase.filter(t => t.isActive).sort((a, b) => a.priority - b.priority);
            
            preview.innerHTML = '';
            
            if (activeTrucks.length === 0) {
                console.log('🖼️ 沒有活躍的餐車，預覽為空');
                return;
            }
            
            activeTrucks.forEach(truck => {
                const item = document.createElement('div');
                item.className = 'marquee-item-preview';
                item.innerHTML = `<img src="${truck.src}" alt="${truck.alt}" onerror="this.src='https://via.placeholder.com/80x60/cccccc/666666?text=圖片載入失敗'">`;
                preview.appendChild(item);
            });
            
            console.log(`🖼️ 預覽已更新，顯示 ${activeTrucks.length} 個餐車`);
        }

        async function toggleTruck(truckId) {
            const truck = foodTruckDatabase.find(t => t.id === truckId);
            if (truck) {
                truck.isActive = !truck.isActive;
                
                // 即時更新本地儲存
                saveDataToLocal();
                
                showAlert(`餐車 "${truck.title}" 已${truck.isActive ? '上架' : '下架'}`, 'success');
                updateStats();
                applyFilters();
                renderPreview();
                
                // 狀態變更完成，等待手動同步
                console.log('✅ 狀態變更完成，請點擊「儲存並同步」按鈕進行遠端同步');
            }
        }

        async function editTitle(truckId) {
            const truck = foodTruckDatabase.find(t => t.id === truckId);
            if (!truck) return;
            
            const newTitle = prompt('請輸入餐車名稱:', truck.title || '');
            if (newTitle !== null && newTitle.trim() !== '') {
                truck.title = newTitle.trim();
                
                // 即時更新本地儲存
                saveDataToLocal();
                
                showAlert('餐車名稱已更新並儲存', 'success');
                applyFilters();
                
                // 標題變更完成，等待手動同步
                console.log('✅ 標題變更完成，請點擊「儲存並同步」按鈕進行遠端同步');
            }
        }

        async function moveTruck(truckId, direction) {
            const truck = foodTruckDatabase.find(t => t.id === truckId);
            if (truck) {
                const currentIndex = foodTruckDatabase.findIndex(t => t.id === truckId);
                const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
                
                if (newIndex >= 0 && newIndex < foodTruckDatabase.length) {
                    [foodTruckDatabase[currentIndex], foodTruckDatabase[newIndex]] = 
                    [foodTruckDatabase[newIndex], foodTruckDatabase[currentIndex]];
                    
                    foodTruckDatabase.forEach((t, index) => {
                        t.priority = index + 1;
                    });
                    
                    // 即時更新本地儲存
                    saveDataToLocal();
                    
                    showAlert(`餐車 "${truck.title}" 已${direction === 'up' ? '上移' : '下移'}`, 'success');
                    applyFilters();
                    renderPreview();
                    
                    // 排序變更完成，等待手動同步
                    console.log('✅ 排序變更完成，請點擊「儲存並同步」按鈕進行遠端同步');
                }
            }
        }

        function fillExample(text, url) {
            for (let i = 1; i <= 3; i++) {
                const textInput = document.getElementById(`newTruckText${i}`);
                const urlInput = document.getElementById(`newTruckLink${i}`);
                
                if (!textInput.value && !urlInput.value) {
                    textInput.value = text;
                    urlInput.value = url;
                    
                    textInput.style.background = 'rgba(16, 185, 129, 0.1)';
                    urlInput.style.background = 'rgba(16, 185, 129, 0.1)';
                    
                    setTimeout(() => {
                        textInput.style.background = '';
                        urlInput.style.background = '';
                    }, 1000);
                    
                    showAlert(`已填入範例：${text}`, 'success');
                    break;
                }
            }
        }

        function openPostimageUpload() {
            window.open('https://postimages.org/', '_blank');
            showAlert('已開啟 Postimage 上傳頁面', 'success');
        }

        // 設定 GitHub Token
        function setupGitHubToken() {
            // 開啟安全的 Token 設定頁面
            window.open('secure-token-setup.html', '_blank', 'width=700,height=900,scrollbars=yes,resizable=yes');
        }
        
        // 測試 GitHub Token
        async function testGitHubToken() {
            try {
                showSyncStatus('🔄 正在測試 GitHub Token...');
                
                const validation = await SimpleGitHubSync.validateToken();
                
                if (validation.valid) {
                    showSyncStatus('✅ GitHub Token 驗證成功！');
                    console.log('✅ GitHub Token 有效，使用者:', validation.user?.login);
                } else {
                    showSyncStatus('❌ GitHub Token 驗證失敗');
                    console.error('❌ GitHub Token 無效:', validation.message);
                }
            } catch (error) {
                console.error('❌ Token 測試失敗:', error);
                showSyncStatus('❌ Token 測試失敗');
            }
        }
        
        // 開啟 Token 設定頁面
        function openTokenSetup() {
            window.open('secure-token-setup.html', '_blank', 'width=700,height=900,scrollbars=yes,resizable=yes');
        }

        // 檢查遠端更新
        async function checkForUpdates() {
            try {
                showSyncStatus('🔄 正在檢查遠端更新...');
                
                const status = SimpleGitHubSync.getProjectStatus();
                if (!status.hasToken) {
                    showAlert('請先設定 GitHub Token', 'danger');
                    return;
                }

                const updateInfo = await SimpleGitHubSync.checkForUpdates('data.json');
                
                if (updateInfo.hasUpdate) {
                    const shouldUpdate = confirm(
                        `發現遠端更新！\n\n` +
                        `遠端 SHA: ${updateInfo.remoteSha.substring(0, 8)}...\n` +
                        `本地 SHA: ${updateInfo.localSha ? updateInfo.localSha.substring(0, 8) + '...' : '無'}\n` +
                        `更新時間: ${new Date(updateInfo.lastModified).toLocaleString('zh-TW')}\n\n` +
                        `是否要下載遠端更新？`
                    );
                    
                    if (shouldUpdate) {
                        await pullRemoteData();
                    }
                } else {
                    showSyncStatus('✅ 已是最新版本');
                }
            } catch (error) {
                console.error('檢查更新失敗:', error);
                showAlert(`檢查更新失敗：${error.message}`, 'danger');
            }
        }

        // 從遠端拉取資料
        async function pullRemoteData() {
            try {
                showSyncStatus('🔄 正在下載遠端資料...');
                
                const result = await SimpleGitHubSync.pullData('data.json');
                const data = JSON.parse(result.content);
                
                // 更新本地資料
                foodTruckDatabase = data.foodTrucks;
                filteredTrucks = [...foodTruckDatabase];
                
                // 儲存到本地
                saveDataToLocal();
                
                showAlert('已從遠端更新資料', 'success');
                applyFilters();
                renderPreview();
                showSyncStatus('✅ 遠端資料已同步');
                
            } catch (error) {
                console.error('拉取遠端資料失敗:', error);
                showAlert(`拉取遠端資料失敗：${error.message}`, 'danger');
            }
        }

        // 調試函數：檢查資料狀態
        function debugDataStatus() {
            console.log('🔍 資料狀態檢查:');
            console.log(`  foodTruckDatabase: ${foodTruckDatabase ? foodTruckDatabase.length : 'undefined'} 個餐車`);
            console.log(`  filteredTrucks: ${filteredTrucks ? filteredTrucks.length : 'undefined'} 個餐車`);
            console.log(`  selectedTrucks: ${selectedTrucks ? selectedTrucks.size : 'undefined'} 個選中`);
            
            // 檢查 localStorage 中的資料
            const localData = localStorage.getItem('foodTruckData');
            if (localData) {
                try {
                    const data = JSON.parse(localData);
                    console.log('📱 localStorage 資料:');
                    console.log(`  最後更新: ${data.lastUpdated}`);
                    console.log(`  版本: ${data.version}`);
                    console.log(`  同步計數: ${data.syncCount}`);
                    console.log(`  餐車數量: ${data.foodTrucks ? data.foodTrucks.length : 0}`);
                    
                    if (data.foodTrucks) {
                        const editingTrucks = data.foodTrucks.filter(truck => truck.isEditing);
                        console.log(`  正在編輯的餐車: ${editingTrucks.length} 個`);
                        editingTrucks.forEach(truck => {
                            console.log(`    - ${truck.title} (ID: ${truck.id})`);
                        });
                    }
                } catch (error) {
                    console.error('❌ 解析 localStorage 資料失敗:', error);
                }
            } else {
                console.log('📱 localStorage 中沒有 foodTruckData');
            }
            
            if (foodTruckDatabase && foodTruckDatabase.length > 0) {
                console.log('  餐車列表:');
                foodTruckDatabase.forEach((truck, index) => {
                    console.log(`    ${index + 1}. ${truck.title} (${truck.isActive ? '已上架' : '已下架'}) ${truck.isEditing ? '[編輯中]' : ''}`);
                });
            }
            
            // 顯示在頁面上
            const status = `資料狀態: 總共 ${foodTruckDatabase ? foodTruckDatabase.length : 0} 個餐車, 篩選後 ${filteredTrucks ? filteredTrucks.length : 0} 個餐車`;
            showAlert(status, 'info');
        }
        
        // 清除本地資料
        function clearLocalData() {
            if (confirm('確定要清除所有本地資料嗎？這會強制從 data.json 重新載入。')) {
                localStorage.removeItem('foodTruckData');
                sessionStorage.removeItem('foodTruckData');
                console.log('🗑️ 本地資料已清除');
                alert('本地資料已清除，頁面將重新載入');
                location.reload();
            }
        }
        
        // 測試 data.json 載入
        async function testDataJsonLoad() {
            console.log('🧪 開始測試 data.json 載入...');
            
            try {
                // 直接測試 fetch data.json
                const response = await fetch('data.json?' + Date.now());
                console.log('📡 Fetch 回應狀態:', response.status, response.statusText);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('📄 解析的資料:', data);
                console.log(`📊 餐車數量: ${data.foodTrucks ? data.foodTrucks.length : 0}`);
                
                if (data && data.foodTrucks && Array.isArray(data.foodTrucks)) {
                    // 直接應用資料
                    foodTruckDatabase = [...data.foodTrucks];
                    filteredTrucks = [...foodTruckDatabase];
                    
                    // 重新渲染
                    renderTruckCards();
                    updateStats();
                    
                    alert(`✅ 成功載入 ${data.foodTrucks.length} 個餐車！`);
                    console.log('✅ data.json 載入測試成功');
                } else {
                    throw new Error('資料格式不正確');
                }
                
            } catch (error) {
                console.error('❌ data.json 載入測試失敗:', error);
                alert(`❌ 載入失敗: ${error.message}`);
            }
        }
        
        // 測試 F5 重新載入流程
        function testF5Reload() {
            console.log('🧪 測試 F5 重新載入流程...');
            
            // 1. 檢查 localStorage
            const localData = localStorage.getItem('foodTruckData');
            console.log('1. localStorage 檢查:', localData ? '有資料' : '無資料');
            
            if (localData) {
                try {
                    const data = JSON.parse(localData);
                    console.log('   - 餐車數量:', data.foodTrucks ? data.foodTrucks.length : 0);
                    console.log('   - 最後更新:', data.lastUpdated);
                    
                    if (data.foodTrucks) {
                        const editingCount = data.foodTrucks.filter(t => t.isEditing).length;
                        console.log('   - 編輯中的餐車:', editingCount);
                    }
                } catch (error) {
                    console.error('   - 解析失敗:', error);
                }
            }
            
            // 2. 檢查當前 foodTruckDatabase
            console.log('2. 當前 foodTruckDatabase:', foodTruckDatabase ? foodTruckDatabase.length : 'undefined');
            
            // 3. 模擬 loadFoodTruckData 流程
            console.log('3. 模擬載入流程...');
            const localDataFromManager = DataManager.loadFromLocal();
            console.log('   - DataManager.loadFromLocal():', localDataFromManager ? '成功' : '失敗');
            
            // 4. 檢查資料是否一致
            if (localData && localDataFromManager) {
                const localStorageCount = JSON.parse(localData).foodTrucks?.length || 0;
                const managerCount = localDataFromManager.foodTrucks?.length || 0;
                console.log('4. 資料一致性檢查:');
                console.log(`   - localStorage: ${localStorageCount} 個餐車`);
                console.log(`   - DataManager: ${managerCount} 個餐車`);
                console.log(`   - 是否一致: ${localStorageCount === managerCount ? '是' : '否'}`);
            }
        }
        
        // 強制重新載入本地資料
        function forceReloadLocalData() {
            console.log('🔄 強制重新載入本地資料...');
            
            const localData = DataManager.loadFromLocal();
            if (localData) {
                console.log('✅ 找到本地資料，強制應用...');
                LoadStrategy.applyLocalData(localData);
                
                // 更新介面
                filteredTrucks = [...foodTruckDatabase];
                updateStats();
                applyFilters();
                renderPreview();
                
                console.log('✅ 本地資料已強制載入並更新介面');
                showAlert('已強制載入本地資料', 'success');
            } else {
                console.log('❌ 沒有找到本地資料');
                showAlert('沒有找到本地資料', 'warning');
            }
        }
        
        // 測試本地儲存功能
        function testLocalSave() {
            console.log('🧪 測試本地儲存功能...');
            
            // 1. 檢查當前資料
            console.log('1. 當前 foodTruckDatabase 狀態:');
            console.log(`   - 餐車數量: ${foodTruckDatabase ? foodTruckDatabase.length : 'undefined'}`);
            if (foodTruckDatabase && foodTruckDatabase.length > 0) {
                console.log(`   - 第一個餐車: ${foodTruckDatabase[0].title}`);
            }
            
            // 2. 嘗試儲存
            console.log('2. 嘗試儲存到本地...');
            const savedData = DataManager.saveToLocal();
            console.log('   - 儲存結果:', savedData ? '成功' : '失敗');
            if (savedData) {
                console.log(`   - 儲存的餐車數量: ${savedData.foodTrucks.length}`);
                console.log(`   - 最後更新時間: ${savedData.lastUpdated}`);
            }
            
            // 3. 檢查 localStorage
            console.log('3. 檢查 localStorage...');
            const storedData = localStorage.getItem('foodTruckData');
            if (storedData) {
                try {
                    const parsed = JSON.parse(storedData);
                    console.log(`   - localStorage 中的餐車數量: ${parsed.foodTrucks ? parsed.foodTrucks.length : 'undefined'}`);
                    console.log(`   - localStorage 中的最後更新: ${parsed.lastUpdated}`);
                } catch (error) {
                    console.error('   - 解析 localStorage 失敗:', error);
                }
            } else {
                console.log('   - localStorage 中沒有資料');
            }
            
            // 4. 嘗試重新載入
            console.log('4. 嘗試重新載入...');
            const reloadedData = DataManager.loadFromLocal();
            console.log('   - 重新載入結果:', reloadedData ? '成功' : '失敗');
            if (reloadedData) {
                console.log(`   - 重新載入的餐車數量: ${reloadedData.foodTrucks.length}`);
            }
            
            showAlert('本地儲存測試完成，請查看控制台', 'info');
        }

        // 強制重新載入資料
        async function forceReloadData() {
            console.log('🔄 強制重新載入資料...');
            
            try {
                // 1. 清除快取
                localStorage.removeItem('foodTruckData');
                sessionStorage.removeItem('foodTruckData');
                console.log('🗑️ 已清除本地快取');
                
                // 2. 強制從遠端載入資料
                const result = await loadFoodTruckData(true); // 強制遠端載入
                console.log(`📊 載入結果:`, result);
                
                // 3. 獨立初始化資料
                const initResult = initializeData();
                console.log(`🔧 初始化結果:`, initResult);
                
                // 4. 強制重新渲染
                updateStats();
                applyFilters();
                renderPreview();
                
                // 5. 顯示結果
                if (initResult.hasData) {
                    showAlert(`✅ 資料已重新載入: ${initResult.foodTruckCount} 個餐車`, 'success');
                } else {
                    showAlert('⚠️ 載入失敗，使用預設資料', 'warning');
                }
                
            } catch (error) {
                console.error('❌ 重新載入失敗:', error);
                
                // 即使失敗也要確保有資料顯示
                const initResult = initializeData();
                updateStats();
                applyFilters();
                renderPreview();
                
                showAlert(`❌ 重新載入失敗: ${error.message}，使用預設資料`, 'danger');
            }
        }
        
        // ==================== 拖曳排序功能 ====================
        
        let draggedElement = null;
        let draggedIndex = -1;
        let placeholderElement = null;
        
        // 初始化拖曳功能
        function initializeDragAndDrop() {
            console.log('🔄 初始化拖曳排序功能...');
            
            // 為所有餐車卡片添加拖曳事件
            const truckCards = document.querySelectorAll('.truck-card');
            truckCards.forEach((card, index) => {
                setupDragEvents(card, index);
            });
            
            // 為網格容器添加拖曳事件（處理拖曳到邊緣的情況）
            const grid = document.getElementById('truckGrid');
            if (grid) {
                setupGridDragEvents(grid);
            }
        }
        
        // 設置網格容器的拖曳事件
        function setupGridDragEvents(grid) {
            // 拖曳進入網格
            grid.addEventListener('dragenter', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            
            // 拖曳懸停在網格上
            grid.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                // 如果沒有拖曳到任何卡片上，在網格末尾添加佔位符
                if (draggedElement && !e.target.closest('.truck-card')) {
                    // 移除舊的佔位符
                    if (placeholderElement && placeholderElement.parentNode) {
                        placeholderElement.remove();
                    }
                    
                    // 創建新的佔位符
                    placeholderElement = document.createElement('div');
                    placeholderElement.className = 'truck-card drag-placeholder';
                    placeholderElement.style.height = '120px'; // 使用固定高度
                    placeholderElement.innerHTML = '<div style="text-align: center; padding: 2rem; color: #64748b;">放置到末尾</div>';
                    
                    // 添加到網格末尾
                    grid.appendChild(placeholderElement);
                }
            });
            
            // 拖曳離開網格
            grid.addEventListener('dragleave', function(e) {
                // 只有在完全離開網格時才移除佔位符
                if (!grid.contains(e.relatedTarget)) {
                    if (placeholderElement && placeholderElement.parentNode) {
                        placeholderElement.remove();
                        placeholderElement = null;
                    }
                }
            });
            
            // 在網格上放置
            grid.addEventListener('drop', function(e) {
                e.preventDefault();
                
                if (draggedElement && placeholderElement) {
                    // 計算目標索引（網格末尾）
                    const allCards = Array.from(grid.children).filter(child => 
                        child.classList.contains('truck-card') && !child.classList.contains('drag-placeholder')
                    );
                    
                    const sourceIndex = draggedIndex;
                    const targetIndex = allCards.length; // 插入到最後（在最後一個元素之後）
                    
                    console.log(`🔄 拖曳到網格末尾: 從位置 ${sourceIndex + 1} 到位置 ${targetIndex + 1} (最後位置)`);
                    console.log(`📋 拖曳行為：餐車將插入到最後位置，其他餐車保持原位`);
                    
                    // 執行重新排序
                    reorderTrucks(sourceIndex, targetIndex);
                }
            });
        }
        
        // 設置拖曳事件
        function setupDragEvents(card, index) {
            // 設置可拖曳
            card.draggable = true;
            
            // 觸控設備支援
            let touchStartY = 0;
            let touchStartX = 0;
            let isDragging = false;
            
            // 觸控開始
            card.addEventListener('touchstart', function(e) {
                if (e.touches.length === 1) {
                    touchStartY = e.touches[0].clientY;
                    touchStartX = e.touches[0].clientX;
                    isDragging = false;
                }
            }, { passive: true });
            
            // 觸控移動
            card.addEventListener('touchmove', function(e) {
                if (e.touches.length === 1 && !isDragging) {
                    const touchY = e.touches[0].clientY;
                    const touchX = e.touches[0].clientX;
                    const deltaY = Math.abs(touchY - touchStartY);
                    const deltaX = Math.abs(touchX - touchStartX);
                    
                    // 如果垂直移動距離大於水平移動距離，且移動距離足夠，則開始拖曳
                    if (deltaY > 10 && deltaY > deltaX) {
                        isDragging = true;
                        this.classList.add('dragging');
                        draggedElement = this;
                        draggedIndex = index;
                        
                        // 創建拖曳數據
                        const dragEvent = new DragEvent('dragstart', {
                            dataTransfer: new DataTransfer()
                        });
                        dragEvent.dataTransfer.effectAllowed = 'move';
                        dragEvent.dataTransfer.setData('text/html', this.outerHTML);
                        
                        console.log(`🔄 觸控拖曳開始: ${index}`);
                    }
                }
            }, { passive: true });
            
            // 觸控結束
            card.addEventListener('touchend', function(e) {
                if (isDragging) {
                    this.classList.remove('dragging');
                    draggedElement = null;
                    draggedIndex = -1;
                    isDragging = false;
                    
                    // 清除所有拖曳樣式
                    document.querySelectorAll('.truck-card').forEach(card => {
                        card.classList.remove('drag-over', 'drag-placeholder');
                    });
                    
                    // 移除佔位符
                    if (placeholderElement) {
                        placeholderElement.remove();
                        placeholderElement = null;
                    }
                    
                    console.log('🔄 觸控拖曳結束');
                }
            }, { passive: true });
            
            // 拖曳開始
            card.addEventListener('dragstart', function(e) {
                draggedElement = this;
                draggedIndex = index;
                this.classList.add('dragging');
                
                // 設置拖曳數據
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', this.outerHTML);
                
                console.log(`🔄 開始拖曳餐車: ${index}`);
            });
            
            // 拖曳結束
            card.addEventListener('dragend', function(e) {
                this.classList.remove('dragging');
                draggedElement = null;
                draggedIndex = -1;
                
                // 清除所有拖曳樣式
                document.querySelectorAll('.truck-card').forEach(card => {
                    card.classList.remove('drag-over');
                });
                
                // 移除佔位符
                if (placeholderElement && placeholderElement.parentNode) {
                    placeholderElement.remove();
                    placeholderElement = null;
                }
                
                console.log('🔄 拖曳結束');
            });
            
            // 拖曳進入
            card.addEventListener('dragenter', function(e) {
                e.preventDefault();
                if (this !== draggedElement) {
                    this.classList.add('drag-over');
                }
            });
            
            // 拖曳離開
            card.addEventListener('dragleave', function(e) {
                this.classList.remove('drag-over');
            });
            
            // 拖曳懸停
            card.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (this !== draggedElement) {
                    // 移除舊的佔位符
                    if (placeholderElement && placeholderElement.parentNode) {
                        placeholderElement.remove();
                    }
                    
                    // 創建新的佔位符
                    placeholderElement = document.createElement('div');
                    placeholderElement.className = 'truck-card drag-placeholder';
                    placeholderElement.style.height = this.offsetHeight + 'px';
                    placeholderElement.innerHTML = '<div style="text-align: center; padding: 2rem; color: #64748b;">放置位置</div>';
                    
                    // 計算插入位置
                    const rect = this.getBoundingClientRect();
                    const midpoint = rect.top + rect.height / 2;
                    
                    // 插入佔位符
                    if (e.clientY < midpoint) {
                        this.parentNode.insertBefore(placeholderElement, this);
                    } else {
                        // 如果是最後一個元素，直接插入到末尾
                        if (this.nextSibling) {
                            this.parentNode.insertBefore(placeholderElement, this.nextSibling);
                        } else {
                            this.parentNode.appendChild(placeholderElement);
                        }
                    }
                }
            });
            
            // 放置
            card.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                
                if (this !== draggedElement && draggedElement && placeholderElement) {
                    // 獲取所有實際的餐車卡片（排除佔位符）
                    const allCards = Array.from(this.parentNode.children).filter(child => 
                        child.classList.contains('truck-card') && !child.classList.contains('drag-placeholder')
                    );
                    
                    // 計算佔位符在實際卡片中的位置
                    const placeholderIndex = Array.from(this.parentNode.children).indexOf(placeholderElement);
                    const sourceIndex = draggedIndex;
                    
                    // 計算目標索引
                    let targetIndex = placeholderIndex;
                    
                    // 如果拖曳到更後面的位置，需要調整索引
                    if (sourceIndex < placeholderIndex) {
                        targetIndex = placeholderIndex - 1; // 因為源元素會被移除
                    }
                    
                    console.log(`🔄 拖曳從位置 ${sourceIndex + 1} 到位置 ${targetIndex + 1} (佔位符位置: ${placeholderIndex + 1})`);
                    console.log(`📋 拖曳行為：餐車將插入到位置 ${targetIndex + 1}，其他餐車會往後移動`);
                    
                    // 執行重新排序
                    reorderTrucks(sourceIndex, targetIndex);
                }
            });
        }
        
        // 重新排序餐車
        async function reorderTrucks(fromIndex, toIndex) {
            try {
                // 確保索引在有效範圍內
                const maxIndex = foodTruckDatabase.length - 1;
                fromIndex = Math.max(0, Math.min(fromIndex, maxIndex));
                toIndex = Math.max(0, Math.min(toIndex, maxIndex));
                
                // 如果源索引和目標索引相同，不需要移動
                if (fromIndex === toIndex) {
                    console.log('📍 位置相同，無需移動');
                    return;
                }
                
                console.log(`🔄 移動餐車從位置 ${fromIndex + 1} 到位置 ${toIndex + 1}`);
                
                // 獲取被拖曳的餐車
                const draggedTruck = foodTruckDatabase[fromIndex];
                
                // 如果拖曳到更後面的位置，目標索引需要調整
                let actualToIndex = toIndex;
                if (fromIndex < toIndex) {
                    actualToIndex = toIndex - 1; // 因為源元素會被移除，所以目標索引要減1
                }
                
                // 從陣列中移除拖曳的元素
                const removedTruck = foodTruckDatabase.splice(fromIndex, 1)[0];
                
                // 插入到新位置（其他元素會自動往後移動）
                foodTruckDatabase.splice(actualToIndex, 0, removedTruck);
                
                // 更新所有餐車的優先級
                foodTruckDatabase.forEach((truck, index) => {
                    truck.priority = index + 1;
                });
                
                console.log(`✅ 餐車 "${draggedTruck.title}" 已插入到位置 ${actualToIndex + 1}，其他餐車已同步調整`);
                
                // 立即更新本地儲存
                saveDataToLocal();
                
                // 重新渲染
                applyFilters();
                renderPreview();
                
                // 顯示成功訊息
                showAlert(`餐車 "${draggedTruck.title}" 已插入到位置 ${actualToIndex + 1}`, 'success');
                
            } catch (error) {
                console.error('❌ 重新排序失敗:', error);
                showAlert('❌ 重新排序失敗', 'danger');
            }
        }
        
        // 更新拖曳事件（當餐車卡片重新渲染時調用）
        function updateDragEvents() {
            const truckCards = document.querySelectorAll('.truck-card');
            truckCards.forEach((card, index) => {
                // 移除舊的事件監聽器
                card.removeEventListener('dragstart', card._dragStartHandler);
                card.removeEventListener('dragend', card._dragEndHandler);
                card.removeEventListener('dragenter', card._dragEnterHandler);
                card.removeEventListener('dragleave', card._dragLeaveHandler);
                card.removeEventListener('dragover', card._dragOverHandler);
                card.removeEventListener('drop', card._dropHandler);
                
                // 重新設置事件
                setupDragEvents(card, index);
            });
        }

        // ==================== Token 管理功能 ====================
        
        // 匯出 Token 設定
        function exportToken() {
            try {
                const token = SimpleProjectConfig.getGitHubToken();
                const project = SimpleProjectConfig.getCurrentProject();
                
                if (!token) {
                    showAlert('❌ 沒有找到 Token，請先設定 Token', 'danger');
                    return;
                }
                
                const tokenData = {
                    token: token,
                    project: project,
                    exportTime: new Date().toISOString(),
                    version: '1.0'
                };
                
                const blob = new Blob([JSON.stringify(tokenData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `github-token-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showAlert('✅ Token 設定已匯出', 'success');
                console.log('📤 Token 已匯出:', tokenData);
                
            } catch (error) {
                console.error('❌ 匯出 Token 失敗:', error);
                showAlert('❌ 匯出 Token 失敗', 'danger');
            }
        }
        
        // 匯入 Token 設定
        function importToken() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.style.display = 'none';
            
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const tokenData = JSON.parse(e.target.result);
                        
                        // 驗證檔案格式
                        if (!tokenData.token || !tokenData.project) {
                            throw new Error('檔案格式不正確');
                        }
                        
                        // 確認匯入
                        const confirmMessage = `確定要匯入 Token 設定嗎？\n\n` +
                            `專案：${tokenData.project.name}\n` +
                            `倉庫：${tokenData.project.repository}\n` +
                            `匯出時間：${new Date(tokenData.exportTime).toLocaleString('zh-TW')}\n\n` +
                            `⚠️ 這將覆蓋當前的 Token 設定！`;
                        
                        if (confirm(confirmMessage)) {
                            // 儲存 Token
                            SimpleProjectConfig.setGitHubToken(tokenData.token);
                            
                            // 更新專案設定（如果需要的話）
                            if (tokenData.project) {
                                const currentConfig = SimpleProjectConfig.load();
                                if (currentConfig) {
                                    currentConfig.currentProject = tokenData.project;
                                    currentConfig.lastUpdated = new Date().toISOString();
                                    SimpleProjectConfig.save(currentConfig);
                                }
                            }
                            
                            showAlert('✅ Token 設定已匯入', 'success');
                            console.log('📥 Token 已匯入:', tokenData);
                            
                            // 測試匯入的 Token
                            setTimeout(async () => {
                                try {
                                    const validation = await SimpleGitHubSync.validateToken();
                                    if (validation.valid) {
                                        showAlert('✅ Token 驗證成功！', 'success');
                                    } else {
                                        showAlert('⚠️ Token 驗證失敗，請檢查 Token 是否有效', 'warning');
                                    }
                                } catch (error) {
                                    console.error('Token 驗證失敗:', error);
                                }
                            }, 1000);
                        }
                        
                    } catch (error) {
                        console.error('❌ 匯入 Token 失敗:', error);
                        showAlert('❌ 匯入失敗：檔案格式不正確或已損壞', 'danger');
                    }
                };
                
                reader.readAsText(file);
            };
            
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
        }
        
        // 檢查 Token 狀態
        function checkTokenStatus() {
            const token = SimpleProjectConfig.getGitHubToken();
            const project = SimpleProjectConfig.getCurrentProject();
            
            if (!token) {
                return {
                    hasToken: false,
                    message: '❌ 未設定 Token',
                    action: '請點擊「🔑 設定 Token」按鈕設定'
                };
            }
            
            if (!project) {
                return {
                    hasToken: true,
                    hasProject: false,
                    message: '⚠️ Token 已設定，但專案設定不完整',
                    action: '請檢查專案設定'
                };
            }
            
            return {
                hasToken: true,
                hasProject: true,
                message: '✅ Token 和專案設定正常',
                action: '可以正常使用同步功能'
            };
        }
        
        // 顯示 Token 狀態
        function showTokenStatus() {
            const status = checkTokenStatus();
            const message = `${status.message}\n\n${status.action}`;
            
            if (status.hasToken && status.hasProject) {
                showAlert(message, 'success');
            } else if (status.hasToken) {
                showAlert(message, 'warning');
            } else {
                showAlert(message, 'danger');
            }
        }
        
        // 顯示拖曳排序說明
        function showDragHelp() {
            const message = `🖱️ 拖曳排序功能說明\n\n` +
                `📱 桌面版：\n` +
                `• 點擊並拖曳餐車卡片左上角的「⋮⋮」圖標\n` +
                `• 拖曳到想要的位置後放開\n` +
                `• 會顯示「放置位置」提示\n\n` +
                `📱 觸控版：\n` +
                `• 長按餐車卡片並上下拖曳\n` +
                `• 拖曳距離超過 10px 時開始排序\n` +
                `• 放開手指完成排序\n\n` +
                `✨ 特色：\n` +
                `• 即時保存並同步到遠端\n` +
                `• 支援批量操作\n` +
                `• 自動更新優先級\n\n` +
                `💡 提示：\n` +
                `• 也可以使用原有的「↑」「↓」按鈕\n` +
                `• 拖曳時卡片會變透明並旋轉\n` +
                `• 拖曳到其他卡片上會高亮顯示`;
            
            alert(message);
        }
        
        // 測試拖曳排序功能
        function testDragSort() {
            console.log('🧪 測試拖曳排序功能...');
            
            if (foodTruckDatabase.length < 2) {
                showAlert('❌ 需要至少 2 個餐車才能測試拖曳排序', 'warning');
                return;
            }
            
            // 測試移動第一個餐車到第二個位置
            const firstTruck = foodTruckDatabase[0];
            const secondTruck = foodTruckDatabase[1];
            
            console.log(`🧪 測試移動: "${firstTruck.title}" 到 "${secondTruck.title}" 的位置`);
            
            // 執行測試移動
            reorderTrucks(0, 1).then(() => {
                showAlert('✅ 拖曳排序測試完成！', 'success');
                
                // 2秒後恢復原位置
                setTimeout(() => {
                    reorderTrucks(1, 0).then(() => {
                        showAlert('🔄 已恢復原位置', 'info');
                    });
                }, 2000);
            }).catch(error => {
                console.error('❌ 拖曳排序測試失敗:', error);
                showAlert('❌ 拖曳排序測試失敗', 'danger');
            });
        }
        
        // ==================== 下拉選單功能 ====================
        
        // 切換下拉選單顯示/隱藏
        function toggleDropdown(dropdownId) {
            const dropdown = document.getElementById(dropdownId);
            const toggle = dropdown.previousElementSibling;
            
            if (dropdown.classList.contains('show')) {
                // 隱藏下拉選單
                dropdown.classList.remove('show');
                toggle.classList.remove('active');
            } else {
                // 隱藏其他下拉選單
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
                document.querySelectorAll('.dropdown-toggle.active').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // 顯示當前下拉選單
                dropdown.classList.add('show');
                toggle.classList.add('active');
            }
        }
        
        // 點擊外部關閉下拉選單
        function closeDropdowns() {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
            document.querySelectorAll('.dropdown-toggle.active').forEach(btn => {
                btn.classList.remove('active');
            });
        }
        
        // 切換除錯功能顯示
        function toggleDebugSection() {
            const debugSection = document.getElementById('debugSection');
            if (debugSection.style.display === 'none') {
                debugSection.style.display = 'block';
                showAlert('🔧 除錯功能已顯示', 'info');
            } else {
                debugSection.style.display = 'none';
                showAlert('🔧 除錯功能已隱藏', 'info');
            }
        }
        
        // 快速修復餐車載入問題
        function quickFixTruckLoading() {
            console.log('🔧 快速修復餐車載入問題...');
            
            // 1. 檢查當前狀態
            console.log('🔍 當前狀態檢查:');
            console.log(`  - foodTruckDatabase 長度: ${foodTruckDatabase ? foodTruckDatabase.length : 'undefined'}`);
            console.log(`  - filteredTrucks 長度: ${filteredTrucks ? filteredTrucks.length : 'undefined'}`);
            
            // 2. 強制從 data.json 載入
            fetch('data.json?' + Date.now())
                .then(response => response.json())
                .then(data => {
                    if (data && data.foodTrucks && Array.isArray(data.foodTrucks)) {
                        console.log(`✅ 成功載入 ${data.foodTrucks.length} 個餐車`);
                        
                        // 直接設置資料
                        foodTruckDatabase = [...data.foodTrucks];
                        filteredTrucks = [...foodTruckDatabase];
                        
                        // 重新渲染
                        renderTruckCards();
                        updateStats();
                        renderPreview();
                        
                        showAlert(`✅ 快速修復成功！載入 ${data.foodTrucks.length} 個餐車`, 'success');
                    } else {
                        throw new Error('資料格式不正確');
                    }
                })
                .catch(error => {
                    console.error('❌ 快速修復失敗:', error);
                    showAlert('❌ 快速修復失敗，請嘗試其他方法', 'danger');
                });
        }

        // 測試同步功能
        async function testSyncFunction() {
            console.log('🧪 開始測試同步功能...');
            showSyncStatus('🧪 正在測試同步功能...');
            
            try {
                // 0. 檢查模組是否載入
                // 使用內建的簡化版同步功能
                
                if (typeof SimpleProjectConfig === 'undefined') {
                    throw new Error('專案設定模組未載入，內建功能失敗');
                }
                
                // 1. 檢查專案狀態
                const status = SimpleGitHubSync.getProjectStatus();
                console.log('📊 專案狀態:', status);
                
                // 2. 測試專案設定
                const project = SimpleProjectConfig.getCurrentProject();
                console.log('📁 當前專案:', project);
                
                if (!project || !project.repository) {
                    showSyncStatus('❌ 專案設定不完整');
                    return;
                }
                
                // 3. 檢查 CORS 問題
                console.log('🌐 測試 GitHub API 連線...');
                try {
                    const testResponse = await fetch('https://api.github.com/zen');
                    console.log('✅ GitHub API 連線正常');
                } catch (corsError) {
                    console.error('❌ CORS 錯誤:', corsError);
                    showSyncStatus('❌ GitHub API CORS 限制');
                    
                    // 提供替代方案
                    const message = `同步測試失敗：\n\n` +
                        `❌ GitHub API CORS 限制\n\n` +
                        `💡 解決方案：\n` +
                        `1. 使用瀏覽器擴展（如 CORS Unblock）\n` +
                        `2. 使用代理服務器\n` +
                        `3. 手動上傳 data.json 到 GitHub\n\n` +
                        `🔗 您的倉庫：${project.website}`;
                    
                    alert(message);
                    return;
                }
                
                // 4. 測試 Token 驗證
                console.log('🔍 測試 Token 驗證...');
                const validation = await SimpleGitHubSync.validateToken();
                console.log('🔍 Token 驗證結果:', validation);
                
                if (!validation.valid) {
                    showSyncStatus(`❌ Token 驗證失敗: ${validation.message}`);
                    return;
                }
                
                // 5. 測試同步（使用當前資料）
                console.log('🔄 測試同步到 GitHub...');
                const data = DataManager.saveToLocal();
                const result = await SimpleGitHubSync.syncData(data);
                
                console.log('✅ 同步測試成功:', result);
                showSyncStatus('✅ 同步功能測試成功！');
                
                // 顯示成功訊息
                setTimeout(() => {
                    const message = `同步測試成功！\n\n` +
                        `📝 提交訊息：${result.commitMessage}\n` +
                        `🔗 查看提交：${result.commitUrl}\n` +
                        `🌐 網站：${project.website}`;
                    
                    alert(message);
                }, 1000);
                
            } catch (error) {
                console.error('❌ 同步測試失敗:', error);
                
                // 提供詳細的錯誤診斷
                let diagnosticMessage = `同步測試失敗：\n\n`;
                
                if (error.message.includes('401')) {
                    diagnosticMessage += '❌ Token 無效或已過期\n';
                    diagnosticMessage += '💡 請檢查 GitHub Token 是否正確\n';
                } else if (error.message.includes('403')) {
                    diagnosticMessage += '❌ 權限不足\n';
                    diagnosticMessage += '💡 請確認 Token 有 repo 權限\n';
                } else if (error.message.includes('404')) {
                    diagnosticMessage += '❌ 找不到倉庫或檔案\n';
                    diagnosticMessage += '💡 請檢查專案設定和倉庫 URL\n';
                } else if (error.message.includes('CORS') || error.name === 'TypeError') {
                    diagnosticMessage += '❌ CORS 跨域限制\n\n';
                    diagnosticMessage += '💡 解決方案：\n';
                    diagnosticMessage += '1. 安裝瀏覽器擴展（CORS Unblock）\n';
                    diagnosticMessage += '2. 使用代理服務器\n';
                    diagnosticMessage += '3. 手動上傳 data.json\n';
                    diagnosticMessage += '4. 使用 GitHub CLI 工具\n\n';
                    diagnosticMessage += '🔗 您的倉庫：https://github.com/sky770825/niceshow';
                } else {
                    diagnosticMessage += `❌ ${error.message}\n`;
                }
                
                diagnosticMessage += `\n🔍 詳細錯誤請查看控制台`;
                
                showSyncStatus(`❌ 同步測試失敗: ${error.message}`);
                alert(diagnosticMessage);
            }
        }


        document.getElementById('addTruckForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('newTruckTitle').value;
            const src = document.getElementById('newTruckSrc').value;
            const alt = document.getElementById('newTruckAlt').value || title;
            const imgLink = document.getElementById('newTruckImgLink').value.trim();
            
            const link1 = document.getElementById('newTruckLink1').value.trim();
            const link2 = document.getElementById('newTruckLink2').value.trim();
            const link3 = document.getElementById('newTruckLink3').value.trim();
            
            const text1 = document.getElementById('newTruckText1').value.trim() || '官網';
            const text2 = document.getElementById('newTruckText2').value.trim() || 'FB';
            const text3 = document.getElementById('newTruckText3').value.trim() || 'IG';
            
            const linkData = [];
            if (link1) linkData.push({ url: link1, text: text1 });
            if (link2) linkData.push({ url: link2, text: text2 });
            if (link3) linkData.push({ url: link3, text: text3 });
            
            const newTruck = {
                id: `truck_${Date.now()}`,
                src: src,
                alt: alt,
                title: title,
                imgLink: imgLink || '',
                link: linkData.length > 0 ? linkData : '',
                isActive: true,
                priority: foodTruckDatabase.length + 1,
                category: 'main'
            };
            
            foodTruckDatabase.push(newTruck);
            
            // 即時更新本地儲存
            saveDataToLocal();
            
            showAlert(`餐車 "${title}" 已新增並儲存`, 'success');
            
            document.getElementById('addTruckForm').reset();
            
            updateStats();
            applyFilters();
            renderPreview();
            
            // 新增餐車完成，等待手動同步
            console.log('✅ 新增餐車完成，請點擊「儲存並同步」按鈕進行遠端同步');
        });

        document.addEventListener('DOMContentLoaded', async function() {
            console.log('🚀 頁面載入完成，開始初始化...');
            
            // 檢查模組是否正確載入
            setTimeout(() => {
                console.log('🔍 檢查模組載入狀態...');
                console.log('  - SimpleProjectConfig:', typeof SimpleProjectConfig !== 'undefined' ? '✅ 已載入' : '❌ 未載入');
                console.log('  - SimpleGitHubSync:', typeof SimpleGitHubSync !== 'undefined' ? '✅ 已載入' : '❌ 未載入');
                
                if (typeof SimpleProjectConfig === 'undefined') {
                    console.error('❌ SimpleProjectConfig 未載入，內建專案設定功能失敗');
                    showAlert('❌ 專案設定模組載入失敗', 'danger');
                }
                
                if (typeof SimpleGitHubSync === 'undefined') {
                    console.error('❌ SimpleGitHubSync 未載入，內建同步功能失敗');
                    showAlert('❌ GitHub 同步模組載入失敗', 'danger');
                }
            }, 100);
            
            // 立即檢查並修復載入問題
            setTimeout(async () => {
                if (!foodTruckDatabase || foodTruckDatabase.length === 0) {
                    console.log('🔧 檢測到沒有資料，嘗試強制載入...');
                    try {
                        const response = await fetch('data.json?' + Date.now());
                        if (response.ok) {
                            const data = await response.json();
                            if (data && data.foodTrucks && Array.isArray(data.foodTrucks)) {
                                foodTruckDatabase = [...data.foodTrucks];
                                filteredTrucks = [...foodTruckDatabase];
                                renderTruckCards();
                                updateStats();
                                console.log(`✅ 自動修復完成，載入 ${data.foodTrucks.length} 個餐車`);
                            }
                        }
                    } catch (error) {
                        console.log('⚠️ 自動修復失敗:', error.message);
                    }
                }
            }, 500);
            
            try {
                // 檢查模組是否載入
                if (typeof SimpleProjectConfig === 'undefined') {
                    throw new Error('SimpleProjectConfig 模組未載入');
                }
                
                // 使用內建的 SimpleGitHubSync
                
                // 1. 初始化專案設定
                SimpleProjectConfig.initialize();
                console.log('✅ 專案設定已初始化');
                
                // 1.5. 檢查並設定 GitHub Token
                const existingToken = SimpleProjectConfig.getGitHubToken();
                if (!existingToken) {
                    console.log('⚠️ 未設定 GitHub Token，請使用設定頁面設定');
                    showAlert('請先設定 GitHub Token 才能使用同步功能', 'warning');
                } else {
                    console.log('✅ GitHub Token 已載入');
                }
                
                // 1.6. 檢查 Token 狀態
                const tokenStatus = checkTokenStatus();
                console.log('🔍 Token 狀態檢查:', tokenStatus);
                
                if (!tokenStatus.hasToken) {
                    console.log('⚠️ 未設定 Token，同步功能將無法使用');
                    showAlert('⚠️ 未設定 GitHub Token，請點擊「🔑 設定 Token」按鈕設定', 'warning');
                } else if (!tokenStatus.hasProject) {
                    console.log('⚠️ Token 已設定，但專案設定不完整');
                    showAlert('⚠️ 專案設定不完整，請檢查設定', 'warning');
                } else {
                    console.log('✅ Token 和專案設定正常');
                    
                    // 測試 Token 是否有效
                    try {
                        const validation = await SimpleGitHubSync.validateToken();
                        console.log('🔍 Token 驗證結果:', validation);
                        if (validation.valid) {
                            console.log('✅ Token 驗證成功，使用者:', validation.user?.login);
                        } else {
                            console.error('❌ Token 驗證失敗:', validation.message);
                            showAlert('⚠️ Token 驗證失敗，請檢查 Token 是否有效', 'warning');
                        }
                    } catch (error) {
                        console.error('❌ Token 驗證過程中發生錯誤:', error);
                        showAlert('⚠️ Token 驗證過程中發生錯誤，請檢查網路連線', 'warning');
                    }
                }
                
                // 2. 載入餐車資料
                const loadResult = await loadFoodTruckData();
                console.log('📊 資料載入結果:', loadResult);
                console.log('📊 載入後的 foodTruckDatabase 長度:', foodTruckDatabase ? foodTruckDatabase.length : 'undefined');
                
                // 3. 檢查是否需要初始化（只有在沒有有效資料時才初始化）
                let initResult;
                if (!foodTruckDatabase || foodTruckDatabase.length === 0) {
                    console.log('⚠️ 沒有有效資料，執行初始化...');
                    initResult = initializeData();
                console.log('🔧 資料初始化結果:', initResult);
                } else {
                    console.log('✅ 已有有效資料，跳過初始化');
                    // 只初始化 filteredTrucks 和 selectedTrucks
                    filteredTrucks = [...foodTruckDatabase];
                    if (!selectedTrucks || !(selectedTrucks instanceof Set)) {
                        selectedTrucks = new Set();
                    }
                    initResult = {
                        foodTruckCount: foodTruckDatabase.length,
                        hasData: true,
                        filteredCount: filteredTrucks.length
                    };
                    
                    console.log(`✅ 資料已載入: ${foodTruckDatabase.length} 個餐車`);
                }
                
                // 4. 渲染介面
                console.log(`🖼️ 開始渲染介面: ${initResult.foodTruckCount} 個餐車`);
                console.log(`🔍 渲染前檢查 - foodTruckDatabase 長度: ${foodTruckDatabase ? foodTruckDatabase.length : 'undefined'}`);
                console.log(`🔍 渲染前檢查 - filteredTrucks 長度: ${filteredTrucks ? filteredTrucks.length : 'undefined'}`);
                
                updateStats();
                applyFilters();
                renderTruckCards(); // 渲染餐車卡片
                renderPreview();
                
                // 檢查渲染結果
                setTimeout(() => {
                    const truckCards = document.querySelectorAll('.truck-card');
                    console.log(`🔍 渲染後檢查 - 實際渲染的卡片數量: ${truckCards.length}`);
                    if (truckCards.length === 0 && foodTruckDatabase && foodTruckDatabase.length > 0) {
                        console.log('⚠️ 檢測到資料已載入但沒有渲染，強制重新渲染...');
                        renderTruckCards();
                        updateStats();
                    }
                }, 100);
                
                // 5. 初始化拖曳功能
                setTimeout(() => {
                    initializeDragAndDrop();
                    console.log('✅ 拖曳排序功能已初始化');
                }, 500);
                
                // 5. 檢查渲染結果，如果沒有顯示餐車，強制重新載入
                setTimeout(() => {
                    const truckCards = document.querySelectorAll('.truck-card');
                    if (truckCards.length === 0 && foodTruckDatabase && foodTruckDatabase.length > 0) {
                        console.log('⚠️ 檢測到資料已載入但沒有渲染，強制重新渲染...');
                        renderTruckCards();
                        updateStats();
                    }
                }, 1000);
                
                // 5. 顯示載入結果
                if (initResult.hasData) {
                    console.log(`✅ 初始化完成: ${initResult.foodTruckCount} 個餐車已載入`);
                } else {
                    console.log('⚠️ 初始化完成: 使用預設資料');
                }
                
            } catch (error) {
                console.error('❌ 初始化失敗:', error);
                
                // 即使初始化失敗，也要確保有基本功能
                const initResult = initializeData();
                updateStats();
                applyFilters();
                renderPreview();
                
                showAlert('初始化失敗，使用預設資料', 'warning');
            }
            
            document.getElementById('searchInput').addEventListener('input', applyFilters);
            document.getElementById('statusFilter').addEventListener('change', applyFilters);
            document.getElementById('sortBy').addEventListener('change', applyFilters);
            
            document.querySelectorAll('.example-item').forEach(item => {
                item.addEventListener('click', function() {
                    this.classList.add('clicked');
                    setTimeout(() => {
                        this.classList.remove('clicked');
                    }, 300);
                });
            });
            
            document.addEventListener('keydown', function(e) {
                // 如果焦點在編輯模式的輸入框內，優先處理輸入框的 Ctrl+A
                if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                        e.preventDefault();
                        e.target.select();
                        return;
                    }
                }
                
                if (e.ctrlKey || e.metaKey) {
                    switch(e.key) {
                        case 'a':
                            e.preventDefault();
                            if (selectedTrucks.size === filteredTrucks.length) {
                                clearSelection();
                            } else {
                                filteredTrucks.forEach(truck => selectedTrucks.add(truck.id));
                                updateBatchActions();
                                renderTruckCards();
                            }
                            break;
                        case 's':
                            e.preventDefault();
                            manualSaveData();
                            break;
                    }
                }
                
                if (e.key === 'Escape') {
                    hideImageModal();
                    clearSelection();
                    closeDropdowns(); // 關閉下拉選單
                }
            });
            
            // 點擊外部關閉下拉選單
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.dropdown')) {
                    closeDropdowns();
                }
            });
        });
    
        });
