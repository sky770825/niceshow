import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary 捕獲錯誤:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="card-glass max-w-md w-full text-center">
            <div className="p-4 bg-red-500 rounded-full inline-flex mb-4">
              <AlertTriangle className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">發生錯誤</h2>
            <p className="text-gray-600 mb-6">
              系統遇到了一些問題。請重新整理頁面或聯繫管理員。
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                <p className="text-sm font-mono text-red-800 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="btn btn-primary flex items-center justify-center space-x-2 mx-auto"
            >
              <RefreshCw size={18} />
              <span>重新整理頁面</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
