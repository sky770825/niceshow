import { useState, useRef } from 'react'
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react'
import { uploadImage } from '../config/supabase'
import { compressImage } from '../utils/imageHelper'
import { useToast } from './Toast'

export default function ImageUploader({ 
  onUploadComplete, 
  currentImage = null, 
  enableCompression = true,
  autoUpload = false, // 新增：是否自動上傳
  showProgress = true // 新增：是否顯示進度
}) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage || null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const toast = useToast()

  const handleFileSelect = async (file) => {
    if (!file) return

    // 驗證檔案類型
    if (!file.type.startsWith('image/')) {
      setError('請選擇圖片檔案')
      toast.error('請選擇圖片檔案（JPG、PNG、WebP）')
      return
    }

    // 驗證檔案大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('圖片大小不能超過 5MB')
      toast.error('圖片大小不能超過 5MB，請選擇較小的圖片')
      return
    }

    setError(null)
    setSuccess(false)
    setSelectedFile(file)

    // 顯示預覽
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // 如果啟用自動上傳，選擇後立即上傳
    if (autoUpload) {
      // 等待預覽載入完成
      setTimeout(() => {
        handleUpload(file)
      }, 100)
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleUpload = async (fileToUse = null) => {
    const file = fileToUse || selectedFile || fileInputRef.current?.files?.[0]
    if (!file) {
      setError('請先選擇圖片')
      toast.error('請先選擇圖片')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)
    setCompressing(false)
    setUploadProgress(0)

    try {
      let fileToUpload = file

      // 如果啟用壓縮且檔案大於 1MB，進行壓縮
      if (enableCompression && file.size > 1024 * 1024) {
        setCompressing(true)
        setUploadProgress(10)
        try {
          fileToUpload = await compressImage(file, 1920, 0.8)
          const originalSize = (file.size / 1024 / 1024).toFixed(2)
          const compressedSize = (fileToUpload.size / 1024 / 1024).toFixed(2)
          toast.info(`圖片已壓縮：${originalSize}MB → ${compressedSize}MB`)
        } catch (compressError) {
          console.warn('壓縮失敗，使用原始檔案:', compressError)
          toast.warning('圖片壓縮失敗，使用原始檔案')
        } finally {
          setCompressing(false)
          setUploadProgress(30)
        }
      } else {
        setUploadProgress(20)
      }

      // 上傳到 niceshow bucket，使用 food-trucks 資料夾分類
      setUploadProgress(50)
      const url = await uploadImage(fileToUpload, 'food-trucks')
      setUploadProgress(100)
      setSuccess(true)
      toast.success('圖片上傳成功！')
      onUploadComplete?.(url)
      
      // 清除選擇的檔案
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // 2秒後清除成功訊息
      setTimeout(() => {
        setSuccess(false)
        setUploadProgress(0)
      }, 2000)
    } catch (err) {
      console.error('上傳失敗:', err)
      const errorMessage = err.message || '上傳失敗，請重試'
      setError(errorMessage)
      toast.error(errorMessage)
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* 預覽區域 */}
      {preview && (
        <div className="relative group">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <img
              src={preview}
              alt="預覽"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <button
                onClick={handleRemove}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transform hover:scale-110"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          {success && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full flex items-center space-x-2 animate-scale-in">
              <CheckCircle2 size={16} />
              <span className="text-sm font-medium">上傳成功</span>
            </div>
          )}
        </div>
      )}

      {/* 上傳區域 */}
      <div className="space-y-3">
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`
            relative border-2 border-dashed rounded-xl p-8
            transition-all duration-300 cursor-pointer
            ${preview 
              ? 'border-primary-300 bg-primary-50/50' 
              : 'border-gray-300 bg-white/50 hover:border-primary-400 hover:bg-primary-50/30'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center justify-center space-y-3">
            {(uploading || compressing) ? (
              <>
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                <p className="text-sm font-medium text-gray-700">
                  {compressing ? '壓縮中...' : '上傳中...'}
                </p>
              </>
            ) : (
              <>
                <div className="p-4 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    {preview ? '點擊更換圖片' : '點擊或拖曳上傳圖片'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    支援 JPG、PNG、WebP（最大 5MB）
                    {autoUpload && <span className="block mt-1 text-primary-600">自動上傳已啟用</span>}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* 上傳進度條 */}
        {showProgress && (uploading || compressing) && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{compressing ? '壓縮中...' : '上傳中...'}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 上傳按鈕 */}
        {preview && !uploading && !compressing && !autoUpload && (
          <button
            onClick={() => handleUpload()}
            className="btn btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Upload size={18} />
            <span>上傳到 Supabase</span>
          </button>
        )}
      </div>
    </div>
  )
}
