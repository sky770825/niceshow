import { motion } from 'framer-motion'
import { ImageIcon, Search, Filter } from 'lucide-react'

export default function EmptyState({ 
  type = 'empty', // 'empty', 'no-results', 'loading'
  title,
  description,
  action,
  icon: Icon = ImageIcon
}) {
  const defaultContent = {
    empty: {
      title: '還沒有內容',
      description: '點擊上方按鈕開始新增',
      icon: ImageIcon
    },
    'no-results': {
      title: '沒有找到結果',
      description: '嘗試調整搜索條件或過濾器',
      icon: Search
    },
    loading: {
      title: '載入中...',
      description: '請稍候',
      icon: ImageIcon
    }
  }

  const content = defaultContent[type] || defaultContent.empty
  const displayIcon = Icon !== ImageIcon ? Icon : content.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card text-center py-12"
    >
      <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
        <displayIcon size={48} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title || content.title}
      </h3>
      <p className="text-gray-600 mb-6">
        {description || content.description}
      </p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </motion.div>
  )
}
