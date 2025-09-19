// Admin 專用 JavaScript - 完全獨立
class TruckManager {
    constructor() {
        this.trucks = [];
        this.marqueeImages = [];
        this.init();
    }

    init() {
        this.loadTrucks();
        this.setupEventListeners();
        this.renderTrucks();
        this.updateStats();
        this.renderMarqueePreview();
    }

    loadTrucks() {
        // 從 localStorage 載入餐車資料，如果沒有則使用預設資料
        const savedTrucks = Utils.storage.get(CONFIG.storageKeys.truckData);
        if (savedTrucks) {
            this.trucks = savedTrucks;
        } else {
            // 使用共享配置的預設餐車資料
            this.trucks = [...CONFIG.defaultTrucks];
            this.saveTrucks();
        }

        // 載入跑碼燈圖片
        this.loadMarqueeImages();
    }

    loadMarqueeImages() {
        const savedMarquee = Utils.storage.get(CONFIG.storageKeys.marqueeImages);
        if (savedMarquee) {
            this.marqueeImages = savedMarquee;
        } else {
            // 預設跑碼燈圖片
            this.marqueeImages = this.trucks
                .filter(truck => truck.status === 'active')
                .map(truck => ({
                    id: truck.id,
                    name: truck.name,
                    image: truck.image
                }));
            this.saveMarqueeImages();
        }
    }

    saveTrucks() {
        Utils.storage.set(CONFIG.storageKeys.truckData, this.trucks);
    }

    saveMarqueeImages() {
        Utils.storage.set(CONFIG.storageKeys.marqueeImages, this.marqueeImages);
    }

