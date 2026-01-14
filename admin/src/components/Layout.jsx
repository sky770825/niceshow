import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Calendar, 
  Image as ImageIcon, 
  Video, 
  Wrench, 
  Heart,
  Menu,
  X,
  LogOut,
  Sparkles
} from 'lucide-react'

export default function Layout({ children, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: '儀表板' },
    { path: '/schedule', icon: Calendar, label: '餐車行程' },
    { path: '/images', icon: ImageIcon, label: '圖片管理' },
    { path: '/videos', icon: Video, label: '影片管理' },
    { path: '/tools', icon: Wrench, label: '工具推薦' },
    { path: '/medical', icon: Heart, label: '醫療資訊' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen">
      {/* Mobile Header */}
      <div className="lg:hidden card-glass mx-4 mt-4 mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold gradient-text">後台管理</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl hover:bg-white/50 transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          <motion.aside
            initial={false}
            animate={{
              x: sidebarOpen ? 0 : '-100%',
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed lg:static inset-y-0 left-0 z-50
              w-72 card-glass border-r border-white/20
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            <div className="h-full flex flex-col">
              {/* Logo */}
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold gradient-text">
                      餐車管理
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">後台管理系統</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          relative flex items-center space-x-3 px-4 py-3 rounded-xl
                          transition-all duration-300 group
                          ${
                            active
                              ? 'bg-gradient-to-r from-primary-500/20 to-purple-500/20 text-primary-600 font-semibold shadow-lg shadow-primary-500/20'
                              : 'text-gray-700 hover:bg-white/50 hover:text-primary-600'
                          }
                        `}
                      >
                        {active && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <Icon 
                          size={20} 
                          className={`relative z-10 ${active ? 'text-primary-600' : 'group-hover:scale-110 transition-transform'}`}
                        />
                        <span className="relative z-10">{item.label}</span>
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-white/20">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50/50 transition-all duration-300 group"
                >
                  <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium">登出</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </AnimatePresence>

        {/* Overlay for mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="p-4 lg:p-6 xl:p-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
