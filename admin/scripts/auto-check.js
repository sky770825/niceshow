#!/usr/bin/env node

/**
 * 自動化檢查腳本
 * 檢查代碼質量、潛在問題、最佳實踐
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.blue}▶${colors.reset} ${msg}`),
}

const projectRoot = path.resolve(__dirname, '..')
const issues = []

function checkFile(filePath, checks) {
  const fullPath = path.join(projectRoot, filePath)
  if (!fs.existsSync(fullPath)) {
    issues.push({ type: 'error', file: filePath, message: '檔案不存在' })
    return
  }

  const content = fs.readFileSync(fullPath, 'utf-8')
  
  checks.forEach(check => {
    const result = check(content, filePath)
    if (result) {
      issues.push({ type: result.type || 'warning', file: filePath, message: result.message })
    }
  })
}

// 檢查規則
const checks = {
  // 檢查 console.log（生產環境應該移除）
  consoleLog: (content, filePath) => {
    const consoleMatches = content.match(/console\.(log|warn|error|info)/g)
    if (consoleMatches && !filePath.includes('scripts/')) {
      return {
        type: 'warning',
        message: `發現 ${consoleMatches.length} 個 console 語句（生產環境建議移除）`
      }
    }
    return null
  },

  // 檢查未使用的導入
  unusedImports: (content, filePath) => {
    // 簡單檢查：導入但未使用
    const imports = content.match(/import\s+.*?\s+from\s+['"](.*?)['"]/g) || []
    // 這裡可以添加更複雜的檢查邏輯
    return null
  },

  // 檢查缺少錯誤處理
  missingErrorHandling: (content, filePath) => {
    const asyncFunctions = content.match(/async\s+.*?\(/g) || []
    const tryCatch = content.match(/try\s*\{/g) || []
    if (asyncFunctions.length > tryCatch.length * 2) {
      return {
        type: 'warning',
        message: '部分異步函數可能缺少錯誤處理'
      }
    }
    return null
  },

  // 檢查 React Hooks 依賴
  hookDependencies: (content, filePath) => {
    const useEffectMatches = content.match(/useEffect\(\(\)\s*=>\s*\{[^}]*\},\s*\[([^\]]*)\]/g) || []
    useEffectMatches.forEach(match => {
      if (match.includes('[]') && match.includes('load')) {
        // 檢查是否有 load 函數但依賴為空
        return {
          type: 'warning',
          message: 'useEffect 可能缺少依賴項'
        }
      }
    })
    return null
  },

  // 檢查硬編碼的值
  hardcodedValues: (content, filePath) => {
    const hardcoded = [
      /password\s*===\s*['"](.*?)['"]/,
      /apiKey\s*=\s*['"](.*?)['"]/,
    ]
    
    for (const pattern of hardcoded) {
      if (pattern.test(content)) {
        return {
          type: 'error',
          message: '發現硬編碼的敏感資訊'
        }
      }
    }
    return null
  },

  // 檢查缺少 PropTypes 或 TypeScript
  typeSafety: (content, filePath) => {
    // 這裡可以添加類型檢查
    return null
  },
}

// 執行檢查
log.section('代碼質量檢查')

const filesToCheck = [
  'src/App.jsx',
  'src/pages/ImageManagement.jsx',
  'src/pages/Dashboard.jsx',
  'src/components/ImageUploader.jsx',
  'src/components/Toast.jsx',
  'src/config/supabase.js',
]

filesToCheck.forEach(file => {
  log.info(`檢查: ${file}`)
  checkFile(file, [
    checks.consoleLog,
    checks.missingErrorHandling,
    checks.hardcodedValues,
  ])
})

// 檢查建置輸出大小
log.section('建置輸出檢查')
try {
  const distPath = path.join(projectRoot, 'dist')
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath, { recursive: true })
    const jsFiles = files.filter(f => f.endsWith('.js'))
    const cssFiles = files.filter(f => f.endsWith('.css'))
    
    log.info(`找到 ${jsFiles.length} 個 JS 檔案`)
    log.info(`找到 ${cssFiles.length} 個 CSS 檔案`)
    
    // 檢查檔案大小
    jsFiles.forEach(file => {
      const filePath = path.join(distPath, file)
      const stats = fs.statSync(filePath)
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
      if (stats.size > 500 * 1024) {
        issues.push({
          type: 'warning',
          file: `dist/${file}`,
          message: `檔案較大: ${sizeMB}MB（建議代碼分割）`
        })
      }
    })
  }
} catch (error) {
  issues.push({
    type: 'warning',
    file: 'dist',
    message: '無法檢查建置輸出'
  })
}

// 檢查環境變數
log.section('環境變數檢查')
const envExamplePath = path.join(projectRoot, '.env.example')
if (fs.existsSync(envExamplePath)) {
  log.success('.env.example 存在')
} else {
  issues.push({
    type: 'warning',
    file: '.env.example',
    message: '缺少環境變數範例檔案'
  })
}

// 輸出結果
log.section('檢查結果')
if (issues.length === 0) {
  log.success('未發現問題！')
} else {
  const errors = issues.filter(i => i.type === 'error')
  const warnings = issues.filter(i => i.type === 'warning')
  
  if (errors.length > 0) {
    log.error(`發現 ${errors.length} 個錯誤:`)
    errors.forEach(issue => {
      console.log(`  ${colors.red}✗${colors.reset} ${issue.file}: ${issue.message}`)
    })
  }
  
  if (warnings.length > 0) {
    log.warning(`發現 ${warnings.length} 個警告:`)
    warnings.forEach(issue => {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${issue.file}: ${issue.message}`)
    })
  }
}

process.exit(issues.filter(i => i.type === 'error').length > 0 ? 1 : 0)
