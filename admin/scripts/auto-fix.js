#!/usr/bin/env node

/**
 * 自動化修復腳本
 * 自動修復常見問題
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.blue}▶${colors.reset} ${msg}`),
}

const projectRoot = path.resolve(__dirname, '..')
let fixedCount = 0

function fixFile(filePath, fixFn) {
  const fullPath = path.join(projectRoot, filePath)
  if (!fs.existsSync(fullPath)) {
    log.warning(`${filePath} 不存在，跳過`)
    return false
  }

  try {
    const originalContent = fs.readFileSync(fullPath, 'utf-8')
    const fixedContent = fixFn(originalContent)
    
    if (originalContent !== fixedContent) {
      fs.writeFileSync(fullPath, fixedContent, 'utf-8')
      log.success(`修復: ${filePath}`)
      fixedCount++
      return true
    }
    return false
  } catch (error) {
    log.warning(`修復 ${filePath} 時出錯: ${error.message}`)
    return false
  }
}

log.section('開始自動修復')

// 1. 修復 package.json scripts
log.info('檢查 package.json...')
const packageJsonPath = path.join(projectRoot, 'package.json')
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  let modified = false

  // 確保有必要的 scripts
  if (!packageJson.scripts) {
    packageJson.scripts = {}
  }

  const requiredScripts = {
    'dev': 'vite',
    'build': 'vite build',
    'preview': 'vite preview',
    'test': 'node scripts/auto-test.js',
    'check': 'node scripts/auto-check.js',
    'fix': 'node scripts/auto-fix.js',
    'auto': 'node scripts/auto.js',
  }

  for (const [script, command] of Object.entries(requiredScripts)) {
    if (packageJson.scripts[script] !== command) {
      packageJson.scripts[script] = command
      modified = true
    }
  }

  if (modified) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8')
    log.success('更新 package.json scripts')
    fixedCount++
  }
}

// 2. 確保 .gitignore 包含必要項目
log.info('檢查 .gitignore...')
const gitignorePath = path.join(projectRoot, '.gitignore')
const gitignoreContent = fs.existsSync(gitignorePath)
  ? fs.readFileSync(gitignorePath, 'utf-8')
  : ''

const requiredIgnores = [
  'node_modules',
  'dist',
  '.env',
  '.env.local',
  '.DS_Store',
]

let gitignoreModified = false
let newGitignore = gitignoreContent

requiredIgnores.forEach(ignore => {
  if (!newGitignore.includes(ignore)) {
    newGitignore += `${ignore}\n`
    gitignoreModified = true
  }
})

if (gitignoreModified) {
  fs.writeFileSync(gitignorePath, newGitignore, 'utf-8')
  log.success('更新 .gitignore')
  fixedCount++
}

// 3. 確保 scripts 目錄存在
log.info('檢查 scripts 目錄...')
const scriptsDir = path.join(projectRoot, 'scripts')
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true })
  log.success('創建 scripts 目錄')
  fixedCount++
}

// 4. 確保 hooks 目錄存在
log.info('檢查 hooks 目錄...')
const hooksDir = path.join(projectRoot, 'src/hooks')
if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true })
  log.success('創建 hooks 目錄')
  fixedCount++
}

// 5. 確保 config 目錄存在
log.info('檢查 config 目錄...')
const configDir = path.join(projectRoot, 'src/config')
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true })
  log.success('創建 config 目錄')
  fixedCount++
}

// 6. 確保 utils 目錄存在
log.info('檢查 utils 目錄...')
const utilsDir = path.join(projectRoot, 'src/utils')
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir, { recursive: true })
  log.success('創建 utils 目錄')
  fixedCount++
}

log.section('修復完成')
if (fixedCount > 0) {
  log.success(`修復了 ${fixedCount} 個問題`)
} else {
  log.info('未發現需要修復的問題')
}

process.exit(0)
