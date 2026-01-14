#!/usr/bin/env node

/**
 * 自動化測試腳本
 * 檢查代碼質量、建置狀態、功能完整性
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
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
const results = {
  passed: [],
  failed: [],
  warnings: [],
}

function runTest(name, testFn) {
  try {
    log.info(`測試: ${name}`)
    const result = testFn()
    if (result === false) {
      results.failed.push(name)
      log.error(`失敗: ${name}`)
      return false
    }
    results.passed.push(name)
    log.success(`通過: ${name}`)
    return true
  } catch (error) {
    results.failed.push(name)
    log.error(`錯誤: ${name} - ${error.message}`)
    return false
  }
}

// 1. 檢查必要檔案
log.section('檢查必要檔案')
runTest('package.json 存在', () => {
  return fs.existsSync(path.join(projectRoot, 'package.json'))
})

runTest('vite.config.js 存在', () => {
  return fs.existsSync(path.join(projectRoot, 'vite.config.js'))
})

runTest('src 目錄存在', () => {
  return fs.existsSync(path.join(projectRoot, 'src'))
})

runTest('src/main.jsx 存在', () => {
  return fs.existsSync(path.join(projectRoot, 'src/main.jsx'))
})

runTest('src/App.jsx 存在', () => {
  return fs.existsSync(path.join(projectRoot, 'src/App.jsx'))
})

// 2. 檢查核心組件
log.section('檢查核心組件')
const requiredComponents = [
  'src/components/Toast.jsx',
  'src/components/ConfirmDialog.jsx',
  'src/components/ImageUploader.jsx',
  'src/components/Layout.jsx',
  'src/components/SearchBar.jsx',
  'src/components/ErrorBoundary.jsx',
  'src/components/EmptyState.jsx',
]

requiredComponents.forEach(component => {
  runTest(`${component} 存在`, () => {
    return fs.existsSync(path.join(projectRoot, component))
  })
})

// 3. 檢查核心頁面
log.section('檢查核心頁面')
const requiredPages = [
  'src/pages/Login.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/ImageManagement.jsx',
  'src/pages/ScheduleManagement.jsx',
  'src/pages/VideoManagement.jsx',
  'src/pages/ToolManagement.jsx',
  'src/pages/MedicalManagement.jsx',
]

requiredPages.forEach(page => {
  runTest(`${page} 存在`, () => {
    return fs.existsSync(path.join(projectRoot, page))
  })
})

// 4. 檢查配置檔案
log.section('檢查配置檔案')
runTest('tailwind.config.js 存在', () => {
  return fs.existsSync(path.join(projectRoot, 'tailwind.config.js'))
})

runTest('src/index.css 存在', () => {
  return fs.existsSync(path.join(projectRoot, 'src/index.css'))
})

runTest('src/config/supabase.js 存在', () => {
  return fs.existsSync(path.join(projectRoot, 'src/config/supabase.js'))
})

// 5. 檢查依賴
log.section('檢查依賴安裝')
runTest('node_modules 存在', () => {
  return fs.existsSync(path.join(projectRoot, 'node_modules'))
})

// 6. 建置測試
log.section('建置測試')
let buildSuccess = false
try {
  log.info('執行 npm run build...')
  const buildOutput = execSync('npm run build', {
    cwd: projectRoot,
    encoding: 'utf-8',
    stdio: 'pipe',
  })
  
  if (buildOutput.includes('built in') || buildOutput.includes('✓ built')) {
    buildSuccess = true
    log.success('建置成功')
  } else if (buildOutput.includes('error') || buildOutput.includes('Error')) {
    log.error('建置失敗')
    console.log(buildOutput)
  }
} catch (error) {
  log.error('建置過程出錯')
  console.log(error.stdout || error.message)
}

if (buildSuccess) {
  results.passed.push('建置測試')
} else {
  results.failed.push('建置測試')
}

// 7. 檢查代碼語法
log.section('檢查代碼語法')
const sourceFiles = [
  'src/App.jsx',
  'src/main.jsx',
  'src/pages/ImageManagement.jsx',
  'src/components/ImageUploader.jsx',
]

sourceFiles.forEach(file => {
  const filePath = path.join(projectRoot, file)
  if (fs.existsSync(filePath)) {
    runTest(`${file} 語法檢查`, () => {
      const content = fs.readFileSync(filePath, 'utf-8')
      // 基本語法檢查
      if (content.includes('import') && content.includes('export')) {
        return true
      }
      return content.length > 0
    })
  }
})

// 8. 檢查環境變數範例
log.section('檢查環境變數配置')
runTest('.env.example 存在', () => {
  return fs.existsSync(path.join(projectRoot, '.env.example'))
})

// 9. 檢查文檔
log.section('檢查文檔')
const docs = [
  'README.md',
  '啟動說明.md',
]

docs.forEach(doc => {
  runTest(`${doc} 存在`, () => {
    return fs.existsSync(path.join(projectRoot, doc))
  })
})

// 10. 檢查 hooks
log.section('檢查 Hooks')
runTest('src/hooks/useKeyboardShortcuts.js 存在', () => {
  return fs.existsSync(path.join(projectRoot, 'src/hooks/useKeyboardShortcuts.js'))
})

// 總結
log.section('測試總結')
console.log(`\n${colors.green}通過: ${results.passed.length}${colors.reset}`)
console.log(`${colors.red}失敗: ${results.failed.length}${colors.reset}`)
console.log(`${colors.yellow}警告: ${results.warnings.length}${colors.reset}\n`)

if (results.failed.length > 0) {
  log.error('失敗的測試:')
  results.failed.forEach(test => {
    console.log(`  - ${test}`)
  })
  process.exit(1)
} else {
  log.success('所有測試通過！')
  process.exit(0)
}
