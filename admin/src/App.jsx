import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ScheduleManagement from './pages/ScheduleManagement'
import ImageManagement from './pages/ImageManagement'
import VideoManagement from './pages/VideoManagement'
import ToolManagement from './pages/ToolManagement'
import MedicalManagement from './pages/MedicalManagement'
import Layout from './components/Layout'
import { ToastProvider } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 檢查是否已登入
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'authenticated') {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = () => {
    localStorage.setItem('admin_auth', 'authenticated')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/schedule" element={<ScheduleManagement />} />
                    <Route path="/images" element={<ImageManagement />} />
                    <Route path="/videos" element={<VideoManagement />} />
                    <Route path="/tools" element={<ToolManagement />} />
                    <Route path="/medical" element={<MedicalManagement />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Router>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
