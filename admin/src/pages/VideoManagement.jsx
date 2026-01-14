import { useState } from 'react'
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react'
import { useToast } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'

export default function VideoManagement() {
  const [videos, setVideos] = useState([
    {
      id: 'video1',
      videoId: '7582085835089005845',
      url: 'https://www.tiktok.com/@aihouse168/video/7582085835089005845',
      title: '宜誠阿麗拉四房雙車位',
    },
    {
      id: 'video2',
      videoId: '7567609445031709972',
      url: 'https://www.tiktok.com/@aihouse168/video/7567609445031709972',
      title: '星視界 700萬起',
    },
    {
      id: 'video3',
      videoId: '7580637798097603860',
      url: 'https://www.tiktok.com/@aihouse168/video/7580637798097603860',
      title: '租！全新落成新天地社區',
    },
    {
      id: 'video4',
      videoId: '7578030483917835540',
      url: 'https://www.tiktok.com/@aihouse168/video/7578030483917835540',
      title: '萬福街12坪大套房',
    },
  ])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const toast = useToast()

  const handleEdit = (video) => {
    setEditingId(video.id)
    setEditForm({ ...video })
  }

  const handleSave = () => {
    const updatedVideos = videos.map(video =>
      video.id === editingId ? { ...video, ...editForm } : video
    )
    setVideos(updatedVideos)
    setEditingId(null)
    toast.success('影片資訊已更新')
    toast.info('請手動更新 index.html 檔案中的 TikTok 影片區塊')
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
    setVideos(videos.filter(video => video.id !== deleteTargetId))
    toast.success('影片已刪除')
    toast.info('請手動更新 index.html 檔案以完成刪除')
    setDeleteTargetId(null)
    setShowDeleteConfirm(false)
  }

  const handleAdd = () => {
    const newVideo = {
      id: `video_${Date.now()}`,
      videoId: '',
      url: '',
      title: '',
    }
    setVideos([...videos, newVideo])
    setEditingId(newVideo.id)
    setEditForm(newVideo)
  }

  const extractVideoId = (url) => {
    const match = url.match(/\/video\/(\d+)/)
    return match ? match[1] : ''
  }

  const handleUrlChange = (url) => {
    const videoId = extractVideoId(url)
    setEditForm({ ...editForm, url, videoId })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">影片管理</h1>
          <p className="text-gray-600">管理 TikTok 影片嵌入</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center space-x-2">
          <Plus size={18} />
          <span>新增影片</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="card">
            {editingId === video.id ? (
              <div className="space-y-4">
                <div>
                  <label className="label">影片標題</label>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="input"
                    placeholder="影片標題"
                  />
                </div>
                <div>
                  <label className="label">TikTok URL</label>
                  <input
                    type="text"
                    value={editForm.url || ''}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="input"
                    placeholder="https://www.tiktok.com/@username/video/..."
                  />
                </div>
                <div>
                  <label className="label">影片 ID</label>
                  <input
                    type="text"
                    value={editForm.videoId || ''}
                    onChange={(e) => setEditForm({ ...editForm, videoId: e.target.value })}
                    className="input"
                    placeholder="自動從 URL 提取"
                    readOnly
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
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                  {video.videoId ? (
                    <blockquote
                      className="tiktok-embed"
                      cite={video.url}
                      data-video-id={video.videoId}
                      style={{ maxWidth: '100%', minWidth: '325px' }}
                    >
                      <section>
                        <a
                          target="_blank"
                          title="@aihouse168"
                          href="https://www.tiktok.com/@aihouse168?refer=embed"
                        >
                          @aihouse168
                        </a>
                      </section>
                    </blockquote>
                  ) : (
                    <div className="text-gray-400">無預覽</div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{video.title || '未命名'}</h3>
                <p className="text-sm text-gray-600 mb-4 break-all">{video.url}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(video)}
                    className="btn btn-secondary flex-1 flex items-center justify-center space-x-2"
                  >
                    <Edit2 size={16} />
                    <span>編輯</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(video.id)}
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
          💡 <strong>提示：</strong>編輯完成後，請手動更新 index.html 檔案中的 TikTok 影片區塊。
          系統會自動從 TikTok URL 提取影片 ID。
        </p>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeleteTargetId(null)
        }}
        onConfirm={handleDelete}
        title="刪除影片"
        message="確定要刪除此影片嗎？此操作無法復原。"
        confirmText="確認刪除"
        cancelText="取消"
        type="danger"
      />
    </div>
  )
}
