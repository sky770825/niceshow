import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Trash2, Edit2, Save, X, ArrowUp, ArrowDown, 
  Image as ImageIcon, Upload as UploadIcon, Loader2,
  CheckSquare, Square, Filter
} from 'lucide-react'
import ImageUploader from '../components/ImageUploader'
import SearchBar from '../components/SearchBar'
import ConfirmDialog from '../components/ConfirmDialog'
import { uploadImage, deleteImage } from '../config/supabase'
import { isSupabaseImage } from '../utils/imageHelper'
import { useToast } from '../components/Toast'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import EmptyState from '../components/EmptyState'

export default function ImageManagement() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showUploader, setShowUploader] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'active', 'inactive'
  const [selectedIds, setSelectedIds] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const toast = useToast()

  useEffect(() => {
    loadImages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadImages = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('../data.json')
      if (!response.ok) throw new Error('無法載入資料')
      const data = await response.json()
      setImages(data.foodTrucks || [])
      toast.success(`圖片資料載入成功（共 ${data.foodTrucks?.length || 0} 張）`)
    } catch (error) {
      console.error('載入圖片資料失敗:', error)
      toast.error('載入圖片資料失敗，請檢查 data.json 檔案是否存在')
    } finally {
      setLoading(false)
    }
  }, [toast])

  // 過濾和搜索（使用 useMemo 優化性能）
  const filteredImages = useMemo(() => {
    if (!images || images.length === 0) return []
    
    const searchLower = searchTerm?.toLowerCase() || ''
    
    return images.filter(image => {
      const matchesSearch = !searchTerm || 
        image.title?.toLowerCase().includes(searchLower) ||
        image.alt?.toLowerCase().includes(searchLower) ||
        image.src?.toLowerCase().includes(searchLower)
      
      const matchesFilter = filterStatus === 'all' ||
        (filterStatus === 'active' && image.isActive) ||
        (filterStatus === 'inactive' && !image.isActive)
      
      return matchesSearch && matchesFilter
    })
  }, [images, searchTerm, filterStatus])

  // 全選/取消全選（使用 useCallback 優化）
  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.length === filteredImages.length && filteredImages.length > 0) {
        return []
      } else {
        return filteredImages.map(img => img.id)
      }
    })
  }, [filteredImages])

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }, [])

  const handleEdit = useCallback((image) => {
    setEditingId(image.id)
    setEditForm({ ...image })
    setShowUploader(false)
    setSelectedIds([])
  }, [])

  const handleSave = useCallback(async () => {
    // 基本驗證
    if (!editForm.title?.trim()) {
      toast.warning('請輸入圖片標題')
      // 聚焦到標題輸入框
      const titleInput = document.querySelector('input[placeholder="圖片標題（必填）"]')
      if (titleInput) {
        titleInput.focus()
        titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    
    // 驗證圖片URL（如果已填寫）
    if (editForm.src && !editForm.src.match(/^https?:\/\//)) {
      toast.warning('請輸入有效的圖片 URL（以 http:// 或 https:// 開頭）')
      return
    }
    
    try {
      const updatedImages = images.map(img =>
        img.id === editingId ? { ...img, ...editForm } : img
      )
      setImages(updatedImages)
      const wasNewImage = !images.find(img => img.id === editingId)
      setEditingId(null)
      setEditForm({})
      setShowUploader(false)
      setHasUnsavedChanges(true) // 標記有未保存的變更
      toast.success(wasNewImage ? '圖片已新增' : '圖片資訊已更新')
      
      // 滾動到頂部，顯示更新後的列表
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('保存失敗:', error)
      toast.error('保存失敗，請重試')
    }
  }, [editingId, editForm, images, toast])

  const handleCancel = useCallback(() => {
    setEditingId(null)
    setEditForm({})
    setShowUploader(false)
  }, [])

  const handleDeleteClick = useCallback((id) => {
    setDeleteTargetId(id)
    setShowDeleteConfirm(true)
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deleteTargetId) return

    const image = images.find(img => img.id === deleteTargetId)
    
    try {
      if (image?.src && isSupabaseImage(image.src)) {
        try {
          await deleteImage(image.src)
        } catch (deleteError) {
          console.warn('從 Supabase 刪除圖片失敗:', deleteError)
          toast.warning('從 Supabase 刪除圖片失敗，但已從列表中移除')
        }
      }

      setImages(images.filter(img => img.id !== deleteTargetId))
      toast.success('圖片已刪除')
    } catch (error) {
      console.error('刪除失敗:', error)
      toast.error(`刪除失敗: ${error.message || '請重試'}`)
    } finally {
      setDeleteTargetId(null)
      setShowDeleteConfirm(false)
    }
  }, [deleteTargetId, images, toast])

  const handleBatchDelete = useCallback(() => {
    if (selectedIds.length === 0) {
      toast.warning('請先選擇要刪除的圖片')
      return
    }

    setDeleteTargetId('batch')
    setShowDeleteConfirm(true)
  }, [selectedIds.length, toast])

  const handleBatchDeleteConfirm = useCallback(async () => {
    const imagesToDelete = images.filter(img => selectedIds.includes(img.id))
    let successCount = 0
    let failCount = 0

    for (const image of imagesToDelete) {
      try {
        if (image?.src && isSupabaseImage(image.src)) {
          try {
            await deleteImage(image.src)
          } catch (e) {
            console.warn('從 Supabase 刪除失敗:', e)
          }
        }
        successCount++
      } catch (error) {
        failCount++
        console.error('刪除失敗:', error)
      }
    }

    const count = selectedIds.length
    setImages(images.filter(img => !selectedIds.includes(img.id)))
    setSelectedIds([])
    
    if (failCount === 0) {
      toast.success(`已成功刪除 ${successCount} 張圖片`)
    } else {
      toast.warning(`已刪除 ${successCount} 張，${failCount} 張失敗`)
    }
    
    setDeleteTargetId(null)
    setShowDeleteConfirm(false)
  }, [selectedIds, images, toast])

  const handleBatchToggleActive = useCallback(() => {
    if (selectedIds.length === 0) {
      toast.warning('請先選擇圖片')
      return
    }

    const allActive = selectedIds.every(id => {
      const img = images.find(i => i.id === id)
      return img?.isActive
    })

    const updatedImages = images.map(img => 
      selectedIds.includes(img.id) 
        ? { ...img, isActive: !allActive }
        : img
    )

    const count = selectedIds.length
    setImages(updatedImages)
    setSelectedIds([])
    toast.success(`已${allActive ? '停用' : '啟用'} ${count} 張圖片`)
  }, [selectedIds, images, toast])

  const handleMove = useCallback((id, direction) => {
    const index = images.findIndex(img => img.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= images.length) {
      toast.warning(direction === 'up' ? '已經是最上方' : '已經是最下方')
      return
    }

    const newImages = [...images]
    const [moved] = newImages.splice(index, 1)
    newImages.splice(newIndex, 0, moved)
    
    newImages.forEach((img, idx) => {
      img.priority = idx + 1
    })
    
    setImages(newImages)
    toast.success('順序已更新')
  }, [images, toast])

  const handleAdd = useCallback(() => {
    const newImage = {
      id: `truck_${Date.now()}`,
      src: '',
      alt: '',
      title: '',
      isActive: true,
      priority: images.length + 1,
      category: 'main',
      link: [],
    }
    setImages(prev => [...prev, newImage])
    setEditingId(newImage.id)
    setEditForm(newImage)
    setShowUploader(true)
  }, [images.length])

  const handleImageUploaded = useCallback((url) => {
    setEditForm(prev => ({ ...prev, src: url }))
    setShowUploader(false)
    toast.success('圖片上傳成功')
  }, [toast])

  // 使用 useRef 存儲函數引用，避免無限循環
  const handlersRef = useRef({ handleSave, handleCancel, toggleSelectAll, handleBatchDelete })
  useEffect(() => {
    handlersRef.current = { handleSave, handleCancel, toggleSelectAll, handleBatchDelete }
  }, [handleSave, handleCancel, toggleSelectAll, handleBatchDelete])

  // 鍵盤快捷鍵（使用 ref 避免依賴循環）
  useKeyboardShortcuts({
    'ctrl+s': (e) => {
      if (editingId) {
        e.preventDefault()
        handlersRef.current.handleSave()
      }
    },
    'escape': () => {
      if (editingId) {
        handlersRef.current.handleCancel()
      }
      if (showDeleteConfirm) {
        setShowDeleteConfirm(false)
        setDeleteTargetId(null)
      }
    },
    'ctrl+a': (e) => {
      e.preventDefault()
      handlersRef.current.toggleSelectAll()
    },
    'delete': () => {
      if (selectedIds.length > 0 && !editingId && !showDeleteConfirm) {
        handlersRef.current.handleBatchDelete()
      }
    },
  }, [editingId, showDeleteConfirm, selectedIds.length])

  const exportJSON = useCallback(() => {
    try {
      const data = {
        foodTrucks: images,
        lastUpdated: new Date().toISOString(),
        version: '1.0',
        syncCount: images.length,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `data_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setHasUnsavedChanges(false) // 清除未保存標記
      toast.success('JSON 檔案已下載')
    } catch (error) {
      console.error('匯出失敗:', error)
      toast.error('匯出失敗，請重試')
    }
  }, [images, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 標題區域 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">圖片管理</h1>
          <p className="text-gray-600">
            管理跑碼燈區域的圖片和連結
            {images.length > 0 && (
              <span className="ml-2 text-primary-600 font-medium">
                （共 {images.length} 張）
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportJSON}
            className={`btn btn-secondary flex items-center space-x-2 ${hasUnsavedChanges ? 'ring-2 ring-yellow-400' : ''}`}
            title="匯出為 JSON 檔案"
          >
            <ImageIcon size={18} />
            <span>匯出 JSON</span>
            {hasUnsavedChanges && (
              <span className="ml-1 px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold animate-pulse">
                未保存
              </span>
            )}
          </button>
          <button
            onClick={handleAdd}
            className="btn btn-primary flex items-center space-x-2"
            title="新增圖片"
          >
            <Plus size={18} />
            <span>新增圖片</span>
          </button>
        </div>
      </motion.div>

      {/* 搜索和過濾區域 */}
      <div className="card-glass">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <SearchBar
              placeholder="搜索圖片標題、描述或 URL..."
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={setSearchTerm}
            />
            {searchTerm && (
              <p className="text-xs text-gray-500 mt-1">
                找到 <strong className="text-primary-600">{filteredImages.length}</strong> 個結果
                {filteredImages.length === 0 && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-primary-600 hover:underline"
                  >
                    清除搜索
                  </button>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">全部狀態 ({images.length})</option>
              <option value="active">僅啟用 ({images.filter(img => img.isActive).length})</option>
              <option value="inactive">僅停用 ({images.filter(img => !img.isActive).length})</option>
            </select>
          </div>
        </div>

        {/* 批量操作 */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-primary-50 rounded-xl border-2 border-primary-300 shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary-500 rounded-lg">
                <CheckSquare className="text-white" size={20} />
              </div>
              <div>
                <span className="text-sm font-bold text-primary-700 block">
                  已選擇 {selectedIds.length} 張圖片
                </span>
                <span className="text-xs text-primary-600">
                  提示：按 Delete 鍵可快速刪除
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleBatchToggleActive}
                className="btn btn-secondary text-sm flex-1 sm:flex-none"
                title="批量啟用/停用選中的圖片"
              >
                批量啟用/停用
              </button>
              <button
                onClick={handleBatchDelete}
                className="btn btn-danger text-sm flex-1 sm:flex-none"
                title="刪除選中的圖片"
              >
                批量刪除
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="btn btn-secondary text-sm flex-1 sm:flex-none"
                title="取消所有選擇"
              >
                取消選擇
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* 編輯表單 */}
      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-glass sticky top-4 z-10 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">編輯圖片</h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="取消編輯 (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {showUploader ? (
                <div>
                  <label className="label">上傳圖片到 Supabase</label>
                  <ImageUploader
                    currentImage={editForm.src}
                    onUploadComplete={handleImageUploaded}
                    enableCompression={true}
                    autoUpload={true}
                    showProgress={true}
                  />
                </div>
              ) : (
                <div>
                  <label className="label">圖片 URL</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={editForm.src || ''}
                      onChange={(e) => setEditForm({ ...editForm, src: e.target.value })}
                      className="input flex-1"
                      placeholder="https://..."
                    />
                    <button
                      onClick={() => setShowUploader(true)}
                      className="btn btn-secondary flex items-center space-x-2"
                    >
                      <UploadIcon size={18} />
                      <span>上傳</span>
                    </button>
                  </div>
                  {editForm.src && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={editForm.src}
                        alt="預覽"
                        loading="lazy"
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    標題 <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={(input) => {
                      // 自動聚焦到標題輸入框
                      if (input && editingId) {
                        setTimeout(() => {
                          input.focus()
                          input.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }, 100)
                      }
                    }}
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="input"
                    placeholder="圖片標題（必填）"
                    required
                    autoFocus
                  />
                  {!editForm.title?.trim() && (
                    <p className="text-xs text-red-500 mt-1">標題為必填項目</p>
                  )}
                </div>
                <div>
                  <label className="label">替代文字</label>
                  <input
                    type="text"
                    value={editForm.alt || ''}
                    onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
                    className="input"
                    placeholder="圖片描述（選填，建議填寫以改善 SEO）"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={editForm.isActive || false}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label className="text-sm font-medium text-gray-700">啟用此圖片</label>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                  title="快捷鍵: Ctrl/Cmd + S"
                >
                  <Save size={18} />
                  <span>儲存</span>
                  <span className="text-xs opacity-70 ml-1">(Ctrl+S)</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary flex items-center justify-center space-x-2"
                  title="快捷鍵: Esc"
                >
                  <X size={18} />
                  <span>取消</span>
                  <span className="text-xs opacity-70 ml-1">(Esc)</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 圖片網格 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleSelectAll}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="全選/取消全選 (Ctrl+A)"
          >
            {selectedIds.length === filteredImages.length && filteredImages.length > 0 ? (
              <CheckSquare size={20} className="text-primary-600" />
            ) : (
              <Square size={20} className="text-gray-400" />
            )}
          </button>
          <span className="text-sm text-gray-600">
            顯示 <strong>{filteredImages.length}</strong> / {images.length} 張圖片
            {selectedIds.length > 0 && (
              <span className="ml-2 text-primary-600">
                （已選擇 {selectedIds.length} 張）
              </span>
            )}
          </span>
        </div>
        {selectedIds.length > 0 && (
          <div className="text-xs text-gray-500">
            提示：按 Delete 鍵可快速刪除選中的圖片
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className={`card group hover:scale-105 transition-transform duration-300 ${
                selectedIds.includes(image.id) ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="relative">
                <button
                  onClick={() => toggleSelect(image.id)}
                  className="absolute top-2 left-2 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all shadow-md hover:scale-110"
                  aria-label={selectedIds.includes(image.id) ? '取消選擇' : '選擇圖片'}
                >
                  {selectedIds.includes(image.id) ? (
                    <CheckSquare size={18} className="text-primary-600" />
                  ) : (
                    <Square size={18} className="text-gray-400" />
                  )}
                </button>
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden mb-4 cursor-pointer group/image">
                  {image.src ? (
                    <>
                      <img
                        src={image.src}
                        alt={image.alt || image.title || '圖片'}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=圖片載入失敗'
                          e.target.onerror = null // 防止無限循環
                        }}
                        onClick={() => {
                          // 點擊圖片快速編輯
                          handleEdit(image)
                        }}
                      />
                      {/* 快速操作按鈕 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                        <span className="text-white text-sm font-medium">優先順序: {image.priority}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(image.src)
                              toast.success('圖片 URL 已複製到剪貼簿')
                            }}
                            className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-white text-xs"
                            title="複製圖片 URL"
                          >
                            複製
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  {!image.isActive && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg z-10">
                      已停用
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 truncate" title={image.title || '未命名'}>
                {image.title || '未命名'}
              </h3>
              {image.alt && (
                <p className="text-xs text-gray-500 mb-2 line-clamp-2" title={image.alt}>
                  {image.alt}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleMove(image.id, 'up')}
                  disabled={index === 0}
                  className="btn btn-secondary flex-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                  title="上移"
                  aria-label="上移"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => handleMove(image.id, 'down')}
                  disabled={index === filteredImages.length - 1}
                  className="btn btn-secondary flex-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                  title="下移"
                  aria-label="下移"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  onClick={() => handleEdit(image)}
                  className="btn btn-secondary flex-1 text-xs flex items-center justify-center space-x-1"
                  title="編輯"
                  aria-label="編輯圖片"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteClick(image.id)}
                  className="btn btn-danger flex-1 text-xs flex items-center justify-center space-x-1"
                  title="刪除"
                  aria-label="刪除圖片"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredImages.length === 0 && (
        <EmptyState
          type={searchTerm || filterStatus !== 'all' ? 'no-results' : 'empty'}
          title={
            searchTerm || filterStatus !== 'all'
              ? '沒有符合條件的圖片'
              : '還沒有圖片'
          }
          description={
            searchTerm || filterStatus !== 'all'
              ? '嘗試調整搜索關鍵字或過濾條件'
              : '點擊「新增圖片」開始建立您的第一張圖片'
          }
          action={
            !searchTerm && filterStatus === 'all' ? (
              <button onClick={handleAdd} className="btn btn-primary">
                新增第一張圖片
              </button>
            ) : (
              <div className="flex flex-wrap justify-center gap-2">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="btn btn-secondary text-sm"
                  >
                    清除搜索
                  </button>
                )}
                {filterStatus !== 'all' && (
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="btn btn-secondary text-sm"
                  >
                    清除過濾
                  </button>
                )}
              </div>
            )
          }
        />
      )}

      {/* 確認對話框 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeleteTargetId(null)
        }}
        onConfirm={deleteTargetId === 'batch' ? handleBatchDeleteConfirm : handleDelete}
        title={deleteTargetId === 'batch' ? '批量刪除' : '刪除圖片'}
        message={
          deleteTargetId === 'batch'
            ? `確定要刪除選中的 ${selectedIds.length} 張圖片嗎？此操作無法復原。`
            : '確定要刪除此圖片嗎？此操作無法復原。'
        }
        confirmText="確認刪除"
        cancelText="取消"
        type="danger"
      />

      {/* 提示訊息 */}
      <div className="card-glass bg-blue-50/50 border-blue-200/50">
        <div className="space-y-2">
          <p className="text-sm text-blue-800">
            💡 <strong>提示：</strong>使用 Supabase 上傳的圖片會自動儲存在雲端。
            編輯完成後，點擊「匯出 JSON」下載更新後的 data.json 檔案。
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-blue-700">
            <span>⌨️ <strong>快捷鍵：</strong></span>
            <span>Ctrl+S 保存</span>
            <span>Esc 取消</span>
            <span>Ctrl+A 全選</span>
            <span>Delete 刪除</span>
          </div>
        </div>
      </div>
    </div>
  )
}