    setupEventListeners() {
        // 狀態篩選
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filterTrucks();
        });

        // 搜尋功能
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterTrucks();
        });
    }

    renderTrucks() {
        const truckGrid = document.getElementById('truckGrid');
        truckGrid.innerHTML = '';

        this.trucks.forEach(truck => {
            const truckCard = this.createTruckCard(truck);
            truckGrid.appendChild(truckCard);
        });
    }

    createTruckCard(truck) {
        const card = document.createElement('div');
        card.className = `truck-card ${truck.status}`;
        card.innerHTML = `
            <div class="truck-image-container">
                <img src="${truck.image}" alt="${truck.name}" class="truck-image">
            </div>
            <div class="truck-info">
                <h3 class="truck-title">${truck.name}</h3>
                <span class="truck-status ${truck.status}">${truck.status === 'active' ? '啟用中' : '已停用'}</span>
                <p class="truck-description">${truck.description}</p>
                <div class="truck-actions">
                    <button class="btn btn-${truck.status === 'active' ? 'warning' : 'success'} btn-sm" 
                            onclick="truckManager.toggleStatus(${truck.id})">
                        ${truck.status === 'active' ? '停用' : '啟用'}
                    </button>
                    <button class="btn btn-info btn-sm" onclick="truckManager.editTruck(${truck.id})">
                        編輯
                    </button>
                    <button class="btn btn-${this.marqueeImages.some(img => img.id === truck.id) ? 'warning' : 'primary'} btn-sm" 
                            onclick="truckManager.toggleMarquee(${truck.id})">
                        ${this.marqueeImages.some(img => img.id === truck.id) ? '移除跑碼燈' : '加入跑碼燈'}
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="truckManager.deleteTruck(${truck.id})">
                        刪除
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    toggleStatus(truckId) {
        const truck = this.trucks.find(t => t.id === truckId);
        if (truck) {
            truck.status = truck.status === 'active' ? 'inactive' : 'active';
            this.saveTrucks();
            this.renderTrucks();
            this.updateStats();
            Utils.showNotification(`餐車 "${truck.name}" 已${truck.status === 'active' ? '啟用' : '停用'}`, 'success');
        }
    }

    toggleMarquee(truckId) {
        const truck = this.trucks.find(t => t.id === truckId);
        if (!truck) return;

        const marqueeIndex = this.marqueeImages.findIndex(img => img.id === truckId);
        
        if (marqueeIndex > -1) {
            // 移除跑碼燈
            this.marqueeImages.splice(marqueeIndex, 1);
            Utils.showNotification(`餐車 "${truck.name}" 已從跑碼燈移除`, 'info');
        } else {
            // 加入跑碼燈
            this.marqueeImages.push({
                id: truck.id,
                name: truck.name,
                image: truck.image
            });
            Utils.showNotification(`餐車 "${truck.name}" 已加入跑碼燈`, 'success');
        }
        
        this.saveMarqueeImages();
        this.renderMarqueePreview();
        this.renderTrucks();
        this.updateStats();
    }

    editTruck(truckId) {
        const truck = this.trucks.find(t => t.id === truckId);
        if (!truck) return;

        const newName = prompt('請輸入新的餐車名稱:', truck.name);
        if (newName && newName.trim() !== '') {
            truck.name = newName.trim();
            this.saveTrucks();
            this.renderTrucks();
            Utils.showNotification(`餐車名稱已更新為 "${truck.name}"`, 'success');
        }
    }

    deleteTruck(truckId) {
        const truck = this.trucks.find(t => t.id === truckId);
        if (!truck) return;

        if (confirm(`確定要刪除餐車 "${truck.name}" 嗎？此操作無法復原。`)) {
            this.trucks = this.trucks.filter(t => t.id !== truckId);
            this.marqueeImages = this.marqueeImages.filter(img => img.id !== truckId);
            this.saveTrucks();
            this.saveMarqueeImages();
            this.renderTrucks();
            this.renderMarqueePreview();
            this.updateStats();
            Utils.showNotification(`餐車 "${truck.name}" 已刪除`, 'success');
        }
    }

    addNewTruck() {
        const name = prompt('請輸入餐車名稱:');
        if (!name || name.trim() === '') return;

        const newTruck = {
            id: Date.now(),
            name: name.trim(),
            image: 'https://via.placeholder.com/300x200/96ceb4/ffffff?text=新餐車',
            status: 'active',
            description: '新加入的餐車',
            location: '四維路',
            phone: '0912-345-000'
        };

        this.trucks.push(newTruck);
        this.saveTrucks();
        this.renderTrucks();
        this.updateStats();
        Utils.showNotification(`餐車 "${newTruck.name}" 已新增`, 'success');
    }

    filterTrucks() {
        const statusFilter = document.getElementById('statusFilter').value;
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        
        const filteredTrucks = this.trucks.filter(truck => {
            const statusMatch = statusFilter === 'all' || truck.status === statusFilter;
            const nameMatch = truck.name.toLowerCase().includes(searchInput);
            return statusMatch && nameMatch;
        });

        this.renderFilteredTrucks(filteredTrucks);
    }

    renderFilteredTrucks(trucks) {
        const truckGrid = document.getElementById('truckGrid');
        truckGrid.innerHTML = '';

        trucks.forEach(truck => {
            const truckCard = this.createTruckCard(truck);
            truckGrid.appendChild(truckCard);
        });
    }

    renderMarqueePreview() {
        const marqueePreview = document.getElementById('marqueePreview');
        marqueePreview.innerHTML = '';

        this.marqueeImages.forEach(img => {
            const imgElement = document.createElement('div');
            imgElement.className = 'marquee-item-preview';
            imgElement.innerHTML = `<img src="${img.image}" alt="${img.name}">`;
            marqueePreview.appendChild(imgElement);
        });

        // 重複圖片以實現無縫循環
        this.marqueeImages.forEach(img => {
            const imgElement = document.createElement('div');
            imgElement.className = 'marquee-item-preview';
            imgElement.innerHTML = `<img src="${img.image}" alt="${img.name}">`;
            marqueePreview.appendChild(imgElement);
        });
    }

    updateStats() {
        const totalTrucks = this.trucks.length;
        const activeTrucks = this.trucks.filter(t => t.status === 'active').length;
        const inactiveTrucks = this.trucks.filter(t => t.status === 'inactive').length;
        const marqueeImages = this.marqueeImages.length;

        document.getElementById('totalTrucks').textContent = totalTrucks;
        document.getElementById('activeTrucks').textContent = activeTrucks;
        document.getElementById('inactiveTrucks').textContent = inactiveTrucks;
        document.getElementById('marqueeImages').textContent = marqueeImages;
    }

    showNotification(message, type = 'info') {
        Utils.showNotification(message, type);
    }

    // 匯出跑碼燈資料到主頁面
    exportMarqueeData() {
        return this.marqueeImages;
    }

    // 從主頁面匯入跑碼燈資料
    importMarqueeData(marqueeData) {
        this.marqueeImages = marqueeData;
        this.saveMarqueeImages();
        this.renderMarqueePreview();
        this.updateStats();
    }
}

// 全域函數
function addNewTruck() {
    truckManager.addNewTruck();
}

// 初始化
let truckManager;
document.addEventListener('DOMContentLoaded', function() {
    truckManager = new TruckManager();
    console.log('🔧 餐車管理後台已載入完成！');
});
