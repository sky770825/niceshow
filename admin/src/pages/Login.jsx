import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Lock } from 'lucide-react'
import { useToast } from '../components/Toast'

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // 模擬載入動畫
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 簡單的密碼驗證
    if (password === 'admin123' || password === 'foodtruck2024') {
      onLogin()
      toast.success('登入成功！')
      navigate('/dashboard')
    } else {
      setError('密碼錯誤，請重新輸入')
      toast.error('密碼錯誤，請重新輸入')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card-glass w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex p-4 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl mb-4"
          >
            <Sparkles className="text-white" size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            四維商圈餐車
          </h1>
          <p className="text-gray-600">後台管理系統</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label flex items-center space-x-2">
              <Lock size={16} />
              <span>管理員密碼</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className="input"
              placeholder="請輸入密碼"
              required
              autoFocus
              disabled={loading}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 flex items-center space-x-1"
              >
                <span>⚠️</span>
                <span>{error}</span>
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="loading-spinner" />
                <span>登入中...</span>
              </>
            ) : (
              <>
                <Lock size={18} />
                <span>登入</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-2">預設密碼</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-mono text-gray-600">admin123</span>
            <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-mono text-gray-600">foodtruck2024</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
