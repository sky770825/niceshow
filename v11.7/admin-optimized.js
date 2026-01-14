// 餐車管理系統 - 優化版 JavaScript
// 版本: 2.0 (優化版)

// 全域變數
let foodTruckDatabase = [];
let filteredTrucks = [];
let selectedTrucks = new Set();

// 專案設定管理
const SimpleProjectConfig = {
    load() {
        try {
            const config = localStorage.getItem('projectConfig');
            if (config) {
                return JSON.parse(config);
            }
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
    
    getGitHubToken() {
        try {
            return localStorage.getItem('githubToken');
        } catch (error) {
            console.error('取得 GitHub Token 失敗:', error);
            return null;
        }
    },
    
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
    }
};

// GitHub 同步功能
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

            const repoInfo = this.parseRepositoryUrl(this.currentProject.repository);
            if (!repoInfo) {
                throw new Error('無效的倉庫 URL');
            }

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

// 資料管理
const DataManager = {
    saveToLocal() {
        const data = {
            foodTrucks: foodTruckDatabase,
            lastUpdated: new Date().toISOString(),
            version: '2.0',
            syncCount: this.getSyncCount()
        };
        
        localStorage.setItem('foodTruckData', JSON.stringify(data));
        sessionStorage.setItem('foodTruckData', JSON.stringify(data));
        
        console.log('💾 資料已儲存到本地儲存');
        return data;
    },
    
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
    
    incrementSyncCount() {
        const currentCount = this.getSyncCount();
        const newCount = currentCount + 1;
        console.log(`📊 同步計數: ${currentCount} → ${newCount}`);
        return newCount;
    }
};

// 編輯管理
const EditManager = {
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
    
    async saveEdit(truckId) {
        const truck = foodTruckDatabase.find(t => t.id === truckId);
        if (!truck) return false;
        
        const newTitle = document.getElementById(`edit-title-${truckId}`)?.value.trim();
        const newAlt = document.getElementById(`edit-alt-${truckId}`)?.value.trim();
        
        if (!newTitle) {
            alert('餐車名稱不能為空！');
            return false;
        }
        
        truck.title = newTitle;
        truck.alt = newAlt || newTitle;
        
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
        
        this.saveState();
        console.log(`💾 餐車 "${truck.title}" 編輯已保存`);
        return true;
    },
    
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
    
    saveState() {
        console.log('💾 保存編輯狀態...');
        DataManager.saveToLocal();
        console.log('✅ 編輯狀態已保存');
    },
    
    hasEditingTruck() {
        return foodTruckDatabase && foodTruckDatabase.some(truck => truck.isEditing);
    },
    
    getEditingTrucks() {
        return foodTruckDatabase ? foodTruckDatabase.filter(truck => truck.isEditing) : [];
    }
};

// 同步管理
const SyncManager = {
    async manualSave() {
        const now = Date.now();
        
        if (isSaving || now - lastSaveTime < 300) {
            console.log('⚠️ 跳過重複儲存');
            return;
        }
        
        isSaving = true;
        lastSaveTime = now;
        
        const data = DataManager.saveToLocal();
        data.syncCount = DataManager.incrementSyncCount();
        localStorage.setItem('foodTruckData', JSON.stringify(data));
        sessionStorage.setItem('foodTruckData', JSON.stringify(data));
        
        console.log('💾 資料已儲存到本地');
        
        try {
            const status = SimpleGitHubSync.getProjectStatus();
            
            if (!status.hasToken) {
                showSyncStatus('❌ 未設定 Token，僅儲存到本地');
            } else {
                await this.validateAndSync(data);
            }
        } catch (error) {
            console.error('同步失敗:', error);
            showSyncStatus('❌ 同步失敗，但已儲存到本地');
        }
        
        setTimeout(() => {
            isSaving = false;
        }, 300);
    },
    
    async validateAndSync(data) {
        try {
            console.log('🔍 開始驗證 Token 和同步...');
            
            const validation = await SimpleGitHubSync.validateToken();
            console.log('🔍 Token 驗證結果:', validation);
            
            if (!validation.valid) {
                throw new Error(validation.message);
            }
            
            showSyncStatus('🔄 正在同步到 GitHub...');
            
            const result = await SimpleGitHubSync.syncData(data);
            console.log('✅ 同步結果:', result);
            
            showSyncStatus('✅ 資料已同步到 GitHub！');
            console.log('✅ 同步成功:', result.commitUrl);
            
        } catch (error) {
            console.error('❌ 同步失敗詳細錯誤:', error);
            
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
        }
    }
};

// 全域變數
let isSaving = false;
let lastSaveTime = 0;

// 主要功能函數
async function loadFoodTruckData(forceRemote = false) {
    console.log('🔄 開始載入餐車資料...');
    
    try {
        if (forceRemote) {
            const remoteData = await DataManager.loadFromRemote();
            return applyRemoteData(remoteData);
        } else {
            const localData = DataManager.loadFromLocal();
            if (localData) {
                return applyLocalData(localData);
            } else {
                const remoteData = await DataManager.loadFromRemote();
                return applyRemoteData(remoteData);
            }
        }
    } catch (error) {
        console.error('❌ 載入餐車資料失敗:', error);
        return applyDefaultData();
    }
}

function applyLocalData(data) {
    console.log('🔄 應用本地資料...');
    foodTruckDatabase = [...data.foodTrucks];
    filteredTrucks = [...foodTruckDatabase];
    renderTruckCards();
    updateStats();
    return { success: true, source: 'local', count: foodTruckDatabase.length };
}

function applyRemoteData(data) {
    console.log('🔄 應用遠端資料...');
    foodTruckDatabase = [...data.foodTrucks];
    filteredTrucks = [...foodTruckDatabase];
    DataManager.saveToLocal();
    renderTruckCards();
    updateStats();
    return { success: true, source: 'remote', count: foodTruckDatabase.length };
}

function applyDefaultData() {
    console.log('⚠️ 使用空狀態');
    foodTruckDatabase = [];
    filteredTrucks = [];
    renderTruckCards();
    updateStats();
    return { success: false, source: 'empty', count: 0 };
}

// 渲染餐車卡片
function renderTruckCards() {
    const grid = document.getElementById('truckGrid');
    if (!grid) return;
    
    if (filteredTrucks.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #64748b;">暫無餐車資料</div>';
        return;
    }
    
    grid.innerHTML = filteredTrucks.map(truck => createTruckCard(truck)).join('');
}

function createTruckCard(truck) {
    const isSelected = selectedTrucks.has(truck.id);
    const statusClass = truck.isActive ? 'active' : 'inactive';
    const selectedClass = isSelected ? 'selected' : '';
    const editingClass = truck.isEditing ? 'editing' : '';
    
    let linksHtml = '';
    if (truck.link && Array.isArray(truck.link)) {
        linksHtml = truck.link.map(link => 
            `<a href="${link.url}" target="_blank" class="truck-link-btn">${link.text}</a>`
        ).join('');
    }
    
    if (truck.isEditing) {
        return createEditingCard(truck);
    }
    
    return `
        <div class="truck-card ${statusClass} ${selectedClass} ${editingClass}" data-id="${truck.id}">
            <div class="truck-image-container">
                <img src="${truck.src}" alt="${truck.alt}" class="truck-image" 
                     onclick="showImageModal('${truck.src}', '${truck.alt}')">
                <div class="truck-priority-badge">${truck.priority || 1}</div>
                <input type="checkbox" class="truck-checkbox" 
                       ${isSelected ? 'checked' : ''} 
                       onchange="toggleTruckSelection('${truck.id}')">
            </div>
            <div class="truck-info">
                <div class="truck-title" onclick="showImageModal('${truck.src}', '${truck.alt}')">${truck.title}</div>
                <div class="truck-alt">${truck.alt || truck.title}</div>
                <div class="truck-links">${linksHtml}</div>
                <div class="truck-actions">
                    <span class="status-badge ${truck.isActive ? 'status-active' : 'status-inactive'}">
                        ${truck.isActive ? '已上架' : '已下架'}
                    </span>
                    <div>
                        <button class="btn btn-sm btn-primary" onclick="EditManager.startEdit('${truck.id}')">編輯</button>
                        <button class="btn btn-sm ${truck.isActive ? 'btn-warning' : 'btn-success'}" 
                                onclick="toggleTruckStatus('${truck.id}')">
                            ${truck.isActive ? '下架' : '上架'}
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteTruck('${truck.id}')">刪除</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createEditingCard(truck) {
    const linkData = truck.link && Array.isArray(truck.link) ? truck.link : [];
    
    return `
        <div class="truck-card editing" data-id="${truck.id}">
            <div class="truck-image-container">
                <img src="${truck.src}" alt="${truck.alt}" class="truck-image">
                <div class="truck-priority-badge">${truck.priority || 1}</div>
            </div>
            <div class="truck-info">
                <input type="text" id="edit-title-${truck.id}" class="truck-title-input" 
                       value="${truck.title}" placeholder="餐車名稱">
                <textarea id="edit-alt-${truck.id}" class="truck-alt-input" 
                          placeholder="餐車描述">${truck.alt || ''}</textarea>
                
                <div class="edit-links-container">
                    ${[1, 2, 3].map(i => {
                        const link = linkData[i-1] || { text: '', url: '' };
                        return `
                            <div class="edit-link-group">
                                <div class="edit-link-label">連結 ${i} 文字</div>
                                <input type="text" id="edit-text-${truck.id}-${i}" class="truck-link-input" 
                                       value="${link.text}" placeholder="連結文字">
                            </div>
                            <div class="edit-link-group">
                                <div class="edit-link-label">連結 ${i} 網址</div>
                                <input type="url" id="edit-url-${truck.id}-${i}" class="truck-link-input" 
                                       value="${link.url}" placeholder="https://example.com">
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="truck-actions">
                    <button class="btn btn-sm btn-success" onclick="EditManager.saveEdit('${truck.id}')">保存</button>
                    <button class="btn btn-sm btn-secondary" onclick="EditManager.cancelEdit('${truck.id}')">取消</button>
                </div>
            </div>
        </div>
    `;
}

// 工具函數
function updateStats() {
    const total = foodTruckDatabase.length;
    const active = foodTruckDatabase.filter(t => t.isActive).length;
    const inactive = total - active;
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

function showSyncStatus(message) {
    const syncStatus = document.getElementById('syncStatus');
    const syncMessage = document.getElementById('syncMessage');
    
    syncMessage.textContent = message;
    syncStatus.style.display = 'block';
    
    setTimeout(() => {
        syncStatus.style.display = 'none';
    }, 3000);
}

// 篩選和搜尋
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;

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

// 餐車操作
function toggleTruckStatus(truckId) {
    const truck = foodTruckDatabase.find(t => t.id === truckId);
    if (truck) {
        truck.isActive = !truck.isActive;
        DataManager.saveToLocal();
        renderTruckCards();
        updateStats();
        showAlert(`餐車已${truck.isActive ? '上架' : '下架'}`, 'success');
    }
}

function deleteTruck(truckId) {
    if (confirm('確定要刪除這個餐車嗎？')) {
        const index = foodTruckDatabase.findIndex(t => t.id === truckId);
        if (index > -1) {
            foodTruckDatabase.splice(index, 1);
            selectedTrucks.delete(truckId);
            DataManager.saveToLocal();
            applyFilters();
            showAlert('餐車已刪除', 'success');
        }
    }
}

function addNewTruck() {
    const title = document.getElementById('newTruckTitle').value.trim();
    const src = document.getElementById('newTruckSrc').value.trim();
    const alt = document.getElementById('newTruckAlt').value.trim();
    
    if (!title || !src) {
        showAlert('請填寫餐車名稱和圖片網址', 'danger');
        return;
    }
    
    const linkData = [];
    for (let i = 1; i <= 3; i++) {
        const text = document.getElementById(`newLink${i}Text`).value.trim();
        const url = document.getElementById(`newLink${i}Url`).value.trim();
        
        if (text && url) {
            linkData.push({ text, url });
        }
    }
    
    const newTruck = {
        id: 'truck_' + Date.now(),
        title,
        src,
        alt: alt || title,
        link: linkData.length > 0 ? linkData : '',
        isActive: true,
        priority: foodTruckDatabase.length + 1,
        isEditing: false
    };
    
    foodTruckDatabase.push(newTruck);
    DataManager.saveToLocal();
    clearForm();
    applyFilters();
    showAlert('餐車已新增', 'success');
}

function clearForm() {
    document.getElementById('newTruckTitle').value = '';
    document.getElementById('newTruckSrc').value = '';
    document.getElementById('newTruckAlt').value = '';
    
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`newLink${i}Text`).value = '';
        document.getElementById(`newLink${i}Url`).value = '';
    }
}

// 批量操作
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
    
    DataManager.saveToLocal();
    showAlert(`已${isActive ? '上架' : '下架'} ${count} 個餐車`, 'success');
    clearSelection();
    applyFilters();
}

function batchDelete() {
    if (selectedTrucks.size === 0) return;
    
    if (confirm(`確定要刪除選中的 ${selectedTrucks.size} 個餐車嗎？`)) {
        selectedTrucks.forEach(truckId => {
            const index = foodTruckDatabase.findIndex(t => t.id === truckId);
            if (index > -1) {
                foodTruckDatabase.splice(index, 1);
            }
        });
        
        DataManager.saveToLocal();
        clearSelection();
        applyFilters();
        showAlert(`已刪除 ${selectedTrucks.size} 個餐車`, 'success');
    }
}

function clearSelection() {
    selectedTrucks.clear();
    updateBatchActions();
    renderTruckCards();
}

// 圖片預覽
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

// 資料匯出
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
    
    showAlert('資料已匯出為data.json', 'success');
}

// 手動儲存
async function manualSaveData() {
    await SyncManager.manualSave();
}

// 初始化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 餐車管理系統啟動中...');
    
    // 載入資料
    await loadFoodTruckData();
    
    // 設定事件監聽器
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('sortBy').addEventListener('change', applyFilters);
    
    // 模態框關閉
    document.getElementById('imageModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideImageModal();
        }
    });
    
    console.log('✅ 餐車管理系統已啟動');
});
