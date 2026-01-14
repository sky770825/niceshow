import { useState } from 'react'
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react'
import { useToast } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'

const TOOL_CATEGORIES = {
  tools: '實用工具推薦',
  related: '相關推薦',
  sponsor: '廠商進駐',
}

export default function ToolManagement() {
  const [tools, setTools] = useState({
    tools: [
      {
        id: 'tool1',
        icon: '💰',
        name: '買賣試算系統',
        desc: '房貸試算工具',
        url: 'https://property-rr6ksz.manus.space/',
        category: 'tools',
        featured: true,
      },
      {
        id: 'tool2',
        icon: '💬',
        name: '房地產諮詢',
        desc: '免費諮詢',
        url: 'https://line.me/R/ti/p/@931aeinu',
        category: 'tools',
      },
      {
        id: 'tool3',
        icon: '🏠',
        name: '房屋物件精選',
        desc: '優質物件',
        url: 'https://realtor.houseprice.tw/agent/buy/0925666597/',
        category: 'tools',
      },
      {
        id: 'tool4',
        icon: '📊',
        name: '實價登錄查詢',
        desc: '房價查詢',
        url: 'https://lvr.land.moi.gov.tw/',
        category: 'tools',
      },
      {
        id: 'tool5',
        icon: '🗺️',
        name: '地圖找房',
        desc: '地圖找房',
        url: 'https://sky770825.github.io/junyang666/',
        category: 'tools',
      },
    ],
    related: [
      {
        id: 'related1',
        icon: '🧋',
        name: '功夫茶四維店',
        desc: '飲料訂購',
        url: 'https://sky770825.github.io/kungfuteahtml/',
        category: 'related',
      },
      {
        id: 'related2',
        icon: '🚗',
        name: '四維停車場',
        desc: '停車場',
        url: 'https://maps.app.goo.gl/gQRVJ4c9MJePNSJ48',
        category: 'related',
      },
      {
        id: 'related3',
        icon: '📞',
        name: '里長聯絡資訊',
        desc: '里長資訊',
        url: 'tel:0933965385',
        category: 'related',
      },
      {
        id: 'related4',
        icon: '🍽️',
        name: '四維餐車社群',
        desc: '餐車群組',
        url: 'https://line.me/ti/g2/VXIuR9NyhkWFQPuMeWTUp_RHitaW82_0r8MU1Q?utm_source=invitation&utm_medium=link_copy&utm_campaign=default',
        category: 'related',
      },
      {
        id: 'related5',
        icon: '🚌',
        name: '楊梅免費公車',
        desc: '免費公車',
        url: 'https://www.yangmei.tycg.gov.tw/News_Content.aspx?n=9055&s=910871',
        category: 'related',
      },
      {
        id: 'related6',
        icon: '🏥',
        name: '楊梅醫療服務',
        desc: '醫療資訊',
        url: '#',
        category: 'related',
      },
    ],
    sponsor: [
      {
        id: 'sponsor1',
        icon: '📢',
        name: '我要進駐',
        desc: '聯絡資訊',
        url: '#',
        category: 'sponsor',
      },
      {
        id: 'sponsor2',
        icon: '🎯',
        name: '精準客群',
        desc: '精準行銷',
        url: '#',
        category: 'sponsor',
      },
      {
        id: 'sponsor3',
        icon: '📈',
        name: '高曝光度',
        desc: '品牌曝光',
        url: '#',
        category: 'sponsor',
      },
      {
        id: 'sponsor4',
        icon: '💼',
        name: '進駐方案',
        desc: '合作方案',
        url: '#',
        category: 'sponsor',
      },
      {
        id: 'sponsor5',
        icon: '⭐',
        name: '成功案例',
        desc: '成功案例',
        url: '#',
        category: 'sponsor',
      },
      {
        id: 'sponsor6',
        icon: '🤝',
        name: '長期合作',
        desc: '長期合作',
        url: '#',
        category: 'sponsor',
      },
    ],
  })
  const [activeCategory, setActiveCategory] = useState('tools')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const toast = useToast()

  const handleEdit = (tool) => {
    setEditingId(tool.id)
    setEditForm({ ...tool })
  }

  const handleSave = () => {
    const updatedTools = {
      ...tools,
      [activeCategory]: tools[activeCategory].map(tool =>
        tool.id === editingId ? { ...tool, ...editForm } : tool
      ),
    }
    setTools(updatedTools)
    setEditingId(null)
    toast.success('工具資訊已更新')
    toast.info('請手動更新 index.html 檔案中的工具推薦區塊')
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id)
    setShowDeleteConfirm(true)
  }

  const handleDelete = () => {
    if (!deleteTargetId) return
    const updatedTools = {
      ...tools,
      [activeCategory]: tools[activeCategory].filter(tool => tool.id !== deleteTargetId),
    }
    setTools(updatedTools)
    toast.success('工具已刪除')
    toast.info('請手動更新 index.html 檔案以完成刪除')
    setDeleteTargetId(null)
    setShowDeleteConfirm(false)
  }

  const handleAdd = () => {
    const newTool = {
      id: `tool_${Date.now()}`,
      icon: '🔧',
      name: '',
      desc: '',
      url: '',
      category: activeCategory,
      featured: false,
    }
    const updatedTools = {
      ...tools,
      [activeCategory]: [...tools[activeCategory], newTool],
    }
    setTools(updatedTools)
    setEditingId(newTool.id)
    setEditForm(newTool)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">工具推薦管理</h1>
          <p className="text-gray-600">管理實用工具、相關推薦和廠商進駐資訊</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center space-x-2">
          <Plus size={18} />
          <span>新增工具</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {Object.entries(TOOL_CATEGORIES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setActiveCategory(key)
              setEditingId(null)
            }}
            className={`
              px-6 py-3 font-medium transition-colors border-b-2
              ${
                activeCategory === key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools[activeCategory].map((tool) => (
          <div key={tool.id} className="card">
            {editingId === tool.id ? (
              <div className="space-y-4">
                <div>
                  <label className="label">圖示</label>
                  <input
                    type="text"
                    value={editForm.icon || ''}
                    onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                    className="input"
                    placeholder="🔧"
                  />
                </div>
                <div>
                  <label className="label">名稱</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">描述</label>
                  <input
                    type="text"
                    value={editForm.desc || ''}
                    onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">連結 URL</label>
                  <input
                    type="text"
                    value={editForm.url || ''}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    className="input"
                  />
                </div>
                {activeCategory === 'tools' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editForm.featured || false}
                      onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                      className="rounded"
                    />
                    <label className="text-sm text-gray-700">熱門標籤</label>
                  </div>
                )}
                <div className="flex space-x-2">
                  <button onClick={handleSave} className="btn btn-primary flex-1 flex items-center justify-center space-x-2">
                    <Save size={16} />
                    <span>儲存</span>
                  </button>
                  <button onClick={handleCancel} className="btn btn-secondary flex items-center justify-center space-x-2">
                    <X size={16} />
                    <span>取消</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{tool.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                    <p className="text-sm text-gray-600">{tool.desc}</p>
                  </div>
                  {tool.featured && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                      熱門
                    </span>
                  )}
                </div>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline mb-4 block break-all"
                >
                  {tool.url}
                </a>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(tool)}
                    className="btn btn-secondary flex-1 flex items-center justify-center space-x-2"
                  >
                    <Edit2 size={16} />
                    <span>編輯</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(tool.id)}
                    className="btn btn-danger flex items-center justify-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>刪除</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="card bg-blue-50">
        <p className="text-sm text-blue-800">
          💡 <strong>提示：</strong>編輯完成後，請手動更新 index.html 檔案中的對應區塊。
        </p>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeleteTargetId(null)
        }}
        onConfirm={handleDelete}
        title="刪除工具"
        message="確定要刪除此工具嗎？此操作無法復原。"
        confirmText="確認刪除"
        cancelText="取消"
        type="danger"
      />
    </div>
  )
}
