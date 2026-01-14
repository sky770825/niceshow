import { useState } from 'react'
import { Plus, Trash2, Edit2, Save, X, MapPin, Phone, Clock } from 'lucide-react'
import { useToast } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'

const MEDICAL_CATEGORIES = {
  hospital: '大型醫院',
  clinic: '一般診所',
  dental: '牙科診所',
  specialty: '專科診所',
  other: '其他診所',
}

export default function MedicalManagement() {
  const [medicalData, setMedicalData] = useState({
    hospital: [
      {
        id: 'med1',
        name: '楊梅天成醫院',
        address: '桃園市楊梅區新農街二段',
        phone: '03-478-3200',
        hours: '24小時急診',
        category: 'hospital',
      },
      {
        id: 'med2',
        name: '楊梅敏盛醫院',
        address: '桃園市楊梅區新農街二段',
        phone: '03-478-3200',
        hours: '24小時急診',
        category: 'hospital',
      },
      {
        id: 'med3',
        name: '怡仁綜合醫院',
        address: '桃園市楊梅區楊新北路321巷30號',
        phone: '03-485-5678',
        hours: '24小時急診',
        category: 'hospital',
      },
      {
        id: 'med4',
        name: '楊梅區衛生所',
        address: '桃園市楊梅區大成路2號',
        phone: '03-478-3683',
        hours: '週一至週五 08:00-17:00',
        category: 'hospital',
      },
    ],
    clinic: [
      {
        id: 'med5',
        name: '民安診所',
        address: '桃園市楊梅區大成路175號',
        phone: '03-478-2200',
        hours: '週一至週六 09:00-21:00',
        category: 'clinic',
      },
      {
        id: 'med6',
        name: '明仁診所',
        address: '桃園市楊梅區楊新北路13號',
        phone: '03-478-2200',
        hours: '週一至週六 09:00-21:00',
        category: 'clinic',
      },
      {
        id: 'med7',
        name: '孫浩診所',
        address: '桃園市楊梅區中興路132號',
        phone: '03-478-2200',
        hours: '週一至週六 09:00-21:00',
        category: 'clinic',
      },
      {
        id: 'med8',
        name: '姜博文診所',
        address: '桃園市楊梅區永美路335號',
        phone: '03-478-2200',
        hours: '週一至週六 09:00-21:00',
        category: 'clinic',
      },
    ],
    dental: [
      {
        id: 'med9',
        name: '楊梅牙醫診所',
        address: '桃園市楊梅區中興路50號',
        phone: '03-478-2200',
        hours: '週一至週六 09:00-18:00',
        category: 'dental',
      },
      {
        id: 'med10',
        name: '陳耀芳耳鼻喉科診所',
        address: '桃園市楊梅區大成路111號',
        phone: '03-478-2200',
        hours: '週一至週六 09:00-18:00',
        category: 'dental',
      },
    ],
    specialty: [
      {
        id: 'med11',
        name: '呂眼科診所',
        address: '桃園市楊梅區大成路81號',
        phone: '03-478-2200',
        hours: '週一至週六 09:00-18:00',
        category: 'specialty',
      },
      {
        id: 'med12',
        name: '楊梅小兒科診所',
        address: '桃園市楊梅區新農街15號',
        phone: '03-478-2200',
        hours: '週一至週日 08:00-22:00',
        category: 'specialty',
      },
    ],
    other: [
      {
        id: 'med13',
        name: '勝遠診所',
        address: '桃園市楊梅區梅山東街150號',
        phone: '03-478-2200',
        hours: '週一至週六 09:00-21:00',
        category: 'other',
      },
      {
        id: 'med14',
        name: '鄭鈞源診所',
        address: '桃園市楊梅區新成路201之1號',
        phone: '03-478-2200',
        hours: '週一至週六 09:00-21:00',
        category: 'other',
      },
    ],
  })
  const [activeCategory, setActiveCategory] = useState('hospital')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const toast = useToast()

  const handleEdit = (item) => {
    setEditingId(item.id)
    setEditForm({ ...item })
  }

  const handleSave = () => {
    const updatedData = {
      ...medicalData,
      [activeCategory]: medicalData[activeCategory].map(item =>
        item.id === editingId ? { ...item, ...editForm } : item
      ),
    }
    setMedicalData(updatedData)
    setEditingId(null)
    toast.success('醫療資訊已更新')
    toast.info('請手動更新 index.html 檔案中的醫療資訊區塊')
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
    const updatedData = {
      ...medicalData,
      [activeCategory]: medicalData[activeCategory].filter(item => item.id !== deleteTargetId),
    }
    setMedicalData(updatedData)
    toast.success('醫療資訊已刪除')
    toast.info('請手動更新 index.html 檔案以完成刪除')
    setDeleteTargetId(null)
    setShowDeleteConfirm(false)
  }

  const handleAdd = () => {
    const newItem = {
      id: `med_${Date.now()}`,
      name: '',
      address: '',
      phone: '',
      hours: '',
      category: activeCategory,
    }
    const updatedData = {
      ...medicalData,
      [activeCategory]: [...medicalData[activeCategory], newItem],
    }
    setMedicalData(updatedData)
    setEditingId(newItem.id)
    setEditForm(newItem)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">醫療資訊管理</h1>
          <p className="text-gray-600">管理楊梅地區的醫療服務資訊</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center space-x-2">
          <Plus size={18} />
          <span>新增醫療資訊</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto">
        {Object.entries(MEDICAL_CATEGORIES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setActiveCategory(key)
              setEditingId(null)
            }}
            className={`
              px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap
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

      {/* Medical Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {medicalData[activeCategory].map((item) => (
          <div key={item.id} className="card">
            {editingId === item.id ? (
              <div className="space-y-4">
                <div>
                  <label className="label">醫療機構名稱</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">地址</label>
                  <input
                    type="text"
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">電話</label>
                  <input
                    type="text"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">營業時間</label>
                  <input
                    type="text"
                    value={editForm.hours || ''}
                    onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                    className="input"
                  />
                </div>
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
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">{item.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin size={18} className="text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-700">{item.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone size={18} className="text-gray-400" />
                    <a href={`tel:${item.phone}`} className="text-sm text-primary-600 hover:underline">
                      {item.phone}
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{item.hours}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="btn btn-secondary flex-1 flex items-center justify-center space-x-2"
                  >
                    <Edit2 size={16} />
                    <span>編輯</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item.id)}
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
          💡 <strong>提示：</strong>編輯完成後，請手動更新 index.html 檔案中的醫療資訊區塊。
          建議在更新前先確認電話號碼和地址的正確性。
        </p>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeleteTargetId(null)
        }}
        onConfirm={handleDelete}
        title="刪除醫療資訊"
        message="確定要刪除此醫療資訊嗎？此操作無法復原。"
        confirmText="確認刪除"
        cancelText="取消"
        type="danger"
      />
    </div>
  )
}
