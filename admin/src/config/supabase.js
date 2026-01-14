import { createClient } from '@supabase/supabase-js'

// Supabase 配置
// 請在 .env 檔案中設定這些值，或直接替換為您的 Supabase 專案資訊
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 圖片上傳配置
export const STORAGE_BUCKET = 'niceshow' // 在 Supabase Storage 中建立的 bucket 名稱

/**
 * 上傳圖片到 Supabase Storage
 * @param {File} file - 要上傳的檔案
 * @param {string} folder - 資料夾路徑（可選）
 * @returns {Promise<string>} 公開 URL
 */
export async function uploadImage(file, folder = '') {
  try {
    // 檢查 Supabase 配置
    if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
      throw new Error('請先設定 Supabase URL，請在 .env 檔案中設定 VITE_SUPABASE_URL')
    }
    
    if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
      throw new Error('請先設定 Supabase Anon Key，請在 .env 檔案中設定 VITE_SUPABASE_ANON_KEY')
    }

    // 生成唯一檔名
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // 上傳檔案
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      // 提供更清楚的錯誤訊息
      if (error.message?.includes('Bucket not found')) {
        throw new Error(`找不到 Storage Bucket "${STORAGE_BUCKET}"，請確認在 Supabase 中已建立此 bucket 並設為公開`)
      }
      if (error.message?.includes('new row violates row-level security')) {
        throw new Error('上傳權限被拒絕，請檢查 Supabase Storage Policies 設定')
      }
      throw new Error(error.message || '上傳失敗')
    }

    // 取得公開 URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('上傳圖片失敗:', error)
    throw error
  }
}

/**
 * 刪除 Supabase Storage 中的圖片
 * @param {string} filePath - 檔案路徑或完整 URL
 */
export async function deleteImage(filePath) {
  try {
    let path = filePath
    
    // 如果是完整 URL，提取路徑
    if (filePath.includes('supabase.co/storage/v1/object/public/')) {
      // 從 URL 中提取路徑：https://xxx.supabase.co/storage/v1/object/public/niceshow/folder/file.jpg
      const urlParts = filePath.split(`${STORAGE_BUCKET}/`)
      if (urlParts.length > 1) {
        path = urlParts[1]
      } else {
        // 如果無法解析，嘗試其他方式
        const match = filePath.match(new RegExp(`${STORAGE_BUCKET}/(.+)`))
        path = match ? match[1] : filePath
      }
    } else if (filePath.includes(`${STORAGE_BUCKET}/`)) {
      // 如果包含 bucket 名稱，提取後面的路徑
      path = filePath.split(`${STORAGE_BUCKET}/`)[1]
    }
    
    // 移除開頭的斜線（如果有）
    path = path.replace(/^\//, '')
    
    if (!path) {
      throw new Error('無法從 URL 中提取檔案路徑')
    }
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path])

    if (error) {
      throw error
    }
    
    return true
  } catch (error) {
    console.error('刪除圖片失敗:', error)
    throw new Error(`刪除圖片失敗: ${error.message || '未知錯誤'}`)
  }
}

/**
 * 列出 Storage 中的所有圖片
 */
export async function listImages(folder = '') {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      throw error
    }

    return data.map(file => ({
      name: file.name,
      path: folder ? `${folder}/${file.name}` : file.name,
      url: supabase.storage.from(STORAGE_BUCKET).getPublicUrl(
        folder ? `${folder}/${file.name}` : file.name
      ).data.publicUrl
    }))
  } catch (error) {
    console.error('列出圖片失敗:', error)
    throw error
  }
}
