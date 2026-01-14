/**
 * 圖片處理輔助函數
 */

/**
 * 檢查圖片 URL 是否來自 Supabase
 */
export function isSupabaseImage(url) {
  if (!url) return false
  return url.includes('supabase.co') || url.includes('niceshow')
}

/**
 * 從 Supabase URL 中提取檔案路徑
 */
export function extractPathFromSupabaseUrl(url) {
  if (!isSupabaseImage(url)) return null
  
  // 格式：https://xxx.supabase.co/storage/v1/object/public/niceshow/folder/file.jpg
  const match = url.match(/niceshow\/(.+)$/)
  return match ? match[1] : null
}

/**
 * 壓縮圖片（可選功能）
 */
export function compressImage(file, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // 計算新尺寸
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }))
            } else {
              reject(new Error('圖片壓縮失敗'))
            }
          },
          file.type,
          quality
        )
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
