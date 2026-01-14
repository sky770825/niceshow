import { useEffect } from 'react'

/**
 * 鍵盤快捷鍵 Hook
 * @param {Object} shortcuts - 快捷鍵配置 { key: handler }
 * @param {Array} deps - 依賴項
 */
export function useKeyboardShortcuts(shortcuts, deps = []) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 如果正在輸入，不觸發快捷鍵
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return
      }

      const key = e.key.toLowerCase()
      const ctrlKey = e.ctrlKey || e.metaKey // 支援 Mac 的 Cmd

      // 檢查快捷鍵
      for (const [shortcut, handler] of Object.entries(shortcuts)) {
        const parts = shortcut.toLowerCase().split('+')
        const needsCtrl = parts.includes('ctrl') || parts.includes('cmd')
        const keyPart = parts.find(p => p !== 'ctrl' && p !== 'cmd')

        if (needsCtrl && ctrlKey && key === keyPart) {
          e.preventDefault()
          handler(e)
          return
        } else if (!needsCtrl && key === shortcut.toLowerCase()) {
          e.preventDefault()
          handler(e)
          return
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, deps)
}
