import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Image as ImageIcon, 
  Video, 
  Wrench, 
  Heart,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useToast } from '../components/Toast'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSchedules: 0,
    totalImages: 0,
    totalVideos: 0,
    totalTools: 0,
  })
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const [scheduleData, imageData] = await Promise.all([
        fetchScheduleData(),
        fetchImageData()
      ])
      
      setStats({
        totalSchedules: scheduleData?.weeks?.length || 0,
        totalImages: imageData?.foodTrucks?.length || 0,
        totalVideos: 4,
        totalTools: 10,
      })
    } catch (error) {
      console.error('載入統計資料失敗:', error)
      toast.error('載入統計資料失敗')
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchScheduleData = async () => {
    try {
      const SHEET_ID = '1oS9zTU6DL_cCRnOI6A4ffAeXXn7fXkr6URxxMVprlG4'
      const SHEET_GID = '782323585'
      const csvURL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`
      const response = await fetch(csvURL)
      const csvText = await response.text()
      const lines = csvText.split('\n').filter(line => line.trim())
      return { weeks: lines.length > 1 ? Math.ceil((lines.length - 1) / 7) : 0 }
    } catch (error) {
      return null
    }
  }

  const fetchImageData = async () => {
    try {
      const response = await fetch('../data.json')
      const data = await response.json()
      return data
    } catch (error) {
      return null
    }
  }

  const quickActions = [
    { 
      icon: Calendar, 
      title: '管理餐車行程', 
      description: '查看和編輯餐車行程安排',
      path: '/schedule',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: ImageIcon, 
      title: '管理圖片', 
      description: '上傳和管理跑碼燈圖片',
      path: '/images',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      icon: Video, 
      title: '管理影片', 
      description: '管理 TikTok 影片嵌入',
      path: '/videos',
      gradient: 'from-pink-500 to-rose-500'
    },
    { 
      icon: Wrench, 
      title: '工具推薦', 
      description: '管理實用工具推薦',
      path: '/tools',
      gradient: 'from-green-500 to-emerald-500'
    },
  ]

  const statCards = [
    {
      label: '總週次',
      value: stats.totalSchedules,
      icon: Calendar,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      label: '圖片數量',
      value: stats.totalImages,
      icon: ImageIcon,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      label: '影片數量',
      value: stats.totalVideos,
      icon: Video,
      color: 'pink',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      label: '工具推薦',
      value: stats.totalTools,
      icon: Wrench,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 標題區域 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">儀表板</h1>
          <p className="text-gray-600">歡迎回來！這裡是您的管理總覽</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Sparkles size={16} />
          <span>系統運行正常</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="card group hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1 font-medium">{stat.label}</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`p-4 bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-lg`}
                >
                  <Icon className="text-white" size={24} />
                </motion.div>
              </div>
              <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                  className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={action.path}
                  className="card group hover:scale-[1.02] transition-all duration-300 block"
                >
                  <div className="flex items-start space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`p-4 bg-gradient-to-br ${action.gradient} rounded-2xl text-white shadow-lg`}
                    >
                      <Icon size={24} />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-lg">{action.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                      <div className="flex items-center text-primary-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        <span>立即前往</span>
                        <ArrowRight size={16} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-glass"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">系統狀態</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">系統已就緒</p>
              <p className="text-xs text-gray-600">所有功能正常運作中</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
